import { useState, useRef, useEffect } from "react";
import { ArrowUp, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import MessageBubble from "./MessageBubble.jsx";
import AgentSelector from "./AgentSelector.jsx";
import { useChat } from "../hooks/useChat.js";

const SUGGESTIONS = [
  "What is RAG?",
  "Weather in Mumbai",
  "Explain embeddings",
  "Write code to find primes up to 50",
  "Difference between RAG and fine tuning",
];

export default function ChatWindow({ store }) {
  const [input, setInput] = useState("");
  const [forcedAgents, setForcedAgents] = useState(null);
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);
  const { messages, isLoading, sendMessage } = useChat(store, "aditya");

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 160) + "px";
  }, [input]);

  async function handleSend() {
    if (!input.trim() || isLoading) return;
    const query = input.trim();
    setInput("");
    await sendMessage(query, forcedAgents);
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  const isEmpty = messages.length === 0;

  return (
    <div className="flex flex-col h-full relative">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-64 bg-indigo-600/8 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#0a0a12]/80 backdrop-blur-sm">
        <div>
          <h2 className="text-sm font-semibold text-white/80">Chat</h2>
          <p className="text-[11px] text-white/25">
            {isEmpty ? "Start a conversation" : `${messages.length} messages`}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="relative z-10 flex-1 overflow-y-auto px-6 py-6">
        <AnimatePresence>
          {isEmpty && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center h-full gap-8 pb-20"
            >
              {/* Hero */}
              <div className="text-center">
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                  className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-2xl font-black text-white shadow-2xl shadow-indigo-500/30 mx-auto mb-4"
                >
                  N
                </motion.div>
                <h3 className="text-white/70 font-semibold text-lg mb-1">
                  What can I help with?
                </h3>
                <p className="text-white/25 text-sm">
                  Intelligent routing across multiple specialized agents
                </p>
              </div>

              {/* Suggestions */}
              <div className="flex flex-wrap gap-2 justify-center max-w-lg">
                {SUGGESTIONS.map((s, i) => (
                  <motion.button
                    key={s}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.05 }}
                    onClick={() => {
                      setInput(s);
                      textareaRef.current?.focus();
                    }}
                    className="text-xs px-4 py-2 rounded-xl border border-white/8 text-white/35 hover:border-indigo-500/40 hover:text-white/60 hover:bg-indigo-500/8 transition-all"
                  >
                    {s}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {messages.map((msg, i) => (
          <MessageBubble key={msg.id} message={msg} index={i} />
        ))}

        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-3 text-white/25 text-sm mb-6"
          >
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-[10px] font-bold text-white">
              N
            </div>
            <div className="flex items-center gap-2">
              <Loader2 size={12} className="animate-spin text-indigo-400" />
              <span className="text-xs">Routing to agents...</span>
            </div>
          </motion.div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div className="relative z-10 border-t border-white/5 bg-[#0a0a12]/80 backdrop-blur-sm">
        <AgentSelector onForceAgents={setForcedAgents} />

        <div className="px-4 py-4">
          <div className="relative flex items-end gap-3 rounded-2xl border border-white/10 bg-white/4 px-4 py-3 focus-within:border-indigo-500/40 focus-within:bg-indigo-500/5 transition-all">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything..."
              rows={1}
              className="flex-1 resize-none bg-transparent text-sm text-white/85 placeholder-white/20 outline-none leading-relaxed"
              style={{ minHeight: "24px", maxHeight: "160px" }}
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="shrink-0 flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/30 disabled:opacity-30 disabled:cursor-not-allowed transition-opacity"
            >
              {isLoading
                ? <Loader2 size={14} className="animate-spin" />
                : <ArrowUp size={14} />
              }
            </motion.button>
          </div>
          <p className="text-center text-[10px] text-white/12 mt-2 font-mono">
            {forcedAgents?.length
              ? `⚡ Forcing: ${forcedAgents.join(", ")}`
              : "↺ Auto-routing — rule-based first, LLM fallback"}
          </p>
        </div>
      </div>
    </div>
  );
}