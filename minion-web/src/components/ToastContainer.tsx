'use client';

import React from 'react';
import { useSoundWaveStore } from '@/lib/soundwaveStore';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useSoundWaveStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border text-sm font-medium transition-all transform animate-in slide-in-from-top-2 ${
            t.type === 'error'
              ? 'bg-[#1e1315] border-red-500/40 text-red-300'
              : t.type === 'success'
              ? 'bg-[#131e17] border-[#1ed760]/40 text-[#1ed760]'
              : 'bg-[#18191E] border-white/10 text-white'
          }`}
        >
          {t.type === 'error' ? (
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          ) : t.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-[#1ed760] shrink-0" />
          ) : (
            <Info className="w-4 h-4 text-amber-400 shrink-0" />
          )}
          <span className="flex-1">{t.message}</span>
          <button
            onClick={() => dismissToast(t.id)}
            className="p-1 hover:bg-white/10 rounded-md transition-colors"
          >
            <X className="w-3.5 h-3.5 opacity-70 hover:opacity-100" />
          </button>
        </div>
      ))}
    </div>
  );
};
