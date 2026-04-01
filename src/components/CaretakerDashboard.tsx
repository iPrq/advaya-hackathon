"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { Haptics } from '@capacitor/haptics';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { ShieldCheck, AlertTriangle, WifiOff, Brain, Activity } from 'lucide-react';

interface CaretakerDashboardProps {
  backendUrl: string;
}

export default function CaretakerDashboard({ backendUrl }: CaretakerDashboardProps) {
  const [isAlert, setIsAlert] = useState<boolean>(false);
  const [networkError, setNetworkError] = useState<boolean>(false);
  const [csiData, setCsiData] = useState<{ index: number; amplitude: number }[]>([]);
  const [variance, setVariance] = useState<number>(0);
  const [confidence, setConfidence] = useState<number>(0);
  const [prediction, setPrediction] = useState<string>("NO_FALL");

  const triggerAlert = useCallback(async () => {
    if (isAlert) return;
    setIsAlert(true);
    setNetworkError(false);

    try {
      if (Capacitor.isNativePlatform()) {
        await Haptics.vibrate();
        setTimeout(() => Haptics.vibrate(), 500);
        setTimeout(() => Haptics.vibrate(), 1500);
      } else if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([500, 1000, 500]);
      }
    } catch (e) {
      console.warn('Haptics error:', e);
    }

    try {
      const AudioContextCtor = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextCtor) {
        const ctx = new AudioContextCtor();
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        osc.connect(gainNode);
        gainNode.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        gainNode.gain.setValueAtTime(0.5, ctx.currentTime);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      }
    } catch (e) {}
  }, [isAlert]);

  useEffect(() => {
    // Derive WebSocket URL from the backendUrl prop (http → ws)
    const wsUrl = backendUrl.replace(/^http/, 'ws').replace(/\/$/, '') + '/';
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      setNetworkError(false);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.subcarriers && Array.isArray(data.subcarriers)) {
          const formattedData = data.subcarriers.map((val: number, idx: number) => ({
            index: idx,
            amplitude: val,
          }));
          setCsiData(formattedData);
          setVariance(data.variance ?? 0);
          setConfidence(data.confidence ?? 0);
          setPrediction(data.prediction ?? "NO_FALL");

          // ML-driven fall detection — alert when ANN predicts FALL
          if (data.prediction === "FALL") {
            triggerAlert();
          }
        }
      } catch (e) {
        console.error("Failed parsing WS data", e);
      }
    };

    ws.onerror = () => setNetworkError(true);
    ws.onclose = () => setNetworkError(true);

    return () => { ws.close(); };
  }, [backendUrl, triggerAlert]);

  const confidencePercent = (confidence * 100).toFixed(1);
  const confidenceColor = prediction === "FALL" 
    ? "text-red-400" 
    : confidence > 0.9 
      ? "text-emerald-400" 
      : "text-yellow-400";

  return (
    <div className={`min-h-screen w-full flex flex-col items-center justify-center p-6 transition-colors duration-500 pb-32 ${isAlert ? 'bg-red-950' : 'bg-gray-950'}`}>
      
      {/* Header */}
      <div className="absolute top-0 w-full p-6 flex items-center justify-between pointer-events-none mt-12 md:mt-4">
        <div className="flex items-center space-x-2 text-emerald-400 bg-emerald-950/50 px-4 py-2 rounded-full border border-emerald-500/30 shadow-lg backdrop-blur-sm">
          <ShieldCheck className="w-5 h-5" />
          <span className="text-sm font-semibold tracking-wide uppercase">Zero-Camera Monitoring Active</span>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Model badge */}
          <div className="flex items-center space-x-2 text-purple-400 bg-purple-950/50 px-4 py-2 rounded-full border border-purple-500/30 shadow-lg backdrop-blur-sm">
            <Brain className="w-4 h-4" />
            <span className="text-sm font-semibold">ANN Model</span>
          </div>

          {networkError && (
            <div className="flex items-center space-x-2 text-red-400 bg-red-950/50 px-4 py-2 rounded-full border border-red-500/30 shadow-lg backdrop-blur-sm">
              <WifiOff className="w-5 h-5" />
              <span className="text-sm font-semibold">Offline</span>
            </div>
          )}
        </div>
      </div>

      <div className={`max-w-4xl w-full p-8 rounded-3xl flex flex-col items-center justify-center space-y-6 bg-gray-900 border shadow-2xl mt-20 ${isAlert ? 'border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.2)]' : 'border-gray-800'}`}>
        
        {/* Title */}
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
            Aegis Dashboard
          </h1>
          <p className="text-gray-500 mt-1 text-sm font-medium tracking-wide">
            Wi-Fi CSI Fall Detection — Artificial Neural Network
          </p>
        </div>

        {/* Stats Row */}
        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-black/30 rounded-xl p-4 border border-gray-800 text-center">
            <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Variance</p>
            <p className="text-2xl font-bold text-emerald-400 font-mono">{variance.toFixed(1)}</p>
          </div>
          <div className="bg-black/30 rounded-xl p-4 border border-gray-800 text-center">
            <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">ANN Confidence</p>
            <p className={`text-2xl font-bold font-mono ${confidenceColor}`}>{confidencePercent}%</p>
          </div>
          <div className="bg-black/30 rounded-xl p-4 border border-gray-800 text-center">
            <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Prediction</p>
            <p className={`text-2xl font-bold font-mono ${prediction === "FALL" ? "text-red-400" : "text-emerald-400"}`}>
              {prediction === "FALL" ? "⚠ FALL" : "✓ SAFE"}
            </p>
          </div>
        </div>

        {/* Real-time Neon Green Chart */}
        <div className="w-full h-56 bg-black/40 rounded-xl p-4 border border-gray-800 shadow-inner" style={{ minWidth: 0, minHeight: 0 }}>
          {csiData.length > 0 ? (
            <ResponsiveContainer width="99%" height="100%">
              <LineChart data={csiData}>
                <XAxis dataKey="index" hide />
                <YAxis domain={[-20, 120]} hide />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '0.5rem' }}
                  itemStyle={{ color: '#34d399', fontWeight: 'bold' }}
                  labelStyle={{ display: 'none' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="amplitude" 
                  stroke={isAlert ? "#f87171" : "#34d399"}
                  strokeWidth={3} 
                  dot={false}
                  isAnimationActive={false} 
                  style={{ filter: isAlert 
                    ? "drop-shadow(0px 0px 10px rgba(248,113,113,0.8))" 
                    : "drop-shadow(0px 0px 8px rgba(52,211,153,0.8))" 
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center w-full h-full text-gray-500 font-mono space-y-4">
              <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
              <span>Connecting to CSI Stream ({backendUrl.replace(/^http/, 'ws')}...)...</span>
            </div>
          )}
        </div>

        {/* Confidence Bar */}
        <div className="w-full">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
            <span className="flex items-center gap-1"><Activity className="w-3 h-3" /> ANN Inference Confidence</span>
            <span className={confidenceColor}>{confidencePercent}%</span>
          </div>
          <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-300 ${
                prediction === "FALL" 
                  ? "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]" 
                  : "bg-emerald-500 shadow-[0_0_10px_rgba(52,211,153,0.5)]"
              }`}
              style={{ width: `${confidence * 100}%` }}
            />
          </div>
        </div>

        {/* Status Display Area */}
        <div className={`w-full text-2xl md:text-3xl font-extrabold py-6 px-6 rounded-2xl text-center flex items-center justify-center transition-all ${
            isAlert 
              ? 'bg-red-900/50 text-red-400 border-2 border-red-500 shadow-[inset_0_0_20px_rgba(239,68,68,0.3)] animate-pulse' 
              : 'bg-emerald-900/20 text-emerald-400 border-2 border-emerald-500/30'
          }`}>
          {isAlert ? (
            <>
              <AlertTriangle className="w-8 h-8 mr-3" />
              EMERGENCY: FALL DETECTED
            </>
          ) : '🟢 Monitoring Secure'}
        </div>

        {/* Reset button */}
        {isAlert && (
          <button 
            onClick={() => setIsAlert(false)}
            className="px-8 py-4 bg-gray-800 text-white font-bold rounded-xl hover:bg-gray-700 transition-colors border border-gray-700 active:scale-95"
          >
            Acknowledge & Reset
          </button>
        )}

      </div>
    </div>
  );
}
