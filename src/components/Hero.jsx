import React from 'react';
import Spline from '@splinetool/react-spline';

export default function Hero(){
  return (
    <section className="relative h-[420px] w-full overflow-hidden rounded-2xl border border-slate-200 bg-black">
      <div className="absolute inset-0">
        <Spline scene="https://prod.spline.design/6tUXqVcUA0xgJugv/scene.splinecode" style={{ width: '100%', height: '100%' }} />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/40 to-transparent pointer-events-none" />
      <div className="relative z-10 h-full flex flex-col items-start justify-end p-6 sm:p-8">
        <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs text-white ring-1 ring-white/15 mb-3">
          <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          CNN–BiLSTM • Live Prediction
        </div>
        <h1 className="text-white text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight">
          TrafficPulse AI — Predictive Streaming Analytics
        </h1>
        <p className="mt-2 max-w-2xl text-slate-200/90 text-sm sm:text-base">
          Real-time telemetry, short-term forecasting, and anomaly-aware alerts for proactive congestion management.
        </p>
      </div>
    </section>
  );
}
