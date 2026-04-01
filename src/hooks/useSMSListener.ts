'use client';

import { useEffect } from 'react';
import { startRealTimeSmsListener } from '../services/smsListener';
import { FinanceTransaction } from '../lib/types';

/**
 * useSMSListener: A hook to start listening for SMS transaction alerts.
 * When an SMS is detected, it triggers the onDetection callback.
 */
export function useSMSListener(onDetection: (t: FinanceTransaction) => void) {
  useEffect(() => {
    let handler: { remove: () => void } | null = null;

    const init = async () => {
      try {
        console.log('Hook: Initializing SMS Listener...');
        handler = await startRealTimeSmsListener((transaction) => {
          // Pass the parsed transaction back to the component
          onDetection(transaction);
        });
      } catch (err) {
        console.error('Failed to start real-time SMS listener:', err);
      }
    };

    init();

    return () => {
      if (handler) {
        console.log('Hook: Cleaning up SMS Listener');
        handler.remove();
      }
    };
  }, [onDetection]);
}
