export const MathAgent = {
  name: "MathAgent",
  description: "Evaluates mathematical expressions",

  async run(expression) {
    const start = Date.now();
    try {
      const result = eval(expression);
      return {
        agent: "MathAgent",
        success: true,
        result: `${expression} = ${result}`,
        ms: Date.now() - start,
      };
    } catch (err) {
      return {
        agent: "MathAgent",
        success: false,
        error: err.message,
        ms: Date.now() - start,
      };
    }
  },
};