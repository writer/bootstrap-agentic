import { registerTool } from "./index.js";

registerTool(
  "calculator",
  "Evaluate a mathematical expression. Supports basic arithmetic: +, -, *, /, **, parentheses.",
  {
    type: "object",
    properties: {
      expression: {
        type: "string",
        description:
          "The mathematical expression to evaluate, e.g. '(2 + 3) * 4'",
      },
    },
    required: ["expression"],
  },
  calculator,
);

function calculator(expression: string): string {
  const allowed = new Set("0123456789+-*/.() ".split(""));
  for (const c of expression) {
    if (!allowed.has(c)) {
      return `Error: invalid characters in expression: ${expression}`;
    }
  }

  try {
    // biome-ignore lint/security/noGlobalEval: required to eval math expressions
    const result = eval(expression);

    return String(result);
  } catch (e) {
    return `Error: ${e}`;
  }
}
