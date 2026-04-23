// Pure rule-based classifier — zero LLM calls
// Returns { agents, confidence, extractedArgs }

const INTENT_RULES = [
  {
    agents: ["WeatherAgent"],
    confidence: 0.95,
    pattern: /weather|temperature|forecast|humid|rain|sunny/i,
    extractArg: (q) => {
      const m = q.match(/(?:weather|temperature|forecast)\s+(?:in\s+)?([a-zA-Z\s]+?)[\?\.]*$/i);
      return { city: m ? m[1].trim() : q };
    },
  },
  {
    agents: ["MathAgent"],
    confidence: 0.98,
    pattern: /^[\d\s\+\-\*\/\(\)\.%\^]+$/,
    extractArg: (q) => ({ expression: q.trim() }),
  },
  {
    agents: ["CodeAgent"],
    confidence: 0.92,
    pattern: /write code|run code|execute|javascript|function|algorithm|program/i,
    extractArg: (q) => ({ query: q }),
  },
  {
    agents: ["RAGAgent"],
    confidence: 0.85,
    pattern: /what is|explain|define|how does|tell me about|meaning of/i,
    extractArg: (q) => ({ query: q }),
  },
  {
    agents: ["ResearchAgent"],
    confidence: 0.85,
    pattern: /latest|news|current|today|recent|search|find|who is|when did/i,
    extractArg: (q) => ({ query: q }),
  },
  {
    agents: ["RAGAgent", "ResearchAgent"],
    confidence: 0.75,
    pattern: /compare|difference|vs|versus|better/i,
    extractArg: (q) => ({ query: q }),
  },
];

export function classifyIntent(query) {
  for (const rule of INTENT_RULES) {
    if (rule.pattern.test(query)) {
      return {
        agents: rule.agents,
        confidence: rule.confidence,
        args: rule.extractArg(query),
        method: "rule-based",
      };
    }
  }

  // No rule matched — low confidence, needs LLM
  return {
    agents: [],
    confidence: 0,
    args: { query },
    method: "needs-llm",
  };
}