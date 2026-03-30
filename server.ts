import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { runDiscovery, validateDiscoveryRequest } from "./src/server/discovery";
import { supabase } from "./src/server/supabase";
import { z } from "zod";

const querySchema = z.object({
  city: z.string().optional(),
  category: z.string().optional(),
  source: z.string().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  app.post("/api/run", async (req, res) => {
    try {
      const payload = validateDiscoveryRequest(req.body);
      const result = await runDiscovery(payload);
      res.json(result);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid discovery payload", details: error.issues });
      }
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/businesses", async (req, res) => {
    try {
      const { city, category, source, search, page, pageSize } = querySchema.parse(req.query);

      let query = supabase.from('businesses').select('*', { count: 'exact' });

      if (city && city !== 'All') query = query.eq('city', city);
      if (category && category !== 'All') query = query.eq('category', category);
      if (source && source !== 'All') query = query.eq('source', source);
      if (search) query = query.or(`name.ilike.%${search}%,phone.ilike.%${search}%,category.ilike.%${search}%`);

      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      const { data, count, error } = await query.order('created_at', { ascending: false }).range(from, to);
      if (error) throw error;

      res.json({ data, total: count || 0, page, pageSize });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid query parameters", details: error.issues });
      }
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/dashboard-summary', async (req, res) => {
    try {
      const { data, error } = await supabase
        .from('businesses')
        .select('id, city, source, created_at')
        .order('created_at', { ascending: false })
        .limit(1000);

      if (error) throw error;

      const records = data || [];
      const byCity = Object.entries(records.reduce<Record<string, number>>((acc, row) => {
        acc[row.city || 'Unknown'] = (acc[row.city || 'Unknown'] || 0) + 1;
        return acc;
      }, {})).map(([name, count]) => ({ name, count }));

      const bySource = Object.entries(records.reduce<Record<string, number>>((acc, row) => {
        acc[row.source || 'unknown'] = (acc[row.source || 'unknown'] || 0) + 1;
        return acc;
      }, {})).map(([name, count]) => ({ name, count }));

      res.json({
        totalBusinesses: records.length,
        byCity,
        bySource,
        recentRecords: records.slice(0, 10),
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
