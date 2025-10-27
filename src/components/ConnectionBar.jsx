import React, { useState } from 'react';
import { Link2, Play, Square } from 'lucide-react';

export default function ConnectionBar({ defaultUrl, status, onConnect, onDisconnect }){
  const [url, setUrl] = useState(defaultUrl);

  return (
    <div className="w-full rounded-xl border border-slate-200 bg-white/70 backdrop-blur p-4 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
      <div className="flex-1">
        <label className="text-xs font-medium text-slate-600 flex items-center gap-2 mb-1">
          <Link2 className="w-4 h-4" /> WebSocket Endpoint
        </label>
        <input
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={url}
          onChange={(e)=> setUrl(e.target.value)}
          placeholder="ws://localhost:8080/stream?role=dashboard"
        />
      </div>
      <div className="flex items-center gap-2">
        {status !== 'connected' ? (
          <button
            onClick={()=> onConnect(url)}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 text-white px-4 py-2 text-sm font-medium hover:bg-blue-700"
          >
            <Play className="w-4 h-4" /> Connect
          </button>
        ) : (
          <button
            onClick={onDisconnect}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-800 text-white px-4 py-2 text-sm font-medium hover:bg-slate-900"
          >
            <Square className="w-4 h-4" /> Disconnect
          </button>
        )}
        <div className={`px-3 py-2 rounded-lg text-xs font-medium ${status==='connected' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : status==='connecting' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-slate-50 text-slate-700 border border-slate-200'}`}>
          {status === 'connected' ? 'Connected' : status === 'connecting' ? 'Connecting…' : 'Disconnected'}
        </div>
      </div>
    </div>
  );
}
