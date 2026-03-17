export interface Thread {
  id: string;
  title: string;
  created_at: string;
}

export interface Message {
  id: string;
  thread_id: string;
  role: string;
  content: string;
  tool_call_id?: string;
  tool_name?: string;
  created_at: string;
}

export interface ChatResponse {
  thread_id: string;
  response: string;
  messages: Message[];
}

const API_BASE = "";

export async function listThreads(): Promise<Thread[]> {
  const res = await fetch(`${API_BASE}/threads/`);
  if (!res.ok) throw new Error("Failed to fetch threads");
  return res.json();
}

export async function createThread(title?: string): Promise<Thread> {
  const res = await fetch(`${API_BASE}/threads/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: title || "New Chat" }),
  });
  if (!res.ok) throw new Error("Failed to create thread");
  return res.json();
}

export async function sendMessage(
  threadId: string,
  message: string
): Promise<ChatResponse> {
  const res = await fetch(`${API_BASE}/threads/${threadId}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });
  if (!res.ok) throw new Error("Failed to send message");
  return res.json();
}
