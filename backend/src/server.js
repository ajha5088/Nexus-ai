import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { orchestrate, orchestrateAgentsOnly } from "./router/orchestrator.js";
import { getHistory } from "./memory/conversationMemory.js";
import { storeDocuments } from "./vectorstore/chromaStore.js";
dotenv.config();

const app = express();
app.use(cors({
  origin: process.env.FRONTEND_URL || "*",
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

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

// ─── Streaming query endpoint ─────────────────────────────────────────────────
app.post("/query/stream", async (req, res) => {
  const { query, userId = "anonymous", forceAgents = null } = req.body;
  if (!query) return res.status(400).json({ error: "query is required" });

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  const send = (data) => res.write(`data: ${JSON.stringify(data)}\n\n`);

  try {
    const start = Date.now();

    // Step 1: Run routing + agents (no synthesis)
    const { trace, agentResults, agentsUsed, routingMethod, llmCalls, blocked } =
      await orchestrateAgentsOnly(query, userId, forceAgents);

    if (blocked) {
      send({ type: "chunk", text: "I can't process that request." });
      send({ type: "done", totalMs: 0 });
      res.end();
      return;
    }

    // Step 2: Send trace immediately — UI shows this before answer arrives
    send({ type: "trace", trace, agentsUsed, routingMethod, llmCalls: llmCalls + 1 });
    console.log("✓ Trace sent");

    // Step 3: Build context from agent results
    const context = agentResults
      .filter((r) => r.success)
      .map((r) => `[${r.agent}]:\n${typeof r.result === "object" ? JSON.stringify(r.result, null, 2) : r.result}`)
      .join("\n\n");

    if (!context) {
      send({ type: "chunk", text: "I couldn't find relevant information to answer your question." });
      send({ type: "done", totalMs: Date.now() - start });
      res.end();
      return;
    }

    // Step 4: Stream synthesis
    const prompt = `You are a helpful assistant. Synthesize these agent results into a clear, well-formatted markdown answer.
Cite which agent provided each piece of information using [AgentName].

User question: ${query}

Agent results:
${context}

Answer:`;

    const stream = await ai.models.generateContentStream({
      model: "gemini-3-flash-preview",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    for await (const chunk of stream) {
      if (chunk.text) {
        console.log("chunk:", chunk.text.slice(0, 20));
        send({ type: "chunk", text: chunk.text });
      }
    }

    console.log("✓ Stream done");
    send({ type: "done", totalMs: Date.now() - start });
    res.end();

  } catch (err) {
    console.error("Stream error:", err.message);
    send({ type: "error", error: err.message });
    res.end();
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`\nNexus AI Backend running on http://localhost:${PORT}`);
  console.log("\nEndpoints:");
  console.log("  GET  /health");
  console.log("  POST /query");
  console.log("  POST /query/forced");
  console.log("  POST /query/stream");
  console.log("  GET  /history/:userId");
  console.log("  POST /ingest");
});

if (process.env.NODE_ENV === "production" && process.env.BACKEND_URL) {
  setInterval(async () => {
    try {
      await fetch(`${process.env.BACKEND_URL}/health`);
      console.log("✓ Self-ping");
    } catch { /* silent */ }
  }, 14 * 60 * 1000);
}