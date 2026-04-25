import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import AgentTrace from "./AgentTrace.jsx";

export default function MessageBubble({ message }) {
  const isUser = message.role === "user";
  const isError = message.role === "error";

  if (isUser) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-end mb-6"
      >
        <div className="max-w-[72%] rounded-2xl rounded-br-sm bg-gradient-to-br from-indigo-600 to-violet-600 px-5 py-3.5 text-sm text-white shadow-lg shadow-indigo-500/20 leading-relaxed">
          {message.content}
        </div>
      </motion.div>
    );
  }

  if (isError) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-start mb-6"
      >
        <div className="max-w-[80%] rounded-2xl bg-red-500/10 border border-red-500/20 px-5 py-3.5 text-sm text-red-300 leading-relaxed">
          {message.content}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex justify-start mb-6"
    >
      <div className="max-w-[85%] w-full">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-[10px] font-bold text-white shadow-md">
            N
          </div>
          <span className="text-xs text-white/30 font-medium">Nexus AI</span>
          {message.totalMs && (
            <span className="text-[10px] text-white/15 font-mono">
              {message.totalMs}ms
            </span>
          )}
          {message.streaming && (
            <span className="text-[10px] text-indigo-400 font-mono animate-pulse">
              streaming...
            </span>
          )}
        </div>

        <div className="rounded-2xl rounded-tl-sm bg-white/5 border border-white/8 px-5 py-4 text-sm text-white/85 leading-relaxed">
          {message.streaming ? (
            // Plain text while streaming — no markdown re-renders
            <span>
              {message.content}
              <span className="inline-block w-0.5 h-4 bg-indigo-400 ml-0.5 animate-pulse align-middle" />
            </span>
          ) : (
            // Full markdown when done
            <div
              className="prose prose-invert prose-sm max-w-none
              prose-p:my-1.5 prose-headings:text-white/80 prose-strong:text-white
              prose-code:text-indigo-300 prose-code:bg-indigo-500/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
              prose-pre:bg-black/40 prose-pre:border prose-pre:border-white/10
              prose-ul:my-1.5 prose-li:my-0.5
              prose-a:text-indigo-400"
            >
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
          )}
        </div>

        {message.trace && !message.streaming && (
          <AgentTrace
            trace={message.trace}
            totalMs={message.totalMs}
            llmCalls={message.llmCalls}
            routingMethod={message.routingMethod}
          />
        )}
      </div>
    </motion.div>
  );
}
