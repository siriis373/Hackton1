/**
 * HealBot Result Server
 * 
 * - Receives POST /webhook  → from n8n after AI processes the error
 * - Serves  GET  /result    → dashboard polls this for latest data
 * - Serves  GET  /history   → last 20 runs
 * - Serves  GET  /          → dashboard HTML
 * 
 * Run: node server/server.js
 * Port: 3000 (or set PORT env var)
 */

const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// In-memory store (resets on server restart — fine for hackathon)
let latestResult = null;
const history = [];

// ─────────────────────────────────────────────
// POST /webhook
// Called by n8n after Ollama processes the log
// Expected body:
// {
//   status: "success" | "failure",
//   error_log: "...",
//   ai_fix: "...",
//   commit: "abc1234",
//   branch: "main",
//   actor: "username",
//   repo: "org/repo",
//   timestamp: "2024-..."
// }
// ─────────────────────────────────────────────
app.post("/webhook", (req, res) => {
  const data = req.body;

  if (!data) {
    return res.status(400).json({ error: "Empty body" });
  }

  const result = {
    id: Date.now(),
    status: data.status || "unknown",
    error_log: data.error_log || "",
    ai_fix: data.ai_fix || "No fix provided",
    commit: data.commit || "unknown",
    branch: data.branch || "unknown",
    actor: data.actor || "unknown",
    repo: data.repo || "unknown",
    timestamp: data.timestamp || new Date().toISOString(),
    received_at: new Date().toISOString(),
  };

  latestResult = result;
  history.unshift(result);

  // Keep only last 20 runs
  if (history.length > 20) history.pop();

  console.log(`[${result.received_at}] Received: ${result.status} | commit: ${result.commit} | branch: ${result.branch}`);

  res.json({ ok: true, id: result.id });
});

// ─────────────────────────────────────────────
// GET /result  — latest run (polled by dashboard)
// ─────────────────────────────────────────────
app.get("/result", (req, res) => {
  if (!latestResult) {
    return res.json({ waiting: true, message: "No runs yet. Push a commit to trigger CI." });
  }
  res.json(latestResult);
});

// ─────────────────────────────────────────────
// GET /history  — last 20 runs
// ─────────────────────────────────────────────
app.get("/history", (req, res) => {
  res.json(history);
});

// ─────────────────────────────────────────────
// Serve dashboard HTML as root
// ─────────────────────────────────────────────
app.use(express.static(path.join(__dirname, "../dashboard")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../dashboard/index.html"));
});

// ─────────────────────────────────────────────
// Start
// ─────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🤖 HealBot server running at http://localhost:${PORT}`);
  console.log(`   Dashboard: http://localhost:${PORT}/`);
  console.log(`   Result API: http://localhost:${PORT}/result`);
  console.log(`   Webhook receiver: POST http://localhost:${PORT}/webhook`);
  console.log(`\n   Share this server via ngrok: ngrok http ${PORT}\n`);
});
