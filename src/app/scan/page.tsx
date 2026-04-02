'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { defineCustomElements } from '@ionic/pwa-elements/loader';
import { ParsedReport } from '@/lib/types';
import ReportTimeline from '@/components/ReportTimeline';
import ChatBot from '@/components/ChatBot';

export default function ScanPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<ParsedReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    defineCustomElements(window);
  }, []);

  const scanDocument = async () => {
    try {
      setError(null);
      setReport(null);

      const image = await Camera.getPhoto({
        quality: 90,
        resultType: CameraResultType.Base64,
        source: CameraSource.Prompt,
      });

      if (image.base64String) {
        setLoading(true);
        const res = await fetch('https://iprq-hackathonadvaya.hf.space/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            base64_image: image.base64String,
            mime_type: `image/${image.format || 'jpeg'}`,
          }),
        });
        if (!res.ok) throw new Error('Analysis failed');
        const result = await res.json();
        setReport(result);
      }
    } catch (e: unknown) {
      const err = e as { message?: string };
      if (err?.message !== 'User cancelled photos app') {
        setError('Failed to process image. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col text-white"
      style={{ background: 'radial-gradient(circle at center, #0a2a28 0%, #000 70%)', fontFamily: "'Inter', sans-serif" }}
    >
      {/* Back button */}
      <div className="px-6 pt-8 pb-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm font-medium"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
      </div>

      {/* ── REPORT VIEW ─────────────────────────────────────────────────── */}
      {report && !loading && (
        <main className="max-w-4xl mx-auto w-full px-6 pt-4 pb-32">
          <header className="flex flex-col items-center mb-8">
            <div className="w-12 h-12 rounded-full bg-emerald-400/10 border border-emerald-400/30 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold tracking-tight mb-1">Analysis Complete</h1>
            <p className="text-gray-500 text-sm">Report processed securely by Aegis AI</p>
          </header>

          <ReportTimeline report={report} />

          {/* Scan Again FAB */}
          <div className="fixed bottom-10 left-0 right-0 flex justify-center pointer-events-none z-40">
            <button
              onClick={scanDocument}
              className="pointer-events-auto btn-glass px-8 py-4 rounded-full flex items-center gap-3 font-semibold"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Scan New Document
            </button>
          </div>

          {/* AI Chat */}
          <div className="mt-8">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-emerald-400">✦</span>
              <h3 className="font-bold text-base">Any doubts? Ask the AI</h3>
            </div>
            <ChatBot
              contextType="prescription"
              context={JSON.stringify(report, null, 2)}
              title="Prescription Assistant"
              placeholder="e.g. When do I take Metformin?"
            />
          </div>
        </main>
      )}

      {/* ── DEFAULT SCAN UI ──────────────────────────────────────────────── */}
      {!report && !loading && (
        <main className="flex-1 flex flex-col items-center justify-center px-6 pb-16 text-center">
          {/* HIPAA Badge */}
          <div className="glass px-5 py-2 rounded-full fade-up mb-8 text-xs font-semibold tracking-widest uppercase text-emerald-300">
            HIPAA Compliant
          </div>

          {/* Headline */}
          <h1 className="fade-up text-4xl font-bold tracking-tight leading-tight mb-4 max-w-sm" style={{ animationDelay: '0.1s' }}>
            Scan Medical<br />
            <span className="text-gradient">Document</span>
          </h1>
          <p className="text-gray-400 text-base mb-12 max-w-xs leading-relaxed fade-up" style={{ animationDelay: '0.2s' }}>
            Point your camera at any medical report, lab result, or prescription.
          </p>

          {/* Scanner Card */}
          <div
            className="relative w-64 h-80 rounded-3xl glass glow flex items-center justify-center overflow-hidden fade-up mb-12"
            style={{ animationDelay: '0.3s' }}
          >
            <div className="w-52 h-68 rounded-2xl bg-white/5 p-4 relative overflow-hidden">
              <div className="space-y-3 opacity-50">
                <div className="h-1.5 bg-white/40 rounded-full w-3/4" />
                <div className="h-1.5 bg-white/20 rounded-full w-1/2" />
                <div className="h-1.5 bg-white/20 rounded-full w-full mt-4" />
                <div className="h-1.5 bg-white/20 rounded-full w-5/6" />
                <div className="h-1.5 bg-white/20 rounded-full w-4/6" />
                <div className="h-1.5 bg-white/20 rounded-full w-full mt-4" />
                <div className="h-1.5 bg-white/20 rounded-full w-2/3" />
                <div className="h-1.5 bg-white/10 rounded-full w-3/4 mt-3" />
              </div>
              {/* Graph */}
              <div className="absolute bottom-5 left-4 w-20 h-10 opacity-40">
                <svg viewBox="0 0 100 40" className="w-full h-full">
                  <path d="M0 30 Q20 10 40 25 T80 15" stroke="#00ffc8" strokeWidth="2" fill="none" />
                </svg>
              </div>
              {/* Scan line */}
              <div className="scan-line" />
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 px-5 py-3 rounded-2xl text-sm font-medium text-red-300 bg-red-500/10 border border-red-500/20 max-w-sm">
              {error}
            </div>
          )}

          {/* CTA */}
          <button
            onClick={scanDocument}
            className="btn-glass px-10 py-4 rounded-full text-base fade-up"
            style={{ animationDelay: '0.4s' }}
          >
            Scan Medical Document →
          </button>

          <p className="mt-6 text-gray-600 text-xs flex items-center gap-1.5 fade-up" style={{ animationDelay: '0.5s' }}>
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 2a4 4 0 00-4 4v3H5a1 1 0 000 2h10a1 1 0 000-2h-1V6a4 4 0 00-4-4zm-2 7V6a2 2 0 114 0v3H8z" />
            </svg>
            End-to-end encrypted & HIPAA secure
          </p>
        </main>
      )}

      {/* ── PREMIUM LOADING OVERLAY ──────────────────────────────────────── */}
      {loading && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(20px)' }}
        >
          {/* Spinning ring */}
          <div className="relative w-16 h-16 mb-8">
            <div className="absolute inset-0 rounded-full border-2 border-white/10" />
            <div className="absolute inset-0 rounded-full border-2 border-t-emerald-400 border-r-transparent border-b-transparent border-l-transparent animate-spin" />
          </div>

          <p className="text-white font-semibold text-lg tracking-tight mb-2">
            Analyzing Report
          </p>
          <p className="text-gray-500 text-sm font-medium">
            Running HIPAA-compliant extraction...
          </p>

          {/* Pulsing dots */}
          <div className="flex gap-1.5 mt-8">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
