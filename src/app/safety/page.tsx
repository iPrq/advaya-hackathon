'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { LineChart, Line, ResponsiveContainer, YAxis, Tooltip } from 'recharts';
import { Activity, ShieldCheck, WifiOff } from 'lucide-react';

export default function SafetyPage() {
  const [emergencyEmail, setEmergencyEmail] = useState('');
  const [emailStatus, setEmailStatus] = useState<string | null>(null);
  
  // Real-time CSI Stream Data
  const [csiData, setCsiData] = useState<{ index: number; amplitude: number }[]>([]);
  const [prediction, setPrediction] = useState<string>("NO_FALL");
  const [networkError, setNetworkError] = useState(false);

  useEffect(() => {
    const ws = new WebSocket('wss://iprq-hackathonadvaya.hf.space/');

    ws.onopen = () => setNetworkError(false);
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.subcarriers) {
          setCsiData(data.subcarriers.map((val: number, idx: number) => ({ index: idx, amplitude: val })));
          setPrediction(data.prediction || "NO_FALL");
        }
      } catch (e) {}
    };

    ws.onerror = () => setNetworkError(true);
    ws.onclose = () => setNetworkError(true);

    return () => ws.close();
  }, []);

  const saveEmergencyContact = async () => {
    try {
      const res = await fetch('https://iprq-hackathonadvaya.hf.space/api/set-alert-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emergencyEmail })
      });
      if (res.ok) setEmailStatus('Saved successfully!');
      setTimeout(() => setEmailStatus(null), 3000);
    } catch (e) {
      setEmailStatus('Failed to save.');
    }
  };

  return (
    <div className="min-h-screen text-on-surface bg-background">
      <main className="max-w-4xl mx-auto px-6 pt-12 pb-32">
        <div className="bg-surface-container-low rounded-[2rem] p-8 border border-white/50 shadow-sm relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4 text-primary">
              <span className="material-symbols-outlined text-3xl">security</span>
              <h2 className="text-3xl font-headline font-extrabold text-on-surface">Aegis Safety</h2>
            </div>
            <p className="text-on-surface-variant font-body mb-8">
              Zero-Camera Wi-Fi Fall Detection is <strong className="text-emerald-600">Active</strong> in the background. 
              If the Neural Network detects a fall, it will automatically alert your emergency contact.
            </p>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-surface-container mb-6">
              <h3 className="font-bold font-headline text-lg mb-2">Emergency Contact Email</h3>
              <p className="text-sm text-outline mb-4">Set the email address of your caretaker to receive instant alerts.</p>
              <div className="flex gap-3">
                <input 
                  type="email" 
                  value={emergencyEmail}
                  onChange={(e) => setEmergencyEmail(e.target.value)}
                  placeholder="caretaker@example.com" 
                  className="flex-1 rounded-xl border-outline-variant bg-surface  focus:ring-2 focus:ring-primary focus:border-primary text-sm px-4 py-3 outline-none transition-all"
                />
                <button 
                  onClick={saveEmergencyContact}
                  className="bg-primary text-white font-bold px-6 py-3 rounded-xl hover:opacity-90 active:scale-95 transition-all"
                >
                  Save
                </button>
              </div>
              {emailStatus && <p className="text-sm font-bold text-emerald-600 mt-3">{emailStatus}</p>}
            </div>

            {/* REAL-TIME CSI STREAM */}
            <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-surface-container relative overflow-hidden">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-bold font-headline text-lg text-on-surface flex items-center gap-2">
                    <Activity className="w-5 h-5 text-primary" /> 
                    Live CSI Stream
                  </h3>
                  <p className="text-sm text-outline">Monitoring spatial subcarrier amplitude</p>
                </div>
                
                {/* Status Badge */}
                <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-2 ${
                  networkError 
                    ? 'bg-error-container text-on-error-container' 
                    : prediction === "FALL" 
                      ? 'bg-error text-white animate-pulse shadow-[0_0_15px_rgba(200,50,50,0.6)]' 
                      : 'bg-emerald-100 text-emerald-700'
                }`}>
                  {networkError ? (
                    <><WifiOff className="w-3.5 h-3.5" /> Offline</>
                  ) : prediction === "FALL" ? (
                    <><span className="w-2 h-2 bg-white rounded-full animate-ping" /> Fall Detected!</>
                  ) : (
                    <><ShieldCheck className="w-3.5 h-3.5" /> Secure</>
                  )}
                </div>
              </div>

              {/* Chart container */}
              <div className="w-full h-48 bg-surface-container/30 rounded-xl relative border border-surface-container-high border-dashed pt-4">
                {csiData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={csiData}>
                      <YAxis domain={[-30, 90]} hide />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#ffffff', borderRadius: '1rem', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        itemStyle={{ color: '#0ea5e9', fontWeight: 'bold' }}
                        labelFormatter={(label) => `Subcarrier ${label}`}
                        formatter={(value: any) => [Number(value).toFixed(2), 'Amplitude']}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="amplitude" 
                        stroke={prediction === "FALL" ? "#ef4444" : "#0ea5e9"} 
                        strokeWidth={3} 
                        dot={false}
                        isAnimationActive={false}
                        style={{ filter: prediction === "FALL" ? "drop-shadow(0px 0px 8px rgba(239,68,68,0.6))" : "drop-shadow(0px 0px 6px rgba(14,165,233,0.3))" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-outline text-sm">
                    <span className="material-symbols-outlined animate-spin mb-2">sync</span>
                    Connecting to sensor stream...
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* BOTTOM NAV BAR (Consolidated) */}
      <nav className="fixed bottom-0 w-full z-50 flex justify-around items-center px-4 pb-6 pt-3 bg-surface-container-lowest/90 backdrop-blur-xl rounded-t-[2rem] shadow-[0_-8px_32px_rgba(0,0,0,0.06)] border border-surface-container">
        <Link href="/" className="flex flex-col items-center justify-center text-outline hover:text-primary px-4 py-2.5 active:scale-95 transition-all outline-none">
          <span className="material-symbols-outlined">medical_services</span>
          <span className="text-[10px] font-medium font-body mt-1">Home</span>
        </Link>
        <div className="bg-secondary-container text-on-secondary-container flex flex-col items-center justify-center rounded-2xl px-5 py-2.5 active:scale-95 transition-all outline-none shadow-sm">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>security</span>
          <span className="text-[10px] font-bold font-body mt-1">Safety</span>
        </div>
        <Link href="/web" className="flex flex-col items-center justify-center text-outline hover:text-primary px-4 py-2.5 active:scale-95 transition-all outline-none">
          <span className="material-symbols-outlined">language</span>
          <span className="text-[10px] font-medium font-body mt-1">Web</span>
        </Link>
        <Link href="/finance" className="flex flex-col items-center justify-center text-outline hover:text-primary px-4 py-2.5 active:scale-95 transition-all outline-none">
          <span className="material-symbols-outlined">payments</span>
          <span className="text-[10px] font-medium font-body mt-1">Finance</span>
        </Link>
        <Link href="/map" className="flex flex-col items-center justify-center text-outline hover:text-primary px-4 py-2.5 active:scale-95 transition-all outline-none">
          <span className="material-symbols-outlined">map</span>
          <span className="text-[10px] font-medium font-body mt-1">Map</span>
        </Link>
      </nav>
    </div>
  );
}
