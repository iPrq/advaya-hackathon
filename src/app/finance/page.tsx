'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import BottomNav from '@/components/BottomNav';
import { smsService } from '@/services/smsService';
import { FinanceTransaction } from '@/lib/types';
import { Activity, Plus, CreditCard, RotateCw } from 'lucide-react';

export default function FinancePage() {
  const [balance, setBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<FinanceTransaction[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [showManual, setShowManual] = useState(false);
  const [manualAmount, setManualAmount] = useState('');
  const [manualNote, setManualNote] = useState('');
  const [scanStatus, setScanStatus] = useState<string | null>(null);
  const [isExtractionEnabled, setIsExtractionEnabled] = useState(true);

  useEffect(() => {
    // 1. Load state from localStorage
    const savedBalance = localStorage.getItem('finance_balance');
    const savedTx = localStorage.getItem('finance_transactions');
    const savedExt = localStorage.getItem('finance_extraction_enabled');
    
    if (savedBalance) setBalance(Number(savedBalance));
    if (savedExt !== null) setIsExtractionEnabled(savedExt === 'true');
    if (savedTx) {
        try {
            setTransactions(JSON.parse(savedTx));
        } catch (e) {
            console.error('Failed to parse transactions', e);
        }
    }
  }, []);

  const toggleExtraction = () => {
    const next = !isExtractionEnabled;
    setIsExtractionEnabled(next);
    localStorage.setItem('finance_extraction_enabled', next.toString());
  };

  const saveState = (newBalance: number, newTx: FinanceTransaction[]) => {
    setBalance(newBalance);
    setTransactions(newTx);
    localStorage.setItem('finance_balance', newBalance.toString());
    localStorage.setItem('finance_transactions', JSON.stringify(newTx));
  };

  const handleScanSMS = async () => {
    if (!isExtractionEnabled) return;
    setIsScanning(true);
    setScanStatus('Analyzing SMS streams...');
    try {
      const newCredits = await smsService.scanForIncome();
      
      if (newCredits.length > 0) {
        const addedBalance = newCredits.reduce((acc, curr) => acc + curr.amount, 0);
        const updatedTx = [...newCredits, ...transactions];
        const updatedBalance = balance + addedBalance;
        
        saveState(updatedBalance, updatedTx);
        
        // Mark as processed
        smsService.markAsProcessed(newCredits.map(c => c.id));
        setScanStatus(`Extraction complete: +$${addedBalance.toFixed(2)}`);
      } else {
        setScanStatus('No new credits found.');
      }
    } catch (e) {
      console.error('SMS Scan Failed', e);
      setScanStatus('Scan failed or permission denied.');
    } finally {
      setIsScanning(false);
      setTimeout(() => setScanStatus(null), 4000);
    }
  };

  const handleManualDeposit = () => {
    const amt = parseFloat(manualAmount);
    if (!amt || isNaN(amt)) return;
    
    const newTx: FinanceTransaction = {
      id: `manual-${Date.now()}`,
      amount: amt,
      type: 'income',
      category: 'Deposit',
      note: manualNote || 'Manual Deposit',
      date: new Date().toISOString()
    };

    const updatedTx = [newTx, ...transactions];
    const updatedBalance = balance + amt;
    
    saveState(updatedBalance, updatedTx);
    setManualAmount('');
    setManualNote('');
    setShowManual(false);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-emerald-500/30">
      {/* HEADER */}
      <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-[#050505]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3">
            <Link href="/home" className="text-white/40 hover:text-white transition-colors">
              <span className="material-symbols-outlined text-xl">arrow_back</span>
            </Link>
            <h1 className="text-lg font-bold tracking-tight text-white/90">Clinical Credits</h1>
          </div>
          
          <button 
             onClick={toggleExtraction}
             className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all duration-300 ${isExtractionEnabled ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-white/5 border-white/10 text-white/40'}`}
          >
             <div className={`w-1.5 h-1.5 rounded-full ${isExtractionEnabled ? 'bg-emerald-400 animate-pulse' : 'bg-white/20'}`} />
             <span className="text-[10px] font-black uppercase tracking-widest">
                {isExtractionEnabled ? 'Scanner Active' : 'Scanner Off'}
             </span>
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-5 pt-10 pb-40">
        <section className="mb-8 px-1">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400/80 mb-1">Aegis Ledger</p>
          <h2 className="text-3xl font-bold tracking-tight text-white">Credit Pulse</h2>
        </section>

        {/* BALANCE CARD WITH SCANNING LOGIC */}
        <div className={`relative overflow-hidden rounded-[2.5rem] bg-white/[0.05] border transition-all duration-700 ${isScanning ? 'border-emerald-500/50 shadow-[0_0_50px_rgba(16,185,129,0.1)]' : 'border-white/10'} p-8 mb-8`}>
           <div className="relative z-10">
              <div className="flex justify-between items-start mb-10">
                 <div>
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 mb-2 block text-center md:text-left">Clinical Credits</span>
                    <div className="flex items-baseline gap-2 justify-center md:justify-start">
                       <span className="text-white/40 text-3xl font-light">$</span>
                       <span className="text-6xl font-black tracking-tighter text-white">
                          {balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                       </span>
                    </div>
                 </div>
                 
                 <button 
                  onClick={handleScanSMS}
                  disabled={isScanning || !isExtractionEnabled}
                  className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${!isExtractionEnabled ? 'opacity-20 cursor-not-allowed bg-white/5' : isScanning ? 'bg-emerald-500 text-black rotate-180' : 'bg-white/10 text-white hover:bg-emerald-500 hover:text-black'}`}
                  title={isExtractionEnabled ? "Scan SMS for Credits" : "Scanner Disabled"}
                 >
                    {isScanning ? <RotateCw className="w-6 h-6 animate-spin" /> : <span className="material-symbols-outlined">sync</span>}
                 </button>
              </div>

              {scanStatus && (
                <div className="mb-8 px-5 py-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-widest text-center animate-pulse">
                   {scanStatus}
                </div>
              )}

              <div className="flex gap-4">
                 <button 
                    onClick={() => setShowManual(!showManual)}
                    className="flex-1 bg-white text-black font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-emerald-400 active:scale-95 transition-all"
                 >
                    <Plus className="w-4 h-4" />
                    Manual Deposit
                 </button>
                 <button className="flex-1 bg-white/5 border border-white/5 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-white/10 active:scale-95 transition-all text-white/60">
                    <CreditCard className="w-4 h-4" />
                    Ledger
                 </button>
              </div>
           </div>

           {/* Backdrop Scan Wave Effect */}
           {isScanning && (
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-emerald-500 text-transparent animate-[scan-beam_2s_linear_infinite]" 
                   style={{ backgroundSize: '200% 100%' }} />
           )}
        </div>

        {/* MANUAL DEPOSIT FORM */}
        {showManual && (
           <div className="mb-10 p-8 rounded-[2rem] bg-white/[0.03] border border-white/10 fade-up space-y-4">
              <div className="flex items-center gap-3 mb-2 px-1">
                 <span className="material-symbols-outlined text-emerald-400">payments</span>
                 <h3 className="font-bold">New Deposit</h3>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                 <input 
                    type="number" 
                    value={manualAmount}
                    onChange={(e) => setManualAmount(e.target.value)}
                    placeholder="Amount (e.g. 500)" 
                    className="flex-1 bg-white/5 border border-white/5 rounded-2xl px-6 py-4 outline-none text-white focus:border-emerald-500/30 transition-all placeholder:text-white/20"
                 />
                 <input 
                    type="text" 
                    value={manualNote}
                    onChange={(e) => setManualNote(e.target.value)}
                    placeholder="Description (Optional)" 
                    className="flex-[2] bg-white/5 border border-white/5 rounded-2xl px-6 py-4 outline-none text-white focus:border-emerald-500/30 transition-all placeholder:text-white/20"
                 />
                 <button 
                    onClick={handleManualDeposit}
                    disabled={!manualAmount}
                    className="bg-emerald-500 text-black font-bold px-8 py-4 rounded-2xl hover:bg-emerald-400 disabled:opacity-30 active:scale-95 transition-all"
                 >
                    Confirm
                 </button>
              </div>
           </div>
        )}

        <div className="px-1 mb-6 flex justify-between items-center">
           <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Transaction History</h3>
           <span className="text-[10px] text-white/20">{transactions.length} Records</span>
        </div>

        <div className="space-y-3">
           {transactions.length > 0 ? (
             transactions.map((tx: FinanceTransaction, idx: number) => (
               <div key={tx.id || idx} className="flex items-center justify-between p-6 rounded-[2rem] bg-white/[0.03] border border-white/5 hover:bg-white/[0.05] transition-all group">
                  <div className="flex items-center gap-4">
                     <div className={`w-12 h-12 rounded-[1.2rem] flex items-center justify-center transition-colors ${tx.type === 'income' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                        <span className="material-symbols-outlined text-[20px]">
                           {tx.category === 'Deposit' ? 'wallet' : 'sms'}
                        </span>
                     </div>
                     <div>
                        <h4 className="font-bold text-sm text-white/90">{tx.note}</h4>
                        <p className="text-[10px] text-white/20 uppercase tracking-widest mt-0.5">
                           {new Date(tx.date).toLocaleDateString()} • {tx.category}
                        </p>
                     </div>
                  </div>
                  <div className={`text-sm font-black ${tx.type === 'income' ? 'text-emerald-400' : 'text-white'}`}>
                     {tx.type === 'income' ? '+' : '-'}${Math.abs(tx.amount).toFixed(2)}
                  </div>
               </div>
             ))
           ) : (
             <div className="py-24 flex flex-col items-center justify-center text-center opacity-10 border border-white/5 border-dashed rounded-[2.5rem]">
                <span className="material-symbols-outlined text-6xl mb-4">analytics</span>
                <p className="text-sm font-medium tracking-tight">Financial pulses ready for monitoring.</p>
             </div>
           )}
        </div>

        <div className="mt-24 text-center opacity-10 text-[10px] font-black uppercase tracking-[0.6em]">
           Aegis Guard Platform
        </div>
      </main>

      <BottomNav />

      <style jsx global>{`
        @keyframes scan-beam {
           0% { transform: translateX(-100%); }
           100% { transform: translateX(100%); }
        }
        body {
          font-family: 'Inter', sans-serif;
        }
      `}</style>
    </div>
  );
}
