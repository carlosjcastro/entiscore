"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { HiChatBubbleLeftRight, HiXMark, HiPaperAirplane, HiPaperClip, HiDocumentText } from "react-icons/hi2";
import ReactMarkdown from "react-markdown";
import DOMPurify from "dompurify";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  attachedFileName?: string;
}

interface ChatPanelProps {
  code: string;
}

const MAX_CLIENT_FILE_SIZE_BYTES = 2 * 1024 * 1024;
const ALLOWED_EXTENSIONS = [".txt", ".html", ".htm", ".md", ".markdown"];
const BLOCKED_EXTENSIONS = [".zip", ".rar", ".7z", ".gz", ".tar", ".bz2"];

function getFileExtension(filename: string): string {
  const lastDot = filename.lastIndexOf(".");
  if (lastDot === -1) return "";
  return filename.slice(lastDot).toLowerCase();
}

function sanitizeDisplayText(text: string): string {
  return DOMPurify.sanitize(text, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
}

async function streamChatResponse(
  code: string,
  message: string,
  history: { role: "user" | "assistant"; content: string }[],
  onChunk: (text: string) => void,
  fileName?: string,
  fileContentBase64?: string
): Promise<string> {
  const requestBody: Record<string, unknown> = { code, message, history };
  if (fileName && fileContentBase64) {
    requestBody["fileName"] = fileName;
    requestBody["fileContentBase64"] = fileContentBase64;
  }

  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestBody),
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
  const [attachedFile, setAttachedFile] = useState<{ name: string; base64: string } | null>(null);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent]);

  function handleFileSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    event.target.value = "";

    const extension = getFileExtension(file.name);

    if (BLOCKED_EXTENSIONS.includes(extension)) {
      setError("Los archivos comprimidos no están permitidos");
      return;
    }

    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      setError("Solo se permiten archivos de texto plano (.txt), HTML (.html) o Markdown (.md)");
      return;
    }

    if (file.size > MAX_CLIENT_FILE_SIZE_BYTES) {
      setError(`El archivo supera el límite de 2 MB (tamaño: ${(file.size / 1024 / 1024).toFixed(1)} MB)`);
      return;
    }

    setError(null);
    setIsProcessingFile(true);

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === "string") {
        const base64 = result.split(",")[1] ?? "";
        setAttachedFile({ name: file.name, base64 });
      }
      setIsProcessingFile(false);
    };
    reader.onerror = () => {
      setError("No se pudo leer el archivo correctamente");
      setIsProcessingFile(false);
    };
    reader.readAsDataURL(file);
  }

  function handleRemoveFile() {
    setAttachedFile(null);
  }

  async function handleSendMessage() {
    const trimmedMessage = inputValue.trim();
    if (trimmedMessage.length === 0 || isStreaming) return;

    setError(null);
    setInputValue("");

    const currentFile = attachedFile;
    setAttachedFile(null);

    const userMessage: ChatMessage = {
      role: "user",
      content: trimmedMessage,
      attachedFileName: currentFile?.name,
    };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setIsStreaming(true);
    setStreamingContent("");

    const historyForApi = messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    try {
      const fullResponse = await streamChatResponse(
        code,
        trimmedMessage,
        historyForApi,
        (partialText) => setStreamingContent(partialText),
        currentFile?.name,
        currentFile?.base64
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
      <motion.button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg transition-all hover:bg-indigo-700 hover:shadow-xl active:scale-95"
        aria-label="Abrir asistente"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      >
        <HiChatBubbleLeftRight className="h-5 w-5" />
      </motion.button>
    );
  }

  return (
    <motion.div
      className="fixed bottom-6 right-6 z-40 flex h-[520px] w-[390px] max-w-[calc(100vw-2rem)] flex-col rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-2xl"
      initial={{ opacity: 0, scale: 0.92, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
    >
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

      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-3 space-y-3">
        {messages.length === 0 && !isStreaming && (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-center">
            <HiChatBubbleLeftRight className="h-8 w-8 text-zinc-200 dark:text-zinc-700" />
            <p className="text-[13px] text-zinc-400 dark:text-zinc-500 max-w-[240px]">
              Preguntame sobre tu análisis, cómo mejorar tu score, o adjunta un archivo para que lo analice.
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
        {attachedFile && (
          <div className="flex items-center gap-2 mb-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/50 px-2.5 py-1.5">
            <HiDocumentText className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
            <span className="text-[11px] font-medium text-indigo-700 dark:text-indigo-300 truncate flex-1">
              {sanitizeDisplayText(attachedFile.name)}
            </span>
            <button
              onClick={handleRemoveFile}
              className="flex h-4 w-4 items-center justify-center rounded text-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-200"
            >
              <HiXMark className="h-3 w-3" />
            </button>
          </div>
        )}

        {isProcessingFile && (
          <div className="flex items-center gap-2 mb-2 px-2.5 py-1.5">
            <div className="h-3 w-3 animate-spin rounded-full border border-indigo-300 border-t-indigo-600" />
            <span className="text-[11px] text-zinc-500">Procesando archivo...</span>
          </div>
        )}

        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.html,.htm,.md,.markdown"
            onChange={handleFileSelect}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isStreaming || isProcessingFile}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-400 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-600 dark:hover:text-zinc-200 disabled:opacity-40"
            aria-label="Adjuntar archivo"
          >
            <HiPaperClip className="h-3.5 w-3.5" />
          </button>
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
    </motion.div>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";

  return (
    <motion.div
      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <div
        className={`max-w-[85%] rounded-xl px-3 py-2 text-[13px] leading-relaxed break-words overflow-hidden ${
          isUser
            ? "bg-indigo-600 text-white"
            : "bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200"
        }`}
        style={{ overflowWrap: "break-word", wordBreak: "break-word" }}
      >
        {message.attachedFileName && (
          <div className={`flex items-center gap-1.5 mb-1.5 pb-1.5 border-b ${isUser ? "border-indigo-500/30" : "border-zinc-200 dark:border-zinc-700"}`}>
            <HiDocumentText className="h-3 w-3 shrink-0" />
            <span className="text-[11px] font-medium truncate">
              {sanitizeDisplayText(message.attachedFileName)}
            </span>
          </div>
        )}
        {isUser ? (
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
        ) : (
          <div className="prose prose-sm prose-zinc dark:prose-invert max-w-none break-words [&_p]:mb-1.5 [&_p]:last:mb-0 [&_ul]:mb-1.5 [&_ol]:mb-1.5 [&_li]:mb-0.5 [&_pre]:overflow-x-auto [&_pre]:max-w-full [&_code]:break-all [&_pre_code]:break-normal">
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
        )}
      </div>
    </motion.div>
  );
}
