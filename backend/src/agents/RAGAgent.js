import { searchDocuments } from "../vectorstore/chromaStore.js";

export const RAGAgent = {
  name: "RAGAgent",
  description: "Searches internal knowledge base for technical concepts",

  async run(query) {
    const start = Date.now();
    try {
      const results = await searchDocuments(query, 3);

      if (!results.length || results[0].score > 0.8) {
        return {
          agent: "RAGAgent",
          success: false,
          result: null,
          ms: Date.now() - start,
        };
      }

      return {
        agent: "RAGAgent",
        success: true,
        result: results.map((r) => ({
          text: r.text,
          source: r.source,
          score: r.score,
        })),
        ms: Date.now() - start,
      };
    } catch (err) {
      return {
        agent: "RAGAgent",
        success: false,
        error: err.message,
        ms: Date.now() - start,
      };
    }
  },
};