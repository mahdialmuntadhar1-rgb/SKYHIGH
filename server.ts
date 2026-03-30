import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { z } from 'zod';
import { getAvailableSourceIds, runDiscovery } from './src/server/discovery';
import { supabase, supabaseConfigured } from './src/server/supabase';
import { SOURCES } from './src/constants';

const runSchema = z.object({
  city: z.string().trim().min(2),
  category: z.string().trim().min(2),
  sources: z.array(z.enum(getAvailableSourceIds() as [string, ...string[]])).min(1)
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.get('/api/sources', (req, res) => {
    const sourceIds = new Set(getAvailableSourceIds());
    const data = SOURCES.map((source) => {
      const implemented = sourceIds.has(source.id as any);
      const geminiEnabled = source.id !== 'gemini' || Boolean(process.env.GEMINI_API_KEY);
      return {
        ...source,
        enabled: source.enabled && implemented && geminiEnabled
      };
    });

    res.json({ data });
  });

  app.post('/api/run', async (req, res) => {
    const parsed = runSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid request payload', details: parsed.error.flatten() });
    }

    if (!supabaseConfigured) {
      return res.status(500).json({ error: 'Supabase is not configured on the server' });
    }

    try {
      const result = await runDiscovery(parsed.data as any);
      res.json(result);
    } catch (error: any) {
      console.error('run failure', error);
      res.status(500).json({ error: error.message || 'Run failed unexpectedly' });
    }
  });

  app.get('/api/businesses', async (req, res) => {
    if (!supabaseConfigured) {
      return res.status(500).json({ error: 'Supabase is not configured on the server' });
    }

    try {
      const { city, category, source, q, page = 1, pageSize = 20 } = req.query;

      let query = supabase.from('businesses').select('*', { count: 'exact' });

      if (city) query = query.eq('city', city);
      if (category) query = query.eq('category', category);
      if (source) query = query.eq('source', source);
      if (q) query = query.or(`name.ilike.%${q}%,phone.ilike.%${q}%,category.ilike.%${q}%`);

      const from = (Number(page) - 1) * Number(pageSize);
      const to = from + Number(pageSize) - 1;

      const { data, count, error } = await query.order('created_at', { ascending: false }).range(from, to);

      if (error) throw error;

      res.json({
        data,
        total: count,
        page: Number(page),
        pageSize: Number(pageSize)
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/dashboard', async (req, res) => {
    if (!supabaseConfigured) {
      return res.status(500).json({ error: 'Supabase is not configured on the server' });
    }

    try {
      const { data, error } = await supabase
        .from('businesses')
        .select('id, city, source, created_at, name, category, phone, address')
        .order('created_at', { ascending: false })
        .limit(5000);

      if (error) throw error;

      const rows = data || [];

      const byCity = rows.reduce<Record<string, number>>((acc, row) => {
        acc[row.city] = (acc[row.city] || 0) + 1;
        return acc;
      }, {});

      const bySource = rows.reduce<Record<string, number>>((acc, row) => {
        const source = row.source || 'unknown';
        acc[source] = (acc[source] || 0) + 1;
        return acc;
      }, {});

      res.json({
        totalBusinesses: rows.length,
        byCity,
        bySource,
        recent: rows.slice(0, 10)
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
