type ToolFunction = (...args: never[]) => string | Promise<string>;

interface ToolEntry {
  function: ToolFunction;
  schema: {
    type: "function";
    function: {
      name: string;
      description: string;
      parameters: Record<string, unknown>;
    };
  };
}

const toolRegistry = new Map<string, ToolEntry>();

export function registerTool(
  name: string,
  description: string,
  parameters: Record<string, unknown>,
  fn: ToolFunction,
): void {
  toolRegistry.set(name, {
    function: fn,
    schema: {
      type: "function",
      function: { name, description, parameters },
    },
  });
}

export function getRegisteredTools() {
  return Array.from(toolRegistry.values()).map((entry) => entry.schema);
}

// Import tool modules so registerTool calls fire
import("./calculator.js");

export async function executeTool(
  toolName: string,
  argumentsJson: string,
): Promise<string> {
  const entry = toolRegistry.get(toolName);

  if (!entry) {
    return JSON.stringify({ error: `Unknown tool: ${toolName}` });
  }

  const args = JSON.parse(argumentsJson);
  const fn = entry.function;

  const result = fn(...(Object.values(args) as never[]));
  const resolved = result instanceof Promise ? await result : result;

  return typeof resolved === "string" ? resolved : JSON.stringify(resolved);
}
