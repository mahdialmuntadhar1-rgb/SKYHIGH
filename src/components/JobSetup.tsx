import React, { useState } from 'react';
import { 
  MapPin, 
  Search, 
  Filter, 
  Zap, 
  ShieldCheck, 
  AlertTriangle, 
  ChevronDown,
  Layers,
  Settings2,
  Play,
  Loader2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { CATEGORIES, IRAQ_CITIES } from '../constants';
import { DiscoveryResult } from '../types';

interface JobSetupProps {
  selectedCity: string;
  selectedDistrict: string;
  selectedZone: string;
  selectedCategory: string;
  isRunning: boolean;
  runResult: DiscoveryResult | null;
  runError: string | null;
  onCityChange: (city: string, district: string, zone: string) => void;
  onDistrictChange: (district: string, zone: string) => void;
  onZoneChange: (zone: string) => void;
  onCategoryChange: (category: string) => void;
  onStartCollection: () => void;
}

export function JobSetup({
  selectedCity,
  selectedDistrict,
  selectedZone,
  selectedCategory,
  isRunning,
  runResult,
  runError,
  onCityChange,
  onDistrictChange,
  onZoneChange,
  onCategoryChange,
  onStartCollection,
}: JobSetupProps) {
  const cityConfig = IRAQ_CITIES.find((city) => city.name === selectedCity) || IRAQ_CITIES[0];
  const districtConfig = cityConfig.districts.find((district) => district.name === selectedDistrict) || cityConfig.districts[0];

  const [toggles, setToggles] = useState({
    freeTierOnly: false,
    useFallback: true,
    enrichmentMode: true,
    mapPoiOnly: false,
    centralCityOnly: true,
    rejectSuburbs: true
  });

  const handleToggle = (key: keyof typeof toggles) => {
    setToggles(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm h-full flex flex-col overflow-hidden">
      <div className="p-6 border-b border-zinc-100 bg-zinc-50 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-zinc-900">Job Setup</h2>
          <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Configure collection parameters</p>
        </div>
        <button
          onClick={onStartCollection}
          disabled={isRunning}
          className="flex items-center gap-2 px-6 py-2.5 bg-orange-600 text-white rounded-xl text-sm font-bold hover:bg-orange-500 transition-all shadow-lg shadow-orange-600/20 active:scale-95 disabled:bg-zinc-400 disabled:shadow-none disabled:cursor-not-allowed"
        >
          {isRunning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-white" />}
          {isRunning ? 'Collecting...' : 'Start Collection'}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        {runResult && (
          <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
            <div className="flex items-center gap-2 mb-1 text-emerald-700">
              <CheckCircle2 className="w-4 h-4" />
              <p className="text-sm font-bold">Collection Complete</p>
            </div>
            <p className="text-xs text-emerald-800/80">{runResult.summary}</p>
            <p className="text-xs text-emerald-800/80 mt-2">
              Inserted: <span className="font-bold">{runResult.insertedCount}</span> • Skipped: <span className="font-bold">{runResult.skippedCount}</span>
            </p>
            {runResult.errors.length > 0 && (
              <ul className="list-disc ml-4 mt-2 text-xs text-amber-700 space-y-1">
                {runResult.errors.map((error) => (
                  <li key={error}>{error}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        {runError && (
          <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-2 text-red-800">
            <AlertCircle className="w-4 h-4 mt-0.5" />
            <p className="text-xs font-medium">{runError}</p>
          </div>
        )}

        <section className="space-y-4">
          <div className="flex items-center gap-2 text-zinc-400">
            <MapPin className="w-4 h-4" />
            <h3 className="text-[10px] font-bold uppercase tracking-widest">Geo Targeting</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-500 ml-1">City</label>
              <div className="relative">
                <select 
                  value={selectedCity}
                  onChange={(e) => {
                    const city = IRAQ_CITIES.find((c) => c.name === e.target.value) || IRAQ_CITIES[0];
                    onCityChange(city.name, city.districts[0].name, city.districts[0].central_zones[0]);
                  }}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 appearance-none"
                >
                  {IRAQ_CITIES.map(city => <option key={city.name} value={city.name}>{city.name}</option>)}
                </select>
                <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-500 ml-1">District</label>
              <div className="relative">
                <select 
                  value={selectedDistrict}
                  onChange={(e) => {
                    const district = cityConfig.districts.find((d) => d.name === e.target.value) || cityConfig.districts[0];
                    onDistrictChange(district.name, district.central_zones[0]);
                  }}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 appearance-none"
                >
                  {cityConfig.districts.map(d => <option key={d.name} value={d.name}>{d.name}</option>)}
                </select>
                <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-500 ml-1">Central Zone</label>
              <div className="relative">
                <select 
                  value={selectedZone}
                  onChange={(e) => onZoneChange(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 appearance-none"
                >
                  {districtConfig.central_zones.map(z => <option key={z} value={z}>{z}</option>)}
                </select>
                <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-2 text-zinc-400">
            <Filter className="w-4 h-4" />
            <h3 className="text-[10px] font-bold uppercase tracking-widest">Category & Keywords</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-500 ml-1">Main Category</label>
              <div className="relative">
                <select
                  value={selectedCategory}
                  onChange={(e) => onCategoryChange(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 appearance-none"
                >
                  {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
                <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-500 ml-1">Keyword Search</label>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input 
                  type="text" 
                  placeholder="e.g. 'Coffee Shop', 'Pharmacy'..." 
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-9 pr-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-2 text-zinc-400">
            <Settings2 className="w-4 h-4" />
            <h3 className="text-[10px] font-bold uppercase tracking-widest">Collection Parameters</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-zinc-500">Max Results</label>
                <span className="text-xs font-black text-orange-600">500</span>
              </div>
              <input type="range" min="10" max="5000" defaultValue="500" className="w-full h-1.5 bg-zinc-100 rounded-lg appearance-none cursor-pointer accent-orange-600" />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-zinc-500">Duplicate Tolerance</label>
                <span className="text-xs font-black text-orange-600">85%</span>
              </div>
              <input type="range" min="50" max="100" defaultValue="85" className="w-full h-1.5 bg-zinc-100 rounded-lg appearance-none cursor-pointer accent-orange-600" />
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-2 text-zinc-400">
            <Zap className="w-4 h-4" />
            <h3 className="text-[10px] font-bold uppercase tracking-widest">Smart Filters</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { id: 'freeTierOnly', label: 'Free Tier Only', icon: Zap },
              { id: 'useFallback', label: 'Use Fallback Sources', icon: Layers },
              { id: 'enrichmentMode', label: 'Enrichment Mode', icon: ShieldCheck },
              { id: 'mapPoiOnly', label: 'Map/POI Only', icon: MapPin },
              { id: 'centralCityOnly', label: 'Central City Only', icon: ShieldCheck },
              { id: 'rejectSuburbs', label: 'Reject Suburbs Automatically', icon: AlertTriangle },
            ].map((toggle) => (
              <button 
                key={toggle.id}
                onClick={() => handleToggle(toggle.id as keyof typeof toggles)}
                className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                  toggles[toggle.id as keyof typeof toggles] 
                    ? 'bg-orange-50 border-orange-200 text-orange-900' 
                    : 'bg-white border-zinc-100 text-zinc-500 hover:border-zinc-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <toggle.icon className={`w-4 h-4 ${toggles[toggle.id as keyof typeof toggles] ? 'text-orange-600' : 'text-zinc-400'}`} />
                  <span className="text-xs font-bold">{toggle.label}</span>
                </div>
                <div className={`w-8 h-4 rounded-full relative transition-colors ${
                  toggles[toggle.id as keyof typeof toggles] ? 'bg-orange-600' : 'bg-zinc-200'
                }`}>
                  <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${
                    toggles[toggle.id as keyof typeof toggles] ? 'left-4.5' : 'left-0.5'
                  }`} />
                </div>
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
