import { useEffect, useRef, useState } from "react";
import { getMessages, Message, sendMessage } from "../api";
import ToolCallDisplay from "./ToolCallDisplay";

interface Props {
  threadId: string;
}

export default function ChatWindow({ threadId }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages([]);
    getMessages(threadId).then(setMessages).catch(console.error);
  }, [threadId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;

    setInput("");
    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        thread_id: threadId,
        role: "user",
        content: text,
        created_at: new Date().toISOString(),
      },
    ]);
    setLoading(true);

    try {
      const res = await sendMessage(threadId, text);
      setMessages(res.messages);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          thread_id: threadId,
          role: "assistant",
          content: "Error: Failed to get response",
          created_at: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-area">
      <div className="messages">
        {messages.map((msg) =>
          msg.role === "tool" ? (
            <ToolCallDisplay key={msg.id} message={msg} />
          ) : (
            <div key={msg.id} className={`message ${msg.role}`}>
              {msg.content}
            </div>
          )
        )}
        {loading && (
          <div className="message assistant" style={{ opacity: 0.5 }}>
            Thinking...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="input-area">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Type a message..."
          disabled={loading}
        />
        <button onClick={handleSend} disabled={loading || !input.trim()}>
          Send
        </button>
      </div>
    </div>
  );
}
