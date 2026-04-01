'use client';

import React from 'react';
import { ParsedReport } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';

export default function ReportTimeline({ report }: { report: ParsedReport }) {
  
  // Helper to rotate colors for timeline items
  const getColorClass = (idx: number) => {
    const sequence = [
      { bg: 'bg-primary', lightBg: 'bg-primary-fixed', lightText: 'text-on-primary-fixed-variant', text: 'text-primary', container: 'text-primary-container', hover: 'group-hover:bg-primary-fixed/30' },
      { bg: 'bg-secondary', lightBg: 'bg-surface-container-high', lightText: 'text-on-surface-variant', text: 'text-secondary', container: 'text-secondary', hover: 'group-hover:bg-primary-fixed/30' },
      { bg: 'bg-tertiary', lightBg: 'bg-tertiary-fixed', lightText: 'text-on-tertiary-fixed-variant', text: 'text-tertiary', container: 'text-tertiary', hover: 'group-hover:bg-tertiary-fixed/40' },
    ];
    return sequence[idx % sequence.length];
  };

  return (
    <div className="pt-8 pb-12 w-full max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-top-4 duration-700">
      
      {/* 1. Crucial Safety Rules */}
      {report.safetyGuardrails && report.safetyGuardrails.length > 0 && (
        <section className="space-y-3">
          {report.safetyGuardrails.map((alert, idx) => (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              key={idx} 
              className="bg-error-container text-on-error-container rounded-3xl p-6 editorial-shadow flex items-start gap-4 border-l-8 border-error"
            >
              <div className="bg-error/10 p-2 rounded-xl shrink-0">
                <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
              </div>
              <div>
                <h2 className="font-headline font-extrabold text-xl mb-1">Crucial Safety Protocol</h2>
                <p className="text-on-error-container/90 leading-relaxed font-medium">
                  {alert.rule}
                </p>
              </div>
            </motion.div>
          ))}
        </section>
      )}

      {/* Page Header / Timeline Intro */}
      <header className="space-y-2 pt-4">
        <span className="text-primary font-bold tracking-widest text-xs font-label uppercase">Treatment Timeline</span>
        <h3 className="text-3xl font-headline font-extrabold text-on-surface tracking-tight">Daily Care Schedule</h3>
        <p className="text-on-surface-variant leading-relaxed">AI-parsed schedule from your latest clinical report. Follow carefully for optimal recovery.</p>
      </header>

      {/* 2. Daily Schedule (Vertical Timeline) */}
      {report.medicationSchedule && report.medicationSchedule.length > 0 ? (
        <section className="relative space-y-0">
          {/* Timeline Path Line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-surface-container-high rounded-full"></div>

          {report.medicationSchedule.map((med, idx) => {
            const colors = getColorClass(idx);
            
            return (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                key={idx} 
                className="relative pl-16 pb-10 group"
              >
                {/* Timeline Dot */}
                <div className={`absolute left-4 top-2 w-4 h-4 rounded-full ${colors.bg} ring-4 ring-surface`}></div>
                
                {/* Timeline Card */}
                <div className={`bg-surface-container-lowest rounded-[2rem] p-6 editorial-shadow transition-all ${colors.hover} border border-outline-variant/10`}>
                  
                  <div className="flex justify-between items-start mb-4">
                    <span className={`${colors.lightBg} ${colors.lightText} px-4 py-1.5 rounded-full text-sm font-extrabold font-headline uppercase`}>
                      {med.timeOfDay}
                    </span>
                    <span className={`material-symbols-outlined ${colors.container}`}>pill</span>
                  </div>
                  
                  <h4 className="text-2xl font-headline font-bold text-on-surface mb-1">{med.medicineName}</h4>
                  <p className={`${colors.text} font-semibold text-lg mb-3`}>{med.dosage}</p>
                  
                  <div className="flex items-center gap-2 text-on-surface-variant bg-surface-container-low p-3 rounded-xl border border-outline-variant/5">
                    <span className="material-symbols-outlined text-sm shrink-0">info</span>
                    <span className="text-sm font-medium">{med.instructions}</span>
                  </div>

                </div>
              </motion.div>
            );
          })}
        </section>
      ) : (
        <div className="flex flex-col items-center justify-center p-12 text-center bg-surface-container-low rounded-[2rem] border-2 border-dashed border-outline-variant">
          <span className="material-symbols-outlined text-5xl text-on-surface-variant mb-4">folder_off</span>
          <h5 className="text-xl font-headline font-bold">No Medications Found</h5>
          <p className="text-on-surface-variant">Your parsed reports will appear here once processed.</p>
        </div>
      )}

      {/* 3. Locations & Protocol Card (Mapped exactly like timeline entry 3 in HTML) */}
      {report.locations && report.locations.length > 0 && (
        <section className="relative space-y-0 pt-4">
           {/* Timeline Line continuation if needed */}
           <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-surface-container-high rounded-full"></div>
           
           {report.locations.map((loc, idx) => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                key={`loc-${idx}`} 
                className="relative pl-16 pb-10 group"
              >
                <div className="absolute left-4 top-2 w-4 h-4 rounded-full bg-tertiary ring-4 ring-surface"></div>
                <div className="bg-surface-container-lowest rounded-[2rem] p-6 editorial-shadow transition-all group-hover:bg-tertiary-fixed/40 border border-outline-variant/10">
                  <div className="flex justify-between items-start mb-4">
                    <span className="bg-tertiary-fixed text-on-tertiary-fixed-variant px-4 py-1.5 rounded-full text-sm font-extrabold font-headline">PROTOCOL</span>
                    <span className="material-symbols-outlined text-tertiary">location_on</span>
                  </div>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="bg-surface-container p-3 rounded-2xl shrink-0">
                      <span className="material-symbols-outlined text-tertiary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>medical_information</span>
                    </div>
                    <div>
                      <h4 className="text-2xl font-headline font-bold text-on-surface leading-tight">{loc.action}</h4>
                      <p className="text-on-surface-variant text-sm font-medium mt-1">{loc.location}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
           ))}
        </section>
      )}

    </div>
  );
}