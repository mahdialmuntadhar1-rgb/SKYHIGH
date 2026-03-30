import React, { useMemo, useState } from 'react';
import {
  CheckSquare,
  Square,
  Search,
  AlertCircle
} from 'lucide-react';
import { DISCOVERY_SOURCES } from '../constants';
import { DiscoverySource } from '../types';

interface SourceSelectorProps {
  selectedSources: DiscoverySource[];
  onSelectedSourcesChange: (sources: DiscoverySource[]) => void;
}

export function SourceSelector({ selectedSources, onSelectedSourcesChange }: SourceSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const toggleAll = () => {
    if (selectedSources.length === DISCOVERY_SOURCES.length) {
      onSelectedSourcesChange([]);
    } else {
      onSelectedSourcesChange(DISCOVERY_SOURCES.map((s) => s.id));
    }
  };

  const toggleSource = (id: DiscoverySource) => {
    if (selectedSources.includes(id)) {
      onSelectedSourcesChange(selectedSources.filter((s) => s !== id));
      return;
    }
    onSelectedSourcesChange([...selectedSources, id]);
  };

  const filteredSources = useMemo(() => {
    return DISCOVERY_SOURCES.filter((s) =>
      `${s.label} ${s.description}`.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  return (
    <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden flex flex-col h-full">
      <div className="p-6 border-b border-zinc-100 bg-zinc-50 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-zinc-900">Data Sources</h2>
          <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Selection here drives the job payload</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Search sources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all w-48"
            />
          </div>
          <button
            onClick={toggleAll}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white rounded-xl text-xs font-bold hover:bg-zinc-800 transition-all shadow-sm"
          >
            {selectedSources.length === DISCOVERY_SOURCES.length ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
            {selectedSources.length === DISCOVERY_SOURCES.length ? 'Deselect All' : 'Select All'}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-zinc-50 sticky top-0 z-10 border-b border-zinc-200">
            <tr>
              <th className="px-6 py-4 w-12"></th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-zinc-400">Source Name</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-zinc-400">Description</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-zinc-400 text-right">Tags</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {filteredSources.map((source) => (
              <tr
                key={source.id}
                className="group hover:bg-zinc-50 transition-colors cursor-pointer"
                onClick={() => toggleSource(source.id)}
              >
                <td className="px-6 py-4">
                  <div className={`w-5 h-5 rounded border transition-all flex items-center justify-center ${
                    selectedSources.includes(source.id)
                      ? 'bg-orange-600 border-orange-600 shadow-sm'
                      : 'border-zinc-300 group-hover:border-zinc-400'
                  }`}>
                    {selectedSources.includes(source.id) && <CheckSquare className="w-4 h-4 text-white" />}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm font-bold text-zinc-900">{source.label}</p>
                </td>
                <td className="px-6 py-4 text-xs text-zinc-600">{source.description}</td>
                <td className="px-6 py-4 text-right">
                  <div className="inline-flex gap-1.5 flex-wrap justify-end">
                    {source.tags.map((tag) => (
                      <span key={tag} className="px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-zinc-100 text-zinc-600">
                        {tag}
                      </span>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="p-4 bg-zinc-50 border-t border-zinc-100 flex items-center gap-3">
        <AlertCircle className="w-4 h-4 text-orange-500" />
        <p className="text-xs text-zinc-500 font-medium">
          <span className="font-bold text-zinc-900">{selectedSources.length} sources selected.</span> These are shared with Job Setup and sent to <code>/api/run</code>.
        </p>
      </div>
    </div>
  );
}
