'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const [isStarting, setIsStarting] = useState(false);
  const router = useRouter();

  const handleGetStarted = () => {
    setIsStarting(true);
    // Premium loading state before entering dashboard
    setTimeout(() => router.push('/home'), 1500);
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 text-center text-white"
      style={{
        fontFamily: "'Inter', sans-serif",
        background: 'radial-gradient(circle at center, #0a2a28 0%, #000 70%)',
      }}
    >
      {/* HIPAA Badge */}
      <div className="glass px-5 py-2 rounded-full fade-up mb-8 text-[10px] font-bold tracking-[0.2em] uppercase text-emerald-400/80">
        HIPAA & SOC-2 Compliant
      </div>

      {/* Logo Section */}
      <div className="relative w-48 h-48 mb-8 fade-up" style={{ animationDelay: '0.1s' }}>
        <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-[80px]" />
        <img
          src="/gg.png"
          alt="Aegis Logo"
          className="relative z-10 w-full h-full object-contain filter drop-shadow-[0_0_20px_rgba(52,211,153,0.3)]"
        />
      </div>

      {/* Headline */}
      <h1 className="fade-up max-w-2xl leading-tight text-5xl md:text-6xl font-bold tracking-tight mb-6" style={{ animationDelay: '0.2s' }}>
        Aegis Medical Companion<br />
        <span className="text-gradient">at your fingertips.</span>
      </h1>

      {/* Description */}
      <div className="fade-up max-w-md mx-auto" style={{ animationDelay: '0.3s' }}>
        <p className="text-gray-400 text-lg font-medium leading-relaxed mb-12">
          Instantly analyze medical reports, lab results, and prescriptions with professional-grade precision.
        </p>
      </div>

      {/* CTA Button */}
      <button
        onClick={handleGetStarted}
        className="group relative px-12 py-5 rounded-full btn-glass fade-up overflow-hidden transition-all duration-300 hover:scale-105 active:scale-95"
        style={{ animationDelay: '0.4s' }}
      >
        <span className="relative z-10 flex items-center gap-3 text-lg font-bold tracking-tight text-white">
          Get Started
          <svg
            className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </span>
      </button>

      {/* Trusted By / Policy */}
      <div
        className="mt-16 flex items-center gap-2 text-gray-500 fade-up"
        style={{ fontSize: '0.75rem', animationDelay: '0.5s' }}
      >
        <svg className="w-4 h-4 opacity-50" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 2a4 4 0 00-4 4v3H5a1 1 0 000 2h10a1 1 0 000-2h-1V6a4 4 0 00-4-4zm-2 7V6a2 2 0 114 0v3H8z" />
        </svg>
        <span>Encrypted & Private</span>
      </div>

      {/* Initializing AI Overlay */}
      {isStarting && (
        <div
          className="fixed inset-0 z-[200] flex flex-col items-center justify-center p-6 text-center"
          style={{ background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(30px)' }}
        >
          {/* Logo spinning scale pulse */}
          <div className="relative w-24 h-24 mb-10 overflow-hidden rounded-full animate-pulse">
             <div className="absolute inset-0 bg-emerald-500/20 animate-ping" />
             <img src="/gg.png" alt="Aegis" className="w-full h-full object-contain relative z-10" />
          </div>

          <h2 className="text-white font-bold text-2xl tracking-tight mb-3">
            Initializing Aegis AI
          </h2>
          <p className="text-gray-500 font-medium max-w-xs leading-relaxed">
            Establishing secure HIPAA connection and analyzing healthcare metrics...
          </p>

          {/* Minimal progress bar */}
          <div className="w-48 h-[2px] bg-white/10 rounded-full mt-10 overflow-hidden">
            <div className="h-full bg-emerald-400 animate-[loading-bar_1.5s_ease-in-out_infinite]" />
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes loading-bar {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .text-gradient {
          background: linear-gradient(135deg, #34d399 0%, #059669 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .btn-glass {
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3);
        }
        .btn-glass:hover {
          background: rgba(255, 255, 255, 0.12);
          border-color: rgba(52, 211, 153, 0.4);
          box-shadow: 0 0 20px rgba(52, 211, 153, 0.2);
        }
      `}</style>
    </div>
  );
}