"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionLimitReached, setSessionLimitReached] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    const query = input.trim();
    if (!query || isLoading) return;

    const userMessage: Message = { role: "user", content: query };
    const updated = [...messages, userMessage];
    setMessages(updated);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updated }),
      });

      if (!res.ok) {
        if (res.status === 429) {
          setSessionLimitReached(true);
          return;
        }
        const err = await res.text();
        setMessages([
          ...updated,
          {
            role: "assistant",
            content: `System error: ${res.status}. ${err}`,
          },
        ]);
        return;
      }

      const data = await res.json();
      setMessages([
        ...updated,
        { role: "assistant", content: data.content },
      ]);
    } catch {
      setMessages([
        ...updated,
        {
          role: "assistant",
          content: "Connection error. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      {/* Floating button */}
      <button
        className="ind-chat-bubble"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "Close chat" : "Ask Seth"}
      >
        {isOpen ? (
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6">
            <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
          </svg>
        ) : (
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6">
            <path
              fillRule="evenodd"
              d="M3.43 2.524A41.29 41.29 0 0110 2c2.236 0 4.43.18 6.57.524 1.437.231 2.43 1.49 2.43 2.902v5.148c0 1.413-.993 2.67-2.43 2.902a41.202 41.202 0 01-5.183.501.78.78 0 00-.528.224l-3.579 3.58A.75.75 0 016 17.25v-3.443a.75.75 0 00-.663-.744A34.924 34.924 0 013.43 12.476C1.993 12.244 1 10.987 1 9.574V5.426c0-1.413.993-2.67 2.43-2.902z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </button>

      {/* Chat panel */}
      {isOpen && (
        <div className="ind-chat-panel">
          {/* Header */}
          <div
            className="px-4 py-3 flex items-center justify-between"
            style={{
              background: "var(--ind-surface-elevated)",
              borderBottom: "1px solid var(--ind-border)",
            }}
          >
            <div>
              <p
                className="text-sm font-bold"
                style={{ color: "var(--ind-fg-strong)" }}
              >
                Ask Seth
              </p>
              <p className="text-xs" style={{ color: "var(--ind-muted)" }}>
                Autistic Systems Thinker • Logical & Precise
              </p>
            </div>
            <span className="ind-pulse" aria-hidden="true" />
          </div>

          {/* Messages */}
          <div
            className="flex-1 overflow-y-auto px-4 py-3 space-y-3"
            style={{ minHeight: "200px", maxHeight: "360px" }}
          >
            {messages.length === 0 && (
              <p className="text-xs text-center py-8" style={{ color: "var(--ind-muted)" }}>
                Ask me about my experience, methodologies, or specific
                projects like the 2012 CTO DeltaV Migration.
              </p>
            )}
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className="max-w-[85%] rounded-lg px-3 py-2 text-sm"
                  style={{
                    background:
                      msg.role === "user"
                        ? "var(--ind-chat-accent)"
                        : "var(--ind-surface-elevated)",
                    color:
                      msg.role === "user"
                        ? "#ffffff"
                        : "var(--ind-fg)",
                    border:
                      msg.role === "assistant"
                        ? "1px solid var(--ind-border)"
                        : "none",
                  }}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div
                  className="rounded-lg px-3 py-2 text-sm"
                  style={{
                    background: "var(--ind-surface-elevated)",
                    color: "var(--ind-muted)",
                    border: "1px solid var(--ind-border)",
                  }}
                >
                  <span className="inline-flex gap-1">
                    <span className="animate-pulse">●</span>
                    <span className="animate-pulse" style={{ animationDelay: "150ms" }}>●</span>
                    <span className="animate-pulse" style={{ animationDelay: "300ms" }}>●</span>
                  </span>
                </div>
              </div>
            )}
            {sessionLimitReached && (
              <div
                className="text-sm p-3 rounded-md"
                style={{
                  borderLeft: "3px solid var(--ind-chat-accent)",
                  borderTop: "1px solid var(--ind-border)",
                  borderRight: "1px solid var(--ind-border)",
                  borderBottom: "1px solid var(--ind-border)",
                  background: "var(--ind-surface-elevated)",
                }}
              >
                <p style={{ color: "var(--ind-fg)" }}>
                  We&apos;ve covered a lot of ground. If you want to keep going or schedule
                  a call —{" "}
                  <a
                    href="mailto:seth.robins@recursiveintelligence.io"
                    style={{ color: "var(--ind-chat-accent)", textDecoration: "underline" }}
                  >
                    seth.robins@recursiveintelligence.io
                  </a>
                </p>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div
            className="px-3 py-3 flex gap-2"
            style={{ borderTop: "1px solid var(--ind-border)" }}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask about my work..."
              className="flex-1 rounded-md px-3 py-2 text-sm outline-none"
              style={{
                background: "var(--ind-bg)",
                color: "var(--ind-fg)",
                border: "1px solid var(--ind-border)",
              }}
              disabled={isLoading || sessionLimitReached}
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim() || sessionLimitReached}
              className="rounded-md px-3 py-2 text-sm font-semibold transition-colors disabled:opacity-40"
              style={{
                background: "var(--ind-chat-accent)",
                color: "#ffffff",
              }}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
}
