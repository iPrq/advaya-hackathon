'use client';

import { useState, useEffect, useCallback } from 'react';
import { CommunityEvent } from '../lib/types';

const STORAGE_KEY = 'geofence_guardian_events';

// Default mock events to pre-populate the community map
const MOCK_EVENTS: CommunityEvent[] = [
  {
    id: 'e1',
    title: 'Free Blood Pressure Checkup',
    location: 'Community Center, Ward 5',
    time: 'Tomorrow, 10:00 AM',
    description: 'Come and get your blood pressure checked for free by our volunteer nurses.',
    joined: false,
    interestedCount: 12,
    isInterested: false
  },
  {
    id: 'e2',
    title: 'Yoga for Seniors',
    location: 'Central Park North',
    time: 'Sat, Oct 25, 7:00 AM',
    description: 'A gentle yoga session focused on flexibility and balance for 60+ age group.',
    joined: true,
    interestedCount: 8,
    isInterested: true
  }
];

export function useCommunity() {
  const [events, setEvents] = useState<CommunityEvent[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from LocalStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored) as CommunityEvent[];
          if (parsed.length > 0) {
            setEvents(parsed);
          } else {
            setEvents(MOCK_EVENTS);
          }
        } catch {
          setEvents(MOCK_EVENTS);
        }
      } else {
        setEvents(MOCK_EVENTS);
      }
      setIsLoaded(true);
    }
  }, []);

  // Sync to LocalStorage
  useEffect(() => {
    if (isLoaded && typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
    }
  }, [events, isLoaded]);

  const addEvent = useCallback((eventData: Omit<CommunityEvent, 'id' | 'joined'>) => {
    const newEvent: CommunityEvent = {
      ...eventData,
      id: Math.random().toString(36).substring(2, 9),
      joined: true, // Auto-join an event you create
      isInterested: false,
      interestedCount: 0,
    };
    setEvents((prev) => [newEvent, ...prev]);
  }, []);

  const joinEvent = useCallback((id: string) => {
    setEvents((prev) =>
      prev.map((e) => (e.id === id ? { ...e, joined: true } : e))
    );
  }, []);

  const toggleInterested = useCallback((id: string) => {
    setEvents((prev) =>
      prev.map((e) => {
        if (e.id === id) {
          const isInterested = !e.isInterested;
          const currentCount = e.interestedCount || 0;
          return {
            ...e,
            isInterested,
            interestedCount: isInterested ? currentCount + 1 : Math.max(0, currentCount - 1)
          };
        }
        return e;
      })
    );
  }, []);

  /** Remove an event from the list by id */
  const removeEvent = useCallback((id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
  }, []);

  return {
    events,
    addEvent,
    joinEvent,
    toggleInterested,
    removeEvent,
    isLoaded,
  };
}
