import React, { useState, useEffect } from 'react';
import { CommunityEvent, GeoPosition } from '@/lib/types';
import EventCard from '@/components/components_map/EventCard';
import { geocodeLocation, getNearbyLandmarks, Landmark } from '@/utils/geocode';

interface CommunityOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  userPosition: GeoPosition | null;
  events: CommunityEvent[];
  addEvent: (eventData: Omit<CommunityEvent, 'id' | 'joined'>) => void;
  joinEvent: (id: string) => void;
  toggleInterested: (id: string) => void;
  isLoaded: boolean;
  /** Called with the event the user wants to see on the map */
  onSelectEvent: (event: CommunityEvent) => void;
  /** Remove an event from the list */
  removeEvent: (id: string) => void;
}

export default function CommunityOverlay({
  isOpen,
  onClose,
  userPosition,
  events,
  addEvent,
  joinEvent,
  toggleInterested,
  isLoaded,
  onSelectEvent,
  removeEvent,
}: CommunityOverlayProps) {
  const [activeTab, setActiveTab] = useState<'events' | 'create'>('events');

  // Form state
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [time, setTime] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCoords, setSelectedCoords] = useState<GeoPosition | null>(null);

  // Landmark state
  const [landmarks, setLandmarks] = useState<Landmark[]>([]);
  const [isLoadingLandmarks, setIsLoadingLandmarks] = useState(false);

  // Fetch landmarks when entering create tab if we have user position
  useEffect(() => {
    if (activeTab === 'create' && userPosition && landmarks.length === 0) {
      setTimeout(() => setIsLoadingLandmarks(true), 0);
      getNearbyLandmarks(userPosition.lat, userPosition.lng, 10).then((places) => {
        setLandmarks(places);
        setTimeout(() => setIsLoadingLandmarks(false), 0);
      });
    }
  }, [activeTab, userPosition, landmarks.length]);

  // Geocoding state
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [geocodeError, setGeocodeError] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !location || !time || !description) return;

    setIsGeocoding(true);
    setGeocodeError('');

    // Use selectedCoords if available, otherwise geocode the text
    let coords: GeoPosition | null = selectedCoords;
    
    if (!coords) {
      coords = await geocodeLocation(location);
    }

    if (!coords) {
      // Non-blocking: warn the user but still allow submission
      setGeocodeError('Could not find coordinates for this location. Event will not appear on map.');
    }

    const formattedTime = time ? new Date(time).toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }) : time;

    addEvent({
      title,
      location,
      time: formattedTime !== 'Invalid Date' ? formattedTime : time,
      description,
      // Use coords if found, else fall back to userPosition, else undefined
      coordinates: coords ?? (userPosition ?? undefined),
    });

    // Reset form and switch to events tab
    setTitle('');
    setLocation('');
    setTime('');
    setDescription('');
    setSelectedCoords(null);
    setGeocodeError('');
    setIsGeocoding(false);
    setActiveTab('events');
  };

  /** Join event and fly map to it */
  const handleJoin = (id: string) => {
    joinEvent(id);
    const ev = events.find((e) => e.id === id);
    if (ev?.coordinates) onSelectEvent(ev);
  };

  /** View on Map: close overlay and fly map to event */
  const handleSelectEvent = (ev: CommunityEvent) => {
    onSelectEvent(ev);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Slide-Up Panel */}
      <div className="relative w-full h-[90vh] bg-[#050505] rounded-t-[3rem] shadow-2xl flex flex-col overflow-hidden animate-[slideUp_0.4s_ease-out] border-t border-white/10">

        {/* Header */}
        <div className="flex justify-between items-center p-8 bg-[#050505] shrink-0">
          <h2 className="text-4xl font-black text-white tracking-tighter">Community<span className="text-emerald-500">.</span></h2>
          <button onClick={onClose} className="p-3 bg-white/5 rounded-full hover:bg-white/10 transition-colors border border-white/5 text-white/40 hover:text-white">
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex bg-[#050505] px-6 shrink-0 gap-4 mb-4">
          <button
            onClick={() => setActiveTab('events')}
            className={`flex-1 py-4 text-[10px] font-black uppercase tracking-[0.3em] transition-all rounded-2xl border ${
              activeTab === 'events' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-white/5 text-white/30 border-white/5 hover:text-white/60'
            }`}
          >
            Local Activity
          </button>
          <button
            onClick={() => setActiveTab('create')}
            className={`flex-1 py-4 text-[10px] font-black uppercase tracking-[0.3em] transition-all rounded-2xl border ${
              activeTab === 'create' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-white/5 text-white/30 border-white/5 hover:text-white/60'
            }`}
          >
            Host Event
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#050505]">
          {/* Events Tab */}
          {activeTab === 'events' && (
            <div className="pb-12 flex flex-col gap-4">
              {!isLoaded ? (
                <div className="flex justify-center p-12">
                  <div className="w-10 h-10 border-[3px] border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
                </div>
              ) : events.length === 0 ? (
                <div className="py-24 flex flex-col items-center justify-center text-center opacity-10 border border-white/5 border-dashed rounded-[2.5rem]">
                   <span className="material-symbols-outlined text-6xl mb-4 text-white">groups_3</span>
                   <p className="text-sm font-black uppercase tracking-[0.2em] text-white">No community activity yet.</p>
                </div>
              ) : (
                events.map((ev) => (
                  <EventCard
                    key={ev.id}
                    event={ev}
                    onJoin={handleJoin}
                    onSelect={handleSelectEvent}
                    onRemove={removeEvent}
                    onToggleInterested={toggleInterested}
                  />
                ))
              )}
            </div>
          )}

          {/* Create Event Tab */}
          {activeTab === 'create' && (
            <form onSubmit={handleCreate} className="flex flex-col gap-5 pb-12">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Event Title</label>
                <input
                  required type="text" value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Neighborhood Patrol"
                  className="w-full mt-2.5 px-6 py-4 rounded-2xl border border-white/5 bg-white/5 text-white font-bold placeholder:text-white/10 focus:outline-none focus:border-emerald-500/30 transition-all"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 pl-1">Location</label>
                <div className="flex flex-col gap-3 mt-2.5">
                  <input
                    required type="text" value={location}
                    onChange={(e) => { 
                      setLocation(e.target.value); 
                      setSelectedCoords(null); 
                      setGeocodeError(''); 
                    }}
                    placeholder="e.g. Central Park"
                    className="w-full px-6 py-4 rounded-2xl border border-white/5 bg-white/5 text-white font-bold placeholder:text-white/10 focus:outline-none focus:border-emerald-500/30 transition-all"
                  />
                  
                  {/* Nearby Landmarks Dropdown Menu */}
                  <div className="mt-1">
                    <select
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === '') return;
                        const lm = landmarks.find((l) => l.name === val);
                        if (lm) {
                          setLocation(lm.name);
                          setSelectedCoords({ lat: lm.lat, lng: lm.lng });
                          setGeocodeError('');
                        }
                      }}
                      className={`w-full px-6 py-4 rounded-2xl border focus:outline-none text-[10px] font-black uppercase tracking-widest cursor-pointer transition-all ${
                        isLoadingLandmarks ? 'bg-white/5 text-white/20 border-white/5' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                      }`}
                      value=""
                      disabled={isLoadingLandmarks || landmarks.length === 0}
                    >
                      {isLoadingLandmarks ? (
                        <option value="" disabled className="bg-[#0a0a0a] text-white">⏳ GPS Locating Landmarks...</option>
                      ) : !userPosition ? (
                        <option value="" disabled className="bg-[#0a0a0a] text-white">📡 GPS Permission Needed</option>
                      ) : landmarks.length === 0 ? (
                        <option value="" disabled className="bg-[#0a0a0a] text-white">No landmarks found nearby</option>
                      ) : (
                        <option value="" disabled className="bg-[#0a0a0a] text-white">🎯 Nearby Landmarks</option>
                      )}
                      
                      {landmarks.map((lm, idx) => (
                        <option key={idx} value={lm.name}>
                          {lm.name} {
                            lm.type === 'park' ? '🌳' : 
                            lm.type === 'school' ? '🏫' : 
                            lm.type === 'museum' ? '🏛️' : 
                            lm.type === 'library' ? '📚' :
                            lm.type === 'place_of_worship' ? '⛪' :
                            lm.type === 'attraction' ? '✨' :
                            lm.type === 'square' ? '⛲' :
                            '📍'
                          }
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                {geocodeError && (
                  <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                    <span>⚠️</span> {geocodeError}
                  </p>
                )}
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 pl-1">Scheduled Time</label>
                <input
                  required type="datetime-local" value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full mt-2.5 px-6 py-4 rounded-2xl border border-white/5 bg-white/5 text-white font-bold focus:outline-none focus:border-emerald-500/30 transition-all [color-scheme:dark]"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 pl-1">Mission Details</label>
                <textarea
                  required value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Environmental safety details..."
                  rows={4}
                  className="w-full mt-2.5 px-6 py-4 rounded-2xl border border-white/5 bg-white/5 text-white font-bold placeholder:text-white/10 focus:outline-none focus:border-emerald-500/30 transition-all resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isGeocoding}
                className="w-full py-5 mt-6 bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase tracking-[0.2em] text-[12px] rounded-2xl shadow-[0_8px_30px_rgba(16,185,129,0.2)] transition-all active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {isGeocoding ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    Locating…
                  </>
                ) : 'Publish Mission'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
