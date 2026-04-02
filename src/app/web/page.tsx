'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import ChatBot from '@/components/ChatBot';
import { Volume2, Square, Loader2, Globe } from 'lucide-react';
import BottomNav from '@/components/BottomNav';

type SpeakLang = 'en' | 'kn' | null;

export default function WebSummaryPage() {
  const [userId, setUserId] = useState('user123');
  const [summaryData, setSummaryData] = useState<{ status: string; summary: string } | null>(null);

  // Voice state
  const [kannadaText, setKannadaText] = useState<string | null>(null);
  const [translating, setTranslating] = useState(false);
  const [loadingTTS, setLoadingTTS] = useState(false);
  const [currentlySpeaking, setCurrentlySpeaking] = useState<SpeakLang>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const prevSummaryRef = useRef<string | null>(null);

  // Reset Kannada cache when summary changes
  useEffect(() => {
    if (summaryData?.summary && summaryData.summary !== prevSummaryRef.current) {
      prevSummaryRef.current = summaryData.summary;
      setKannadaText(null);
      stopAll();
    }
  }, [summaryData?.summary]);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await fetch(`https://iprq-hackathonadvaya.hf.space/api/webpage-summary/${userId}`);
        if (res.ok) setSummaryData(await res.json());
      } catch (e) {
        console.error('Failed to fetch summary', e);
      }
    };
    fetchSummary();
    const interval = setInterval(fetchSummary, 3000);
    return () => clearInterval(interval);
  }, [userId]);

  const stopAll = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
      audioRef.current = null;
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) window.speechSynthesis.cancel();
    setCurrentlySpeaking(null);
    setLoadingTTS(false);
  };

  // ── English TTS (Groq Orpheus with Web Speech Fallback) ──────────────────
  const handleEnglish = async () => {
    if (currentlySpeaking === 'en') { stopAll(); return; }
    if (!summaryData?.summary) return;
    stopAll();
    setLoadingTTS(true);
    setCurrentlySpeaking('en');

    try {
      // 1. Attempt High-Quality Groq TTS
      const res = await fetch('https://iprq-hackathonadvaya.hf.space/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: summaryData.summary.slice(0, 2000), // Slice to prevent payload errors
          voice: 'hannah' 
        }),
      });

      if (!res.ok) throw new Error('API_FAIL');
      
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audioRef.current = audio;
      
      audio.onended = () => { URL.revokeObjectURL(url); setCurrentlySpeaking(null); };
      audio.onerror = () => { throw new Error('AUDIO_PLAYBACK_FAIL'); };
      
      setLoadingTTS(false);
      await audio.play();

    } catch (err) {
      console.warn('Groq TTS failed, falling back to browser speech engine...', err);
      
      // 2. Fallback to Browser Native Speech Synthesis
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
        const utt = new SpeechSynthesisUtterance(summaryData.summary);
        
        // Find best English voice
        const voices = window.speechSynthesis.getVoices();
        const voice = voices.find(v => v.lang.startsWith('en-GB') || v.lang.startsWith('en-US'));
        if (voice) utt.voice = voice;
        
        utt.lang = 'en-US';
        utt.rate = 0.95;
        utt.onend = () => setCurrentlySpeaking(null);
        utt.onerror = () => setCurrentlySpeaking(null);
        
        setLoadingTTS(false);
        window.speechSynthesis.speak(utt);
      } else {
        setLoadingTTS(false);
        setCurrentlySpeaking(null);
      }
    }
  };

  // Translate → Web Speech kn-IN for Kannada
  const speakKannadaText = (text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const voices = window.speechSynthesis.getVoices();
    const knVoice = voices.find((v) => v.lang === 'kn-IN')
      ?? voices.find((v) => v.lang.startsWith('kn'))
      ?? null;
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = 'kn-IN';
    utt.rate = 0.82;
    if (knVoice) utt.voice = knVoice;
    utt.onend = () => setCurrentlySpeaking(null);
    utt.onerror = () => setCurrentlySpeaking(null);
    setCurrentlySpeaking('kn');
    window.speechSynthesis.speak(utt);
  };

  const handleKannada = async () => {
    if (currentlySpeaking === 'kn') { stopAll(); return; }
    if (!summaryData?.summary) return;
    stopAll();

    if (kannadaText) { speakKannadaText(kannadaText); return; }

    setTranslating(true);
    try {
      const res = await fetch('https://iprq-hackathonadvaya.hf.space/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: summaryData.summary, target_language: 'Kannada' }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setKannadaText(data.translated_text);
      speakKannadaText(data.translated_text);
    } catch {
      console.error('Kannada translation error');
    } finally {
      setTranslating(false);
    }
  };

  const hasMeaningfulSummary =
    summaryData?.status === 'done' &&
    !!summaryData.summary &&
    summaryData.summary !== 'No data found for this user.' &&
    summaryData.summary !== 'Failed to generate summary.';

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-emerald-500/30">
      {/* HEADER */}
      <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-[#050505]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3">
            <Link href="/home" className="text-white/40 hover:text-white transition-colors">
              <span className="material-symbols-outlined text-xl">arrow_back</span>
            </Link>
            <h1 className="text-lg font-bold tracking-tight text-white/90">Web Summarizer</h1>
          </div>
          {summaryData?.status === 'processing' && (
            <div className="flex items-center gap-2">
               <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
               <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Syncing</span>
            </div>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-5 pt-10 pb-40">
        <section className="mb-10 px-1">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400/80 mb-1">Aegis Intelligence</p>
          <h2 className="text-3xl font-bold tracking-tight text-white">Neural Hub</h2>
        </section>

        <div className="rounded-[2.5rem] bg-white/[0.03] border border-white/10 p-10 shadow-2xl mb-8 relative group">
           <div className="flex items-center gap-4 mb-10 px-1">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
                 <Globe className="w-6 h-6" />
              </div>
              <div>
                 <h3 className="font-bold text-xl leading-none">External Feed</h3>
                 <p className="text-[10px] text-white/20 font-black uppercase tracking-[0.1em] mt-1.5">Neural Web Analysis</p>
              </div>
           </div>

           {/* User ID Section - Simplified (Removed extra inner box) */}
           <div className="mb-12 px-1">
              <div className="flex justify-between items-center mb-3">
                 <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30 pl-1">Credential Link</h4>
                 <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
                    <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">Active Link</span>
                 </div>
              </div>
              <input
                 type="text"
                 value={userId}
                 onChange={(e) => { setUserId(e.target.value); setKannadaText(null); }}
                 placeholder="user123"
                 className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-5 outline-none text-white focus:border-emerald-500/30 transition-all font-mono text-sm placeholder:text-white/10 focus:bg-white/[0.07]"
              />
           </div>

           {/* Extraction Result - Simplified (Unified with container) */}
           <div className="px-1">
              <div className="flex items-center justify-between mb-4 pl-1">
                 <h5 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30">Analysis Stream</h5>
                 {summaryData?.status === 'processing' ? (
                    <div className="flex items-center gap-2">
                       <Loader2 className="w-3 h-3 text-emerald-500 animate-spin" />
                       <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Syncing Intelligence</span>
                    </div>
                 ) : hasMeaningfulSummary ? (
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 flex items-center gap-2">
                       <span className="material-symbols-outlined text-[14px]">check_circle</span>
                       Transmission Ready
                    </span>
                 ) : null}
              </div>

              <div className={`p-8 rounded-[2rem] border transition-all duration-700 min-h-[160px] whitespace-pre-wrap text-white/80 text-sm leading-relaxed font-medium ${hasMeaningfulSummary ? 'bg-white/[0.03] border-emerald-500/20 shadow-[0_0_40px_rgba(16,185,129,0.03)]' : 'bg-transparent border-white/5'}`}>
                 {summaryData?.summary || 'Waiting for browser extension data...'}
              </div>

              {/* Voice Controls */}
              {hasMeaningfulSummary && (
                <div className="mt-8 flex flex-col gap-3">
                   <div className="flex flex-wrap gap-3">
                      <button
                        onClick={handleEnglish}
                        disabled={loadingTTS && currentlySpeaking !== 'en'}
                        className={`flex-1 min-w-[160px] flex items-center justify-center gap-3 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border shadow-lg ${currentlySpeaking === 'en'
                            ? 'bg-emerald-500 text-black border-emerald-500'
                            : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white'
                          }`}
                      >
                        {loadingTTS && currentlySpeaking === 'en' ? (
                          <Loader2 className="w-4 h-4 animate-spin text-black" />
                        ) : currentlySpeaking === 'en' ? (
                          <Square className="w-4 h-4 fill-current" />
                        ) : (
                          <Volume2 className="w-4 h-4" />
                        )}
                        {currentlySpeaking === 'en' ? 'Stop Stream' : 'Listen: English'}
                      </button>

                      <button
                        onClick={handleKannada}
                        disabled={translating}
                        className={`flex-1 min-w-[160px] flex items-center justify-center gap-3 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border shadow-lg ${currentlySpeaking === 'kn'
                            ? 'bg-emerald-500 text-black border-emerald-500'
                            : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white'
                          }`}
                      >
                        {translating ? (
                          <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                        ) : currentlySpeaking === 'kn' ? (
                          <Square className="w-4 h-4 fill-current" />
                        ) : (
                          <Volume2 className="w-4 h-4" />
                        )}
                        {currentlySpeaking === 'kn' ? 'ನಿಲ್ಲಿಸಿ' : 'ಕನ್ನಡದಲ್ಲಿ ಓದಿ'}
                      </button>
                   </div>

                   {/* Kannada Preview Box */}
                   {kannadaText && (
                      <div className="mt-4 p-8 rounded-[2rem] bg-emerald-500/5 border border-emerald-500/10 text-emerald-400 text-sm leading-relaxed animate-in fade-in slide-in-from-top-4 duration-700 shadow-inner">
                         <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-4 opacity-50">Translation Preview</p>
                         {kannadaText}
                      </div>
                   )}
                </div>
              )}
           </div>

           {/* Backdrop Scan Subtle Sweep */}
           {summaryData?.status === 'processing' && (
              <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent animate-[scan-beam_3s_linear_infinite]" />
           )}
        </div>

        {/* AI INTERROGATION / CHAT */}
        <div className="mt-12 px-1">
           <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                 <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">
                    {hasMeaningfulSummary ? 'Interrogate Context' : 'Aegis Assistant'}
                 </h3>
              </div>
              {hasMeaningfulSummary && <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">Active session</span>}
           </div>
           
           <div className="rounded-[2.5rem] overflow-hidden border border-white/5 bg-white/[0.02]">
              <ChatBot
                contextType="webpage"
                context={
                  hasMeaningfulSummary
                    ? summaryData!.summary
                    : 'No webpage has been analyzed yet. Transmission is idle.'
                }
                title="Neural Assistant"
                placeholder="Query clinical context..."
              />
           </div>
        </div>

        <div className="mt-24 text-center opacity-10 text-[10px] font-black uppercase tracking-[0.6em]">
           Aegis Guard Knowledge Engine
        </div>
      </main>

      <BottomNav />

      <style jsx global>{`
        @keyframes scan-beam {
           0% { transform: translateX(-100%); }
           100% { transform: translateX(100%); }
        }
        body {
          font-family: 'Inter', sans-serif;
        }
      `}</style>
    </div>
  );
}
