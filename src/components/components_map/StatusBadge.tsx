import React from 'react';
import { GeofenceStatus } from '@/lib/types';

interface StatusBadgeProps {
  status: GeofenceStatus;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  if (status === 'unknown') return null;

  const isInside = status === 'inside';

  return (
    <div className={`absolute top-6 left-6 z-50 transition-all duration-300 transform ${isInside ? 'scale-100' : 'scale-[1.02]'}`}>
      <div 
        className={`px-5 py-2 rounded-full shadow-2xl backdrop-blur-xl font-bold text-[10px] uppercase tracking-[0.2em] flex items-center gap-3 border
          ${isInside 
            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.1)]' 
            : 'bg-red-500/10 text-red-400 border-red-500/20 shadow-[0_0_40px_rgba(239,68,68,0.2)] animate-pulse'
          }
        `}
      >
        {isInside ? (
          <>
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.8)] animate-pulse" />
            Protected
          </>
        ) : (
          <>
            <div className="w-1.5 h-1.5 rounded-full bg-red-400 shadow-[0_0_12px_rgba(239,68,68,0.8)]" />
            Unsecured
          </>
        )}
      </div>
    </div>
  );
}
