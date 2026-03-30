import React, { useEffect, useState } from 'react';
import { Filter, Phone, MapPin, ExternalLink, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { CanonicalBusiness, QCStatus } from '../types';

const CITIES = ['All', 'Baghdad', 'Erbil', 'Basra', 'Mosul', 'Sulaymaniyah', 'Najaf', 'Karbala'];
const STATUSES: Array<'All' | QCStatus> = ['All', 'Pending Review', 'Needs Cleaning', 'Needs Verification', 'Verified', 'Rejected', 'Export Ready', 'Outside Central Coverage'];

export function ResultsPage() {
  const [businesses, setBusinesses] = useState<CanonicalBusiness[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [city, setCity] = useState('All');
  const [status, setStatus] = useState<'All' | QCStatus>('All');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 10;

  useEffect(() => {
    const fetchBusinesses = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
        if (city !== 'All') params.append('city', city);
        if (status !== 'All') params.append('status', status);

        const response = await fetch(`/api/businesses?${params}`);
        if (!response.ok) throw new Error('Failed to fetch businesses');
        const data = await response.json();
        setBusinesses(data.data);
        setTotal(data.total);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBusinesses();
  }, [city, status, page]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">QC Review Queue</h1>
        <div className="flex items-center gap-2 bg-white border border-zinc-200 p-1 rounded-xl shadow-sm">
          <div className="flex items-center gap-2 px-3 text-zinc-400"><Filter className="w-4 h-4" /></div>
          <select value={city} onChange={(e) => { setCity(e.target.value); setPage(1); }} className="bg-transparent text-sm font-medium py-2 pr-4 focus:outline-none">
            {CITIES.map((item) => <option key={item}>{item}</option>)}
          </select>
          <div className="w-px h-4 bg-zinc-200" />
          <select value={status} onChange={(e) => { setStatus(e.target.value as any); setPage(1); }} className="bg-transparent text-sm font-medium py-2 pr-4 focus:outline-none">
            {STATUSES.map((item) => <option key={item}>{item}</option>)}
          </select>
        </div>
      </div>

      {loading ? <div className="flex justify-center py-12"><Loader2 className="w-7 h-7 animate-spin text-zinc-400" /></div> : error ? <div className="text-red-700">{error}</div> : (
        <div className="space-y-4">
          {businesses.map((biz) => (
            <div key={`${biz.provider_id}-${biz.business_name}-${biz.created_at}`} className="bg-white border border-zinc-200 rounded-2xl p-6">
              <div className="flex justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold">{biz.business_name}</h3>
                  <div className="text-sm text-zinc-500 flex flex-wrap gap-3 mt-1">
                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {biz.city} / {biz.district || '-'}</span>
                    {biz.phone_primary && <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {biz.phone_primary}</span>}
                    <span className="bg-zinc-100 px-2 rounded text-xs">{biz.category}</span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-1">Coverage: {biz.coverage_type} · Provider: {biz.source_name}</p>
                  <p className="text-xs text-zinc-500 mt-1">Scores — completeness {biz.completeness_score} / verification {biz.verification_score} / readiness {biz.publish_readiness_score}</p>
                  {biz.verification_notes?.length ? <p className="text-xs text-amber-700 mt-1">Notes: {biz.verification_notes.join('; ')}</p> : null}
                </div>
                <div className="text-right space-y-2">
                  <div className="text-xs px-2 py-1 bg-zinc-900 text-white rounded">{biz.status}</div>
                  {biz.source_url && <a href={biz.source_url} target="_blank" rel="noreferrer" className="text-xs text-orange-700 inline-flex items-center gap-1">source <ExternalLink className="w-3.5 h-3.5" /></a>}
                </div>
              </div>
            </div>
          ))}

          <div className="flex items-center justify-between pt-4">
            <p className="text-sm text-zinc-500">Showing {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, total)} of {total}</p>
            <div className="flex gap-2">
              <button disabled={page === 1} onClick={() => setPage((p) => p - 1)} className="p-2 rounded-lg border border-zinc-200 disabled:opacity-30"><ChevronLeft className="w-5 h-5" /></button>
              <button disabled={page * pageSize >= total} onClick={() => setPage((p) => p + 1)} className="p-2 rounded-lg border border-zinc-200 disabled:opacity-30"><ChevronRight className="w-5 h-5" /></button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
