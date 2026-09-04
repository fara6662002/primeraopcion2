import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase, type Profile } from '@/lib/supabase';
import { fetchProfile, getDeviceFingerprint, updateProfile, addAlert } from '@/lib/store';

type LicenseStatus = 'expired' | 'suspended' | 'pending' | null;

type AuthContextType = {
  user: Profile | null;
  isAdmin: boolean;
  loading: boolean;
  authError: string | null;
  licenseStatus: LicenseStatus;
  signIn: (email: string, password: string) => Promise<{ status: string; error?: string }>;
  adminSignIn: (email: string, password: string) => Promise<{ status: string; error?: string }>;
  signUp: (email: string, password: string, fullName: string, avatar: string, parentEmail: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_EMAIL = 'fararuiz64@gmail.com';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [licenseStatus, setLicenseStatus] = useState<LicenseStatus>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (cancelled) return;
      if (session) {
        const email = session.user.email ?? '';
        if (email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
          setIsAdmin(true);
          setLoading(false);
        } else {
          await loadProfile(session.user.id);
        }
      } else {
        setLoading(false);
      }
    })();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      (async () => {
        if (!session) {
          setUser(null);
          setIsAdmin(false);
          setLicenseStatus(null);
          setLoading(false);
          return;
        }
        const email = session.user.email ?? '';
        if (email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
          setIsAdmin(true);
          setUser(null);
          setLicenseStatus(null);
          setLoading(false);
        } else {
          await loadProfile(session.user.id);
        }
      })();
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadProfile = async (userId: string) => {
    try {
      const profile = await fetchProfile(userId);
      if (!profile) {
        setUser(null);
        setLoading(false);
        return;
      }

      // Check expiration
      if (profile.expires_at && new Date(profile.expires_at) < new Date()) {
        await updateProfile(userId, { status: 'expired', blocked: true });
        setAuthError('Tu licencia ha vencido. Contacta al administrador para renovar tu acceso.');
        setLicenseStatus('expired');
        setUser(null);
        setLoading(false);
        return;
      }

      // Check device binding
      if (profile.approved && !profile.blocked) {
        const fp = getDeviceFingerprint();
        if (!profile.bound_device_id && !profile.device_fingerprint) {
          await updateProfile(userId, { bound_device_id: fp, device_fingerprint: fp, last_login_at: new Date().toISOString() });
        } else if (profile.bound_device_id && profile.bound_device_id !== fp && profile.device_fingerprint && profile.device_fingerprint !== fp) {
          await addAlert({
            userId,
            userName: profile.full_name,
            email: profile.email ?? '',
            deviceFingerprint: fp,
            userAgent: navigator.userAgent,
            message: `Intento de acceso desde un equipo no registrado (${profile.email}).`,
          });
          setAuthError('Este equipo no está registrado para tu cuenta. Contacta al administrador.');
          await supabase.auth.signOut();
          setUser(null);
          setLoading(false);
          return;
        }
        await updateProfile(userId, { last_login_at: new Date().toISOString() });
      }

      if (!profile.approved) {
        setAuthError('Tu cuenta está pendiente de aprobación por el administrador.');
        setLicenseStatus('pending');
        setUser(null);
      } else if (profile.blocked) {
        setAuthError('Tu cuenta ha sido suspendida. Contacta al administrador.');
        setLicenseStatus('suspended');
        setUser(null);
      } else {
        setAuthError(null);
        setLicenseStatus(null);
        setUser(profile);
      }
      setLoading(false);
    } catch (err) {
      console.error('Error loading profile:', err);
      setUser(null);
      setLoading(false);
    }
  };

  const signIn: AuthContextType['signIn'] = async (email, password) => {
    setAuthError(null);
    setLicenseStatus(null);
    const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) {
      return { status: 'error', error: 'Correo o contraseña incorrectos.' };
    }
    if (email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
      setIsAdmin(true);
      return { status: 'ok' };
    }
    if (data.user) {
      const profile = await fetchProfile(data.user.id);
      if (profile && !profile.approved) {
        setLicenseStatus('pending');
        return { status: 'pending', error: 'Tu cuenta está pendiente de aprobación por el administrador.' };
      }
      if (profile && profile.blocked) {
        setLicenseStatus('suspended');
        return { status: 'blocked', error: 'Tu cuenta ha sido suspendida. Contacta al administrador.' };
      }
      if (profile && profile.expires_at && new Date(profile.expires_at) < new Date()) {
        setLicenseStatus('expired');
        return { status: 'expired', error: 'Tu licencia ha vencido. Contacta al administrador para renovar tu acceso.' };
      }
    }
    return { status: 'ok' };
  };

  const adminSignIn: AuthContextType['adminSignIn'] = async (email, password) => {
    if (email.trim().toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
      return { status: 'error', error: 'Credenciales de administrador incorrectas.' };
    }
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) {
      return { status: 'error', error: 'Credenciales de administrador incorrectas.' };
    }
    setIsAdmin(true);
    return { status: 'ok' };
  };

  const signUp: AuthContextType['signUp'] = async (email, password, fullName, avatar, parentEmail) => {
    setAuthError(null);
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { data: { full_name: fullName.trim(), avatar } },
    });
    if (error) {
      return { error: error.message };
    }
    if (data.user) {
      const { error: profileError } = await supabase.from('profiles').upsert({
        id: data.user.id,
        email: email.trim(),
        full_name: fullName.trim(),
        avatar,
        parent_email: parentEmail.trim(),
        role: 'student',
        approved: false,
        blocked: false,
        status: 'pending',
      });
      if (profileError) {
        return { error: 'Se creó la cuenta pero hubo un problema con el perfil. Intenta iniciar sesión.' };
      }
    }
    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsAdmin(false);
    setAuthError(null);
    setLicenseStatus(null);
  };

  const refreshUser = async () => {
    if (!user) return;
    const fresh = await fetchProfile(user.id);
    if (fresh) setUser(fresh);
  };

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading, authError, licenseStatus, signIn, adminSignIn, signUp, signOut, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
