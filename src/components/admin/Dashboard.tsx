import React, { useEffect, useMemo, useState } from 'react';
import { Users, Database, Clock } from 'lucide-react';
import { Business } from '../../types';

interface DashboardProps {
  refreshToken?: number;
}

interface DashboardPayload {
  totalBusinesses: number;
  byCity: Record<string, number>;
  bySource: Record<string, number>;
  recent: Business[];
}

export function Dashboard({ refreshToken }: DashboardProps) {
  const [data, setData] = useState<DashboardPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/dashboard');
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error || 'Failed to load dashboard');
        setData(payload);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [refreshToken]);

  const cityData = useMemo(() => Object.entries(data?.byCity || {}).sort((a, b) => Number(b[1]) - Number(a[1])), [data]);
  const sourceData = useMemo(() => Object.entries(data?.bySource || {}).sort((a, b) => Number(b[1]) - Number(a[1])), [data]);

  if (loading) return <div className="text-sm text-zinc-500">Loading dashboard...</div>;
  if (error) return <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-700">{error}</div>;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Operations Overview</h2>
        <p className="text-zinc-500 text-sm">Live Supabase metrics for discovered businesses.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-zinc-200 p-5 rounded-2xl shadow-sm">
          <div className="bg-blue-500 p-2 rounded-lg w-fit mb-4"><Database className="w-5 h-5 text-white" /></div>
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider">Total Businesses</p>
          <p className="text-2xl font-bold tracking-tight">{data?.totalBusinesses || 0}</p>
        </div>
        <div className="bg-white border border-zinc-200 p-5 rounded-2xl shadow-sm">
          <div className="bg-emerald-500 p-2 rounded-lg w-fit mb-4"><Users className="w-5 h-5 text-white" /></div>
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider">Tracked Cities</p>
          <p className="text-2xl font-bold tracking-tight">{cityData.length}</p>
        </div>
        <div className="bg-white border border-zinc-200 p-5 rounded-2xl shadow-sm">
          <div className="bg-amber-500 p-2 rounded-lg w-fit mb-4"><Clock className="w-5 h-5 text-white" /></div>
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider">Recent Records</p>
          <p className="text-2xl font-bold tracking-tight">{data?.recent?.length || 0}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-zinc-200 p-6 rounded-2xl shadow-sm">
          <h3 className="font-bold mb-4">Counts by City</h3>
          <div className="space-y-2">
            {cityData.map(([city, count]) => (
              <div key={city} className="flex items-center justify-between text-sm border-b border-zinc-100 pb-2">
                <span>{city}</span>
                <span className="font-bold">{count}</span>
              </div>
            ))}
            {cityData.length === 0 && <div className="text-sm text-zinc-500">No data yet.</div>}
          </div>
        </div>
        <div className="bg-white border border-zinc-200 p-6 rounded-2xl shadow-sm">
          <h3 className="font-bold mb-4">Counts by Source</h3>
          <div className="space-y-2">
            {sourceData.map(([source, count]) => (
              <div key={source} className="flex items-center justify-between text-sm border-b border-zinc-100 pb-2">
                <span className="uppercase">{source}</span>
                <span className="font-bold">{count}</span>
              </div>
            ))}
            {sourceData.length === 0 && <div className="text-sm text-zinc-500">No data yet.</div>}
          </div>
        </div>
      </div>

      <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-zinc-100"><h3 className="font-bold">Recent Records</h3></div>
        <div className="divide-y divide-zinc-100">
          {(data?.recent || []).map((item) => (
            <div key={item.id} className="p-6 flex items-center justify-between hover:bg-zinc-50 transition-colors">
              <div>
                <p className="text-sm font-bold">{item.name}</p>
                <p className="text-xs text-zinc-500">{item.city} • {item.category} • {item.source}</p>
              </div>
              <div className="text-xs text-zinc-400">{item.created_at ? new Date(item.created_at).toLocaleString() : '-'}</div>
            </div>
          ))}
          {data?.recent?.length === 0 && <div className="p-6 text-sm text-zinc-500">No records yet.</div>}
        </div>
      </div>
    </div>
  );
}
