import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const AVAILABLE_AGENTS = [
  "RAGAgent - searches internal knowledge base",
  "ResearchAgent - searches the web",
  "CodeAgent - writes and runs JavaScript",
  "WeatherAgent - gets weather for a city",
  "MathAgent - solves math expressions",
];

export async function supervisorRoute(query) {
  const start = Date.now();

  const prompt = `You are a routing supervisor. Given a user query, decide which agents to call.
Return ONLY a valid JSON array of agent names. Nothing else.

Available agents:
${AVAILABLE_AGENTS.join("\n")}

User query: "${query}"

Rules:
- Return minimum agents needed
- Return ["RAGAgent", "ResearchAgent"] for complex questions
- Return ["MathAgent"] for pure math
- Return ["WeatherAgent"] for weather
- Return ["CodeAgent"] for code tasks

JSON array only:`;

  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash-exp",
    contents: [{ role: "user", parts: [{ text: prompt }] }],
  });

  try {
    const text = response.text.trim().replace(/```json|```/g, "");
    const agents = JSON.parse(text);
    return {
      agents,
      confidence: 0.9,
      method: "llm-supervisor",
      ms: Date.now() - start,
    };
  } catch {
    return {
      agents: ["RAGAgent", "ResearchAgent"],
      confidence: 0.5,
      method: "llm-supervisor-fallback",
      ms: Date.now() - start,
    };
  }
}