import React from 'react';

export default function TelemetryList({ items }){
  return (
    <div className="h-[340px] overflow-auto rounded-xl border border-slate-200 bg-white">
      <div className="sticky top-0 z-10 bg-slate-50/80 backdrop-blur px-4 py-2 text-xs text-slate-600 border-b border-slate-200">Live Telemetry</div>
      <ul className="divide-y divide-slate-100">
        {items.length === 0 && (
          <li className="px-4 py-6 text-sm text-slate-500">Waiting for telemetry… Connect the generator to start streaming.</li>
        )}
        {items.map((t)=> (
          <li key={t.id} className="px-4 py-3 text-sm">
            <div className="flex items-center justify-between">
              <div className="font-medium text-slate-800">{t.segmentName} <span className="text-slate-400">({t.segmentId})</span></div>
              <div className="text-slate-500">{new Date(t.timestamp).toLocaleTimeString()}</div>
            </div>
            <div className="mt-1 text-slate-600">
              Speed <span className="font-semibold">{t.speed.toFixed(1)} km/h</span> · Occupancy <span className="font-semibold">{(t.occupancy*100).toFixed(0)}%</span> · Vehicles <span className="font-semibold">{t.vehicleCount}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
