import React, { useState } from 'react';
import { Play, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { DiscoverySource, DiscoveryResult } from '../types';

const CITIES = ['Baghdad', 'Erbil', 'Basra', 'Mosul', 'Sulaymaniyah', 'Najaf', 'Karbala'];
const CATEGORIES = ['Restaurant', 'Hotel', 'Cafe', 'Pharmacy', 'Supermarket', 'Tech Company', 'Gym'];
const SOURCES: { id: DiscoverySource; name: string }[] = [
  { id: 'gemini', name: 'Gemini Research' },
  { id: 'osm', name: 'OSM / Nominatim' },
];

export function RunPage() {
  const [city, setCity] = useState(CITIES[0]);
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [selectedSources, setSelectedSources] = useState<DiscoverySource[]>(['gemini', 'osm']);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DiscoveryResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const toggleSource = (id: DiscoverySource) => {
    setSelectedSources(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const handleRun = async () => {
    if (selectedSources.length === 0) {
      setError('Please select at least one source.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ city, category, sources: selectedSources }),
      });

      if (!response.ok) throw new Error('Failed to run discovery');
      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return <div className="max-w-2xl mx-auto" />;
}
