# AI Interview Agent (ABTalks Hackathon)

An intelligent, adaptive technical interview engine powered by Gemini LLM, built for the ABTalks hackathon.

---

## 🏗️ Architecture Overview

The AI Agent is modularly structured into five core Python components:

```
ai-agent/
├── interview_engine.py   # Central orchestrator & FastAPI backend adapter
├── question_generator.py # Gemini-powered adaptive question/follow-up generator
├── answer_evaluator.py   # LLM answer quality, technical depth & gap evaluator
├── context_manager.py    # Conversation state & session memory manager
├── feedback_generator.py # Final feedback compiler (matches official API schema)
├── candidates.json       # Official candidate profiles
├── curriculum.json       # Official 31-day curriculum
├── test_agent.py         # End-to-end standalone simulation test script
└── README.md             # Complete technical & integration documentation
```

---

## 💾 1. Conversation State Representation

Each session maintains state in a structured session object (`session_state`):

```python
{
  "session_id": "abc-123",
  "candidate_id": "CAND-001",
  "candidate": { ... }, # Full profile from candidates.json
  "completed_curriculum_days": [7, 8, 10, 12, 16, 22, 23, 28, 31],
  "topics_already_covered": ["Vector Databases", "Prompt Engineering"],
  "questions_already_asked": [
    {"number": 1, "question": "...", "day": 7, "topic": "Embeddings Explained"}
  ],
  "candidate_answers": ["..."],
  "answer_evaluations": [
    {
      "rating": "strong",
      "score": 8,
      "technical_depth": "intermediate",
      "key_strengths": ["..."],
      "gaps_or_misconceptions": ["..."],
      "suggested_next_direction": "deeper_probe"
    }
  ],
  "current_question_number": 1,
  "curriculum_days_covered": [7],
  "conversation_history": [ ... ],
  "final_performance_summary": None,
  "is_completed": False
}
```

---

## 👤 2. Candidate Profile Usage

The agent inspects candidate attributes from `candidates.json`:
- **Job Role & Experience**: Tailors vocabulary and technical expectations (e.g., Senior Data Engineer vs Junior Developer).
- **Missions & Attempt Counts**: Focuses on days where attempts were high (e.g., 4 or 5 attempts) to check for lingering misconceptions, or skipped days to verify knowledge.
- **Commit Signals**: Adapts interviewing tone and scenario depth.

---

## 📚 3. Curriculum Information Usage

The agent maps questions to `curriculum.json`:
- Tracks **31 curriculum days** across **8 modules**.
- Extracts specific tools (e.g., `ChromaDB`, `FastAPI`, `MCP`, `Docker`) and objectives for targeted scenario questions.
- Tracks `curriculum_days_covered` to guarantee broad topic coverage.

---

## 🧠 4. Next Question Decision Logic

Rather than using a fixed questionnaire, the agent decides dynamically:

$$\text{Candidate Profile} + \text{Curriculum} + \text{Previous Answer} + \text{Answer Evaluation} \Rightarrow \text{Next Question}$$

- **Weak Answer** ($\text{Score} < 5$ or `rating == 'weak'`): Generates a clarifying or foundational follow-up on the same topic.
- **Strong Answer** ($\text{Score} \ge 8$ or `rating == 'strong'`): Generates a deeper technical or edge-case probe.
- **Topic Complete**: Moves to an unvisited curriculum day to ensure broad evaluation.

---

## 🎯 5. Constraint Enforcement (8+ Questions, 4+ Days)

The interview completion condition requires **both** criteria:
1. `current_question_number >= 8`
2. `len(curriculum_days_covered) >= 4`

If `done=True` is requested before meeting both conditions, `InterviewEngine` enforces additional questions, selecting unvisited curriculum days if needed.

---

## 📊 6. Final Feedback Generation

When the completion criteria are met, `feedback_generator.py` compiles the final evaluation matching the official Technical Specification:

```json
{
  "summary": "Detailed narrative of candidate technical performance across all turns...",
  "strengths": ["Clear explanation of dense retrieval", "Solid understanding of Docker multi-stage builds"],
  "gaps": ["Lacks hands-on experience with Model Context Protocol (MCP)"],
  "next": ["Review Day 23: Model Context Protocol (MCP)", "Practice LangChain agent tools"]
}
```

---

## ⚡ 7. Backend Integration Guide

### Required Function / Interface for FastAPI Backend
The backend calls `process_interview_turn` in `interview_engine.py`:

```python
from ai-agent.interview_engine import process_interview_turn

# 1. Start Interview
response = process_interview_turn({
    "sessionId": "abc-123",
    "candidate": candidate_data  # From candidates.json
})
# Returns: {"reply": "Welcome...", "done": False}

# 2. Subsequent Turns
response = process_interview_turn({
    "sessionId": "abc-123",
    "message": "Candidate's response..."
})
# Returns: {"reply": "Next question...", "done": False}
# OR when complete:
# Returns: {"reply": "Interview completed.", "done": True, "feedback": {...}}
```

### Environment Variables
- `GEMINI_API_KEY`: Required for Gemini API calls. Read directly from `os.environ.get("GEMINI_API_KEY")`.

---

## 🧪 8. Standalone Testing

Run the simulation script directly:

```bash
python3 ai-agent/test_agent.py
```
