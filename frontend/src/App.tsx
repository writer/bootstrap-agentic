import { useEffect, useState } from "react";
import { createThread, listThreads, Thread } from "./api";
import ChatWindow from "./components/ChatWindow";

export default function App() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [activeThread, setActiveThread] = useState<string | null>(null);

  useEffect(() => {
    listThreads().then(setThreads).catch(console.error);
  }, []);

  const handleNewThread = async () => {
    const thread = await createThread();
    setThreads((prev) => [thread, ...prev]);
    setActiveThread(thread.id);
  };

  return (
    <>
      <div className="sidebar">
        <h2>Threads</h2>
        <button onClick={handleNewThread}>+ New Chat</button>
        <div className="thread-list">
          {threads.map((t) => (
            <div
              key={t.id}
              className={`thread-item ${activeThread === t.id ? "active" : ""}`}
              onClick={() => setActiveThread(t.id)}
            >
              {t.title}
            </div>
          ))}
        </div>
      </div>
      {activeThread ? (
        <ChatWindow threadId={activeThread} />
      ) : (
        <div className="empty-state">
          Select a thread or create a new one to start chatting.
        </div>
      )}
    </>
  );
}
