'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { defineCustomElements } from '@ionic/pwa-elements/loader';
import { FileSearch } from 'lucide-react';
import { ParsedReport } from '@/lib/types';
import ReportTimeline from '@/components/ReportTimeline';
import ChatBot from '@/components/ChatBot';
import FinanceSummary from '@/components/FinanceSummary';
import CommunitySummary from '@/components/CommunitySummary';

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<ParsedReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    defineCustomElements(window);
  }, []);

  const scanDocument = async () => {
    try {
      setError(null);
      
      // If we already have a report, clear it first before re-triggering camera so we don't overlay
      if (report) setReport(null);
      
      const image = await Camera.getPhoto({
        quality: 90,
        resultType: CameraResultType.Base64,
        source: CameraSource.Prompt
      });
      
      if (image.base64String) {
        setLoading(true);
        const res = await fetch('https://iprq-hackathonadvaya.hf.space/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            base64_image: image.base64String,
            mime_type: `image/${image.format || 'jpeg'}`
          })
        });
        if (!res.ok) throw new Error('Analysis failed');
        const result = await res.json();
        setReport(result);
      }
    } catch (e: any) {
      if (e?.message !== 'User cancelled photos app') setError('Failed to process image');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen text-on-surface bg-background">
      {/* If loading, show loading screen */}
      {loading && (
        <main className="max-w-4xl mx-auto px-6 pt-32 pb-32 flex flex-col items-center">
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-primary blur-2xl opacity-20 animate-pulse rounded-full" />
              <FileSearch className="w-20 h-20 text-primary animate-bounce relative z-10" />
            </div>
            <h2 className="text-2xl font-headline font-bold text-on-surface mb-2">Analyzing Report</h2>
            <p className="text-on-surface-variant font-body animate-pulse">Running HIPAA-compliant extraction...</p>
        </main>
      )}

      {report && !loading && (
        <>
         <main className="max-w-4xl mx-auto pt-12 pb-32">
            <header className="flex flex-col items-center mb-8 px-6">
               <h1 className="text-3xl font-headline font-black text-on-surface mb-2">Analysis Complete</h1>
            </header>
            
            <div className="px-4">
              <ReportTimeline report={report} />
            </div>

            {/* Sticky FAB exactly matched to user HTML */}
            <div className="fixed bottom-24 left-0 right-0 flex justify-center pointer-events-none z-40">
              <button
                onClick={scanDocument}
                className="pointer-events-auto bg-gradient-to-br from-primary to-primary-container text-on-primary font-headline font-bold px-8 py-4 rounded-full shadow-2xl flex items-center gap-3 active:scale-95 transition-all group"
              >
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>document_scanner</span>
                <span className="tracking-wide">Scan New Document</span>
              </button>
            </div>

            {/* ── Inline Prescription Chat ─────────────────────────────── */}
            <div className="mt-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-primary text-xl">✦</span>
                <h3 className="font-bold font-headline text-base text-on-surface">Any doubts? Ask the AI</h3>
              </div>
              <ChatBot
                contextType="prescription"
                context={JSON.stringify(report, null, 2)}
                title="Prescription Assistant"
                placeholder="e.g. When do I take Metformin?"
              />
            </div>
          </main>
        </>
      )}

      {/* Dashboard Default State */}

      {!loading && !report && (
        <>
          <header className="bg-surface/80 backdrop-blur-md full-width top-0 sticky z-50 flex justify-between items-center w-full px-6 py-4">
            <div className="flex items-center gap-4">
              <button className="text-primary scale-95 transition-transform duration-200 hover:bg-surface-container p-2 rounded-full">
                <span className="material-symbols-outlined">menu</span>
              </button>
              <h1 className="text-xl font-headline font-bold text-primary tracking-tight">Ageis</h1>
            </div>
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-full bg-secondary-container flex items-center justify-center overflow-hidden border-2 border-surface-container-highest">
                <img alt="User profile avatar" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC3pAS0jIqB54KzwR8tL7fz54QqSL-T80TXUqN5_qDqTO6Exzec5SejDMF3TtLHLe0roS3gQ5AkIMl83gaT2YN2mI2DMqoXcuWHjuT8JbjldZz0rn51Ndq4ejqnaFz1Oim_yDooDwLLIpfNZQFaRlv0Kfsr7-CBTZK73trKwkZ70u6wnToDiLwfk5lLw_mMtoPj2pPwUGnkqVYhzGpkGT-GBlpbtnlKlGpjXRitDNazmXU9BB3teouTX6QTyC0nLOqu424WGrqPphw" />
              </div>
            </div>
          </header>

          <main className="max-w-4xl mx-auto px-6 pt-12 pb-32">
            <section className="relative mb-12">
              <div className="bg-white rounded-[2rem] p-8 md:p-12 shadow-[0_4px_32px_rgba(0,0,0,0.03)] overflow-hidden border border-white/50 bg-gradient-to-br from-white to-surface-container-low">
                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className="mb-6 inline-flex items-center gap-2 px-4 py-1.5 bg-secondary-fixed text-on-secondary-fixed-variant rounded-full text-sm font-semibold tracking-wide">
                    <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
                    HIPAA Compliant
                  </div>
                  <h2 className="text-4xl md:text-5xl font-headline font-extrabold text-on-surface mb-4 leading-tight">
                    Your clinical assistant <br /><span className="text-primary">at your fingertips.</span>
                  </h2>
                  <p className="text-lg font-body text-on-surface-variant max-w-xl mb-10 leading-relaxed">
                    Instantly analyze medical reports, lab results, and prescriptions with professional-grade precision.
                  </p>
                  
                  {/* HERO SCAN BUTTON */}
                  <button onClick={scanDocument} className="group relative w-full max-w-md h-16 flex items-center justify-center gap-3 bg-gradient-to-r from-primary to-primary-container text-white rounded-[1.5rem] font-bold text-lg shadow-lg shadow-primary/20 hover:scale-[0.98] transition-all duration-200">
                    <span className="material-symbols-outlined">document_scanner</span>
                    Scan Medical Document
                    <span className="material-symbols-outlined ml-2 group-hover:translate-x-1 transition-transform">arrow_forward</span>
                  </button>

                  {error && (
                    <div className="mt-6 p-4 bg-error-container text-on-error-container text-sm font-medium rounded-xl w-full max-w-md bg-opacity-80">
                      {error}
                    </div>
                  )}

                  <p className="mt-6 text-sm font-body text-outline flex items-center gap-2">
                    <span className="material-symbols-outlined text-base">lock</span>
                    All data is end-to-end encrypted and HIPAA secure.
                  </p>
                </div>
                
                {/* Abstract background pattern */}
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 bg-tertiary/5 rounded-full blur-2xl"></div>
              </div>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-surface-container-lowest p-6 rounded-[1.5rem] flex items-center gap-5 cursor-pointer hover:bg-surface-container transition-colors duration-200 active:scale-95 group shadow-sm">
                <div className="w-14 h-14 rounded-2xl bg-secondary-fixed flex items-center justify-center text-on-secondary-fixed group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-3xl">history</span>
                </div>
                <div>
                  <h3 className="font-bold font-headline text-lg text-on-surface">Past Reports</h3>
                  <p className="text-sm font-body text-on-surface-variant">View and share your analyzed records</p>
                </div>
                <span className="material-symbols-outlined ml-auto text-outline group-hover:text-primary transition-colors">chevron_right</span>
              </div>
              
              <div className="bg-surface-container-lowest p-6 rounded-[1.5rem] flex items-center gap-5 cursor-pointer hover:bg-surface-container transition-colors duration-200 active:scale-95 group shadow-sm">
                <div className="w-14 h-14 rounded-2xl bg-tertiary-fixed flex items-center justify-center text-on-tertiary-fixed group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-3xl">person</span>
                </div>
                <div>
                  <h3 className="font-bold font-headline text-lg text-on-surface">View Profile</h3>
                  <p className="text-sm font-body text-on-surface-variant">Manage health details & privacy</p>
                </div>
                <span className="material-symbols-outlined ml-auto text-outline group-hover:text-tertiary transition-colors">chevron_right</span>
              </div>
            </div>

            {/* FINANCE & COMMUNITY SUMMARIES */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <FinanceSummary />
              <CommunitySummary />
            </div>

            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 bg-surface-container-low rounded-[2rem] p-8 relative overflow-hidden h-64 flex flex-col justify-end">
                <img alt="Clinician background" className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-multiply border border-surface-container" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDaw3Um0nr1InBZo9co0TGsXE-azUUKPdCYCqd5If1qgFjOHI0sH8qvwtMFqBQXlt5EIitNUqkJ5q3X3PgKgqoogDQMUvm1NaNCEvHFi9Rq9ufXbseYLfItIS9Tya7o6FgXYxVRrb3jt17hbuLV4MgB-wIC5folpYX-yYBRHqE4fDNHN2Vg8P6cEe18X1HVdpkEbQfprrS82ZxNczI0a4aY4RdCRJ3zhq8n5_SWku3BJi1OKgl7RHNPt2WELq4MUp56Wi-O0EwBsBo" />
                <div className="relative z-10">
                  <span className="text-xs font-bold text-primary uppercase tracking-widest mb-2 block">Next Checkup</span>
                  <h4 className="text-2xl font-headline font-bold text-on-surface">Routine Wellness Scan</h4>
                  <p className="font-body text-on-surface-variant mt-1">Scheduled for Friday, Oct 24 at 10:30 AM</p>
                </div>
              </div>
              <div className="bg-primary p-8 rounded-[2rem] flex flex-col justify-between text-white shadow-[0_8px_32px_rgba(30,96,169,0.3)]">
                <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>health_and_safety</span>
                <div>
                  <h4 className="text-xl font-headline font-bold mb-1">Health Score</h4>
                  <div className="text-4xl font-headline font-black mb-2">94%</div>
                  <div className="w-full bg-white/20 h-1 rounded-full overflow-hidden">
                    <div className="bg-white h-full w-[94%] border-none"></div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-16 flex flex-wrap items-center justify-center gap-8 opacity-60">
                <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-xl">verified</span>
                    <span className="text-[11px] font-bold uppercase tracking-widest text-on-surface">Privacy Secure</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-xl">encrypted</span>
                    <span className="text-[11px] font-bold uppercase tracking-widest text-on-surface">AES-256 Encrypted</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-xl">gpp_good</span>
                    <span className="text-[11px] font-bold uppercase tracking-widest text-on-surface">Certified</span>
                </div>
            </div>
          </main>
        </>
      )}

      {/* BOTTOM NAV BAR (Consolidated) */}
      <nav className="fixed bottom-0 w-full z-50 flex justify-around items-center px-4 pb-6 pt-3 bg-surface-container-lowest/90 backdrop-blur-xl rounded-t-[2rem] shadow-[0_-8px_32px_rgba(0,0,0,0.06)] border border-surface-container">
        <button 
          onClick={() => { setReport(null); }} 
          className={`flex flex-col items-center justify-center rounded-2xl px-5 py-2.5 active:scale-95 transition-all outline-none ${!report ? 'bg-secondary-container text-on-secondary-container shadow-sm' : 'text-outline hover:text-primary'}`}
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>medical_services</span>
          <span className="text-[10px] font-bold font-body mt-1">Home</span>
        </button>
        <Link href="/safety" className="flex flex-col items-center justify-center text-outline hover:text-primary px-4 py-2.5 active:scale-95 transition-all outline-none">
          <span className="material-symbols-outlined">security</span>
          <span className="text-[10px] font-medium font-body mt-1">Safety</span>
        </Link>
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