'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import FinanceSummary from '@/components/FinanceSummary';
import BottomNav from '@/components/BottomNav';

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-emerald-500/30">
      {/* HEADER */}
      <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-[#050505]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <span className="material-symbols-outlined text-emerald-400 text-xl">shield_moon</span>
            </div>
            <h1 className="text-lg font-bold tracking-tight text-white/90">Aegis</h1>
          </div>
          <button className="h-9 w-9 overflow-hidden rounded-full border border-white/10 ring-2 ring-emerald-500/20 transition-all hover:ring-emerald-500/40">
            <img
              alt="User"
              className="h-full w-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuC3pAS0jIqB54KzwR8tL7fz54QqSL-T80TXUqN5_qDqTO6Exzec5SejDMF3TtLHLe0roS3gQ5AkIMl83gaT2YN2mI2DMqoXcuWHjuT8JbjldZz0rn51Ndq4ejqnaFz1Oim_yDooDwLLIpfNZQFaRlv0Kfsr7-CBTZK73trKwkZ70u6wnToDiLwfk5lLw_mMtoPj2pPwUGnkqVYhzGpkGT-GBlpbtnlKlGpjXRitDNazmXU9BB3teouTX6QTyC0nLOqu424WGrqPphw"
            />
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 pt-10 pb-36">
        {/* Welcome Section */}
        <section className="mb-10">
          <p className="text-sm font-medium text-emerald-400/80 mb-1 uppercase tracking-[0.2em]">Patient Dashboard</p>
          <h2 className="text-3xl font-bold tracking-tight text-white">Welcome back, <span className="text-white/60">User</span></h2>
        </section>

        {/* Health Wellness & Scan Action */}
        <div className="mb-10">
          <div className="relative group overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-emerald-500/20 to-emerald-900/10 border border-emerald-500/20 p-8 flex flex-col justify-between h-64 transition-all hover:border-emerald-500/40">
            <div className="relative z-10">
              <div className="flex items-center gap-2 text-emerald-400 mb-3">
                <span className="material-symbols-outlined text-2xl">health_metrics</span>
                <span className="text-xs font-bold uppercase tracking-[0.2em]">Health Insights</span>
              </div>
              <h3 className="text-3xl font-bold mb-2">Patient Status: <span className="text-emerald-400">Stable</span></h3>
              <p className="text-white/50 text-sm max-w-sm leading-relaxed">
                Your medical history and clinical vitals are synchronized. Start a new analysis to update your health profile.
              </p>
            </div>
            
            <button 
              onClick={() => router.push('/scan')}
              className="relative z-10 w-fit flex items-center gap-3 bg-white text-black px-8 py-4 rounded-full font-bold text-base transition-all hover:bg-emerald-400 hover:scale-105 active:scale-95 shadow-2xl shadow-black/40"
            >
              <span className="material-symbols-outlined">document_scanner</span>
              New Medical Scan
            </button>

            {/* Subtle graphic element */}
            <div className="absolute top-1/2 right-12 -translate-y-1/2 w-48 h-48 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
              <svg viewBox="0 0 100 100" className="w-full h-full fill-none stroke-emerald-400" strokeWidth="1.5">
                 <circle cx="50" cy="50" r="45" strokeDasharray="20 10" className="animate-[spin_20s_linear_infinite]" />
                 <circle cx="50" cy="50" r="35" strokeDasharray="10 5" className="animate-[spin_15s_linear_infinite_reverse]" opacity="0.5" />
                 <path d="M30 50 L45 50 L50 40 L55 60 L60 50 L70 50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        </div>

        {/* Quick Links Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          {[
            { icon: 'history', label: 'Past Reports', color: 'emerald' },
            { icon: 'shield_person', label: 'Privacy', color: 'blue' },
            { icon: 'share_reviews', label: 'Share', color: 'orange' },
            { icon: 'settings', label: 'Settings', color: 'zinc' },
          ].map((item) => (
            <button key={item.label} className="bg-white/5 border border-white/5 p-5 rounded-3xl flex flex-col items-center gap-3 transition-all hover:bg-white/10 hover:border-white/20 active:scale-95 group">
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center transition-transform group-hover:scale-110">
                <span className="material-symbols-outlined text-2xl text-white/70 group-hover:text-white">{item.icon}</span>
              </div>
              <span className="text-xs font-bold text-white/50 group-hover:text-white/90">{item.label}</span>
            </button>
          ))}
        </div>

        {/* Insights Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white/40 px-2">Clinical Insights</h3>
          </div>
          <div className="grid grid-cols-1">
            <FinanceSummary />
          </div>
        </div>

        {/* Status Bar */}
        <div className="mt-12 flex items-center justify-between px-6 py-4 rounded-[2rem] bg-white/5 border border-white/5 text-[10px] font-bold text-white/30 uppercase tracking-widest">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            AI Core Active
          </div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-xs">encrypted</span>
            HIPAA SECURE
          </div>
        </div>
      </main>

      <BottomNav />

      <style jsx global>{`
        @font-face {
          font-family: 'Inter';
          font-style: normal;
          font-weight: 100 900;
          font-display: swap;
          src: url('https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZJhjp-Ekp5G.woff2') format('woff2');
        }
        body {
          font-family: 'Inter', sans-serif;
        }
        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
      `}</style>
    </div>
  );
}
