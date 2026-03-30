import React, { useEffect, useMemo, useState } from 'react';
import { Database, MapPinned, RadioTower, Clock3 } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface DashboardSummary {
  totalBusinesses: number;
  byCity: { name: string; count: number }[];
  bySource: { name: string; count: number }[];
  recentRecords: { id: string; city: string; source: string; created_at: string }[];
}

interface DashboardProps {
  dataVersion: number;
}

const PIE_COLORS = ['#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6'];

export function Dashboard({ dataVersion }: DashboardProps) {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSummary = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/dashboard-summary');
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error || 'Failed to load dashboard');
        setSummary(payload);
      } catch (fetchError: any) {
        setError(fetchError.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [dataVersion]);

  const topCity = useMemo(() => {
    if (!summary?.byCity.length) return 'N/A';
    return [...summary.byCity].sort((a, b) => b.count - a.count)[0].name;
  }, [summary]);

  if (loading) {
    return <div className="p-10 bg-white rounded-2xl border border-zinc-200">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="p-10 bg-red-50 rounded-2xl border border-red-100 text-red-800">{error}</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Operations Overview</h2>
        <p className="text-zinc-500 text-sm">Live Supabase metrics for collection output.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Businesses', value: summary?.totalBusinesses || 0, icon: Database },
          { label: 'Tracked Cities', value: summary?.byCity.length || 0, icon: MapPinned },
          { label: 'Active Sources', value: summary?.bySource.length || 0, icon: RadioTower },
          { label: 'Top City', value: topCity, icon: Clock3 },
        ].map((stat) => (
          <div key={stat.label} className="bg-white border border-zinc-200 p-5 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <stat.icon className="w-5 h-5 text-zinc-500" />
            </div>
            <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider">{stat.label}</p>
            <p className="text-2xl font-bold tracking-tight">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-zinc-200 p-6 rounded-2xl shadow-sm">
          <h3 className="font-bold mb-6">Businesses by City</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <BarChart data={summary?.byCity || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip />
                <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} barSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white border border-zinc-200 p-6 rounded-2xl shadow-sm">
          <h3 className="font-bold mb-6">By Source</h3>
          <div className="h-[230px]">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <PieChart>
                <Pie data={summary?.bySource || []} cx="50%" cy="50%" innerRadius={45} outerRadius={75} dataKey="count">
                  {(summary?.bySource || []).map((entry, index) => (
                    <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-4">
            {(summary?.bySource || []).map((item, index) => (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }} />
                  <span className="text-zinc-600 uppercase">{item.name}</span>
                </div>
                <span className="font-bold">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-zinc-100">
          <h3 className="font-bold">Recent Records</h3>
        </div>
        <div className="divide-y divide-zinc-100">
          {(summary?.recentRecords || []).map((record) => (
            <div key={record.id} className="p-4 flex items-center justify-between">
              <p className="text-sm font-medium">{record.city} • <span className="uppercase">{record.source}</span></p>
              <p className="text-xs text-zinc-500">{new Date(record.created_at).toLocaleString()}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
