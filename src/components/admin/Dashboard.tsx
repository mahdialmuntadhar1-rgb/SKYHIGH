import React, { useEffect, useMemo, useState } from 'react';
import { Users, Database, MapPin, Radio, TrendingUp } from 'lucide-react';
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
import { DashboardStats } from '../../types';

interface DashboardProps {
  refreshKey?: number;
}

const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#14b8a6'];

export function Dashboard({ refreshKey = 0 }: DashboardProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/dashboard-stats');
        const json = await response.json();
        if (!response.ok) {
          throw new Error(json?.error || 'Failed to load dashboard');
        }
        setStats(json);
      } catch (err: any) {
        setError(err?.message || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [refreshKey]);

  const topCities = useMemo(() => (stats?.countsByCity || []).sort((a, b) => b.count - a.count).slice(0, 8), [stats]);
  const sourceChart = useMemo(
    () => (stats?.countsBySource || []).sort((a, b) => b.count - a.count).map((s) => ({ name: s.source, value: s.count })),
    [stats]
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Operations Overview</h2>
          <p className="text-zinc-500 text-sm">Live Supabase data quality and collection metrics.</p>
        </div>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-900 p-4 rounded-xl text-sm">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Businesses', value: stats?.totalBusinesses ?? 0, icon: Database, color: 'bg-blue-500' },
          { label: 'Cities Covered', value: stats?.countsByCity.length ?? 0, icon: MapPin, color: 'bg-emerald-500' },
          { label: 'Active Sources', value: stats?.countsBySource.length ?? 0, icon: Radio, color: 'bg-amber-500' },
          { label: 'Recent Records', value: stats?.recentBusinesses.length ?? 0, icon: TrendingUp, color: 'bg-indigo-500' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white border border-zinc-200 p-5 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.color} p-2 rounded-lg`}><stat.icon className="w-5 h-5 text-white" /></div>
            </div>
            <div className="space-y-1">
              <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider">{stat.label}</p>
              <p className="text-2xl font-bold tracking-tight">{loading ? '...' : Number(stat.value).toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-zinc-200 p-6 rounded-2xl shadow-sm">
          <h3 className="font-bold mb-8">Businesses by City</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <BarChart data={topCities}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="city" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white border border-zinc-200 p-6 rounded-2xl shadow-sm">
          <h3 className="font-bold mb-8">By Source</h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <PieChart>
                <Pie data={sourceChart} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {sourceChart.map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3 mt-4">
            {(sourceChart.length ? sourceChart : [{ name: 'No data', value: 0 }]).map((item, idx) => (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} /><span className="text-zinc-600 uppercase">{item.name}</span></div>
                <span className="font-bold">{item.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
          <h3 className="font-bold">Recent Records</h3>
          <Users className="w-4 h-4 text-zinc-400" />
        </div>
        <div className="divide-y divide-zinc-100">
          {(stats?.recentBusinesses || []).map((biz) => (
            <div key={biz.id} className="p-6 flex items-center justify-between hover:bg-zinc-50 transition-colors">
              <div>
                <p className="text-sm font-bold">{biz.name}</p>
                <p className="text-xs text-zinc-500">{biz.city} • {biz.category}</p>
              </div>
              <span className="text-xs font-bold text-zinc-500 uppercase">{biz.source || 'unknown'}</span>
            </div>
          ))}
          {!loading && (!stats?.recentBusinesses || stats.recentBusinesses.length === 0) && (
            <div className="p-6 text-sm text-zinc-500">No records available yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}
