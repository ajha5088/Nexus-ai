import { useState } from "react";
import { Database, Search, Code, Cloud, Calculator, SlidersHorizontal } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const AGENTS = [
  { id: "RAGAgent",      label: "Knowledge",  icon: Database,   color: "#06b6d4" },
  { id: "ResearchAgent", label: "Web Search", icon: Search,     color: "#22c55e" },
  { id: "CodeAgent",     label: "Code",       icon: Code,       color: "#ec4899" },
  { id: "WeatherAgent",  label: "Weather",    icon: Cloud,      color: "#38bdf8" },
  { id: "MathAgent",     label: "Math",       icon: Calculator, color: "#f59e0b" },
];

export default function AgentSelector({ onForceAgents }) {
  const [selected, setSelected] = useState([]);
  const [open, setOpen] = useState(false);

  function toggle(id) {
    const next = selected.includes(id)
      ? selected.filter((a) => a !== id)
      : [...selected, id];
    setSelected(next);
    onForceAgents(next.length > 0 ? next : null);
  }

  return (
    <div className="border-t border-white/5 bg-[#080810]">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-5 py-2.5 text-[11px] text-white/25 hover:text-white/50 transition-colors w-full"
      >
        <SlidersHorizontal size={11} />
        {selected.length > 0
          ? `Forcing: ${selected.map(a => a.replace("Agent","")).join(", ")}`
          : "Auto-routing active — click to force agents"}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden px-4 pb-3"
          >
            <div className="flex flex-wrap gap-2">
              {AGENTS.map(({ id, label, icon: Icon, color }) => {
                const isSelected = selected.includes(id);
                return (
                  <button
                    key={id}
                    onClick={() => toggle(id)}
                    className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs border transition-all"
                    style={isSelected ? {
                      borderColor: `${color}50`,
                      backgroundColor: `${color}15`,
                      color,
                    } : {
                      borderColor: "rgba(255,255,255,0.08)",
                      color: "rgba(255,255,255,0.3)",
                    }}
                  >
                    <Icon size={10} />
                    {label}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}