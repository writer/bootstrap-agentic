from backend.agent.tools import register_tool


@register_tool(
    name="calculator",
    description="Evaluate a mathematical expression. Supports basic arithmetic: +, -, *, /, **, parentheses.",
    parameters={
        "type": "object",
        "properties": {
            "expression": {
                "type": "string",
                "description": "The mathematical expression to evaluate, e.g. '(2 + 3) * 4'",
            }
        },
        "required": ["expression"],
    },
)
def calculator(expression: str) -> str:
    """Safely evaluate a mathematical expression."""
    allowed = set("0123456789+-*/.() ")
    if not all(c in allowed for c in expression):
        return f"Error: invalid characters in expression: {expression}"

    try:
        result = eval(expression)  # noqa: S307
        return str(result)
    except Exception as e:
        return f"Error: {e}"
