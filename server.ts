import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { ZodError } from 'zod';
import { runDiscovery } from './src/server/discovery';
import { supabase } from './src/server/supabase';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.post('/api/run', async (req, res) => {
    try {
      const result = await runDiscovery(req.body);
      res.json(result);
    } catch (error: any) {
      if (error instanceof ZodError) {
        return res.status(400).json({ error: 'Invalid request payload', details: error.issues });
      }
      res.status(500).json({ error: error?.message || 'Failed to run discovery' });
    }
  });

  app.get('/api/businesses', async (req, res) => {
    try {
      const { city, category, source, q, page = 1, pageSize = 20 } = req.query;

      let query = supabase.from('businesses').select('*', { count: 'exact' });

      if (city) query = query.eq('city', city as string);
      if (category) query = query.eq('category', category as string);
      if (source) query = query.eq('source', source as string);
      if (q && typeof q === 'string') {
        const safe = q.replace(/[,%]/g, '').trim();
        if (safe) {
          query = query.or(`name.ilike.%${safe}%,phone.ilike.%${safe}%,category.ilike.%${safe}%`);
        }
      }

      const pageNum = Number(page);
      const sizeNum = Number(pageSize);
      const from = (pageNum - 1) * sizeNum;
      const to = from + sizeNum - 1;

      const { data, count, error } = await query.order('created_at', { ascending: false }).range(from, to);

      if (error) throw error;

      res.json({
        data: data || [],
        total: count || 0,
        page: pageNum,
        pageSize: sizeNum,
      });
    } catch (error: any) {
      res.status(500).json({ error: error?.message || 'Failed to fetch businesses' });
    }
  });

  app.get('/api/dashboard-stats', async (_req, res) => {
    try {
      const { count, error: countError } = await supabase
        .from('businesses')
        .select('id', { count: 'exact', head: true });

      if (countError) throw countError;

      const { data: cityRows, error: cityError } = await supabase.from('businesses').select('city');
      if (cityError) throw cityError;

      const { data: sourceRows, error: sourceError } = await supabase.from('businesses').select('source');
      if (sourceError) throw sourceError;

      const { data: recentBusinesses, error: recentError } = await supabase
        .from('businesses')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(8);
      if (recentError) throw recentError;

      const countsByCityMap = new Map<string, number>();
      for (const row of cityRows || []) {
        const city = row.city || 'Unknown';
        countsByCityMap.set(city, (countsByCityMap.get(city) || 0) + 1);
      }

      const countsBySourceMap = new Map<string, number>();
      for (const row of sourceRows || []) {
        const source = row.source || 'unknown';
        countsBySourceMap.set(source, (countsBySourceMap.get(source) || 0) + 1);
      }

      res.json({
        totalBusinesses: count || 0,
        countsByCity: [...countsByCityMap.entries()].map(([city, count]) => ({ city, count })),
        countsBySource: [...countsBySourceMap.entries()].map(([source, count]) => ({ source, count })),
        recentBusinesses: recentBusinesses || [],
      });
    } catch (error: any) {
      res.status(500).json({ error: error?.message || 'Failed to fetch dashboard stats' });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
