import React, { useEffect, useMemo, useState } from 'react';
import {
  Search,
  Filter,
  CheckSquare,
  Square,
  Phone,
  MapPin,
  Globe,
  ExternalLink,
  XCircle,
} from 'lucide-react';
import { Business } from '../../types';

interface ReviewQueueProps {
  refreshKey?: number;
}

export function ReviewQueue({ refreshKey = 0 }: ReviewQueueProps) {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [filterCity, setFilterCity] = useState('All Cities');
  const [search, setSearch] = useState('');
  const [viewingRecord, setViewingRecord] = useState<Business | null>(null);

  const cities = useMemo(() => ['All Cities', ...Array.from(new Set(businesses.map((b) => b.city).filter(Boolean)))], [businesses]);

  useEffect(() => {
    const fetchBusinesses = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({ page: '1', pageSize: '100' });
        if (filterCity !== 'All Cities') params.set('city', filterCity);
        if (search.trim()) params.set('q', search.trim());

        const response = await fetch(`/api/businesses?${params.toString()}`);
        const json = await response.json();
        if (!response.ok) {
          throw new Error(json?.error || 'Failed to fetch businesses');
        }

        setBusinesses(json.data || []);
      } catch (err: any) {
        setError(err?.message || 'Failed to fetch businesses');
      } finally {
        setLoading(false);
      }
    };

    fetchBusinesses();
  }, [filterCity, search, refreshKey]);

  const toggleSelectAll = () => {
    if (selectedIds.length === businesses.length) setSelectedIds([]);
    else setSelectedIds(businesses.map((b) => b.id));
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]));
  };

  return (
    <div className="relative min-h-[calc(100vh-12rem)] space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Review Queue</h2>
          <p className="text-zinc-500 text-sm">Live businesses from Supabase for review and cleanup.</p>
        </div>
        <button className="px-4 py-2 bg-zinc-900 text-white rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors flex items-center gap-2">
          Bulk Actions ({selectedIds.length})
        </button>
      </div>

      <div className="bg-white border border-zinc-200 p-4 rounded-2xl shadow-sm flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, phone, or category..."
            className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-zinc-400" />
          <select
            value={filterCity}
            onChange={(e) => setFilterCity(e.target.value)}
            className="bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-sm font-medium focus:outline-none"
          >
            {cities.map((city) => <option key={city}>{city}</option>)}
          </select>
        </div>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-900 p-4 rounded-xl text-sm">{error}</div>}

      <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-zinc-50 border-b border-zinc-200">
              <tr>
                <th className="px-6 py-4 w-10">
                  <button onClick={toggleSelectAll} className="text-zinc-400 hover:text-zinc-900 transition-colors">
                    {selectedIds.length === businesses.length && businesses.length > 0 ? <CheckSquare className="w-5 h-5 text-orange-600" /> : <Square className="w-5 h-5" />}
                  </button>
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-500">Business</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-500">Location</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-500">Source</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-500 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-8 text-sm text-zinc-500">Loading records...</td></tr>
              ) : businesses.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-sm text-zinc-500">No records found.</td></tr>
              ) : (
                businesses.map((biz) => (
                  <tr key={biz.id} className={`cursor-pointer hover:bg-zinc-50 transition-colors ${selectedIds.includes(biz.id) ? 'bg-orange-50/30' : ''}`} onClick={() => setViewingRecord(biz)}>
                    <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => toggleSelect(biz.id)} className="text-zinc-400 hover:text-zinc-900 transition-colors">
                        {selectedIds.includes(biz.id) ? <CheckSquare className="w-5 h-5 text-orange-600" /> : <Square className="w-5 h-5" />}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2"><span className="font-bold text-sm">{biz.name}</span></div>
                        <div className="flex items-center gap-2 text-xs text-zinc-500">
                          <span className="bg-zinc-100 px-1.5 py-0.5 rounded font-bold uppercase tracking-tighter">{biz.category}</span>
                          {biz.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {biz.phone}</span>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-zinc-400" />{biz.city}</div>
                      <div className="text-xs text-zinc-500">{biz.address || '-'}</div>
                    </td>
                    <td className="px-6 py-4 text-xs uppercase font-bold text-zinc-500">{biz.source || 'unknown'}</td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-xs font-bold text-orange-600 hover:text-orange-700">Open</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {viewingRecord && (
        <div className="fixed inset-y-0 right-0 w-[400px] bg-white border-l border-zinc-200 shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
          <div className="p-6 border-b border-zinc-100 flex items-center justify-between bg-zinc-50">
            <div><h3 className="font-bold text-lg">Record Details</h3><p className="text-xs text-zinc-500">ID: {viewingRecord.id}</p></div>
            <button onClick={() => setViewingRecord(null)} className="p-2 hover:bg-zinc-200 rounded-lg transition-colors"><XCircle className="w-5 h-5 text-zinc-400" /></button>
          </div>
          <div className="flex-1 overflow-auto p-6 space-y-4 text-sm">
            <div><p className="text-xs font-bold text-zinc-500">Name</p><p className="font-bold">{viewingRecord.name}</p></div>
            <div><p className="text-xs font-bold text-zinc-500">Category</p><p>{viewingRecord.category}</p></div>
            <div><p className="text-xs font-bold text-zinc-500">City</p><p>{viewingRecord.city}</p></div>
            <div><p className="text-xs font-bold text-zinc-500">Address</p><p>{viewingRecord.address || '-'}</p></div>
            <div><p className="text-xs font-bold text-zinc-500">Phone</p><p>{viewingRecord.phone || '-'}</p></div>
            <div><p className="text-xs font-bold text-zinc-500">Website</p>{viewingRecord.website ? <a href={viewingRecord.website} target="_blank" rel="noreferrer" className="text-orange-600 inline-flex items-center gap-1"><Globe className="w-4 h-4" />Open website</a> : <p>-</p>}</div>
            <div><p className="text-xs font-bold text-zinc-500">Source</p>{viewingRecord.source_url ? <a href={viewingRecord.source_url} target="_blank" rel="noreferrer" className="text-orange-600 inline-flex items-center gap-1"><ExternalLink className="w-4 h-4" />{viewingRecord.source}</a> : <p>{viewingRecord.source || '-'}</p>}</div>
          </div>
        </div>
      )}
    </div>
  );
}
