import asyncio
import json
from typing import Any, Callable

_tool_registry: dict[str, dict[str, Any]] = {}


def register_tool(name: str, description: str, parameters: dict):
    """Decorator to register a function as an agent tool."""

    def decorator(func: Callable):
        _tool_registry[name] = {
            "function": func,
            "schema": {
                "type": "function",
                "function": {
                    "name": name,
                    "description": description,
                    "parameters": parameters,
                },
            },
        }
        return func

    return decorator


def get_registered_tools() -> list[dict]:
    """Return OpenAI-compatible tool schemas for all registered tools."""
    return [entry["schema"] for entry in _tool_registry.values()]


# Import tool modules so @register_tool decorators fire
import backend.agent.tools.calculator  # noqa: F401, E402


async def execute_tool(tool_name: str, arguments: str) -> str:
    """Execute a registered tool by name with JSON arguments."""
    if tool_name not in _tool_registry:
        return json.dumps({"error": f"Unknown tool: {tool_name}"})

    func = _tool_registry[tool_name]["function"]
    args = json.loads(arguments)

    if asyncio.iscoroutinefunction(func):
        result = await func(**args)
    else:
        result = func(**args)

    return json.dumps(result) if not isinstance(result, str) else result
