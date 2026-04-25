import { motion, AnimatePresence } from "framer-motion";
import { Zap, Brain, Search, Code, Cloud, Calculator, Sparkles, Shield, Database, CheckCircle, XCircle } from "lucide-react";

const META = {
  "cache":            { icon: Zap,        color: "#f59e0b", label: "Cache" },
  "safety":           { icon: Shield,     color: "#ef4444", label: "Safety" },
  "intent-classifier":{ icon: Brain,      color: "#6366f1", label: "Classifier" },
  "llm-supervisor":   { icon: Brain,      color: "#8b5cf6", label: "Supervisor" },
  "forced-routing":   { icon: Zap,        color: "#f97316", label: "Forced" },
  "RAGAgent":         { icon: Database,   color: "#06b6d4", label: "RAG" },
  "ResearchAgent":    { icon: Search,     color: "#22c55e", label: "Research" },
  "CodeAgent":        { icon: Code,       color: "#ec4899", label: "Code" },
  "WeatherAgent":     { icon: Cloud,      color: "#38bdf8", label: "Weather" },
  "MathAgent":        { icon: Calculator, color: "#f59e0b", label: "Math" },
  "synthesizer":      { icon: Sparkles,   color: "#a78bfa", label: "Synthesizer" },
};

export default function AgentTrace({ trace, totalMs, llmCalls, routingMethod }) {
  if (!trace?.length) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-3 rounded-2xl border border-white/8 bg-black/30 backdrop-blur-sm overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/5">
        <span className="text-[10px] font-mono uppercase tracking-widest text-white/30">
          Agent Trace
        </span>
        <div className="flex items-center gap-3 text-[10px] font-mono text-white/25">
          <span className="text-white/40 font-medium">{totalMs}ms</span>
          <span>·</span>
          <span>{llmCalls} LLM {llmCalls === 1 ? "call" : "calls"}</span>
          <span>·</span>
          <span>{routingMethod}</span>
        </div>
      </div>

      {/* Steps */}
      <div className="p-3 flex flex-wrap gap-2">
        <AnimatePresence>
          {trace.map((step, i) => {
            const m = META[step.layer] ?? { icon: Brain, color: "#6366f1", label: step.layer };
            const Icon = m.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.04 }}
                className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-mono border"
                style={{
                  borderColor: `${m.color}25`,
                  backgroundColor: `${m.color}10`,
                  color: m.color,
                }}
              >
                <Icon size={10} />
                <span>{m.label}</span>
                {step.agents?.length > 0 && (
                  <span style={{ color: `${m.color}80` }}>
                    → {step.agents.join(",")}
                  </span>
                )}
                {step.success === true && <CheckCircle size={9} className="text-green-400" />}
                {step.success === false && <XCircle size={9} className="text-red-400" />}
                <span style={{ color: `${m.color}60` }}>{step.ms}ms</span>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}