import React, { useEffect, useMemo, useRef, useState } from 'react';
import Hero from './components/Hero';
import ConnectionBar from './components/ConnectionBar';
import TelemetryList from './components/TelemetryList';
import SegmentsTable from './components/SegmentsTable';

function useDashboardWs(){
  const [status, setStatus] = useState('disconnected');
  const [url, setUrl] = useState(() => {
    const proto = typeof window !== 'undefined' && window.location?.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = typeof window !== 'undefined' ? window.location.host : 'localhost:8080';
    return `${proto}//${host}/stream?role=dashboard`;
  });
  const wsRef = useRef(null);
  const [telemetry, setTelemetry] = useState([]);
  const [segments, setSegments] = useState({});
  const [alerts, setAlerts] = useState([]);
  const [historyBySegment, setHistoryBySegment] = useState({});

  const connect = (customUrl) => {
    const target = customUrl || url;
    setUrl(target);
    try{
      setStatus('connecting');
      const ws = new WebSocket(target);
      wsRef.current = ws;
      ws.onopen = () => setStatus('connected');
      ws.onclose = () => setStatus('disconnected');
      ws.onerror = () => setStatus('disconnected');
      ws.onmessage = (ev) => {
        try{
          const msg = JSON.parse(ev.data);
          if(msg.type === 'telemetry'){
            setTelemetry((prev) => [msg.data, ...prev].slice(0, 120));
          } else if(msg.type === 'segment_update'){
            setSegments((s) => ({ ...s, [msg.segmentId]: { ...(s[msg.segmentId]||{}), prediction: msg.prediction, features: msg.features }}));
            if(msg.alert){ setAlerts((a) => [msg.alert, ...a].slice(0, 60)); }
          } else if(msg.type === 'init'){
            (msg.segments || []).forEach((id) => setSegments((s) => ({ ...s, [id]: s[id] || {} })));
          } else if(msg.type === 'prediction'){
            // CNN–BiLSTM real vs predicted packet
            const { segmentId, predicted, actual, timestamp } = msg;
            setHistoryBySegment((h) => {
              const arr = h[segmentId] ? [...h[segmentId]] : [];
              arr.push({ t: timestamp, yhat: predicted, y: actual });
              const trimmed = arr.slice(Math.max(0, arr.length - 120));
              return { ...h, [segmentId]: trimmed };
            });
            setSegments((s) => ({
              ...s,
              [segmentId]: {
                ...(s[segmentId]||{}),
                prediction: predicted,
                features: s[segmentId]?.features || null,
              }
            }));
          }
        }catch(e){ /* ignore malformed */ }
      };
    }catch(e){ setStatus('disconnected'); }
  };

  const disconnect = () => {
    try{ wsRef.current?.close(); }catch{ /* noop */ }
    setStatus('disconnected');
  };

  return { status, url, connect, disconnect, telemetry, segments, alerts, historyBySegment };
}

function SvgLine({ points, color, yDomain, strokeWidth=2 }){
  if(!points || points.length === 0) return null;
  const width = 640, height = 220, pad = 24;
  const xs = points.map(p=>p.t);
  const ys = points.map(p=>p.v);
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const minY = yDomain ? yDomain[0] : Math.min(...ys);
  const maxY = yDomain ? yDomain[1] : Math.max(...ys);
  const sx = (x) => pad + (width - 2*pad) * ((x - minX) / (maxX - minX || 1));
  const sy = (y) => height - pad - (height - 2*pad) * ((y - minY) / (maxY - minY || 1));
  const d = points.map((p,i)=> `${i?'L':'M'}${sx(p.t)},${sy(p.v)}`).join(' ');
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-[240px]">
      <defs>
        <linearGradient id="gradPred" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.4" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width={width} height={height} rx="12" fill="white" />
      <path d={d} fill="none" stroke={color} strokeWidth={strokeWidth} />
    </svg>
  );
}

function RealVsPredChart({ series }){
  const pointsPred = series.map(p => ({ t: p.t, v: p.yhat }));
  const pointsReal = series.map(p => ({ t: p.t, v: p.y }));
  const yMin = Math.min(...pointsPred.map(p=>p.v), ...pointsReal.map(p=>p.v), 0);
  const yMax = Math.max(...pointsPred.map(p=>p.v), ...pointsReal.map(p=>p.v), 80);
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm font-medium text-slate-700">Actual vs Predicted Speed</div>
        <div className="flex items-center gap-3 text-xs">
          <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Actual</span>
          <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-blue-600" /> Predicted</span>
        </div>
      </div>
      <div className="relative">
        <SvgLine points={pointsReal} color="#10b981" yDomain={[yMin, yMax]} />
        <div className="-mt-[240px]">
          <SvgLine points={pointsPred} color="#2563eb" yDomain={[yMin, yMax]} />
        </div>
      </div>
    </div>
  );
}

export default function App(){
  const { status, url, connect, disconnect, telemetry, segments, alerts, historyBySegment } = useDashboardWs();
  const [selectedSegment, setSelectedSegment] = useState('');

  useEffect(()=>{ connect(url); // auto-connect
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const topAlerts = useMemo(() => alerts.slice(0, 5), [alerts]);
  const segmentIds = useMemo(()=> Object.keys(segments), [segments]);
  useEffect(()=>{
    if(!selectedSegment && segmentIds.length) setSelectedSegment(segmentIds[0]);
  }, [segmentIds, selectedSegment]);

  const series = historyBySegment[selectedSegment] || [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8 space-y-6">
        <Hero />

        <ConnectionBar
          defaultUrl={url}
          status={status}
          onConnect={connect}
          onDisconnect={disconnect}
        />

        {topAlerts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {topAlerts.map((a) => (
              <div key={a.id} className={`rounded-xl border p-4 ${a.level==='CRITICAL' ? 'border-rose-200 bg-rose-50' : a.level==='WARN' ? 'border-amber-200 bg-amber-50' : 'border-slate-200 bg-slate-50'}`}>
                <div className="flex items-center justify-between">
                  <div className="text-xs font-semibold tracking-wide uppercase text-slate-600">{a.level}</div>
                  <div className="text-xs text-slate-500">{new Date(a.timestamp).toLocaleTimeString()}</div>
                </div>
                <div className="mt-1 text-slate-800 font-medium">Segment {a.segmentId}</div>
                <div className="text-sm text-slate-600">{a.message}</div>
                <div className="mt-1 text-sm text-slate-700">Predicted speed <span className="font-semibold">{a.predictedSpeed?.toFixed ? a.predictedSpeed.toFixed(1) : a.predictedSpeed} km/h</span></div>
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-slate-700">Segment</div>
              <select className="rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white" value={selectedSegment} onChange={(e)=> setSelectedSegment(e.target.value)}>
                {segmentIds.length === 0 && <option value="">Waiting…</option>}
                {segmentIds.map(id => <option key={id} value={id}>{id}</option>)}
              </select>
            </div>
            <RealVsPredChart series={series} />
            <SegmentsTable segments={segments} />
          </div>
          <div className="lg:col-span-1">
            <TelemetryList items={telemetry} />
          </div>
        </div>
      </div>
    </div>
  );
}
