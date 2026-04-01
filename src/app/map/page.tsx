'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Geolocation } from '@capacitor/geolocation';
import { useCommunity } from '@/hooks/useCommunity';
import { Map as MapIcon, Navigation, Plus, Users, Calendar, MapPin, Search, Filter } from 'lucide-react';

export default function MapPage() {
  const { events, joinEvent, toggleInterested, addEvent, isLoaded } = useCommunity();
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  
  // New Event Form
  const [newTitle, setNewTitle] = useState('');
  const [newLoc, setNewLoc] = useState('');
  const [newTime, setNewTime] = useState('');
  const [newDesc, setNewDesc] = useState('');

  // Get GPS Location via Capacitor
  useEffect(() => {
    const getPos = async () => {
      try {
        const permissions = await Geolocation.checkPermissions();
        if (permissions.location !== 'granted') {
          await Geolocation.requestPermissions();
        }
        const position = await Geolocation.getCurrentPosition();
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      } catch (e) {
        console.error('Error getting location:', e);
        // Fallback to a default location (e.g., Bangalore)
        setUserLocation({ lat: 12.9716, lng: 77.5946 });
      }
    };
    getPos();
  }, []);

  const handleAddEvent = () => {
    if (!newTitle || !newLoc) return;
    addEvent({
      title: newTitle,
      location: newLoc,
      time: newTime,
      description: newDesc,
      coordinates: userLocation || { lat: 12.9716, lng: 77.5946 }
    });
    setNewTitle(''); setNewLoc(''); setNewTime(''); setNewDesc('');
    setShowAdd(false);
  };

  const filteredEvents = events.filter(e => 
    e.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    e.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <main className="max-w-4xl mx-auto px-6 pt-12 pb-32">
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-headline font-extrabold text-on-surface flex items-center gap-2">
              <MapIcon className="text-orange-600 w-8 h-8" /> Community Hub
            </h1>
            <p className="text-sm text-outline mt-1 font-body">Connect with neighbors and local health initiatives.</p>
          </div>
          <button 
            onClick={() => setShowAdd(!showAdd)}
            className="w-12 h-12 bg-orange-600 text-white rounded-2xl flex items-center justify-center shadow-lg active:scale-95 transition-all"
          >
            <Plus />
          </button>
        </header>

        {/* SEARCH BAR */}
        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-outline w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search events, workshops, or clinics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface-container rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-2 focus:ring-orange-600 border border-outline-variant text-sm font-medium"
          />
        </div>

        {/* ADD EVENT OVERLAY */}
        {showAdd && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-[2rem] p-8 w-full max-w-md shadow-2xl relative animate-in zoom-in-95 duration-200">
              <button 
                onClick={() => setShowAdd(false)}
                className="absolute top-6 right-6 text-outline hover:text-on-surface"
              >
                <Plus className="rotate-45" />
              </button>
              <h3 className="font-headline font-bold text-2xl mb-6">Create Community Event</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-outline mb-1 block">Title</label>
                  <input 
                    value={newTitle} onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Morning Yoga"
                    className="w-full bg-surface-container rounded-xl py-3 px-4 outline-none border border-outline-variant text-sm"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-outline mb-1 block">Location</label>
                  <input 
                    value={newLoc} onChange={(e) => setNewLoc(e.target.value)}
                    placeholder="e.g. Ward 4 Community Center"
                    className="w-full bg-surface-container rounded-xl py-3 px-4 outline-none border border-outline-variant text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-[10px] font-bold uppercase tracking-widest text-outline mb-1 block">Time</label>
                        <input 
                            value={newTime} onChange={(e) => setNewTime(e.target.value)}
                            placeholder="Sat, 10 AM"
                            className="w-full bg-surface-container rounded-xl py-3 px-4 outline-none border border-outline-variant text-sm"
                        />
                    </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-outline mb-1 block">Description</label>
                  <textarea 
                    value={newDesc} onChange={(e) => setNewDesc(e.target.value)}
                    placeholder="Tell neighbors what's happening..."
                    className="w-full bg-surface-container rounded-xl py-3 px-4 outline-none border border-outline-variant text-sm h-24 resize-none"
                  />
                </div>
                <button 
                  onClick={handleAddEvent}
                  className="w-full bg-orange-600 text-white font-bold py-4 rounded-xl shadow-lg mt-4 active:scale-95 transition-all"
                >
                  Post Event
                </button>
              </div>
            </div>
          </div>
        )}

        {/* LIVE POSITION CARD */}
        {userLocation && (
          <div className="bg-orange-50 border border-orange-100 rounded-3xl p-6 mb-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-orange-600">
                    <Navigation className="w-6 h-6" />
                </div>
                <div>
                    <h4 className="font-bold text-orange-900 leading-none mb-1">Live GPS Active</h4>
                    <p className="text-xs text-orange-700 opacity-80">Finding events within 5km of your current position.</p>
                </div>
            </div>
            <div className="text-right">
                <p className="text-[10px] font-bold uppercase tracking-widest text-orange-400 leading-none mb-1">Accuracy</p>
                <p className="text-sm font-bold text-orange-800">High (GPS)</p>
            </div>
          </div>
        )}

        {/* EVENT LIST */}
        <div className="space-y-6">
          {!isLoaded ? (
            <div className="flex justify-center py-20">
              <Plus className="animate-spin text-orange-400 w-12 h-12" />
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="bg-white rounded-[2rem] p-12 text-center border border-surface-container border-dashed">
                <Users className="w-12 h-12 text-outline mx-auto mb-4 opacity-50" />
                <p className="text-outline font-medium">No results for "{searchQuery}". Try something else!</p>
            </div>
          ) : (
            filteredEvents.map(event => (
              <div key={event.id} className="bg-white rounded-[2rem] p-8 shadow-sm border border-surface-container relative overflow-hidden group hover:shadow-md transition-shadow">
                <div className="relative z-10 flex flex-col md:flex-row gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="material-symbols-outlined text-orange-600 text-lg">event</span>
                        <h3 className="text-2xl font-headline font-bold text-on-surface">{event.title}</h3>
                    </div>
                    <p className="text-on-surface-variant text-sm mb-6 leading-relaxed">{event.description}</p>
                    
                    <div className="flex flex-wrap gap-4">
                      <div className="flex items-center gap-2 px-4 py-2 bg-surface-container rounded-xl text-xs font-bold text-outline">
                        <MapPin className="w-3.5 h-3.5" /> {event.location}
                      </div>
                      <div className="flex items-center gap-2 px-4 py-2 bg-surface-container rounded-xl text-xs font-bold text-outline">
                        <Calendar className="w-3.5 h-3.5" /> {event.time}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col justify-between items-end md:w-32">
                    <div className="bg-orange-50 text-orange-600 px-3 py-1 rounded-full text-xs font-black uppercase tracking-tighter shadow-sm mb-4">
                        ★ {event.interestedCount} Interested
                    </div>
                    
                    <div className="flex flex-col gap-2 w-full">
                        <button 
                          onClick={() => joinEvent(event.id)}
                          disabled={event.joined}
                          className={`w-full py-3 rounded-xl font-bold text-sm transition-all shadow-sm ${event.joined ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-600 text-white active:scale-95'}`}
                        >
                          {event.joined ? 'Joined' : 'Join Event'}
                        </button>
                        <button 
                          onClick={() => toggleInterested(event.id)}
                          className={`w-full py-2 rounded-xl font-bold text-[10px] uppercase tracking-widest border transition-all ${event.isInterested ? 'bg-orange-50 border-orange-200 text-orange-600' : 'border-outline-variant text-outline'}`}
                        >
                          {event.isInterested ? 'Interested ✓' : 'Interested'}
                        </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* BOTTOM NAV BAR */}
      <nav className="fixed bottom-0 w-full z-50 flex justify-around items-center px-4 pb-6 pt-3 bg-surface-container-lowest/90 backdrop-blur-xl rounded-t-[2rem] shadow-[0_-8px_32px_rgba(0,0,0,0.06)] border border-surface-container">
        <Link href="/" className="flex flex-col items-center justify-center text-outline hover:text-primary px-4 py-2.5 active:scale-95 transition-all outline-none">
          <span className="material-symbols-outlined">medical_services</span>
          <span className="text-[10px] font-medium font-body mt-1">Home</span>
        </Link>
        <Link href="/safety" className="flex flex-col items-center justify-center text-outline hover:text-primary px-4 py-2.5 active:scale-95 transition-all outline-none">
          <span className="material-symbols-outlined">security</span>
          <span className="text-[10px] font-medium font-body mt-1">Safety</span>
        </Link>
        <Link href="/web" className="flex flex-col items-center justify-center text-outline hover:text-primary px-4 py-2.5 active:scale-95 transition-all outline-none">
          <span className="material-symbols-outlined">language</span>
          <span className="text-[10px] font-medium font-body mt-1">Web</span>
        </Link>
        <Link href="/finance" className="flex flex-col items-center justify-center text-outline hover:text-primary px-4 py-2.5 active:scale-95 transition-all outline-none">
          <span className="material-symbols-outlined">payments</span>
          <span className="text-[10px] font-medium font-body mt-1">Finance</span>
        </Link>
        <div className="bg-orange-100/50 text-orange-700 flex flex-col items-center justify-center rounded-2xl px-5 py-2.5 active:scale-95 transition-all outline-none shadow-sm">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>map</span>
          <span className="text-[10px] font-bold font-body mt-1">Map</span>
        </div>
      </nav>
    </div>
  );
}
