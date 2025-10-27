import React from 'react';
import Spline from '@splinetool/react-spline';

export default function Hero(){
  return (
    <section className="relative h-[380px] w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-950">
      <div className="absolute inset-0">
        <Spline scene="https://prod.spline.design/sbnqZNZdJSLK7U2A/scene.splinecode" style={{ width: '100%', height: '100%' }} />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/30 to-transparent pointer-events-none" />
      <div className="relative z-10 h-full flex flex-col items-start justify-end p-6 sm:p-8">
        <div className="inline-flex items-center gap-2 rounded-full bg-slate-900/70 px-3 py-1 text-xs text-slate-200 ring-1 ring-white/10 mb-3">
          <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          Live Predictive Streaming
        </div>
        <h1 className="text-white text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight">
          Traffic Management — Predictive Streaming Analytics
        </h1>
        <p className="mt-2 max-w-2xl text-slate-300 text-sm sm:text-base">
          Real-time telemetry, short-term speed prediction, and intelligent alerts to anticipate congestion before it happens.
        </p>
      </div>
    </section>
  );
}
