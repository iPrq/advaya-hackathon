'use client';

import React from 'react';
import Link from 'next/link';
import { CommunityEvent } from '../lib/types';
import { useCommunity } from '../hooks/useCommunity';

/**
 * CommunitySummary — exportable summary card for the Community page.
 * Uses the same useCommunity hook (localStorage-backed) as the full overlay,
 * so joining/interested counts stay in sync. No props needed.
 */
export default function CommunitySummary() {
  const { events, joinEvent, toggleInterested, isLoaded } = useCommunity();

  const joinedCount = events.filter((e) => e.joined).length;
  const upcomingEvents = events.slice(0, 3);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-surface-container overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-orange-50 flex items-center justify-center">
            <span className="material-symbols-outlined text-orange-600 text-sm">groups</span>
          </div>
          <h2 className="text-base font-bold text-on-surface">Community</h2>
        </div>
        <Link
          href="/map"
          className="text-xs font-bold text-orange-600 hover:opacity-80 transition-colors"
        >
          View All →
        </Link>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-px bg-surface-container border-t border-b border-surface-container">
        <div className="bg-white px-5 py-3">
          <p className="text-[10px] font-bold text-orange-500 uppercase tracking-widest mb-0.5">
            Total Events
          </p>
          <p className="text-2xl font-black font-headline text-on-surface">{events.length}</p>
        </div>
        <div className="bg-white px-5 py-3">
          <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-0.5">
            Joined
          </p>
          <p className="text-2xl font-black font-headline text-on-surface">{joinedCount}</p>
        </div>
      </div>

      {/* Upcoming events list */}
      <div className="px-5 pt-3 pb-5">
        <p className="text-[10px] font-black text-outline uppercase tracking-widest mb-2">
          Upcoming
        </p>

        {!isLoaded ? (
          <div className="flex justify-center py-4">
            <div className="w-5 h-5 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : upcomingEvents.length === 0 ? (
          <p className="text-xs text-outline py-2 text-center italic">
            No events yet — create one on the map!
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {upcomingEvents.map((event: CommunityEvent) => (
              <div
                key={event.id}
                className="flex items-start justify-between gap-3"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-on-surface truncate leading-none">
                    {event.title}
                  </p>
                  <p className="text-[10px] text-outline mt-0.5 flex items-center gap-1 truncate font-medium">
                    <span className="material-symbols-outlined text-[12px]">location_on</span>
                    {event.location}
                  </p>
                  <p className="text-[10px] text-outline mt-0.5 flex items-center gap-1 font-medium">
                    <span className="material-symbols-outlined text-[12px]">schedule</span>
                    {event.time}
                  </p>
                </div>

                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  {/* Join / Joined button */}
                  <button
                    onClick={() => joinEvent(event.id)}
                    disabled={event.joined}
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-lg transition-all ${
                      event.joined
                        ? 'bg-emerald-50 text-emerald-600 cursor-default'
                        : 'bg-orange-600 text-white hover:opacity-90 active:scale-95 shadow-sm'
                    }`}
                  >
                    {event.joined ? '✓ Joined' : 'Join'}
                  </button>

                  {/* Interested toggle */}
                  <button
                    onClick={() => toggleInterested(event.id)}
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-all active:scale-95 ${
                      event.isInterested
                        ? 'border-orange-300 bg-orange-50 text-orange-600'
                        : 'border-surface-container text-outline hover:text-orange-500'
                    }`}
                  >
                    ★ {event.interestedCount ?? 0}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
