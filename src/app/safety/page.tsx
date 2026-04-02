'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';
import { Activity, ShieldCheck } from 'lucide-react';
import BottomNav from '@/components/BottomNav';

export default function SafetyPage() {
  const [emergencyEmail, setEmergencyEmail] = useState('');
  const [emailStatus, setEmailStatus] = useState<string | null>(null);
  
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
      if (res.ok) setEmailStatus('Contact updated');
      setTimeout(() => setEmailStatus(null), 3000);
    } catch (e) {
      setEmailStatus('Failed to update');
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-emerald-500/30">
      {/* Premium Header */}
      <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-[#050505]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3">
            <Link href="/home" className="text-white/40 hover:text-white transition-colors">
              <span className="material-symbols-outlined text-xl">arrow_back</span>
            </Link>
            <h1 className="text-lg font-bold tracking-tight text-white/90">Safety Monitor</h1>
          </div>
          <div className={`h-1.5 w-1.5 rounded-full ${networkError ? 'bg-red-500' : 'bg-emerald-500 animate-pulse'}`} />
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-5 pt-10 pb-40">
        <section className="mb-8 px-1">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400/80 mb-1">Aegis Protection</p>
          <h2 className="text-3xl font-bold tracking-tight text-white">Fall Detection</h2>
        </section>

        {/* Main Status Card */}
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 p-8 mb-6">
           <div className="flex flex-col md:flex-row justify-between gap-8 mb-10">
              <div className="space-y-4">
                 <div className="flex items-center gap-2">
                    <ShieldCheck className={`w-5 h-5 ${prediction === "FALL" ? 'text-red-400' : 'text-emerald-400'}`} />
                    <span className="text-xs font-bold uppercase tracking-widest text-white/30">Environment Status</span>
                 </div>
                 <div>
                    <h3 className={`text-4xl font-bold tracking-tighter ${prediction === "FALL" ? 'text-red-400' : 'text-white'}`}>
                       {networkError ? 'Offline' : prediction === "FALL" ? 'FALL ALERT' : 'SECURE'}
                    </h3>
                    <p className="text-white/40 text-sm mt-1">CSI Monitoring is active in the background.</p>
                 </div>
              </div>

              <div className="flex flex-col justify-center">
                 <div className="w-full md:w-64 h-24 relative opacity-40">
                    {csiData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={csiData}>
                          <YAxis domain={[-30, 90]} hide />
                          <Line 
                            type="monotone" 
                            dataKey="amplitude" 
                            stroke={prediction === "FALL" ? "#f87171" : "#10b981"} 
                            strokeWidth={2} 
                            dot={false}
                            isAnimationActive={false}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full text-[10px] text-white/20 uppercase tracking-widest">
                         Connecting to sensor...
                      </div>
                    )}
                 </div>
              </div>
           </div>

           <div className="h-[1px] w-full bg-white/5 mb-8" />

           {/* Emergency Config Inline */}
           <div className="flex flex-col sm:flex-row gap-3">
              <input 
                type="email" 
                value={emergencyEmail}
                onChange={(e) => setEmergencyEmail(e.target.value)}
                placeholder="Caretaker email" 
                className="flex-1 bg-white/[0.03] border border-white/5 rounded-2xl px-5 py-4 outline-none text-white text-sm focus:border-emerald-500/30 transition-all placeholder:text-white/20"
              />
              <button 
                onClick={saveEmergencyContact}
                className="bg-white text-black font-bold px-8 py-4 rounded-2xl hover:bg-emerald-400 active:scale-95 transition-all text-sm whitespace-nowrap"
              >
                Update Alert
              </button>
           </div>
           {emailStatus && <p className="text-[10px] font-bold text-emerald-400 mt-4 uppercase tracking-widest px-1">{emailStatus}</p>}
        </div>

        {/* Feature Grid - Matches /home style cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
           <div className="p-8 rounded-[2rem] bg-white/5 border border-white/5">
              <span className="material-symbols-outlined text-emerald-400/50 mb-4">sensors</span>
              <h4 className="font-bold text-sm mb-2 uppercase tracking-wide">CSI Monitoring</h4>
              <p className="text-white/40 text-xs leading-relaxed">
                Uses Wi-Fi signal interference analysis to detect falls without invading privacy via cameras.
              </p>
           </div>
           <div className="p-8 rounded-[2rem] bg-white/5 border border-white/5">
              <span className="material-symbols-outlined text-emerald-400/50 mb-4">emergency_share</span>
              <h4 className="font-bold text-sm mb-2 uppercase tracking-wide">Instant Alerts</h4>
              <p className="text-white/40 text-xs leading-relaxed">
                Automatically notifies your caretaker via encrypted email protocols the moment a fall is detected.
              </p>
           </div>
        </div>

        <div className="mt-20 text-center opacity-10 text-[10px] font-black uppercase tracking-[0.5em]">
           Aegis Medical Companion
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
