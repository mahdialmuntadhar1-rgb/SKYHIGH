import React, { useEffect, useMemo, useState } from 'react';
import {
  Search,
  Filter,
  CheckSquare,
  Square,
  MapPin,
  Phone,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  XCircle,
} from 'lucide-react';
import { Business } from '../../types';

interface ReviewQueueProps {
  dataVersion: number;
}

export function ReviewQueue({ dataVersion }: ReviewQueueProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [filterCity, setFilterCity] = useState('All');
  const [search, setSearch] = useState('');
  const [records, setRecords] = useState<Business[]>([]);
  const [viewingRecord, setViewingRecord] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 20;

  useEffect(() => {
    const fetchBusinesses = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
        if (filterCity !== 'All') params.set('city', filterCity);
        if (search.trim()) params.set('search', search.trim());

        const response = await fetch(`/api/businesses?${params.toString()}`);
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error || 'Failed to load records');

        setRecords(payload.data || []);
        setTotal(payload.total || 0);
      } catch (fetchError: any) {
        setError(fetchError.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBusinesses();
  }, [page, filterCity, search, dataVersion]);

  const cityOptions = useMemo(() => {
    const unique = new Set(records.map((record) => record.city).filter(Boolean));
    return ['All', ...Array.from(unique)];
  }, [records]);

  const toggleSelectAll = () => {
    if (selectedIds.length === records.length) {
      setSelectedIds([]);
      return;
    }
    setSelectedIds(records.map((record) => record.id));
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  };

  return (
    <div className="relative min-h-[calc(100vh-12rem)] space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Review Queue</h2>
          <p className="text-zinc-500 text-sm">Live Supabase records for manual review.</p>
        </div>
        <button className="px-4 py-2 bg-zinc-900 text-white rounded-lg text-sm font-medium">Bulk Actions ({selectedIds.length})</button>
      </div>

      <div className="bg-white border border-zinc-200 p-4 rounded-2xl shadow-sm flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by name, phone, or category..."
            className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-zinc-400" />
          <select
            value={filterCity}
            onChange={(e) => {
              setFilterCity(e.target.value);
              setPage(1);
            }}
            className="bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-sm font-medium focus:outline-none"
          >
            {cityOptions.map((city) => (
              <option key={city} value={city}>
                {city === 'All' ? 'All Cities' : city}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-sm text-zinc-500">Loading records...</div>
        ) : error ? (
          <div className="p-8 text-sm text-red-700 bg-red-50">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-zinc-50 border-b border-zinc-200">
                <tr>
                  <th className="px-6 py-4 w-10">
                    <button onClick={toggleSelectAll}>
                      {selectedIds.length === records.length && records.length > 0 ? <CheckSquare className="w-5 h-5 text-orange-600" /> : <Square className="w-5 h-5 text-zinc-500" />}
                    </button>
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-500">Business Details</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-500">Location</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-500">Source</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-500 text-right">Confidence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {records.map((biz) => (
                  <tr key={biz.id} onClick={() => setViewingRecord(biz)} className="cursor-pointer hover:bg-zinc-50 transition-colors">
                    <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => toggleSelect(biz.id)}>
                        {selectedIds.includes(biz.id) ? <CheckSquare className="w-5 h-5 text-orange-600" /> : <Square className="w-5 h-5 text-zinc-400" />}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-sm">{biz.name}</p>
                      <p className="text-xs text-zinc-500">{biz.category} {biz.phone ? `• ${biz.phone}` : ''}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-700">
                      <div className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-zinc-400" /> {biz.city}</div>
                      {biz.address && <p className="text-xs text-zinc-500 mt-1">{biz.address}</p>}
                    </td>
                    <td className="px-6 py-4 text-sm uppercase">{biz.source}</td>
                    <td className="px-6 py-4 text-right font-bold">{Math.round((biz.confidence_score || 0) * 100)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="px-6 py-4 bg-zinc-50 border-t border-zinc-200 flex items-center justify-between">
          <p className="text-xs text-zinc-500 font-medium">
            Showing <span className="text-zinc-900 font-bold">{records.length === 0 ? 0 : (page - 1) * pageSize + 1}-{Math.min(page * pageSize, total)}</span> of <span className="text-zinc-900 font-bold">{total}</span>
          </p>
          <div className="flex gap-2">
            <button disabled={page === 1} onClick={() => setPage((value) => Math.max(1, value - 1))} className="p-1.5 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 disabled:opacity-30 transition-all">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button disabled={page * pageSize >= total} onClick={() => setPage((value) => value + 1)} className="p-1.5 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 disabled:opacity-30 transition-all">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {viewingRecord && (
        <div className="fixed inset-y-0 right-0 w-[400px] bg-white border-l border-zinc-200 shadow-2xl z-50 flex flex-col">
          <div className="p-6 border-b border-zinc-100 flex items-center justify-between bg-zinc-50">
            <div>
              <h3 className="font-bold text-lg">Record Details</h3>
              <p className="text-xs text-zinc-500">ID: {viewingRecord.id}</p>
            </div>
            <button onClick={() => setViewingRecord(null)} className="p-2 hover:bg-zinc-200 rounded-lg transition-colors">
              <XCircle className="w-5 h-5 text-zinc-400" />
            </button>
          </div>
          <div className="p-6 space-y-3 text-sm overflow-auto">
            <p><span className="font-bold">Name:</span> {viewingRecord.name}</p>
            <p><span className="font-bold">Category:</span> {viewingRecord.category}</p>
            <p><span className="font-bold">City:</span> {viewingRecord.city}</p>
            {viewingRecord.address && <p><span className="font-bold">Address:</span> {viewingRecord.address}</p>}
            {viewingRecord.phone && <p className="flex items-center gap-1"><Phone className="w-4 h-4" /> {viewingRecord.phone}</p>}
            {viewingRecord.website && (
              <a href={viewingRecord.website} target="_blank" rel="noreferrer" className="text-blue-600 underline inline-flex items-center gap-1">
                Website <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
            {viewingRecord.source_url && (
              <a href={viewingRecord.source_url} target="_blank" rel="noreferrer" className="text-blue-600 underline inline-flex items-center gap-1">
                Source link <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
