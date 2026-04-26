import { ChromaClient } from "chromadb";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import dotenv from "dotenv";
dotenv.config();

const isProduction = process.env.NODE_ENV === "production";

const chroma = new ChromaClient(
  isProduction
    ? {
        path: process.env.CHROMA_URL,
        auth: {
          provider: "token",
          credentials: process.env.CHROMA_API_KEY,
          tokenHeaderType: "X_CHROMA_TOKEN",
        },
      }
    : { host: "localhost", port: 8000 }
);

const COLLECTION = "nexus-knowledge";

const embeddings = new GoogleGenerativeAIEmbeddings({
  apiKey: process.env.GEMINI_API_KEY,
  modelName: "text-embedding-004",
});

export async function getCollection() {
  return await chroma.getOrCreateCollection({
    name: COLLECTION,
    embeddingFunction: {
      generate: async (texts) => await embeddings.embedDocuments(texts),
    },
  });
}

export async function storeDocuments(chunks) {
  const collection = await getCollection();
  const ids = chunks.map((_, i) => `doc-${Date.now()}-${i}`);
  const embeds = await embeddings.embedDocuments(chunks.map((c) => c.text));

  await collection.add({
    ids,
    embeddings: embeds,
    documents: chunks.map((c) => c.text),
    metadatas: chunks.map((c) => ({ source: c.source })),
  });

  return ids.length;
}

export async function searchDocuments(query, topK = 3) {
  const collection = await getCollection();
  const queryEmbed = await embeddings.embedQuery(query);

  const results = await collection.query({
    queryEmbeddings: [queryEmbed],
    nResults: topK,
  });

  return results.documents[0].map((text, i) => ({
    text,
    source: results.metadatas[0][i]?.source ?? "unknown",
    score: results.distances[0][i],
  }));
}