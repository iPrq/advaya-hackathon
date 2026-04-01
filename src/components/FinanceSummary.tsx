'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { FinanceTransaction } from '../lib/types';
import { useSMSListener } from '../hooks/useSMSListener';

const STORAGE_KEY = 'geofence_guardian_finance';

/**
 * FinanceSummary — exportable summary card for the Finance page.
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
    <div className="bg-white rounded-2xl shadow-sm border border-surface-container overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
            <span className="text-primary font-black text-sm">₹</span>
          </div>
          <h2 className="text-base font-bold text-on-surface">Finance</h2>
        </div>
        <Link
          href="/finance"
          className="text-xs font-bold text-primary hover:opacity-80 transition-colors"
        >
          View All →
        </Link>
      </div>

      {/* Balance */}
      <div className="px-5 pb-3">
        <p className="text-[10px] font-bold text-outline uppercase tracking-widest mb-0.5">
          Balance
        </p>
        <p
          className={`text-3xl font-headline font-black ${
            balance >= 0 ? 'text-primary' : 'text-error'
          }`}
        >
          ₹{balance.toLocaleString('en-IN')}
        </p>
      </div>

      {/* Income / Expense row */}
      <div className="grid grid-cols-2 gap-px bg-surface-container border-t border-b border-surface-container">
        <div className="bg-white px-5 py-3">
          <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-0.5">
            Income
          </p>
          <p className="text-sm font-bold font-headline text-on-surface">
            ₹{income.toLocaleString('en-IN')}
          </p>
        </div>
        <div className="bg-white px-5 py-3">
          <p className="text-[10px] font-bold text-error uppercase tracking-widest mb-0.5">
            Expenses
          </p>
          <p className="text-sm font-bold font-headline text-on-surface">
            ₹{expense.toLocaleString('en-IN')}
          </p>
        </div>
      </div>

      {/* Recent transactions */}
      <div className="px-5 pt-3 pb-5">
        <p className="text-[10px] font-black text-outline uppercase tracking-widest mb-2">
          Recent
        </p>
        {recent.length === 0 ? (
          <p className="text-xs text-outline py-2 text-center italic">
            No transactions yet
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {recent.map((t) => (
              <div key={t.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                      t.type === 'income'
                        ? 'bg-emerald-50 text-emerald-600'
                        : 'bg-error-container text-on-error-container'
                    }`}
                  >
                    {t.type === 'income' ? (
                      <span className="material-symbols-outlined text-sm">add</span>
                    ) : (
                      <span className="material-symbols-outlined text-sm">remove</span>
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-on-surface leading-none">
                      {t.category}
                    </p>
                    <p className="text-[10px] text-outline mt-0.5">
                      {new Date(t.date).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </p>
                  </div>
                </div>
                <p
                  className={`text-xs font-headline font-black ${
                    t.type === 'income' ? 'text-emerald-600' : 'text-error'
                  }`}
                >
                  {t.type === 'income' ? '+' : '-'}₹
                  {t.amount.toLocaleString('en-IN')}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
