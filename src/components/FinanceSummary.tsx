'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { FinanceTransaction } from '../lib/types';
import { useSMSListener } from '../hooks/useSMSListener';

const STORAGE_KEY = 'geofence_guardian_finance';

/**
 * FinanceSummary — exportable summary card for the Home page.
 * Reads from the same localStorage key as the full Finance page,
 * so data is always in sync. No props needed.
 */
export default function FinanceSummary() {
  const [transactions, setTransactions] = useState<FinanceTransaction[]>([]);

  // Load from LocalStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setTransactions(JSON.parse(stored));
      } catch {
        setTransactions([]);
      }
    }
  }, []);

  // Sync to LocalStorage (when transactions are added via SMS)
  useEffect(() => {
    if (typeof window !== 'undefined' && transactions.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
    }
  }, [transactions]);

  // Hook-up real-time SMS detection
  useSMSListener((newDetection) => {
    setTransactions((prev) => [newDetection, ...prev]);
  });

  const { income, expense } = useMemo(() => {
    return transactions.reduce(
      (acc, t) => {
        if (t.type === 'income') acc.income += t.amount;
        else acc.expense += t.amount;
        return acc;
      },
      { income: 0, expense: 0 }
    );
  }, [transactions]);

  const balance = income - expense;
  const recent = transactions.slice(0, 3);

  return (
    <div className="bg-white/[0.03] rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl backdrop-blur-3xl">
      {/* Header */}
      <div className="flex items-center justify-between px-8 pt-8 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
            <span className="text-emerald-400 font-black text-lg">₹</span>
          </div>
          <div>
            <h2 className="text-lg font-bold text-white/90 leading-none">Clinical Credits</h2>
            <p className="text-[10px] text-white/20 font-black uppercase tracking-widest mt-1.5">Automated Extraction</p>
          </div>
        </div>
        <Link
          href="/finance"
          className="text-[10px] font-black uppercase tracking-widest text-emerald-400 hover:text-emerald-300 transition-colors bg-emerald-500/5 px-4 py-2 rounded-full border border-emerald-500/10"
        >
          View Ledger
        </Link>
      </div>

      {/* Balance Section */}
      <div className="px-8 pb-6">
        <div className="flex flex-col gap-1">
           <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Current Balance</span>
           <p className={`text-5xl font-black tracking-tighter ${balance >= 0 ? 'text-white' : 'text-red-400'}`}>
             ₹{balance.toLocaleString('en-IN')}
           </p>
        </div>
      </div>

      {/* Income / Expense Stats */}
      <div className="grid grid-cols-2 gap-4 px-8 pb-8">
        <div className="bg-white/5 p-5 rounded-3xl border border-white/5">
          <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest mb-1.5 flex items-center gap-2">
            <span className="w-1 h-1 rounded-full bg-emerald-400" />
            Total Deposit
          </p>
          <p className="text-xl font-black text-white">
            ₹{income.toLocaleString('en-IN')}
          </p>
        </div>
        <div className="bg-white/5 p-5 rounded-3xl border border-white/5">
          <p className="text-[9px] font-black text-red-400 uppercase tracking-widest mb-1.5 flex items-center gap-2">
            <span className="w-1 h-1 rounded-full bg-red-400" />
            Vitals Cost
          </p>
          <p className="text-xl font-black text-white">
            ₹{expense.toLocaleString('en-IN')}
          </p>
        </div>
      </div>

      {/* Recent History Table-style */}
      <div className="px-8 pb-8">
        <div className="flex items-center justify-between mb-4 px-1">
           <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">Recent Activity</h3>
           <div className="flex gap-1">
              {[1, 2, 3].map(i => <div key={i} className="w-1 h-1 rounded-full bg-white/10" />)}
           </div>
        </div>
        
        {recent.length === 0 ? (
          <div className="py-6 flex flex-col items-center justify-center opacity-20 border border-dashed border-white/10 rounded-2xl">
             <span className="material-symbols-outlined text-3xl mb-2">payments</span>
             <p className="text-[10px] font-bold uppercase tracking-widest">No transaction feed detected</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {recent.map((t) => (
              <div key={t.id} className="flex items-center justify-between p-4 bg-white/[0.02] rounded-2xl border border-white/5 hover:bg-white/5 transition-all group">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition-transform group-hover:scale-105 ${
                    t.type === 'income'
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                      : 'bg-red-500/10 border-red-500/20 text-red-400'
                  }`}>
                    <span className="material-symbols-outlined text-lg">
                       {t.type === 'income' ? 'south_west' : 'north_east'}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs font-black text-white/90 leading-none">
                      {t.category}
                    </p>
                    <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest mt-1.5">
                      {new Date(t.date).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
                <p className={`text-sm font-black ${t.type === 'income' ? 'text-emerald-400' : 'text-red-400'}`}>
                  {t.type === 'income' ? '+' : '-'}₹{t.amount.toLocaleString('en-IN')}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Decorative Neural Scan line at bottom */}
      <div className="h-1 w-full bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
    </div>
  );
}
