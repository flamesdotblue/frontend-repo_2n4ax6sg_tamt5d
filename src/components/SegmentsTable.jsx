import React from 'react';

function AlertBadge({ level, value }){
  if(!value && !level) return <span className="text-slate-400">-</span>;
  if(level === 'CRITICAL') return <span className="px-2 py-1 rounded-md text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">CRITICAL</span>;
  if(level === 'WARN') return <span className="px-2 py-1 rounded-md text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">WARN</span>;
  return <span className="px-2 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">OK</span>;
}

export default function SegmentsTable({ segments }){
  const entries = Object.entries(segments);
  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
      <div className="px-4 py-2 text-xs text-slate-600 bg-slate-50 border-b border-slate-200 sticky top-0">Predictions & Alerts</div>
      <table className="w-full text-sm">
        <thead className="bg-slate-50">
          <tr className="text-left text-slate-600">
            <th className="px-4 py-2">Segment</th>
            <th className="px-4 py-2">Pred Speed (next)</th>
            <th className="px-4 py-2">Avg Speed</th>
            <th className="px-4 py-2">Occupancy</th>
            <th className="px-4 py-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {entries.length === 0 && (
            <tr><td className="px-4 py-6 text-slate-500" colSpan={5}>No segments yet — waiting for data…</td></tr>
          )}
          {entries.map(([id, s]) => {
            const prediction = typeof s.prediction === 'number' ? s.prediction : null;
            const avgSpeed = s.features ? s.features[0] : null;
            const occ = s.features ? s.features[1] : null;
            const level = prediction != null ? (prediction <= 12 ? 'CRITICAL' : prediction <= 20 ? 'WARN' : 'INFO') : null;
            return (
              <tr key={id} className="border-t border-slate-100">
                <td className="px-4 py-3 font-medium text-slate-800">{id}</td>
                <td className="px-4 py-3">{prediction != null ? prediction.toFixed(1) : '-'}</td>
                <td className="px-4 py-3">{avgSpeed != null ? avgSpeed.toFixed(1) : '-'}</td>
                <td className="px-4 py-3">{occ != null ? `${(occ*100).toFixed(0)}%` : '-'}</td>
                <td className="px-4 py-3"><AlertBadge level={level} value={prediction} /></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
