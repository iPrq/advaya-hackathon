import React from 'react';
import { CommunityEvent } from '@/lib/types';

interface EventCardProps {
  event: CommunityEvent;
  onJoin: (id: string) => void;
  /** Called when "View on Map" is tapped — closes overlay and flies map to event */
  onSelect?: (event: CommunityEvent) => void;
  /** Called to permanently remove this event */
  onRemove?: (id: string) => void;
  /** Called to toggle interested statys */
  onToggleInterested?: (id: string) => void;
}

/** Opens Google Maps navigation to the event's coordinates in a new tab */
function openNavigation(event: CommunityEvent) {
  if (!event.coordinates) return;
  const url = `https://www.google.com/maps/dir/?api=1&destination=${event.coordinates.lat},${event.coordinates.lng}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}

export default function EventCard({ event, onJoin, onSelect, onRemove, onToggleInterested }: EventCardProps) {
  const hasCoords = !!event.coordinates;

  return (
    <div className="bg-white/[0.03] rounded-[2.5rem] border border-white/5 p-6 flex flex-col gap-4 group hover:bg-white/[0.05] transition-all duration-500 mb-4 shadow-2xl">
      {/* Title row with discard button */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 overflow-hidden">
          <h3 className="text-xl font-black text-white tracking-tighter truncate leading-none mb-4">{event.title}</h3>
          
          <div className="flex flex-col gap-3">
            <div className="flex items-center text-[10px] font-black uppercase tracking-[0.2em] text-white/30 gap-3 w-full">
               <span className="material-symbols-outlined text-emerald-500 scale-75">location_on</span>
               <span className="truncate">{event.location}</span>
            </div>

            <div className="flex items-center text-[10px] font-black uppercase tracking-[0.2em] text-white/30 gap-3">
               <span className="material-symbols-outlined text-emerald-500 scale-75">schedule</span>
               <span className="truncate">{event.time}</span>
            </div>
          </div>
        </div>

        {onRemove && (
          <button
            onClick={() => onRemove(event.id)}
            title="Discard event"
            className="w-10 h-10 flex items-center justify-center bg-white/5 text-white/20 hover:text-red-400 hover:bg-red-500/10 border border-white/5 rounded-full transition-all shrink-0 opacity-0 group-hover:opacity-100"
          >
            <span className="material-symbols-outlined text-lg">delete</span>
          </button>
        )}
      </div>

      <div className="text-white/60 text-sm font-medium leading-relaxed bg-[#0a0a0a] p-5 rounded-2xl border border-white/5 shadow-inner">
        {event.description}
      </div>

      {/* Primary action: Join & Interested */}
      <div className="flex gap-3">
        <button
          onClick={() => onJoin(event.id)}
          disabled={event.joined}
          className={`py-4 px-6 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all duration-300 flex-1 border shadow-lg
            ${event.joined
              ? 'bg-white/5 text-white/20 border-white/5 cursor-not-allowed'
              : 'bg-emerald-500 text-black border-emerald-500 hover:bg-emerald-400 active:scale-[0.98]'
            }
          `}
        >
          {event.joined ? '✓ Mission Joined' : 'Join Mission'}
        </button>

        {onToggleInterested && (
          <button
            onClick={() => onToggleInterested(event.id)}
            className={`py-4 px-6 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-3 border flex-[0.5]
              ${event.isInterested
                ? 'bg-red-500/10 border-red-500/20 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.1)]'
                : 'bg-white/5 border-white/5 text-white/30 hover:bg-white/10'
              }
            `}
          >
            <span className={`material-symbols-outlined text-base ${event.isInterested ? 'fill-1' : ''}`}>favorite</span>
            <span className="font-black">{event.interestedCount || 0}</span>
          </button>
        )}
      </div>

      {/* Secondary actions row */}
      {hasCoords && (
        <div className="flex gap-3 pt-1 border-t border-white/5 mt-1">
          {onSelect && (
            <button
              onClick={() => handleSelectOnMap(event, onSelect)}
              className="flex-1 py-3.5 rounded-xl text-[9px] font-black uppercase tracking-[0.3em] text-white/40 bg-white/5 border border-white/5 hover:bg-white/10 hover:text-white transition-all flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-base">explore</span>
              Locate
            </button>
          )}

          <button
            onClick={() => openNavigation(event)}
            className="flex-1 py-3.5 rounded-xl text-[9px] font-black uppercase tracking-[0.3em] text-white/40 bg-white/5 border border-white/5 hover:bg-white/10 hover:text-white transition-all flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-base">near_me</span>
            Navigate
          </button>
        </div>
      )}
    </div>
  );
}

/** Internal helper to match handleSelectEvent signature if needed */
function handleSelectOnMap(event: CommunityEvent, onSelect: (ev: CommunityEvent) => void) {
    onSelect(event);
}
