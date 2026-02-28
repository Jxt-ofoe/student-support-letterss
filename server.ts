import express from "express";
import { createServer as createViteServer } from "vite";
import { createClient } from "@libsql/client";
import { nanoid } from "nanoid";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Turso Client
const databaseUrl = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!databaseUrl) {
  console.warn("Warning: TURSO_DATABASE_URL is not defined in environment variables. Falling back to local SQLite file.");
}

const turso = createClient({
  url: databaseUrl || "file:local.db",
  authToken: authToken || undefined,
});

// Initialize Database
async function initDb() {
  console.log("DB Init Start");
  try {
    await turso.execute(`CREATE TABLE IF NOT EXISTS pending_letters (id TEXT PRIMARY KEY, letterText TEXT NOT NULL, nickname TEXT, createdAt DATETIME DEFAULT CURRENT_TIMESTAMP, status TEXT DEFAULT 'pending')`);
    await turso.execute(`CREATE TABLE IF NOT EXISTS approved_letters (id TEXT PRIMARY KEY, letterText TEXT NOT NULL, nickname TEXT, createdAt DATETIME, approvedAt DATETIME DEFAULT CURRENT_TIMESTAMP)`);
    await turso.execute(`CREATE TABLE IF NOT EXISTS visitors (id TEXT PRIMARY KEY, firstVisit DATETIME DEFAULT CURRENT_TIMESTAMP, lastVisit DATETIME DEFAULT CURRENT_TIMESTAMP)`);
    console.log("DB Init Success");
  } catch (error) {
    console.error("DB Init Error:", error);
  }
}

// API Routes
app.get("/api/health", async (req, res) => {
  try {
    await turso.execute("SELECT 1");
    res.json({ status: "ok" });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.get("/api/letters/approved", async (req, res) => {
  try {
    const result = await turso.execute("SELECT * FROM approved_letters ORDER BY approvedAt DESC LIMIT 100");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.post("/api/letters/pending", async (req, res) => {
  const { letterText, nickname } = req.body;
  try {
    const id = nanoid();
    await turso.execute({
      sql: "INSERT INTO pending_letters (id, letterText, nickname) VALUES (?, ?, ?)",
      args: [id, letterText, nickname || "Anonymous"],
    });
    res.status(201).json({ id });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.post("/api/visitors/record", async (req, res) => {
  const { visitorId } = req.body;
  if (!visitorId) return res.status(400).json({ error: "visitorId is required" });
  try {
    await turso.execute({
      sql: "INSERT INTO visitors (id) VALUES (?) ON CONFLICT(id) DO UPDATE SET lastVisit = CURRENT_TIMESTAMP",
      args: [visitorId],
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// Admin Routes
app.get("/api/admin/stats", async (req, res) => {
  try {
    const visitorCount = await turso.execute("SELECT COUNT(*) as count FROM visitors");
    const pendingCount = await turso.execute("SELECT COUNT(*) as count FROM pending_letters");
    const approvedCount = await turso.execute("SELECT COUNT(*) as count FROM approved_letters");
    
    res.json({
      uniqueVisitors: visitorCount.rows[0].count,
      pendingLetters: pendingCount.rows[0].count,
      approvedLetters: approvedCount.rows[0].count,
      totalSubmissions: Number(visitorCount.rows[0].count) + Number(pendingCount.rows[0].count) // This is just an example, maybe total letters is better
    });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});
app.get("/api/admin/pending", async (req, res) => {
  try {
    const result = await turso.execute("SELECT * FROM pending_letters ORDER BY createdAt DESC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.post("/api/admin/approve/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const pending = await turso.execute({
      sql: "SELECT * FROM pending_letters WHERE id = ?",
      args: [id],
    });

    if (pending.rows.length === 0) return res.status(404).json({ error: "Letter not found" });

    const letter = pending.rows[0];

    await turso.execute({
      sql: "INSERT INTO approved_letters (id, letterText, nickname, createdAt) VALUES (?, ?, ?, ?)",
      args: [letter.id, letter.letterText, letter.nickname, letter.createdAt],
    });

    await turso.execute({
      sql: "DELETE FROM pending_letters WHERE id = ?",
      args: [id],
    });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.delete("/api/admin/pending/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await turso.execute({
      sql: "DELETE FROM pending_letters WHERE id = ?",
      args: [id],
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

async function start() {
  await initDb();
  
  if (process.env.NODE_ENV === "production") {
    // Serve static files from dist
    app.use(express.static("dist"));
    // SPA fallback - serve index.html for all non-API routes
    app.get("*", (req, res) => {
      res.sendFile("dist/index.html", { root: process.cwd() });
    });
  } else {
    // Development: use Vite middleware
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    // SPA fallback
    app.use("*", (req, res) => {
      res.redirect("/");
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server on http://localhost:${PORT}`);
  });
}

start().catch(console.error);
