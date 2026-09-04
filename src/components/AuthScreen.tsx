import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { fetchAvatarCatalogUrls } from '@/lib/store';
import { GraduationCap, Mail, Lock, User as UserIcon, Loader2, LogIn, UserPlus, ShieldCheck, ArrowLeft, Check, Users } from 'lucide-react';

export default function AuthScreen() {
  const { signIn, signUp, adminSignIn, authError } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [showAdmin, setShowAdmin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [parentEmail, setParentEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [avatars, setAvatars] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const urls = await fetchAvatarCatalogUrls();
        setAvatars(urls);
      } catch {
        setAvatars([]);
      }
    })();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    if (mode === 'login') {
      const { error } = await signIn(email.trim(), password);
      if (error) setError(error);
    } else {
      if (!selectedAvatar) {
        setError('Selecciona un avatar para tu perfil.');
        setBusy(false);
        return;
      }
      const { error } = await signUp(email.trim(), password, fullName.trim(), selectedAvatar, parentEmail.trim());
      if (error) setError(error);
      else {
        setError('Tu cuenta está pendiente de aprobación por el administrador.');
        setMode('login');
        setEmail('');
        setPassword('');
        setFullName('');
        setSelectedAvatar(null);
        setParentEmail('');
      }
    }
    setBusy(false);
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const { error } = await adminSignIn(email.trim(), password);
    if (error) setError(error);
    setBusy(false);
  };

  const displayError = error || authError;

  const branding = (
    <div className="text-center mb-8">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-academic-500 mb-4 shadow-lg shadow-academic-500/30">
        <GraduationCap className="w-8 h-8 text-white" />
      </div>
      <h1 className="text-2xl font-bold text-white tracking-tight sm:text-3xl">Plataforma de Preparación Académica</h1>
      <p className="text-academic-200 mt-2 text-sm">Preparación y simulacro para el examen de admisión</p>
    </div>
  );

  const fieldStyles = 'w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-academic-500 focus:ring-2 focus:ring-academic-500/20 outline-none transition-all text-slate-800';

  if (showAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-academic-900 to-slate-800 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {branding}
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-slate-800">Ingreso Administrador</h2>
                <p className="text-xs text-slate-500">Acceso exclusivo para administradores</p>
              </div>
            </div>
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Correo</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@correo.mx" className={fieldStyles} required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Contraseña</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className={fieldStyles} required />
                </div>
              </div>
              {displayError && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl p-3">{displayError}</div>}
              <button type="submit" disabled={busy} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-semibold transition-all shadow-lg disabled:opacity-60 disabled:cursor-not-allowed">
                {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : <><ShieldCheck className="w-5 h-5" /> Acceder</>}
              </button>
              <button type="button" onClick={() => { setShowAdmin(false); setError(null); setEmail(''); setPassword(''); }} className="w-full flex items-center justify-center gap-2 text-sm text-slate-500 hover:text-slate-700 py-2">
                <ArrowLeft className="w-4 h-4" /> Volver al inicio de sesión
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-academic-900 to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {branding}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="flex gap-2 mb-6 p-1 bg-slate-100 rounded-xl">
            <button onClick={() => { setMode('login'); setError(null); }} className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${mode === 'login' ? 'bg-white text-academic-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
              Iniciar Sesión
            </button>
            <button onClick={() => { setMode('register'); setError(null); }} className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${mode === 'register' ? 'bg-white text-academic-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
              Registrarse
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Nombre completo</label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Tu nombre" className={fieldStyles} required />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Elige tu avatar</label>
                  <div className="grid grid-cols-4 gap-2">
                    {avatars.map((av) => (
                      <button key={av} type="button" onClick={() => setSelectedAvatar(av)} className={`relative rounded-xl overflow-hidden border-2 transition-all aspect-square ${selectedAvatar === av ? 'border-academic-500 ring-2 ring-academic-500/30' : 'border-slate-200 hover:border-academic-300'}`}>
                        <img src={av} alt="avatar" className="w-full h-full object-cover" />
                        {selectedAvatar === av && (
                          <div className="absolute inset-0 bg-academic-500/20 flex items-center justify-center">
                            <Check className="w-5 h-5 text-white drop-shadow" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Correo electrónico del padre, madre o tutor</label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input type="email" value={parentEmail} onChange={(e) => setParentEmail(e.target.value)} placeholder="tutor@correo.mx" className={fieldStyles} required />
                  </div>
                </div>
              </>
            )}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Correo electrónico</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="alumno@correo.mx" className={fieldStyles} required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className={fieldStyles} required />
              </div>
            </div>
            {displayError && (
              <div className={`text-sm rounded-xl p-3 ${displayError.includes('pendiente') ? 'text-amber-700 bg-amber-50 border border-amber-200' : 'text-red-600 bg-red-50 border border-red-200'}`}>{displayError}</div>
            )}
            <button type="submit" disabled={busy} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-academic-600 hover:bg-academic-700 text-white font-semibold transition-all shadow-lg shadow-academic-600/25 disabled:opacity-60 disabled:cursor-not-allowed">
              {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : mode === 'login' ? <><LogIn className="w-5 h-5" /> Entrar</> : <><UserPlus className="w-5 h-5" /> Crear cuenta</>}
            </button>
          </form>
        </div>
        <div className="text-center mt-6">
          <button onClick={() => { setShowAdmin(true); setError(null); setEmail(''); setPassword(''); }} className="inline-flex items-center gap-1.5 text-xs text-academic-200/60 hover:text-academic-200 transition-colors">
            <ShieldCheck className="w-3.5 h-3.5" /> Ingreso Administrador
          </button>
        </div>
      </div>
    </div>
  );
}
