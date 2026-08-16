# AI Interview Agent Integration Guide

This document provides the technical integration specification for Member 2 (Backend Developer) and the wider ABTalks team to integrate the AI Interview Agent with the FastAPI / Node.js backend.

---

## 1. AI Agent File Structure

All AI agent logic and data reside inside the `ai-agent/` directory:

```
ai-agent/
├── interview_engine.py   # Main entry point & turn orchestrator
├── question_generator.py # Gemini-powered adaptive question/follow-up generator
├── answer_evaluator.py   # Technical accuracy, depth & gap evaluator
├── context_manager.py    # Session state & context manager (persisted)
├── feedback_generator.py # Final feedback compiler
├── candidates.json       # Official candidate profiles
├── curriculum.json       # Official 31-day curriculum
├── test_agent.py         # Standalone simulation test script
└── README.md             # Architecture overview & documentation
```

---

## 2. How the Backend Interacts with the AI Agent

The AI Agent is designed for two integration modes:

### Mode A: Direct Python Import (FastAPI Backend)
In a Python/FastAPI environment, the backend imports the agent entry point directly:

```python
from ai_agent.interview_engine import process_interview_turn

# Process request payload directly
response = process_interview_turn(payload_dict)
```

### Mode B: CLI / Subprocess Execution (Node.js or External Backends)
In a Node.js Express or external runner environment, the backend invokes the agent via standard I/O:

```bash
python3 ai-agent/interview_engine.py -
```
*(Receives request JSON on `stdin` and outputs response JSON to `stdout`)*

---

## 3. Current HTTP Endpoint

```
POST /api/interview
```

> **Note on Implementation:** `POST /api/interview` is the **CURRENT** HTTP endpoint implemented in `server.ts` that bridges incoming HTTP requests to `interview_engine.py`. The official Technical Specification document provided by the organizers defines this standard endpoint for the interview service.

---

## 4. HTTP Method

`POST`

---

## 5. Request JSON: Starting an Interview

To initialize a new interview session, pass the `sessionId` and the full candidate object (matching `candidates.json`):

```json
POST /api/interview
Content-Type: application/json

{
  "sessionId": "session-abc-123",
  "candidate": {
    "member": {
      "id": "CAND-001",
      "name": "Sarah Johnson",
      "jobRole": "Senior Data Engineer",
      "yearsExperience": 9,
      "education": "MS Computer Science",
      "status": "COMPLETED"
    },
    "missions": [
      { "day": 7, "title": "Embeddings Explained", "passed": true, "attempts": 1 },
      { "day": 8, "title": "Vector Databases Overview", "passed": true, "attempts": 1 }
    ],
    "signals": { "commitDays": 28, "missionsCompleted": 30, "missionsFirstTry": 20 }
  }
}
```

---

## 6. Request JSON: Submitting a Candidate Answer

For every subsequent conversation turn, pass the same `sessionId` and the candidate's latest response in `message`:

```json
POST /api/interview
Content-Type: application/json

{
  "sessionId": "session-abc-123",
  "message": "Vector embeddings convert unstructured text into dense floating-point numerical vectors capturing semantic relationships."
}
```

---

## 7. Response JSON Format

### In-Progress Interview Response (`done: false`)
```json
{
  "reply": "Question 2 (Day 7 - Embeddings Explained): Taking your explanation further, how would you optimize or scale this architecture under high load?",
  "done": false
}
```

### Completed Interview Response (`done: true`)
```json
{
  "reply": "Thank you for completing the technical interview! Your responses have been evaluated.",
  "done": true,
  "feedback": {
    "summary": "Sarah Johnson completed a technical interview covering 4 curriculum days with 8 questions. Overall performance score was 7.5/10.",
    "strengths": [
      "Demonstrated clear understanding of dense vector embeddings and HNSW indexing",
      "Solid knowledge of containerized deployment using Docker and Kubernetes"
    ],
    "gaps": [
      "Could provide deeper architectural details regarding Model Context Protocol (MCP)"
    ],
    "next": [
      "Review Day 23: Model Context Protocol (MCP)",
      "Practice LangChain multi-agent orchestration tools"
    ]
  }
}
```

---

## 8. How `sessionId` Works

- `sessionId` is a unique string (e.g., UUID or session token) created by the caller/backend.
- The `ContextManager` uses `sessionId` to load and persist conversation state.
- All turns sharing the same `sessionId` inherit full history, past evaluations, and curriculum coverage.

---

## 9. How Candidate Information is Passed

- Candidate information is passed in the initial request under the `candidate` key.
- The agent extracts candidate role, experience level, and completed/skipped mission history to customize question difficulty and select relevant topics.

---

## 10. How Conversation Context is Maintained

- The agent stores question history, candidate answers, answer evaluations, curriculum days covered, and current topic pointers per `sessionId`.
- Adaptive follow-up logic evaluates previous answers:
  - **Weak Answer**: Triggers a clarifying / foundational follow-up question.
  - **Strong Answer**: Triggers a deeper technical or architectural probe.
- Ensures at least **8 questions** are asked and at least **4 curriculum days** are covered before marking `done: true`.

---

## 11. How the Backend Knows the Interview is Complete

The backend checks the `done` boolean field in the JSON response:
- `done: false` -> Continue conversation by asking the candidate for another response.
- `done: true` -> The interview is finished; extract and display the `feedback` object.

---

## 12. Final Feedback Structure

Matching the official Technical Specification:

| Field | Type | Description |
|---|---|---|
| `summary` | string | Narrative evaluation of overall performance |
| `strengths` | string[] | Bullet points of key demonstrated technical strengths |
| `gaps` | string[] | Bullet points of identified knowledge gaps or misconceptions |
| `next` | string[] | Actionable recommendations and curriculum days to revise |

---

## 13. Required Environment Variables

- `GEMINI_API_KEY`: Required for Gemini model API requests. Read from `os.environ.get("GEMINI_API_KEY")`.

---

## 14. Commands to Run the Agent Locally

### Option A: Standard Full App Server (Express + Python Agent)
```bash
npm run dev
```
Starts the server at `http://localhost:3000`.

### Option B: Standalone Python Agent Simulation
```bash
python3 ai-agent/test_agent.py
```
Runs a complete 8+ question interview simulation directly in terminal.

---

## 15. Testing the Agent Using `curl`

### Step 1: Start Interview
```bash
curl -X POST http://localhost:3000/api/interview \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "curl-test-session-001",
    "candidate": {
      "member": {
        "id": "CAND-001",
        "name": "Sarah Johnson",
        "jobRole": "Senior Data Engineer",
        "yearsExperience": 9,
        "education": "MS Computer Science"
      },
      "missions": [
        { "day": 7, "title": "Embeddings Explained", "passed": true }
      ]
    }
  }'
```

### Step 2: Submit Candidate Answer
```bash
curl -X POST http://localhost:3000/api/interview \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "curl-test-session-001",
    "message": "Vector embeddings convert text into dense vectors for similarity search."
  }'
```
