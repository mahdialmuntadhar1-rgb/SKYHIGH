import React, { useEffect, useMemo, useState } from 'react';
import { Search, Filter, ExternalLink, MapPin, Phone, Globe, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Business } from '../../types';

interface ReviewQueueProps {
  refreshToken?: number;
}

export function ReviewQueue({ refreshToken }: ReviewQueueProps) {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [city, setCity] = useState('All Cities');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 20;

  const fetchBusinesses = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString()
      });
      if (city !== 'All Cities') params.set('city', city);
      if (search.trim()) params.set('q', search.trim());

      const response = await fetch(`/api/businesses?${params.toString()}`);
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || 'Failed to fetch records');

      setBusinesses(payload.data || []);
      setTotal(payload.total || 0);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBusinesses();
  }, [page, city, refreshToken]);

  const cities = useMemo(() => {
    const set = new Set<string>(['All Cities']);
    businesses.forEach((b) => {
      if (b.city) set.add(b.city);
    });
    return [...set];
  }, [businesses]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Review Queue</h2>
          <p className="text-zinc-500 text-sm">Live Supabase records for manual quality review.</p>
        </div>
      </div>

      <div className="bg-white border border-zinc-200 p-4 rounded-2xl shadow-sm flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (setPage(1), fetchBusinesses())}
            placeholder="Search by name, phone, or category..."
            className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-zinc-400" />
          <select
            value={city}
            onChange={(e) => {
              setCity(e.target.value);
              setPage(1);
            }}
            className="bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-sm font-medium focus:outline-none"
          >
            {cities.map((cityName) => (
              <option key={cityName} value={cityName}>
                {cityName}
              </option>
            ))}
          </select>
          <button onClick={() => { setPage(1); fetchBusinesses(); }} className="px-3 py-2 bg-zinc-900 text-white rounded-xl text-xs font-bold">
            Apply
          </button>
        </div>
      </div>

      <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-10 flex items-center justify-center text-zinc-500 gap-2">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading records...
          </div>
        ) : error ? (
          <div className="p-6 text-sm text-red-700 bg-red-50">{error}</div>
        ) : businesses.length === 0 ? (
          <div className="p-10 text-center text-sm text-zinc-500">No records found for the selected filters.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-zinc-50 border-b border-zinc-200">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-500">Business</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-500">Location</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-500">Contact</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-500">Source</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-500">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {businesses.map((biz) => (
                  <tr key={biz.id} className="hover:bg-zinc-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-semibold text-sm">{biz.name}</div>
                        <div className="text-xs text-zinc-500">{biz.local_name || '-'} • {biz.category}</div>
                        {biz.address && <div className="text-xs text-zinc-400 mt-1">{biz.address}</div>}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-600">
                      <span className="inline-flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{biz.city || '-'}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-600">
                      <div className="flex items-center gap-3">
                        {biz.phone ? <span className="inline-flex items-center gap-1"><Phone className="w-3.5 h-3.5" />{biz.phone}</span> : <span>-</span>}
                        {biz.website && (
                          <a href={biz.website} target="_blank" rel="noreferrer" className="text-zinc-400 hover:text-zinc-800">
                            <Globe className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-600">
                      <div className="flex items-center gap-2">
                        <span className="uppercase text-xs font-bold">{biz.source || '-'}</span>
                        {biz.source_url && (
                          <a href={biz.source_url} target="_blank" rel="noreferrer" className="text-zinc-400 hover:text-zinc-800">
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-zinc-500">{biz.created_at ? new Date(biz.created_at).toLocaleString() : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="px-6 py-4 bg-zinc-50 border-t border-zinc-200 flex items-center justify-between">
          <p className="text-xs text-zinc-500 font-medium">
            Showing <span className="text-zinc-900 font-bold">{Math.min((page - 1) * pageSize + 1, total || 0)}-{Math.min(page * pageSize, total)}</span> of <span className="text-zinc-900 font-bold">{total}</span> records
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => p - 1)}
              disabled={page === 1}
              className="p-1.5 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 disabled:opacity-30 transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page * pageSize >= total}
              className="p-1.5 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 disabled:opacity-30 transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
