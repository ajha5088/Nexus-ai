import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { orchestrate } from "./router/orchestrator.js";
import { getHistory } from "./memory/conversationMemory.js";
import { storeDocuments } from "./vectorstore/chromaStore.js";
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ─── Health ───────────────────────────────────────────────────────────────────
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ─── Main query endpoint ──────────────────────────────────────────────────────
app.post("/query", async (req, res) => {
  const { query, userId = "anonymous", forceAgents = null } = req.body;

  if (!query) return res.status(400).json({ error: "query is required" });

  try {
    const result = await orchestrate(query, userId, forceAgents);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Force specific agents ────────────────────────────────────────────────────
app.post("/query/forced", async (req, res) => {
  const { query, agents, userId = "anonymous" } = req.body;

  if (!query || !agents?.length) {
    return res.status(400).json({ error: "query and agents are required" });
  }

  try {
    const result = await orchestrate(query, userId, agents);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Conversation history ─────────────────────────────────────────────────────
app.get("/history/:userId", (req, res) => {
  res.json(getHistory(req.params.userId));
});

// ─── Ingest documents ─────────────────────────────────────────────────────────
app.post("/ingest", async (req, res) => {
  const { documents, source } = req.body;
  if (!documents || !source) {
    return res.status(400).json({ error: "documents and source required" });
  }

  try {
    const chunks = documents.map((text) => ({ text, source }));
    const count = await storeDocuments(chunks);
    res.json({ success: true, chunksStored: count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`\nNexus AI Backend running on http://localhost:${PORT}`);
  console.log("\nEndpoints:");
  console.log("  GET  /health");
  console.log("  POST /query          { query, userId?, forceAgents? }");
  console.log("  POST /query/forced   { query, agents[], userId? }");
  console.log("  GET  /history/:userId");
  console.log("  POST /ingest         { documents[], source }");
});