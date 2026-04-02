import React from 'react';

interface ControlsProps {
  onSetSafeZone: () => void;
  radius: number;
  onRadiusChange: (radius: number) => void;
  isTracking: boolean;
  onToggleTracking: () => void;
  canSetSafeZone: boolean;
}

export default function Controls({
  onSetSafeZone,
  radius,
  onRadiusChange,
  isTracking,
  onToggleTracking,
  canSetSafeZone,
}: ControlsProps) {
  return (
    <div className="absolute bottom-28 left-0 right-0 px-5 z-40 max-w-sm mx-auto">
      <div className="bg-white/5 backdrop-blur-3xl rounded-[2.5rem] p-6 shadow-2xl border border-white/10">
        
        {/* Set Safe Zone Button */}
        <button
          onClick={onSetSafeZone}
          disabled={!canSetSafeZone}
          className={`w-full py-4 rounded-2xl font-bold text-[13px] uppercase tracking-widest mb-6 transition-all duration-300 active:scale-[0.98] ${
            canSetSafeZone
              ? "bg-emerald-500 text-black shadow-[0_8px_30px_rgba(16,185,129,0.2)]"
              : "bg-white/5 text-white/20 cursor-not-allowed border border-white/5"
          }`}
        >
          {canSetSafeZone ? 'Set Safe Zone' : 'GPS Initializing...'}       
        </button>

        {/* Radius Slider */}
        <div className="mb-6 bg-white/[0.03] p-5 rounded-2xl border border-white/5">
          <div className="flex justify-between items-center mb-4">
            <label className="text-white/40 font-black uppercase tracking-[0.2em] text-[10px]">Protection Radius</label>
            <span className="text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1 rounded-full text-[10px] uppercase tracking-widest border border-emerald-500/20">
              {radius}m
            </span>
          </div>
          <input
            type="range"
            min="50"
            max="500"
            step="10"
            value={radius}
            onChange={(e) => onRadiusChange(Number(e.target.value))}
            className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-emerald-500 transition-colors"
          />
        </div>

        {/* Tracking Toggle */}
        <div className="flex justify-center">
          <button
            onClick={onToggleTracking}
            className={`w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-3 border ${
              isTracking
                ? "bg-red-500/10 text-red-400 border-red-500/20"
                : "bg-white/5 text-white/40 border-white/5 hover:bg-white/10"
            }`}
          >
            <div className={`w-1.5 h-1.5 rounded-full ${isTracking ? "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)] animate-pulse" : "bg-white/20"}`} />
            {isTracking ? 'Tracking Active' : 'Enable Live Tracking'}
          </button>
        </div>

      </div>
    </div>
  );
}
