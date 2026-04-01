'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import ChatBot from '@/components/ChatBot';
import { Volume2, Square, Loader2 } from 'lucide-react';

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

  // Chatbot — inline, always visible
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

  // Groq Orpheus TTS for English
  const handleEnglish = async () => {
    if (currentlySpeaking === 'en') { stopAll(); return; }
    if (!summaryData?.summary) return;
    stopAll();
    setLoadingTTS(true);
    setCurrentlySpeaking('en');
    try {
      const res = await fetch('https://iprq-hackathonadvaya.hf.space/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: summaryData.summary, voice: 'hannah' }),
      });
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => { URL.revokeObjectURL(url); setCurrentlySpeaking(null); };
      audio.onerror = () => { URL.revokeObjectURL(url); setCurrentlySpeaking(null); };
      setLoadingTTS(false);
      audio.play();
    } catch {
      setLoadingTTS(false);
      setCurrentlySpeaking(null);
    }
  };

  // Translate → Web Speech kn-IN for Kannada (Groq has no Kannada TTS model)
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
    utt.onend  = () => setCurrentlySpeaking(null);
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
    <div className="min-h-screen text-on-surface bg-background">
      <main className="max-w-4xl mx-auto px-6 pt-12 pb-32">
        <div className="bg-surface-container-low rounded-[2rem] p-8 border border-white/50 shadow-sm relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4 text-primary">
              <span className="material-symbols-outlined text-3xl">language</span>
              <h2 className="text-3xl font-headline font-extrabold text-on-surface">Web Summarizer</h2>
            </div>
            <p className="text-on-surface-variant font-body mb-8">
              Live updates from your Chrome Extension. Extracted webpage contents are processed by the{' '}
              <strong className="text-primary">Groq Llama 3.3 70B</strong> engine.
            </p>

            {/* User ID */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-surface-container mb-6">
              <h3 className="font-bold font-headline text-lg mb-2">User ID Link</h3>
              <p className="text-sm text-outline mb-4">Ensure this matches the User ID inside your Chrome Extension popup.</p>
              <input
                type="text"
                value={userId}
                onChange={(e) => { setUserId(e.target.value); setKannadaText(null); }}
                placeholder="user123"
                className="w-full rounded-xl border-outline-variant bg-surface focus:ring-2 focus:ring-primary focus:border-primary text-sm px-4 py-3 outline-none transition-all font-mono"
              />
            </div>

            {/* Extraction Result */}
            <div className={`rounded-2xl p-6 border transition-all duration-300 ${
              hasMeaningfulSummary ? 'bg-emerald-50 border-emerald-200' : 'bg-surface-container-lowest border-surface-container'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold font-headline text-lg text-on-surface">Extraction Result</h3>
                {summaryData?.status === 'processing' && (
                  <div className="flex items-center gap-2 text-sm text-primary font-bold animate-pulse">
                    <span className="w-3 h-3 rounded-full bg-primary animate-ping" />
                    Processing AI
                  </div>
                )}
                {hasMeaningfulSummary && (
                  <div className="flex items-center gap-2 text-sm text-emerald-700 font-bold">
                    <span className="material-symbols-outlined text-base">check_circle</span>
                    Model Complete
                  </div>
                )}
              </div>

              <div className="prose prose-sm prose-emerald max-w-none text-on-surface-variant bg-white p-4 rounded-xl border border-surface-container/50 shadow-inner min-h-[100px] whitespace-pre-wrap">
                {summaryData?.summary || 'Waiting for extension data...'}
              </div>

              {/* Voice + Doubts Buttons */}
              {hasMeaningfulSummary && (
                <div className="mt-4 flex flex-wrap gap-3">

                  {/* English TTS — Groq Orpheus */}
                  <button
                    onClick={handleEnglish}
                    disabled={loadingTTS && currentlySpeaking !== 'en'}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-95 shadow-sm ${
                      currentlySpeaking === 'en'
                        ? 'bg-primary text-white shadow-primary/30 shadow-md'
                        : 'bg-white border border-surface-container text-on-surface hover:border-primary hover:text-primary'
                    }`}
                  >
                    {loadingTTS && currentlySpeaking === 'en' ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Loading audio...</>
                    ) : currentlySpeaking === 'en' ? (
                      <>
                        <Square className="w-4 h-4" /> Stop
                        <span className="flex gap-0.5 ml-1">
                          {[0, 120, 240].map((d) => (
                            <span key={d} className="w-0.5 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />
                          ))}
                        </span>
                      </>
                    ) : (
                      <><Volume2 className="w-4 h-4" /> Read in English</>
                    )}
                  </button>

                  {/* Kannada TTS — Web Speech kn-IN */}
                  <button
                    onClick={handleKannada}
                    disabled={translating}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-95 shadow-sm disabled:opacity-60 ${
                      currentlySpeaking === 'kn'
                        ? 'bg-orange-500 text-white shadow-orange-300 shadow-md'
                        : 'bg-white border border-surface-container text-on-surface hover:border-orange-400 hover:text-orange-600'
                    }`}
                  >
                    {translating ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> ಅನುವಾದಿಸಲಾಗುತ್ತಿದೆ...</>
                    ) : currentlySpeaking === 'kn' ? (
                      <>
                        <Square className="w-4 h-4" /> ನಿಲ್ಲಿಸಿ
                        <span className="flex gap-0.5 ml-1">
                          {[0, 120, 240].map((d) => (
                            <span key={d} className="w-0.5 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />
                          ))}
                        </span>
                      </>
                    ) : (
                      <><Volume2 className="w-4 h-4" /> ಕನ್ನಡದಲ್ಲಿ ಓದಿ</>
                    )}
                  </button>

                  {/* ── Any Doubts button removed — chat is always inline below ── */}

                  {/* Kannada text preview */}
                  {kannadaText && (
                    <div className="w-full mt-2 bg-orange-50 border border-orange-200 rounded-xl p-4 text-sm text-orange-900 leading-relaxed">
                      <p className="text-[11px] font-bold text-orange-500 uppercase tracking-widest mb-1.5">
                        ಕನ್ನಡ ಅನುವಾದ · Groq Llama 3.3 70B
                      </p>
                      {kannadaText}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Inline AI Chat ───────────────────────────────────────────────── */}
        <div className="mt-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-primary text-xl">✦</span>
            <h3 className="font-bold font-headline text-base text-on-surface">
              {hasMeaningfulSummary ? 'Any doubts? Ask the AI' : 'AI Assistant'}
            </h3>
          </div>
          <ChatBot
            contextType="webpage"
            context={
              hasMeaningfulSummary
                ? summaryData!.summary
                : 'No webpage has been analyzed yet. The user has not sent any data from the Chrome extension.'
            }
            title="Web Assistant"
            placeholder="e.g. What is this page about?"
          />
        </div>
      </main>

      {/* BOTTOM NAV BAR (Consolidated) */}
      <nav className="fixed bottom-0 w-full z-50 flex justify-around items-center px-4 pb-6 pt-3 bg-surface-container-lowest/90 backdrop-blur-xl rounded-t-[2rem] shadow-[0_-8px_32px_rgba(0,0,0,0.06)] border border-surface-container">
        <Link href="/" className="flex flex-col items-center justify-center text-outline hover:text-primary px-4 py-2.5 active:scale-95 transition-all outline-none">
          <span className="material-symbols-outlined">medical_services</span>
          <span className="text-[10px] font-medium font-body mt-1">Home</span>
        </Link>
        <Link href="/safety" className="flex flex-col items-center justify-center text-outline hover:text-primary px-4 py-2.5 active:scale-95 transition-all outline-none">
          <span className="material-symbols-outlined">security</span>
          <span className="text-[10px] font-medium font-body mt-1">Safety</span>
        </Link>
        <div className="bg-secondary-container text-on-secondary-container flex flex-col items-center justify-center rounded-2xl px-5 py-2.5 active:scale-95 transition-all outline-none shadow-sm">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>language</span>
          <span className="text-[10px] font-bold font-body mt-1">Web</span>
        </div>
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
