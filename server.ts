import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { runDiscovery } from './src/server/discovery';
import { supabase } from './src/server/supabase';

function parsePositiveInt(value: unknown, fallback: number): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return Math.floor(parsed);
}

function buildCsv(rows: Record<string, any>[]): string {
  if (rows.length === 0) return '';

  const headers = Object.keys(rows[0]);
  const escape = (input: unknown) => {
    const value = input == null ? '' : typeof input === 'object' ? JSON.stringify(input) : String(input);
    const escaped = value.replace(/"/g, '""');
    return /[",\n]/.test(escaped) ? `"${escaped}"` : escaped;
  };

  const lines = [headers.join(',')];
  for (const row of rows) {
    lines.push(headers.map((header) => escape(row[header])).join(','));
  }

  return lines.join('\n');
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      env: {
        hasSupabaseUrl: Boolean(process.env.SUPABASE_URL),
        hasSupabaseServiceRoleKey: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
        hasGeminiApiKey: Boolean(process.env.GEMINI_API_KEY),
        hasFoursquareApiKey: Boolean(process.env.FOURSQUARE_API_KEY)
      }
    });
  });

  app.post('/api/run', async (req, res) => {
    try {
      const result = await runDiscovery(req.body);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/businesses', async (req, res) => {
    try {
      const { city, category, source, status, search, from, to } = req.query;
      const page = parsePositiveInt(req.query.page, 1);
      const pageSize = parsePositiveInt(req.query.pageSize, 20);

      let query = supabase
        .from('businesses')
        .select('*', { count: 'exact' });

      if (city) query = query.eq('city', city);
      if (category) query = query.eq('category', category);
      if (source) query = query.contains('sources', [source]);
      if (status) query = query.eq('status', status);
      if (search) query = query.or(`name.ilike.%${search}%,address.ilike.%${search}%,phone.ilike.%${search}%`);
      if (from) query = query.gte('created_at', from);
      if (to) query = query.lte('created_at', to);

      const fromIndex = (page - 1) * pageSize;
      const toIndex = fromIndex + pageSize - 1;

      const { data, count, error } = await query
        .order('created_at', { ascending: false })
        .range(fromIndex, toIndex);

      if (error) throw error;

      res.json({
        data,
        total: count || 0,
        page,
        pageSize,
        totalPages: Math.ceil((count || 0) / pageSize)
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/export', async (req, res) => {
    try {
      const { city, category, source, status, from, to } = req.query;
      const format = (req.query.format as string) || 'csv';

      let query = supabase
        .from('businesses')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10000);

      if (city) query = query.eq('city', city);
      if (category) query = query.eq('category', category);
      if (source) query = query.contains('sources', [source]);
      if (status) query = query.eq('status', status);
      if (from) query = query.gte('created_at', from);
      if (to) query = query.lte('created_at', to);

      const { data, error } = await query;
      if (error) throw error;

      const rows = data || [];
      const stamp = new Date().toISOString().slice(0, 10);

      if (format === 'json') {
        const payload = JSON.stringify(rows, null, 2);
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="businesses_${stamp}.json"`);
        res.send(payload);
        return;
      }

      if (format !== 'csv') {
        res.status(400).json({ error: 'Unsupported export format' });
        return;
      }

      const payload = buildCsv(rows as Record<string, any>[]);
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="businesses_${stamp}.csv"`);
      res.send(payload);
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
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
