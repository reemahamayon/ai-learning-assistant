"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ModuleInfo {
  title: string;
  description: string;
  topics: string[];
}

function ChatContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const moduleId = searchParams.get("module");

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [moduleInfo, setModuleInfo] = useState<ModuleInfo | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/login");
        return;
      }
      setCheckingAuth(false);

      if (moduleId) {
        const modSnap = await getDoc(doc(db, "modules", moduleId));
        if (modSnap.exists()) {
          setModuleInfo(modSnap.data() as ModuleInfo);
        }
      }
    });
    return () => unsubscribe();
  }, [router, moduleId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: "user", content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages,
          moduleContext: moduleInfo
            ? {
                title: moduleInfo.title,
                description: moduleInfo.description,
                topics: moduleInfo.topics,
              }
            : null,
        }),
      });

      const data = await res.json();

      if (data.reply) {
        setMessages([...newMessages, { role: "assistant", content: data.reply }]);
      } else {
        setMessages([
          ...newMessages,
          { role: "assistant", content: "Sorry, something went wrong. Please try again." },
        ]);
      }
    } catch (err) {
      setMessages([
        ...newMessages,
        { role: "assistant", content: "Error connecting to the AI. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (checkingAuth) {
    return (
      <div className="app-loading">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="app-page flex flex-col">

      <div className="flex-1 overflow-y-auto p-4 max-w-3xl w-full mx-auto">
        {messages.length === 0 && (
          <p className="text-gray-500 text-center mt-10">
            {moduleInfo
              ? `Ask me anything about ${moduleInfo.title} — I'm here to help.`
              : "Ask me anything about what you're learning — I'm here to help."}
          </p>
        )}

        <div className="space-y-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] px-4 py-2 rounded-2xl whitespace-pre-wrap ${
                  msg.role === "user"
                    ? "chat-message-user"
                    : "chat-message-assistant"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-800 text-gray-400 px-4 py-2 rounded-2xl">
                Thinking...
              </div>
            </div>
          )}
        </div>
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-gray-800 p-4">
        <div className="max-w-3xl mx-auto flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your question..."
            rows={1}
            className="flex-1 resize-none px-4 py-2 rounded-lg bg-gray-900 border border-gray-700 focus:outline-none theme-input text-white"
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="px-5 py-2 rounded-lg theme-button disabled:opacity-50 font-medium"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="app-loading" />}>
      <ChatContent />
    </Suspense>
  );
}