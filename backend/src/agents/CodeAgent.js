export const CodeAgent = {
  name: "CodeAgent",
  description: "Executes JavaScript code and returns output",

  async run(code) {
    const start = Date.now();
    try {
      const logs = [];
      const mockConsole = {
        log: (...a) => logs.push(a.map(String).join(" ")),
        error: (...a) => logs.push("ERROR: " + a.map(String).join(" ")),
      };
      new Function("console", code)(mockConsole);

      return {
        agent: "CodeAgent",
        success: true,
        result: logs.join("\n") || "Code ran with no output.",
        ms: Date.now() - start,
      };
    } catch (err) {
      return {
        agent: "CodeAgent",
        success: false,
        error: err.message,
        ms: Date.now() - start,
      };
    }
  },
};