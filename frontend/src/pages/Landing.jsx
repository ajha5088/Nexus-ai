import { useNavigate } from "react-router-dom";
import { ArrowRight, Zap, Brain, GitBranch, Layers } from "lucide-react";
import { motion } from "framer-motion";

const FEATURES = [
  {
    icon: Zap,
    color: "#f59e0b",
    title: "Rule-based routing",
    desc: "95% of queries resolved without touching the LLM. Sub-100ms responses.",
  },
  {
    icon: Brain,
    color: "#6366f1",
    title: "LLM Supervisor",
    desc: "Falls back to intelligent routing only for ambiguous queries.",
  },
  {
    icon: GitBranch,
    color: "#22c55e",
    title: "Parallel agents",
    desc: "Multiple specialized agents run simultaneously, results synthesized in one call.",
  },
  {
    icon: Layers,
    color: "#ec4899",
    title: "Agent trace",
    desc: "Full observability into every routing decision and agent execution.",
  },
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        width: "100%",
        minHeight: "100vh",
        backgroundColor: "#080810",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "64px 24px",
        boxSizing: "border-box",
        overflowX: "hidden",
      }}
    >
      {/* Full screen background glows */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div
          style={{
            background:
              "radial-gradient(ellipse at 50% 30%, rgba(99,102,241,0.12) 0%, transparent 70%)",
          }}
          className="absolute inset-0"
        />
        <div
          style={{
            background:
              "radial-gradient(ellipse at 20% 80%, rgba(139,92,246,0.08) 0%, transparent 60%)",
          }}
          className="absolute inset-0"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-4xl mx-auto flex flex-col items-center text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-4 py-1.5 text-xs text-indigo-400 mb-8 font-mono"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
          Multi-Agent Orchestration Platform
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-6xl sm:text-7xl font-black text-white mb-4 tracking-tighter leading-none"
        >
          Nexus{" "}
          <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">
            AI
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-white/35 text-base sm:text-lg mb-10 leading-relaxed"
        >
          The AI that knows which AI to use.
          <br />
          Minimum LLM calls. Maximum intelligence.
        </motion.p>

        {/* Features grid — full width of container */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10 w-full text-left"
        >
          {FEATURES.map(({ icon: Icon, color, title, desc }) => (
            <div
              key={title}
              className="rounded-2xl border border-white/5 bg-white/3 p-5 hover:bg-white/5 transition-colors"
            >
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center mb-3"
                style={{
                  backgroundColor: `${color}15`,
                  border: `1px solid ${color}25`,
                }}
              >
                <Icon size={15} style={{ color }} />
              </div>
              <p className="text-white/80 text-sm font-medium mb-1">{title}</p>
              <p className="text-white/30 text-xs leading-relaxed">{desc}</p>
            </div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          whileHover={{ scale: 1.02, y: -1 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate("/chat")}
          className="inline-flex items-center gap-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-8 py-4 text-sm font-semibold text-white shadow-2xl shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-shadow"
        >
          Launch Nexus AI
          <ArrowRight size={16} />
        </motion.button>
      </div>
    </div>
  );
}
