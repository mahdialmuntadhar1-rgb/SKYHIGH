import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { runDiscovery } from './src/server/discovery';
import { providerCatalog } from './src/server/providers/catalog';
import { getLatestRecords, setLatestRecords } from './src/server/discoveryStore';
import { exportRecords } from './src/server/services/importExport';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.get('/api/providers', (_req, res) => {
    res.json({ data: providerCatalog });
  });

  app.post('/api/run', async (req, res) => {
    try {
      const result = await runDiscovery(req.body);
      setLatestRecords(result.records);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/businesses', (req, res) => {
    try {
      const { city, category, status, page = '1', pageSize = '20' } = req.query;
      let rows = getLatestRecords();

      if (city) rows = rows.filter((row) => row.city === city);
      if (category) rows = rows.filter((row) => row.category === category);
      if (status) rows = rows.filter((row) => row.status === status);

      const pageNum = Number(page);
      const sizeNum = Number(pageSize);
      const from = (pageNum - 1) * sizeNum;
      const to = from + sizeNum;

      res.json({
        data: rows.slice(from, to),
        total: rows.length,
        page: pageNum,
        pageSize: sizeNum
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/export', (req, res) => {
    const format = (req.query.format as 'csv' | 'json') || 'json';
    const body = exportRecords(getLatestRecords(), format);
    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
    }
    res.send(body);
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
