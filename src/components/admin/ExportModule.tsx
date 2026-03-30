import React, { useEffect, useMemo, useState } from 'react';
import {
  Download,
  FileText,
  FileJson,
  Filter,
  CheckCircle2,
  Calendar,
  Loader2
} from 'lucide-react';

interface ExportMeta {
  total: number;
}

const cities = ['All Cities', 'Baghdad', 'Erbil', 'Basra', 'Sulaymaniyah', 'Mosul'];
const categories = ['All Categories', 'Retail', 'Food & Beverage', 'Health & Medical', 'Technology', 'Education', 'Hospitality'];

export function ExportModule() {
  const [isExporting, setIsExporting] = useState(false);
  const [isLoadingMeta, setIsLoadingMeta] = useState(true);
  const [meta, setMeta] = useState<ExportMeta>({ total: 0 });
  const [error, setError] = useState<string | null>(null);

  const [exportFormat, setExportFormat] = useState<'csv' | 'json'>('csv');
  const [city, setCity] = useState('All Cities');
  const [category, setCategory] = useState('All Categories');
  const [status, setStatus] = useState('Verified Only');
  const [dateRange, setDateRange] = useState('Last 30 Days');

  const statusValue = useMemo(() => {
    if (status === 'Verified Only') return 'verified';
    if (status === 'Export Ready Only') return 'export_ready';
    return '';
  }, [status]);

  const dateFrom = useMemo(() => {
    const now = new Date();
    if (dateRange === 'Last 30 Days') {
      now.setDate(now.getDate() - 30);
      return now.toISOString();
    }
    if (dateRange === 'Last 90 Days') {
      now.setDate(now.getDate() - 90);
      return now.toISOString();
    }
    return '';
  }, [dateRange]);

  const buildParams = () => {
    const params = new URLSearchParams();
    if (city !== 'All Cities') params.set('city', city);
    if (category !== 'All Categories') params.set('category', category);
    if (statusValue) params.set('status', statusValue);
    if (dateFrom) params.set('from', dateFrom);
    return params;
  };

  const loadMeta = async () => {
    setIsLoadingMeta(true);
    setError(null);
    try {
      const params = buildParams();
      params.set('page', '1');
      params.set('pageSize', '1');
      const response = await fetch(`/api/businesses?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to calculate export size');
      const result = await response.json();
      setMeta({ total: result.total || 0 });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoadingMeta(false);
    }
  };

  useEffect(() => {
    loadMeta();
  }, [city, category, status, dateRange]);

  const handleExport = async () => {
    setIsExporting(true);
    setError(null);
    try {
      const params = buildParams();
      params.set('format', exportFormat);
      const response = await fetch(`/api/export?${params.toString()}`);
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error || 'Export failed');
      }

      const disposition = response.headers.get('content-disposition');
      const fallbackName = `business_export_${new Date().toISOString().slice(0, 10)}.${exportFormat}`;
      const fileNameMatch = disposition?.match(/filename="([^"]+)"/);
      const fileName = fileNameMatch?.[1] || fallbackName;

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Export Module</h2>
          <p className="text-zinc-500 text-sm">Export runs against live records in Supabase with active filters.</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold border border-emerald-100">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>{isLoadingMeta ? 'Calculating…' : `${meta.total.toLocaleString()} records match`}</span>
        </div>
      </div>

      <div className="bg-white border border-zinc-200 rounded-2xl p-8 shadow-sm space-y-8">
        <div className="space-y-4">
          <h3 className="font-bold flex items-center gap-2">
            <Filter className="w-4 h-4 text-zinc-400" />
            Export Filters
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">City</label>
              <select value={city} onChange={(e) => setCity(e.target.value)} className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20">
                {cities.map((value) => <option key={value}>{value}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20">
                {categories.map((value) => <option key={value}>{value}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20">
                <option>Verified Only</option>
                <option>Export Ready Only</option>
                <option>All Records</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Date Range</label>
              <div className="relative">
                <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <select value={dateRange} onChange={(e) => setDateRange(e.target.value)} className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20">
                  <option>Last 30 Days</option>
                  <option>Last 90 Days</option>
                  <option>All Time</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-bold flex items-center gap-2">
            <Download className="w-4 h-4 text-zinc-400" />
            Export Format
          </h3>
          <div className="grid grid-cols-2 gap-4 max-w-md">
            {[
              { id: 'csv', label: 'CSV', icon: FileText, desc: 'Best for spreadsheets' },
              { id: 'json', label: 'JSON', icon: FileJson, desc: 'Best for developers' }
            ].map((format) => (
              <button
                key={format.id}
                onClick={() => setExportFormat(format.id as 'csv' | 'json')}
                className={`p-4 rounded-2xl border-2 text-left transition-all ${
                  exportFormat === format.id
                    ? 'border-orange-500 bg-orange-50/50 ring-1 ring-orange-500'
                    : 'border-zinc-100 bg-zinc-50 hover:border-zinc-200'
                }`}
              >
                <format.icon className={`w-6 h-6 mb-3 ${exportFormat === format.id ? 'text-orange-600' : 'text-zinc-400'}`} />
                <p className="font-bold text-sm">{format.label}</p>
                <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-tighter">{format.desc}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="pt-6 border-t border-zinc-100 flex items-center justify-between">
          <div className="text-sm text-zinc-500">
            Matching records: <span className="font-bold text-zinc-900">{isLoadingMeta ? '…' : meta.total.toLocaleString()}</span>
          </div>
          <button
            onClick={handleExport}
            disabled={isExporting || isLoadingMeta || meta.total === 0}
            className="px-8 py-4 bg-zinc-900 text-white rounded-2xl font-bold hover:bg-zinc-800 transition-all shadow-lg flex items-center gap-3 disabled:bg-zinc-400"
          >
            {isExporting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
            {isExporting ? 'Generating File...' : 'Generate & Download'}
          </button>
        </div>

        {error && <p className="text-sm text-red-600 font-medium">{error}</p>}
      </div>
    </div>
  );
}
