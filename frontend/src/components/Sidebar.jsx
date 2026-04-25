import { Plus, MessageSquare, Trash2, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Sidebar({ conversations, activeId, onSelect, onCreate, onDelete }) {
  return (
    <div className="flex flex-col h-full w-64 bg-[#080810] border-r border-white/5">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/5">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
          <Zap size={14} className="text-white" />
        </div>
        <div>
          <span className="text-sm font-bold text-white tracking-tight">Nexus AI</span>
          <p className="text-[10px] text-white/25 leading-none mt-0.5">Multi-Agent Platform</p>
        </div>
      </div>

      {/* New chat button */}
      <div className="px-3 py-3">
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={onCreate}
          className="w-full flex items-center gap-2.5 rounded-xl border border-indigo-500/30 bg-indigo-500/10 px-4 py-2.5 text-xs font-medium text-indigo-300 hover:bg-indigo-500/20 transition-colors"
        >
          <Plus size={13} />
          New chat
        </motion.button>
      </div>

      {/* Conversations */}
      <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-1">
        {conversations.length === 0 && (
          <p className="text-center text-white/20 text-xs mt-8 px-4">
            No conversations yet. Start a new chat!
          </p>
        )}
        <AnimatePresence>
          {conversations.map((conv) => (
            <motion.div
              key={conv.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className={`group flex items-center gap-2 rounded-xl px-3 py-2.5 cursor-pointer transition-all ${
                activeId === conv.id
                  ? "bg-white/8 border border-white/10"
                  : "hover:bg-white/4 border border-transparent"
              }`}
              onClick={() => onSelect(conv.id)}
            >
              <MessageSquare size={12} className="text-white/30 shrink-0" />
              <span className="flex-1 text-xs text-white/60 truncate leading-relaxed">
                {conv.title}
              </span>
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(conv.id); }}
                className="opacity-0 group-hover:opacity-100 text-white/20 hover:text-red-400 transition-all"
              >
                <Trash2 size={11} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-white/5">
        <p className="text-[10px] text-white/15 leading-relaxed">
          Max 2 LLM calls per query.<br />
          Rule-based routing first.
        </p>
      </div>
    </div>
  );
}