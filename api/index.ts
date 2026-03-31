import "dotenv/config";
import express from "express";
import { runDiscovery } from "../src/server/discovery";
import { supabase } from "../src/server/supabase";

const app = express();
app.use(express.json());

app.get("/api/health", (_req, res) => {
  const supabaseConfigured = !!(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    supabase: supabaseConfigured ? "configured" : "missing_env_vars",
  });
});

app.post("/api/run", async (req, res) => {
  try {
    const result = await runDiscovery(req.body);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/businesses", async (req, res) => {
  try {
    const { city, category, source, page = "1", pageSize = "20" } = req.query as Record<string, string>;

    let query = supabase.from("businesses").select("*", { count: "exact" });
    if (city)     query = query.eq("city", city);
    if (category) query = query.eq("category", category);
    if (source)   query = query.eq("source", source);

    const from = (Number(page) - 1) * Number(pageSize);
    const to   = from + Number(pageSize) - 1;

    const { data, count, error } = await query
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) throw error;

    res.json({ data, total: count, page: Number(page), pageSize: Number(pageSize) });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default app;
