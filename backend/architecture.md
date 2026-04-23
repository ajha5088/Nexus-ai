User Query
    │
    ▼
┌─────────────────────────────────────────┐
│           LAYER 0: Cache                │  ← 0ms, no LLM
│     Exact match → instant return        │
└─────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────┐
│           LAYER 1: Safety               │  ← 0ms, no LLM
│     Block harmful / prompt injection    │
└─────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────┐
│        LAYER 2: Intent Classifier       │  ← rule-based, no LLM
│                                         │
│  keyword rules → assign intent score   │
│  "weather" → WEATHER_AGENT             │
│  "calculate" → MATH_AGENT             │
│  "search my docs" → RAG_AGENT         │
│  "research" → RESEARCH_AGENT          │
│  "code" → CODE_AGENT                  │
│  confidence > 0.8 → skip LLM router   │
└─────────────────────────────────────────┘
    │
    ├── high confidence → FORCED ROUTING (no LLM)
    │
    ▼ low confidence
┌─────────────────────────────────────────┐
│       LAYER 3: LLM Supervisor           │  ← 1 LLM call max
│                                         │
│   "Which agent(s) should handle this?" │
│   Returns: [AGENT_NAME, AGENT_NAME]    │
│   No answering — routing ONLY          │
└─────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────┐
│         LAYER 4: Agent Execution        │
│                                         │
│  ┌──────────┐  ┌──────────┐            │
│  │RAG Agent │  │Research  │            │
│  │          │  │Agent     │            │
│  └──────────┘  └──────────┘            │
│  ┌──────────┐  ┌──────────┐            │
│  │Code Agent│  │Weather   │            │
│  │          │  │Agent     │            │
│  └──────────┘  └──────────┘            │
│                                         │
│  Agents run in PARALLEL where possible │
└─────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────┐
│       LAYER 5: Synthesis (1 LLM call)   │  ← only 1 LLM call
│                                         │
│   All agent results → single summary   │
│   Clean, cited, formatted response     │
└─────────────────────────────────────────┘