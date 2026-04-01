'use client';

import { useEffect } from 'react';
import { defineCustomElements } from '@ionic/pwa-elements/loader';

export default function CapacitorLoader() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      defineCustomElements(window);
    }
  }, []);

  return null;
}
