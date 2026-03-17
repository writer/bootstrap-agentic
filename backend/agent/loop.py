from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.agent.prompts import SYSTEM_PROMPT
from backend.agent.tools import execute_tool, get_registered_tools
from backend.models.message import Message
from backend.services.llm import llm_client


async def run_agent(thread_id: str, user_message: str, db: AsyncSession) -> str:
    """Run the agent loop: load history, call LLM, handle tool calls, return response."""

    # Load existing messages for context
    result = await db.execute(
        select(Message)
        .where(Message.thread_id == thread_id)
        .order_by(Message.created_at)
    )
    history = result.scalars().all()

    # Build messages for the LLM
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    for msg in history:
        messages.append({"role": msg.role, "content": msg.content})

    messages.append({"role": "user", "content": user_message})

    # Save user message
    user_msg = Message(thread_id=thread_id, role="user", content=user_message)
    db.add(user_msg)
    await db.flush()

    # Agent loop — keep calling LLM until we get a final text response
    tools = get_registered_tools()

    while True:
        response = await llm_client.chat.completions.create(
            model=llm_client._model,
            messages=messages,
            tools=tools if tools else None,
            tool_choice="auto" if tools else None,
        )

        choice = response.choices[0]
        assistant_message = choice.message

        if not assistant_message.tool_calls:
            # Final text response
            content = assistant_message.content or ""
            assistant_msg = Message(
                thread_id=thread_id, role="assistant", content=content
            )
            db.add(assistant_msg)
            await db.commit()
            return content

        # Handle tool calls
        messages.append(assistant_message)

        for tool_call in assistant_message.tool_calls:
            tool_result = await execute_tool(
                tool_call.function.name,
                tool_call.function.arguments,
            )

            messages.append(
                {
                    "role": "tool",
                    "tool_call_id": tool_call.id,
                    "content": tool_result,
                }
            )

            # Save tool result as a message
            tool_msg = Message(
                thread_id=thread_id,
                role="tool",
                content=tool_result,
                tool_call_id=tool_call.id,
                tool_name=tool_call.function.name,
            )
            db.add(tool_msg)

        await db.flush()
