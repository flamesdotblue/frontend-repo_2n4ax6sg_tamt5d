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
            if(msg.alert){
              setAlerts((a) => [msg.alert, ...a].slice(0, 60));
            }
          } else if(msg.type === 'init'){
            (msg.segments || []).forEach((id) => setSegments((s) => ({ ...s, [id]: s[id] || {} })));
          }
        }catch(e){
          // ignore malformed
        }
      };
    }catch(e){
      setStatus('disconnected');
    }
  };

  const disconnect = () => {
    try{ wsRef.current?.close(); }catch{ /* noop */ }
    setStatus('disconnected');
  };

  return { status, url, connect, disconnect, telemetry, segments, alerts };
}

export default function App(){
  const { status, url, connect, disconnect, telemetry, segments, alerts } = useDashboardWs();

  useEffect(()=>{
    // auto-connect on mount to default url
    connect(url);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const topAlerts = useMemo(() => alerts.slice(0, 5), [alerts]);

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
          <div className="lg:col-span-2">
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
