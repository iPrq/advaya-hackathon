'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Bot, Loader2, Volume2, VolumeX, Mic, RotateCcw, Sparkles } from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatBotProps {
  contextType: 'prescription' | 'webpage';
  context: string;
  title?: string;
  placeholder?: string;
}

// ── Speech Recognition ──────────────────────────────────
type SRInstance = {
  lang: string; interimResults: boolean; continuous: boolean;
  onstart: (() => void) | null;
  onresult: ((e: any) => void) | null;
  onerror:  (() => void) | null;
  onend:    (() => void) | null;
  start: () => void; stop: () => void;
};
function getSR(): (new () => SRInstance) | null {
  if (typeof window === 'undefined') return null;
  return (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition ?? null;
}

// ── Best English voice ──────────────────────────────────
function getBestVoice(): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined') return null;
  const voices = window.speechSynthesis.getVoices();
  for (const name of ['Google UK English Female', 'Google UK English Male', 'Google US English', 'Samantha']) {
    const v = voices.find((v) => v.name.includes(name));
    if (v) return v;
  }
  return voices.find((v) => v.lang.startsWith('en') && !v.localService) ?? voices.find((v) => v.lang.startsWith('en')) ?? null;
}

// ── Groq Orpheus TTS ──────────────────────────────────
async function speakText(
  text: string,
  audioRef: React.MutableRefObject<HTMLAudioElement | null>,
  onEnd: () => void
): Promise<void> {
  if (audioRef.current) { audioRef.current.pause(); audioRef.current.src = ''; audioRef.current = null; }
  try {
    const res = await fetch('https://iprq-hackathonadvaya.hf.space/api/tts', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: text.slice(0, 2000), voice: 'hannah' }),
    });
    if (!res.ok) throw new Error();
    const blob = await res.blob();
    const url  = URL.createObjectURL(blob);
    const audio = new Audio(url);
    audioRef.current = audio;
    audio.onended = () => { URL.revokeObjectURL(url); onEnd(); };
    audio.onerror = () => { URL.revokeObjectURL(url); onEnd(); };
    await audio.play();
  } catch {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utt = new SpeechSynthesisUtterance(text);
      const v = getBestVoice();
      if (v) utt.voice = v;
      utt.lang = v?.lang ?? 'en-GB'; utt.rate = 0.92;
      utt.onend = onEnd; utt.onerror = onEnd;
      window.speechSynthesis.speak(utt);
    } else { onEnd(); }
  }
}

// ── Component ───────────────────────────────────────────────────────────────
export default function ChatBot({ contextType, context, title, placeholder }: ChatBotProps) {
  const [messages, setMessages]   = useState<ChatMessage[]>([]);
  const [input, setInput]         = useState('');
  const [loading, setLoading]     = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [speakingIdx, setSpeakingIdx]       = useState<number | null>(null);
  const [ttsFetchIdx, setTtsFetchIdx]       = useState<number | null>(null);
  const [recording, setRecording]   = useState(false);
  const [interim, setInterim]       = useState('');

  const audioRef  = useRef<HTMLAudioElement | null>(null);
  const srRef     = useRef<SRInstance | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLInputElement>(null);

  // Greeting
  useEffect(() => {
    const g = contextType === 'prescription'
      ? "Hi! I've read your prescription. Ask me anything about your medications or dosage."
      : context?.length > 30
        ? "Hi! I've read the webpage summary. What would you like to know?"
        : "No page scanned yet — use the Chrome extension, then ask me anything.";
    setMessages([{ role: 'assistant', content: g }]);
  }, []);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading]);

  const stopAll = useCallback(() => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.src = ''; audioRef.current = null; }
    if (typeof window !== 'undefined' && window.speechSynthesis) window.speechSynthesis.cancel();
    setSpeakingIdx(null); setTtsFetchIdx(null);
  }, []);

  // Auto-speak new reply
  useEffect(() => {
    if (!autoSpeak || !messages.length) return;
    const last = messages[messages.length - 1];
    if (last.role !== 'assistant') return;
    const idx = messages.length - 1;
    setTtsFetchIdx(idx);
    speakText(last.content, audioRef, () => setSpeakingIdx(null)).then(() => {
      setTtsFetchIdx(null); setSpeakingIdx(idx);
    });
  }, [messages]);

  const handleSpeak = async (text: string, idx: number) => {
    if (speakingIdx === idx || ttsFetchIdx === idx) { stopAll(); return; }
    stopAll(); setTtsFetchIdx(idx);
    await speakText(text, audioRef, () => setSpeakingIdx(null));
    setTtsFetchIdx(null); setSpeakingIdx(idx);
  };

  const sendMessage = async (override?: string) => {
    const trimmed = (override ?? input).trim();
    if (!trimmed || loading) return;
    stopAll();
    const newMsgs: ChatMessage[] = [...messages, { role: 'user', content: trimmed }];
    setMessages(newMsgs); setInput(''); setInterim(''); setLoading(true);
    try {
      const res = await fetch('https://iprq-hackathonadvaya.hf.space/api/chat', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ context_type: contextType, context, messages: newMsgs }),
      });
      const data = await res.json();
      setMessages((p) => [...p, { role: 'assistant', content: data.reply }]);
    } catch {
      setMessages((p) => [...p, { role: 'assistant', content: '⚠️ Neural connection error. Please retry.' }]);
    } finally { setLoading(false); }
  };

  const startMic = () => {
    const SR = getSR();
    if (!SR) { alert('Speech recognition not supported.'); return; }
    stopAll();
    const rec = new SR();
    srRef.current = rec;
    rec.lang = 'en-IN'; rec.interimResults = true; rec.continuous = false;
    rec.onstart = () => setRecording(true);
    rec.onresult = (e: any) => {
      let fin = '', tmp = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) fin += t; else tmp += t;
      }
      if (fin) { setInput((p) => (p + ' ' + fin).trim()); setInterim(''); }
      else setInterim(tmp);
    };
    rec.onerror = () => { setRecording(false); setInterim(''); };
    rec.onend   = () => { setRecording(false); setInterim(''); inputRef.current?.focus(); };
    rec.start();
  };

  const stopMic = () => { srRef.current?.stop(); setRecording(false); };

  const clearChat = () => {
    stopAll();
    const g = contextType === 'prescription'
      ? "Hi! I've read your prescription. Ask me anything about your medications or dosage."
      : context?.length > 30
        ? "Hi! I've read the webpage summary. What would you like to know?"
        : "No page scanned yet — use the Chrome extension, then ask me anything.";
    setMessages([{ role: 'assistant', content: g }]);
    setInput(''); setInterim('');
  };

  const shownInput = recording && interim ? interim : input;

  return (
    <div className="rounded-[2rem] overflow-hidden border border-white/5 shadow-2xl bg-[#050505] flex flex-col min-h-[400px]">

      {/* ── Slim header bar ─────────────────────────────────────────────── */}
      <div className="flex items-center gap-4 px-6 py-4 border-b border-white/5 bg-white/[0.02]">
        <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0 border border-emerald-500/20">
          <Sparkles className="w-4 h-4 text-emerald-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/90 truncate">{title ?? 'Assistant'}</p>
          <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest mt-0.5">Llama 3.3 70B · Neural Flow</p>
        </div>
        <div className="flex items-center gap-2">
           <button
             onClick={() => { if (autoSpeak) stopAll(); setAutoSpeak((v) => !v); }}
             className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all bg-white/5 border border-white/10 ${autoSpeak ? 'text-emerald-400' : 'text-white/20'}`}
           >
             {autoSpeak ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
           </button>
           <button onClick={clearChat} className="w-8 h-8 rounded-xl flex items-center justify-center text-white/20 bg-white/5 border border-white/10 hover:text-white transition-all">
             <RotateCcw className="w-4 h-4" />
           </button>
           <div className="flex items-center gap-2 pl-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              <span className="text-[10px] font-black text-emerald-400/80 uppercase tracking-widest">Live</span>
           </div>
        </div>
      </div>

      {/* ── Messages ────────────────────────────────────────────────────── */}
      <div
        className="overflow-y-auto px-6 py-6 space-y-6 flex-1 bg-[#050505]"
        style={{ maxHeight: '420px' }}
      >
        {messages.map((msg, i) => (
          <div key={i} className={`flex items-start gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>

            {/* Avatar */}
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 border transition-all ${
               msg.role === 'assistant' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-white/10 border-white/10 text-white'
            }`}>
               {msg.role === 'assistant' ? <Bot className="w-4 h-4" /> : <span className="text-[10px] font-black">YU</span>}
            </div>

            <div className={`flex flex-col gap-2 max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div
                className={`px-5 py-4 text-sm leading-relaxed font-medium ${
                  msg.role === 'user'
                    ? 'bg-emerald-500 text-black rounded-3xl rounded-tr-none shadow-[0_8px_20px_rgba(16,185,129,0.1)]'
                    : 'bg-white/5 border border-white/10 text-white rounded-3xl rounded-tl-none'
                }`}
              >
                {msg.content}
              </div>

              {/* Listen pill — assistant only */}
              {msg.role === 'assistant' && (
                <button
                  onClick={() => handleSpeak(msg.content, i)}
                  className={`flex items-center gap-2 text-[10px] px-3 py-1.5 rounded-full transition-all font-black uppercase tracking-widest ${
                    speakingIdx === i
                      ? 'text-emerald-400 bg-emerald-500/10'
                      : ttsFetchIdx === i
                        ? 'text-white/20'
                        : 'text-white/30 hover:text-emerald-400 hover:bg-white/5'
                  }`}
                >
                  {ttsFetchIdx === i ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : speakingIdx === i ? (
                    <span className="flex gap-1 items-end h-3">
                      {[0, 80, 160].map((d) => (
                        <span key={d} className="w-0.5 rounded-full bg-emerald-400 animate-bounce" style={{ height: `${[8, 12, 8][d / 80]}px`, animationDelay: `${d}ms` }} />
                      ))}
                    </span>
                  ) : (
                    <Volume2 className="w-3 h-3" />
                  )}
                  {ttsFetchIdx === i ? 'Transmitting' : speakingIdx === i ? 'Stop' : 'Listen'}
                </button>
              )}
            </div>
          </div>
        ))}

        {/* Typing dots */}
        {loading && (
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0 border border-emerald-500/20">
              <Bot className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="bg-white/5 border border-white/10 px-6 py-5 rounded-3xl rounded-tl-none flex gap-1.5 items-center">
              {[0, 140, 280].map((d) => (
                <span key={d} className="w-1.5 h-1.5 rounded-full bg-emerald-400/40 animate-bounce" style={{ animationDelay: `${d}ms` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* ── Input bar ───────────────────────────────────────────────────── */}
      <div className="px-6 py-6 border-t border-white/5 bg-[#0a0a0a]">
        <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all duration-300 ${
          recording ? 'border-red-500/50 bg-red-500/5' : 'border-white/5 bg-white/5 focus-within:border-emerald-500/30'
        }`}>

          <button
            onPointerDown={startMic}
            onPointerUp={stopMic}
            onPointerLeave={stopMic}
            className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
              recording ? 'bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.3)]' : 'bg-white/5 text-white/30 hover:text-emerald-400'
            }`}
          >
            <Mic className="w-5 h-5" />
          </button>

          <input
            ref={inputRef}
            type="text"
            value={shownInput}
            onChange={(e) => !recording && setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
            placeholder={recording ? 'Neural Listening...' : (placeholder ?? 'Query context...')}
            readOnly={recording}
            className="flex-1 bg-transparent text-sm outline-none text-white placeholder:text-white/10 font-medium"
          />

          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading || recording}
            className="w-10 h-10 rounded-xl bg-emerald-500 text-black flex items-center justify-center disabled:opacity-20 active:scale-95 transition-all flex-shrink-0 shadow-lg shadow-emerald-500/10"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>

        <div className="mt-4 flex justify-center items-center gap-4 text-[9px] font-black uppercase tracking-[0.2em] text-white/10">
           <span>Hold mic for neural input</span>
           <span className="w-1 h-1 rounded-full bg-white/10" />
           <span>Press ↵ to transmit</span>
        </div>
      </div>
    </div>
  );
}
