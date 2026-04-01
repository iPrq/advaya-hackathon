'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { FinanceTransaction } from '@/lib/types';
import { useSMSListener } from '@/hooks/useSMSListener';
import { Plus, Minus, Landmark, History, TrendingUp, TrendingDown, Trash2 } from 'lucide-react';

const STORAGE_KEY = 'geofence_guardian_finance';

export default function FinancePage() {
  const [transactions, setTransactions] = useState<FinanceTransaction[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newAmount, setNewAmount] = useState('');
  const [newCategory, setNewCategory] = useState('Medicine');
  const [newType, setNewType] = useState<'income' | 'expense'>('expense');

  // Load from local storage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setTransactions(JSON.parse(stored));
      } catch (e) {
        setTransactions([]);
      }
    }
  }, []);

  // Save to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
  }, [transactions]);

  // Real-time SMS Detection
  useSMSListener((newT) => {
    setTransactions((prev) => [newT, ...prev]);
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

  const addTransaction = () => {
    const amountNum = parseFloat(newAmount);
    if (isNaN(amountNum) || amountNum <= 0) return;

    const newT: FinanceTransaction = {
      id: Math.random().toString(36).substring(7),
      amount: amountNum,
      type: newType,
      category: newCategory,
      note: 'Manual entry',
      date: new Date().toISOString()
    };

    setTransactions([newT, ...transactions]);
    setNewAmount('');
    setShowAdd(false);
  };

  const deleteTransaction = (id: string) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <main className="max-w-4xl mx-auto px-6 pt-12 pb-32">
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-headline font-extrabold text-on-surface flex items-center gap-2">
              <Landmark className="text-primary w-8 h-8" /> Finance Tracker
            </h1>
            <p className="text-sm text-outline mt-1 italic font-body">SMS-powered automated expense detection active.</p>
          </div>
          <button 
            onClick={() => setShowAdd(!showAdd)}
            className="w-12 h-12 bg-primary text-white rounded-2xl flex items-center justify-center shadow-lg active:scale-95 transition-transform"
          >
            <Plus />
          </button>
        </header>

        {/* BALANCE CARD */}
        <div className="bg-primary-fixed text-on-primary-fixed p-8 rounded-[2rem] shadow-sm mb-8 relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-xs font-bold uppercase tracking-widest opacity-70 mb-1">Total Balance</p>
            <h2 className="text-5xl font-headline font-black mb-6">₹{balance.toLocaleString('en-IN')}</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/40 backdrop-blur-md rounded-2xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold opacity-70 leading-tight">Income</p>
                  <p className="text-lg font-headline font-bold">₹{income.toLocaleString('en-IN')}</p>
                </div>
              </div>
              <div className="bg-white/40 backdrop-blur-md rounded-2xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-error-container text-on-error-container rounded-xl flex items-center justify-center">
                  <TrendingDown className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold opacity-70 leading-tight">Expense</p>
                  <p className="text-lg font-headline font-bold">₹{expense.toLocaleString('en-IN')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ADD TRANSACTION FORM */}
        {showAdd && (
          <div className="bg-surface-container rounded-3xl p-6 mb-8 border border-outline-variant shadow-lg animate-in slide-in-from-top-4 duration-300">
            <h3 className="font-headline font-bold text-lg mb-4">Add Transaction</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-outline mb-1 block">Amount (₹)</label>
                <input 
                  type="number" 
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-white rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-primary border border-outline-variant"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-outline mb-1 block">Type</label>
                <div className="flex bg-white rounded-xl p-1 border border-outline-variant">
                  <button 
                    onClick={() => setNewType('expense')}
                    className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${newType === 'expense' ? 'bg-error text-white' : 'text-outline hover:bg-surface-container'}`}
                  >Expense</button>
                  <button 
                    onClick={() => setNewType('income')}
                    className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${newType === 'income' ? 'bg-emerald-600 text-white' : 'text-outline hover:bg-surface-container'}`}
                  >Income</button>
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-outline mb-1 block">Category</label>
                <select 
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full bg-white rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-primary border border-outline-variant text-sm font-medium"
                >
                  <option>Medicine</option>
                  <option>Consultation</option>
                  <option>Lab Tests</option>
                  <option>Hospitalization</option>
                  <option>Salary</option>
                  <option>Other</option>
                </select>
              </div>
              <div className="flex items-end">
                <button 
                  onClick={addTransaction}
                  className="w-full bg-primary text-white font-bold py-3.5 rounded-xl shadow-md hover:opacity-90 active:scale-95 transition-all"
                >
                  Confirm Entry
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TRANSACTION LIST */}
        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-surface-container">
          <h3 className="font-headline font-bold text-xl mb-6 flex items-center gap-2">
            <History className="w-5 h-5 text-primary" /> History
          </h3>
          
          <div className="space-y-4">
            {transactions.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-surface-container rounded-full flex items-center justify-center mx-auto mb-4 opacity-50">
                  <Landmark className="text-outline w-8 h-8" />
                </div>
                <p className="text-outline font-medium italic">No transactions found.</p>
              </div>
            ) : (
              transactions.map(t => (
                <div key={t.id} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-surface-container transition-colors group">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${t.type === 'income' ? 'bg-emerald-100 text-emerald-700' : 'bg-error-container text-on-error-container'}`}>
                    {t.type === 'income' ? <Plus className="w-5 h-5" /> : <Minus className="w-5 h-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-on-surface truncate">{t.category}</h4>
                    <p className="text-[11px] text-outline font-medium">
                      {new Date(t.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })} · {t.note}
                    </p>
                  </div>
                  <div className="text-right flex items-center gap-3">
                    <p className={`text-lg font-headline font-black ${t.type === 'income' ? 'text-emerald-600' : 'text-error'}`}>
                      {t.type === 'income' ? '+' : '-'}₹{t.amount.toLocaleString('en-IN')}
                    </p>
                    <button 
                      onClick={() => deleteTransaction(t.id)}
                      className="text-outline hover:text-error opacity-0 group-hover:opacity-100 transition-all p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
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
        <Link href="/web" className="flex flex-col items-center justify-center text-outline hover:text-primary px-4 py-2.5 active:scale-95 transition-all outline-none">
          <span className="material-symbols-outlined">language</span>
          <span className="text-[10px] font-medium font-body mt-1">Web</span>
        </Link>
        <div className="bg-secondary-container text-on-secondary-container flex flex-col items-center justify-center rounded-2xl px-5 py-2.5 active:scale-95 transition-all outline-none shadow-sm">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>payments</span>
          <span className="text-[10px] font-bold font-body mt-1">Finance</span>
        </div>
        <Link href="/map" className="flex flex-col items-center justify-center text-outline hover:text-primary px-4 py-2.5 active:scale-95 transition-all outline-none">
          <span className="material-symbols-outlined">map</span>
          <span className="text-[10px] font-medium font-body mt-1">Map</span>
        </Link>
      </nav>
    </div>
  );
}
