export const ResearchAgent = {
  name: "ResearchAgent",
  description: "Searches Google via Serper and returns structured results",

  async run(query) {
    const start = Date.now();

    // ✅ Validate API key
    if (!process.env.SERPER_API_KEY) {
      return {
        agent: "ResearchAgent",
        success: false,
        error: "Missing SERPER_API_KEY",
        ms: Date.now() - start,
      };
    }

    try {
      // ✅ Timeout protection
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);

      const response = await fetch("https://google.serper.dev/search", {
        method: "POST",
        headers: {
          "X-API-KEY": process.env.SERPER_API_KEY,
          "Content-Type": "application/json",
        },
        signal: controller.signal,
        body: JSON.stringify({
          q: query,
          gl: "in", // geo: India (important for relevance)
          hl: "en", // language
          num: 5, // results
        }),
      });

      clearTimeout(timeout);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      // ✅ Normalize organic results
      const results = (data.organic || []).map((r) => ({
        title: r.title,
        url: r.link,
        snippet: r.snippet,
        position: r.position,
      }));

      // ✅ Optional: include answer box if exists
      const answerBox = data.answerBox
        ? {
            answer: data.answerBox.answer,
            snippet: data.answerBox.snippet,
            title: data.answerBox.title,
          }
        : null;

      return {
        agent: "ResearchAgent",
        success: true,
        result: {
          answer: answerBox,
          results: results,
        },
        ms: Date.now() - start,
      };
    } catch (err) {
      console.error("ResearchAgent Error:", err.message);

      return {
        agent: "ResearchAgent",
        success: false,
        error: err.name === "AbortError" ? "Request timed out" : err.message,
        ms: Date.now() - start,
      };
    }
  },
};
