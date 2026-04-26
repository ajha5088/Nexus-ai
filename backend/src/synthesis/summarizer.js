import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function synthesize(query, agentResults) {
  const start = Date.now();

  // Build context from all agent results
  const context = agentResults
    .filter((r) => r.success)
    .map((r) => {
      const resultText = typeof r.result === "object"
        ? JSON.stringify(r.result, null, 2)
        : r.result;
      return `[${r.agent}]:\n${resultText}`;
    })
    .join("\n\n");

  if (!context) {
    return {
      answer: "I couldn't find relevant information to answer your question.",
      ms: Date.now() - start,
    };
  }

  const prompt = `You are a helpful assistant. Synthesize the agent results below into a clear, concise answer.
Be direct. Cite which agent provided each piece of information.
If weather data is present, format it nicely.
If code output is present, include it.

User question: ${query}

Agent results:
${context}

Answer:`;

  const response = await ai.models.generateContent({
    model: "gemini-2-flash-preview",
    contents: [{ role: "user", parts: [{ text: prompt }] }],
  });

  return {
    answer: response.text.trim(),
    ms: Date.now() - start,
  };
}