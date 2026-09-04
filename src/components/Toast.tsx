import { useEffect } from 'react';
import { CheckCircle2, XCircle, AlertCircle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

export type Toast = {
  id: number;
  type: ToastType;
  message: string;
};

type Props = {
  toasts: Toast[];
  onDismiss: (id: number) => void;
};

export default function ToastContainer({ toasts, onDismiss }: Props) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: number) => void }) {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const config = {
    success: { icon: CheckCircle2, bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-800', iconColor: 'text-emerald-500' },
    error: { icon: XCircle, bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800', iconColor: 'text-red-500' },
    info: { icon: AlertCircle, bg: 'bg-academic-50', border: 'border-academic-200', text: 'text-academic-800', iconColor: 'text-academic-500' },
  };
  const c = config[toast.type];
  const Icon = c.icon;

  return (
    <div className={`flex items-start gap-3 ${c.bg} border ${c.border} rounded-xl p-4 shadow-lg animate-[slideIn_0.2s_ease-out]`}>
      <Icon className={`w-5 h-5 ${c.iconColor} flex-shrink-0 mt-0.5`} />
      <p className={`text-sm font-medium ${c.text} flex-1`}>{toast.message}</p>
      <button onClick={() => onDismiss(toast.id)} className={`${c.text} opacity-50 hover:opacity-100 transition-opacity`}>
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
