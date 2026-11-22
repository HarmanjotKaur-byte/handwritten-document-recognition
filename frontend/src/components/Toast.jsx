import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ toast, onClose }) {
  if (!toast) return null;

  const icons = {
    success: <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />,
    error: <AlertCircle className="h-4 w-4 text-rose-500 shrink-0" />,
    info: <Info className="h-4 w-4 text-blue-500 shrink-0" />
  };

  const borderStyles = {
    success: 'border-emerald-200 dark:border-emerald-800/50 bg-white dark:bg-slate-900',
    error: 'border-rose-200 dark:border-rose-800/50 bg-white dark:bg-slate-900',
    info: 'border-blue-200 dark:border-blue-800/50 bg-white dark:bg-slate-900'
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg ${borderStyles[toast.type || 'info']}`}>
        {icons[toast.type || 'info']}
        <p className="text-xs font-medium text-slate-800 dark:text-slate-100 flex-1">{toast.message}</p>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          aria-label="Dismiss toast"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
