import React, { useEffect, useMemo, useState } from 'react';
import { Play, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { DiscoveryResult, ProviderConfig, ProviderId, SourcePriorityMode, SourceSelector } from '../types';

const CITIES = ['Baghdad', 'Erbil', 'Basra', 'Mosul', 'Sulaymaniyah', 'Najaf', 'Karbala'];
const CATEGORIES = ['Restaurant', 'Hotel', 'Cafe', 'Pharmacy', 'Supermarket', 'Tech Company', 'Gym'];

const PRIORITY_MODES: SourcePriorityMode[] = ['source-priority', 'best-coverage', 'cheapest-first', 'free-tier-first'];

export function RunPage() {
  const [providers, setProviders] = useState<ProviderConfig[]>([]);
  const [selector, setSelector] = useState<SourceSelector>({
    selectAllSources: false,
    selectedProviders: ['geoapify', 'serpapi'],
    sourcePriorityMode: 'free-tier-first',
    freeTierOnly: false,
    mapPoiOnly: false,
    enrichmentOnly: false,
    fallbackSearchOnly: false,
    manualUploadsOnly: false,
    centralCityOnly: true,
    city: CITIES[0],
    category: CATEGORIES[0],
    subcategory: '',
    districtCentralZone: 'Karrada',
    maxResultsPerSource: 5,
    duplicateTolerance: 0.2,
    verificationStrictness: 0.75
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DiscoveryResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/providers')
      .then((res) => res.json())
      .then((payload) => setProviders(payload.data || []))
      .catch(() => setProviders([]));
  }, []);

  const toggleProvider = (providerId: ProviderId) => {
    setSelector((prev) => {
      const selected = prev.selectedProviders.includes(providerId)
        ? prev.selectedProviders.filter((id) => id !== providerId)
        : [...prev.selectedProviders, providerId];
      return { ...prev, selectedProviders: selected, selectAllSources: selected.length === providers.length };
    });
  };

  const handleRun = async () => {
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const response = await fetch('/api/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ selector, runInParallel: true, stopOnThreshold: 100 })
      });
      if (!response.ok) throw new Error('Failed to run pipeline');
      setResult(await response.json());
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const grouped = useMemo(() => {
    return {
      poi: providers.filter((provider) => provider.provider_type === 'poi'),
      search: providers.filter((provider) => provider.provider_type === 'search_fallback'),
      enrich: providers.filter((provider) => provider.provider_type === 'scraping_enrichment'),
      manual: providers.filter((provider) => provider.provider_type === 'manual_upload')
    };
  }, [providers]);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="bg-white border border-zinc-200 rounded-2xl p-8 shadow-sm">
        <h1 className="text-2xl font-bold mb-6">Source Selector Pipeline</h1>

        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <select value={selector.city} onChange={(e) => setSelector({ ...selector, city: e.target.value })} className="input">
            {CITIES.map((city) => <option key={city}>{city}</option>)}
          </select>
          <select value={selector.category} onChange={(e) => setSelector({ ...selector, category: e.target.value })} className="input">
            {CATEGORIES.map((category) => <option key={category}>{category}</option>)}
          </select>
          <input value={selector.subcategory} placeholder="Subcategory" onChange={(e) => setSelector({ ...selector, subcategory: e.target.value })} className="input" />
          <input value={selector.districtCentralZone} placeholder="Central district/zone" onChange={(e) => setSelector({ ...selector, districtCentralZone: e.target.value })} className="input" />
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <label className="chip"><input type="checkbox" checked={selector.selectAllSources} onChange={(e) => setSelector({ ...selector, selectAllSources: e.target.checked, selectedProviders: e.target.checked ? providers.map((p) => p.provider_id) : [] })} /> Select all sources</label>
          <select value={selector.sourcePriorityMode} onChange={(e) => setSelector({ ...selector, sourcePriorityMode: e.target.value as SourcePriorityMode })} className="input">
            {PRIORITY_MODES.map((mode) => <option key={mode} value={mode}>{mode}</option>)}
          </select>

          <label className="chip"><input type="checkbox" checked={selector.freeTierOnly} onChange={(e) => setSelector({ ...selector, freeTierOnly: e.target.checked })} /> Free-tier only</label>
          <label className="chip"><input type="checkbox" checked={selector.mapPoiOnly} onChange={(e) => setSelector({ ...selector, mapPoiOnly: e.target.checked })} /> Map/POI only</label>
          <label className="chip"><input type="checkbox" checked={selector.enrichmentOnly} onChange={(e) => setSelector({ ...selector, enrichmentOnly: e.target.checked })} /> Enrichment only</label>
          <label className="chip"><input type="checkbox" checked={selector.fallbackSearchOnly} onChange={(e) => setSelector({ ...selector, fallbackSearchOnly: e.target.checked })} /> Fallback search only</label>
          <label className="chip"><input type="checkbox" checked={selector.manualUploadsOnly} onChange={(e) => setSelector({ ...selector, manualUploadsOnly: e.target.checked })} /> Manual uploads only</label>
          <label className="chip"><input type="checkbox" checked={selector.centralCityOnly} onChange={(e) => setSelector({ ...selector, centralCityOnly: e.target.checked })} /> Central-city only</label>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <label className="text-sm">Max results/source <input type="number" value={selector.maxResultsPerSource} onChange={(e) => setSelector({ ...selector, maxResultsPerSource: Number(e.target.value) })} className="input mt-1" /></label>
          <label className="text-sm">Duplicate tolerance <input type="number" step="0.05" value={selector.duplicateTolerance} onChange={(e) => setSelector({ ...selector, duplicateTolerance: Number(e.target.value) })} className="input mt-1" /></label>
          <label className="text-sm">Verification strictness <input type="number" step="0.05" value={selector.verificationStrictness} onChange={(e) => setSelector({ ...selector, verificationStrictness: Number(e.target.value) })} className="input mt-1" /></label>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {[['POI Sources', grouped.poi], ['Fallback Search', grouped.search], ['Enrichment', grouped.enrich], ['Manual Upload', grouped.manual]].map(([title, list]) => (
            <div key={title} className="border border-zinc-200 rounded-xl p-3 space-y-2">
              <p className="text-xs uppercase font-bold text-zinc-500">{title}</p>
              {(list as ProviderConfig[]).map((provider) => (
                <label key={provider.provider_id} className="flex items-center justify-between text-sm">
                  <span>{provider.provider_name}</span>
                  <input type="checkbox" checked={selector.selectedProviders.includes(provider.provider_id)} onChange={() => toggleProvider(provider.provider_id)} />
                </label>
              ))}
            </div>
          ))}
        </div>

        <button onClick={handleRun} disabled={loading} className="mt-6 w-full bg-orange-600 hover:bg-orange-700 disabled:bg-zinc-400 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-orange-600/20">
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5 fill-current" />}
          {loading ? 'Running Pipeline...' : 'Run Pipeline'}
        </button>

        {error && <div className="mt-4 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 text-red-900"><AlertCircle className="w-5 h-5" /><p className="text-sm">{error}</p></div>}

        {result && (
          <div className="mt-6 p-6 bg-zinc-900 text-white rounded-2xl space-y-3">
            <div className="flex items-center gap-2 text-orange-400"><CheckCircle2 className="w-5 h-5" /><h3 className="font-bold">Pipeline Summary</h3></div>
            <p className="text-sm text-zinc-300">{result.summary}</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-zinc-800 p-3 rounded-lg"><div className="text-xs text-zinc-500">Accepted</div><div className="text-2xl font-mono text-green-400">{result.insertedCount}</div></div>
              <div className="bg-zinc-800 p-3 rounded-lg"><div className="text-xs text-zinc-500">Skipped</div><div className="text-2xl font-mono text-zinc-300">{result.skippedCount}</div></div>
            </div>
            <p className="text-xs text-zinc-400">{result.reports.importSummary}</p>
          </div>
        )}
      </div>
    </div>
  );
}
