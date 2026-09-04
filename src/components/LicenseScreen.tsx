import { ShieldX, LogOut, Clock } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

type Props = {
  reason: 'expired' | 'suspended' | 'pending';
};

const MESSAGES: Record<Props['reason'], { title: string; body: string }> = {
  expired: {
    title: 'Licencia Vencida',
    body: 'Tu período de acceso ha terminado. Contacta al administrador para renovar tu licencia y continuar preparándote para el examen.',
  },
  suspended: {
    title: 'Cuenta Suspendida',
    body: 'Tu cuenta ha sido suspendida por el administrador. Si crees que es un error, ponte en contacto para resolverlo.',
  },
  pending: {
    title: 'Cuenta Pendiente',
    body: 'Tu cuenta está en revisión. El administrador debe aprobarla antes de que puedas acceder a la plataforma.',
  },
};

export default function LicenseScreen({ reason }: Props) {
  const { signOut } = useAuth();
  const msg = MESSAGES[reason];
  const Icon = reason === 'expired' ? Clock : ShieldX;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-50 mb-5">
            <Icon className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-xl font-bold text-slate-800 mb-3">{msg.title}</h1>
          <p className="text-sm text-slate-500 leading-relaxed mb-6">{msg.body}</p>
          <button
            onClick={() => signOut()}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-semibold transition-all shadow-lg"
          >
            <LogOut className="w-5 h-5" /> Cerrar sesión
          </button>
          <p className="text-xs text-slate-400 mt-4">Contacto: fararuiz64@gmail.com</p>
        </div>
      </div>
    </div>
  );
}
