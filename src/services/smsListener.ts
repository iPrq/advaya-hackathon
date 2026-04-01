import { FinanceTransaction } from '../lib/types';

/**
 * simulatedSmsDetection: A mock service for SMS transaction detection.
 * In a real production app on Capacitor, this would use a plugin
 * like capacitor-voice-recorder or similar depending on OS capabilities,
 * or ideally Capacitor SMS Receiver for Android.
 */
export async function startRealTimeSmsListener(onDetection: (t: FinanceTransaction) => void) {
  console.log('Service: SMS Listener started (Simulation Mode)');

  // Simulate an SMS arrival every 45-60 seconds 
  const interval = setInterval(() => {
    const isMockTrigger = Math.random() > 0.8; // Only trigger sometimes to simulate reality
    if (isMockTrigger) {
      const mockTransaction: FinanceTransaction = {
        id: Math.random().toString(36).substring(7),
        amount: Math.floor(Math.random() * 500) + 50,
        type: 'expense',
        category: 'Auto-detected',
        note: 'Simulated SMS detection from bank alert',
        date: new Date().toISOString()
      };
      onDetection(mockTransaction);
    }
  }, 45000);

  return {
    remove: () => {
      console.log('Service: SMS Listener stopped');
      clearInterval(interval);
    }
  };
}
