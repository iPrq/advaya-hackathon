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

// ── Speech Recognition (browser native, no TypeScript lib needed) ───────────
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

// ── Best English voice for Web Speech fallback ──────────────────────────────
function getBestVoice(): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined') return null;
  const voices = window.speechSynthesis.getVoices();
  for (const name of ['Google UK English Female', 'Google UK English Male', 'Google US English', 'Samantha']) {
    const v = voices.find((v) => v.name.includes(name));
    if (v) return v;
  }
  return voices.find((v) => v.lang.startsWith('en') && !v.localService) ?? voices.find((v) => v.lang.startsWith('en')) ?? null;
}

// ── Groq Orpheus TTS with browser fallback ──────────────────────────────────
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
      setMessages((p) => [...p, { role: 'assistant', content: '⚠️ Something went wrong. Please try again.' }]);
    } finally { setLoading(false); }
  };

  // Voice input — hold mic
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
    <div className="rounded-2xl overflow-hidden border border-surface-container shadow-sm bg-white flex flex-col">

      {/* ── Slim header bar ─────────────────────────────────────────────── */}
      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-surface-container bg-surface-container-lowest/60">
        <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-on-surface truncate">{title ?? 'AI Assistant'}</p>
          <p className="text-[11px] text-outline">Groq · Llama 3.3 70B</p>
        </div>
        <button
          onClick={() => { if (autoSpeak) stopAll(); setAutoSpeak((v) => !v); }}
          title={autoSpeak ? 'Mute' : 'Unmute'}
          className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${autoSpeak ? 'text-primary bg-primary/10' : 'text-outline bg-surface-container'}`}
        >
          {autoSpeak ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
        </button>
        <button onClick={clearChat} title="Clear" className="w-7 h-7 rounded-full flex items-center justify-center text-outline bg-surface-container transition-all hover:text-primary">
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[11px] text-emerald-600 font-medium">Live</span>
        </span>
      </div>

      {/* ── Messages ────────────────────────────────────────────────────── */}
      <div
        className="overflow-y-auto px-4 py-4 space-y-3 bg-[#f8f9fb]"
        style={{ minHeight: '200px', maxHeight: '320px' }}
      >
        {messages.map((msg, i) => (
          <div key={i} className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>

            {/* Bot avatar — left side only */}
            {msg.role === 'assistant' && (
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mb-5">
                <Bot className="w-3.5 h-3.5 text-primary" />
              </div>
            )}

            <div className={`flex flex-col gap-1 max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div
                className={`px-3.5 py-2.5 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-primary text-white rounded-2xl rounded-br-md'
                    : 'bg-white border border-surface-container text-on-surface rounded-2xl rounded-bl-md shadow-sm'
                }`}
              >
                {msg.content}
              </div>

              {/* Listen pill — assistant only */}
              {msg.role === 'assistant' && (
                <button
                  onClick={() => handleSpeak(msg.content, i)}
                  className={`flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full transition-all font-medium ${
                    speakingIdx === i
                      ? 'text-primary'
                      : ttsFetchIdx === i
                        ? 'text-outline'
                        : 'text-outline hover:text-primary'
                  }`}
                >
                  {ttsFetchIdx === i ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : speakingIdx === i ? (
                    <span className="flex gap-0.5 items-end h-3">
                      {[0, 80, 160].map((d) => (
                        <span key={d} className="w-0.5 rounded-full bg-primary animate-bounce" style={{ height: `${[8, 12, 8][d / 80]}px`, animationDelay: `${d}ms` }} />
                      ))}
                    </span>
                  ) : (
                    <Volume2 className="w-3 h-3" />
                  )}
                  {ttsFetchIdx === i ? 'Loading…' : speakingIdx === i ? 'Stop' : 'Listen'}
                </button>
              )}
            </div>
          </div>
        ))}

        {/* Typing dots */}
        {loading && (
          <div className="flex items-end gap-2 justify-start">
            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Bot className="w-3.5 h-3.5 text-primary" />
            </div>
            <div className="bg-white border border-surface-container px-3.5 py-3 rounded-2xl rounded-bl-md shadow-sm flex gap-1 items-center">
              {[0, 140, 280].map((d) => (
                <span key={d} className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: `${d}ms` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* ── Input bar ───────────────────────────────────────────────────── */}
      <div className="px-3 py-3 border-t border-surface-container bg-white">
        <div className={`flex items-center gap-2 px-3 py-2 rounded-2xl border transition-all ${
          recording ? 'border-red-300 bg-red-50' : 'border-surface-container bg-surface-container-lowest focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20'
        }`}>

          {/* Mic — hold to speak */}
          <button
            onPointerDown={startMic}
            onPointerUp={stopMic}
            onPointerLeave={stopMic}
            title="Hold to speak"
            className={`relative w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 select-none transition-all ${
              recording ? 'bg-red-500 text-white' : 'text-outline hover:text-primary'
            }`}
          >
            <Mic className="w-4 h-4" />
            {recording && <span className="absolute inset-0 rounded-xl bg-red-400/40 animate-ping" />}
          </button>

          <input
            ref={inputRef}
            type="text"
            value={shownInput}
            onChange={(e) => !recording && setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
            placeholder={recording ? 'Listening…' : (placeholder ?? 'Ask a question…')}
            readOnly={recording}
            className="flex-1 bg-transparent text-sm outline-none text-on-surface placeholder:text-outline/60"
          />

          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading || recording}
            className="w-8 h-8 rounded-xl bg-primary text-white flex items-center justify-center disabled:opacity-35 active:scale-90 transition-all flex-shrink-0"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
          </button>
        </div>

        <p className="text-center text-[10px] text-outline/50 mt-1.5">
          {recording ? '🔴 Release to finish' : 'Hold mic · type · press ↵ to send'}
        </p>
      </div>
    </div>
  );
}
