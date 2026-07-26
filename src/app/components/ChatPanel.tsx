"use client";

import { useState, useRef, useEffect } from "react";
import { HiChatBubbleLeftRight, HiXMark, HiPaperAirplane } from "react-icons/hi2";
import ReactMarkdown from "react-markdown";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface ChatPanelProps {
  code: string;
}

async function streamChatResponse(
  code: string,
  message: string,
  history: ChatMessage[],
  onChunk: (text: string) => void
): Promise<string> {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code, message, history }),
  });

  if (!response.ok) {
    const errorBody = await response.json();
    throw new Error(errorBody.error ?? "Error al conectar con el asistente");
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error("No se pudo leer la respuesta");

  const decoder = new TextDecoder();
  let fullResponse = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value, { stream: true });
    fullResponse += chunk;
    onChunk(fullResponse);
  }

  return fullResponse;
}

export function ChatPanel({ code }: ChatPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent]);

  async function handleSendMessage() {
    const trimmedMessage = inputValue.trim();
    if (trimmedMessage.length === 0 || isStreaming) return;

    setError(null);
    setInputValue("");

    const userMessage: ChatMessage = { role: "user", content: trimmedMessage };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setIsStreaming(true);
    setStreamingContent("");

    try {
      const fullResponse = await streamChatResponse(
        code,
        trimmedMessage,
        messages,
        (partialText) => setStreamingContent(partialText)
      );

      const assistantMessage: ChatMessage = { role: "assistant", content: fullResponse };
      setMessages([...updatedMessages, assistantMessage]);
      setStreamingContent("");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error inesperado";
      setError(errorMessage);
    } finally {
      setIsStreaming(false);
    }
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg transition-all hover:bg-indigo-700 hover:shadow-xl active:scale-95"
        aria-label="Abrir asistente"
      >
        <HiChatBubbleLeftRight className="h-5 w-5" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-40 flex h-[500px] w-[380px] max-w-[calc(100vw-2rem)] flex-col rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-2xl">
      <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-700 px-4 py-3">
        <div className="flex items-center gap-2">
          <HiChatBubbleLeftRight className="h-4 w-4 text-indigo-500" />
          <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
            Asistente Entiscore
          </span>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-600 dark:hover:text-zinc-200"
        >
          <HiXMark className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.length === 0 && !isStreaming && (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-center">
            <HiChatBubbleLeftRight className="h-8 w-8 text-zinc-200 dark:text-zinc-700" />
            <p className="text-[13px] text-zinc-400 dark:text-zinc-500 max-w-[240px]">
              Preguntame sobre tu análisis, cómo mejorar tu score, o qué significa cada hallazgo.
            </p>
          </div>
        )}

        {messages.map((msg, index) => (
          <MessageBubble key={index} message={msg} />
        ))}

        {isStreaming && streamingContent.length > 0 && (
          <MessageBubble message={{ role: "assistant", content: streamingContent }} />
        )}

        {isStreaming && streamingContent.length === 0 && (
          <div className="flex items-center gap-2 px-3 py-2">
            <div className="flex gap-1">
              <div className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" />
              <div className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" style={{ animationDelay: "150ms" }} />
              <div className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/50 px-3 py-2">
            <p className="text-[12px] text-rose-600 dark:text-rose-400">{error}</p>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-zinc-200 dark:border-zinc-700 px-3 py-3">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escribe tu pregunta..."
            disabled={isStreaming}
            className="flex-1 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-[13px] text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-indigo-500/40 disabled:opacity-50"
          />
          <button
            onClick={handleSendMessage}
            disabled={isStreaming || inputValue.trim().length === 0}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-white transition-colors hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <HiPaperAirplane className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-xl px-3 py-2 text-[13px] leading-relaxed ${
          isUser
            ? "bg-indigo-600 text-white"
            : "bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200"
        }`}
      >
        {isUser ? (
          <p>{message.content}</p>
        ) : (
          <div className="prose prose-sm prose-zinc dark:prose-invert max-w-none [&_p]:mb-1.5 [&_p]:last:mb-0 [&_ul]:mb-1.5 [&_ol]:mb-1.5 [&_li]:mb-0.5">
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}
