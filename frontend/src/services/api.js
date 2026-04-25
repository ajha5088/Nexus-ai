const BASE = import.meta.env.VITE_API_URL;

export async function sendQuery({ query, userId, forceAgents = null }) {
  const endpoint = forceAgents?.length
    ? `${BASE}/query/forced`
    : `${BASE}/query`;

  const body = forceAgents?.length
    ? { query, userId, agents: forceAgents }
    : { query, userId };

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function getHistory(userId) {
  const res = await fetch(`${BASE}/history/${userId}`);
  return res.json();
}

export async function ingestDocuments({ documents, source }) {
  const res = await fetch(`${BASE}/ingest`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ documents, source }),
  });
  return res.json();
}

export async function sendQueryStream({ query, userId, forceAgents = null }, onChunk, onTrace, onDone) {
  const res = await fetch(`${BASE}/query/stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query,
      userId,
      forceAgents: forceAgents?.length ? forceAgents : null,
    }),
  });

  if (!res.ok) throw new Error(`API error: ${res.status}`);

  const reader = res.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const lines = decoder.decode(value).split("\n");
    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      try {
        const data = JSON.parse(line.slice(6));
        if (data.type === "trace") onTrace(data);
        if (data.type === "chunk") onChunk(data.text);
        if (data.type === "done") onDone(data);
        if (data.type === "error") throw new Error(data.error);
      } catch { /* skip malformed chunks */ }
    }
  }
}

export async function healthCheck() {
  const res = await fetch(`${BASE}/health`);
  return res.json();
}