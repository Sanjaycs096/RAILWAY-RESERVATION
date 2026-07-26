import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useAuth();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 max-w-sm w-full px-4 pointer-events-none">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-xl border backdrop-blur-md transition-all duration-300 animate-slide-up ${
            toast.type === 'success'
              ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-100'
              : toast.type === 'error'
              ? 'bg-red-950/90 border-red-500/40 text-red-100'
              : toast.type === 'warning'
              ? 'bg-amber-950/90 border-amber-500/40 text-amber-100'
              : 'bg-indigo-950/90 border-indigo-500/40 text-indigo-100'
          }`}
        >
          <div className="mt-0.5 shrink-0">
            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
            {toast.type === 'error' && <XCircle className="w-5 h-5 text-red-400" />}
            {toast.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-400" />}
            {toast.type === 'info' && <Info className="w-5 h-5 text-indigo-400" />}
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-semibold tracking-wide">{toast.title}</h4>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">{toast.message}</p>
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-slate-400 hover:text-white transition-colors p-1 rounded-md"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
