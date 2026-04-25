import { classifyIntent } from "./intentClassifier.js";
import { supervisorRoute } from "./llmSuperVisor.js";
import { RAGAgent } from "../agents/RAGAgent.js";
import { ResearchAgent } from "../agents/ResearchAgent.js";
import { CodeAgent } from "../agents/CodeAgent.js";
import { WeatherAgent } from "../agents/WeatherAgent.js";
import { MathAgent } from "../agents/MathAgent.js";
import { synthesize } from "../synthesis/summarizer.js";
import { getHistory, addTurn } from "../memory/conversationMemory.js";

const AGENT_MAP = {
  RAGAgent,
  ResearchAgent,
  CodeAgent,
  WeatherAgent,
  MathAgent,
};

const CACHE = new Map();
const CACHE_TTL = 5 * 60 * 1000;

// ─── Cache ────────────────────────────────────────────────────────────────────
function cacheGet(key) {
  const entry = CACHE.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts > CACHE_TTL) { CACHE.delete(key); return null; }
  return entry.value;
}
function cacheSet(key, value) {
  CACHE.set(key, { value, ts: Date.now() });
}

// ─── Safety ───────────────────────────────────────────────────────────────────
const BLOCKED = [
  /ignore previous instructions/i,
  /jailbreak/i,
  /you are now/i,
  /forget your (system |)instructions/i,
];
function safetyCheck(query) {
  return BLOCKED.some((p) => p.test(query));
}

// ─── Run agents in parallel ───────────────────────────────────────────────────
async function runAgents(agentNames, args) {
  const tasks = agentNames.map((name) => {
    const agent = AGENT_MAP[name];
    if (!agent) return Promise.resolve({ agent: name, success: false, error: "Not found" });

    // Each agent gets the most relevant arg
    const arg = args.city ?? args.expression ?? args.code ?? args.query ?? "";
    return agent.run(arg);
  });

  return await Promise.all(tasks);
}

// ─── Master orchestrator ──────────────────────────────────────────────────────
export async function orchestrate(query, userId = "anonymous", forceAgents = null) {
  const trace = []; // tracks every step for the UI
  const start = Date.now();

  // Layer 0: Cache
  const cached = cacheGet(query);
  if (cached) {
    return { ...cached, trace: [{ layer: "cache", ms: 0 }] };
  }

  // Layer 1: Safety
  if (safetyCheck(query)) {
    return {
      answer: "I can't process that request.",
      trace: [{ layer: "safety", ms: 0 }],
      totalMs: 0,
    };
  }

  // Layer 2: Force routing (API caller can force specific agents)
  let routing;
  if (forceAgents && forceAgents.length > 0) {
    routing = {
      agents: forceAgents,
      confidence: 1.0,
      method: "forced",
      args: { query },
    };
    trace.push({ layer: "forced-routing", agents: forceAgents, ms: 0 });
  } else {
    // Layer 3: Intent classifier (rule-based, no LLM)
    const classified = classifyIntent(query);
    trace.push({
      layer: "intent-classifier",
      agents: classified.agents,
      confidence: classified.confidence,
      method: classified.method,
      ms: 1,
    });

    if (classified.confidence >= 0.65) {
      routing = classified;
    } else {
      // Layer 4: LLM Supervisor (only when needed)
      const supervised = await supervisorRoute(query);
      trace.push({
        layer: "llm-supervisor",
        agents: supervised.agents,
        ms: supervised.ms,
      });
      routing = { ...supervised, args: { query } };
    }
  }

  // Layer 5: Run agents in parallel
  const agentStart = Date.now();
  const agentResults = await runAgents(routing.agents, routing.args);
  agentResults.forEach((r) => {
    trace.push({
      layer: r.agent,
      success: r.success,
      ms: r.ms,
    });
  });

  // Layer 6: Synthesize (1 LLM call)
  const { answer, ms: synthMs } = await synthesize(query, agentResults);
  trace.push({ layer: "synthesizer", ms: synthMs });

  // Save to memory
  addTurn(userId, "user", query);
  addTurn(userId, "assistant", answer);

  const totalMs = Date.now() - start;
  const llmCalls = routing.method === "llm-supervisor" ? 2 : 1;

  const result = {
    answer,
    trace,
    totalMs,
    llmCalls,
    agentsUsed: routing.agents,
    routingMethod: routing.method,
  };

  cacheSet(query, result);
  return result;
}

// Export this for the streaming endpoint
export async function orchestrateAgentsOnly(query, userId = "anonymous", forceAgents = null) {
  if (safetyCheck(query)) return { blocked: true };

  let routing;
  const trace = [];

  if (forceAgents?.length) {
    routing = { agents: forceAgents, confidence: 1.0, method: "forced", args: { query } };
    trace.push({ layer: "forced-routing", agents: forceAgents, ms: 0 });
  } else {
    const classified = classifyIntent(query);
    trace.push({ layer: "intent-classifier", agents: classified.agents, confidence: classified.confidence, method: classified.method, ms: 1 });

    if (classified.confidence >= 0.65) {
      routing = classified;
    } else {
      const supervised = await supervisorRoute(query);
      trace.push({ layer: "llm-supervisor", agents: supervised.agents, ms: supervised.ms });
      routing = { ...supervised, args: { query } };
    }
  }

  const agentResults = await runAgents(routing.agents, routing.args);
  agentResults.forEach((r) => {
    trace.push({ layer: r.agent, success: r.success, ms: r.ms });
  });

  addTurn(userId, "user", query);

  return {
    trace,
    agentResults,
    agentsUsed: routing.agents,
    routingMethod: routing.method,
    llmCalls: routing.method === "llm-supervisor" ? 1 : 0,
  };
}