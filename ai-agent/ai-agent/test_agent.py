"""
test_agent.py
Simulates a complete 8+ question technical interview for a candidate without requiring a frontend or external HTTP server.
"""

import os
import json
import uuid
from interview_engine import InterviewEngine

def run_simulated_interview():
    print("=" * 70)
    print("ABTalks AI Interview Agent - Full Simulation Test")
    print("=" * 70)

    engine = InterviewEngine()

    # 1. Load candidate from candidates.json
    candidate = engine.get_candidate_by_id("CAND-001")
    if not candidate:
        print("Candidate CAND-001 not found!")
        return

    member = candidate["member"]
    print(f"\n[1] Selected Candidate:")
    print(f"    ID: {member['id']}")
    print(f"    Name: {member['name']}")
    print(f"    Role: {member['jobRole']} ({member['yearsExperience']} years exp)")
    print(f"    Education: {member['education']}")

    # 2. Start Interview Session
    session_id = f"test-session-{uuid.uuid4().hex[:6]}"
    print(f"\n[2] Starting Interview Session ID: {session_id}")

    start_payload = {
        "sessionId": session_id,
        "candidate": candidate
    }

    response = engine.process_turn(start_payload)
    print(f"\nAI Agent Reply:\n{response['reply']}")
    print(f"Done Status: {response['done']}")

    # Simulated candidate responses (mix of strong, moderate, and weak answers to test adaptivity)
    simulated_answers = [
        # Response to Q1 (Vector DBs / Embeddings)
        "Vector embeddings convert unstructured text into dense numerical floating-point vectors capturing semantic relationships. Vector databases store these embeddings and use similarity search algorithms like HNSW or Cosine Similarity for fast retrieval.",
        
        # Response to Q2 (Follow-up or RAG)
        "To handle chunking for RAG, I use recursive character text splitters with overlap around 200 tokens. This maintains contextual continuity across document boundaries.",
        
        # Response to Q3 (Multi-agent orchestration / MCP)
        "I have used basic LLM prompts, but I'm not very familiar with multi-agent orchestration like CrewAI or Model Context Protocol.",
        
        # Response to Q4 (Clarifying follow-up on Agentic AI / LangChain)
        "In LangChain, a ReAct agent combines reasoning and tool execution in a loop, evaluating thought-action-observation cycles until a final answer is determined.",
        
        # Response to Q5 (Prompt Engineering / Function calling)
        "Function calling allows the LLM to return structured JSON specifying tool names and arguments defined via Pydantic schemas, which are executed backend-side.",
        
        # Response to Q6 (Docker / Kubernetes Deployment)
        "We containerize Python applications using Docker multi-stage builds and deploy them to Kubernetes clusters using Helm charts, setting readiness and liveness probes.",
        
        # Response to Q7 (Monitoring & Observability)
        "I'm not sure about Prometheus metrics for LLMs.",
        
        # Response to Q8 (Capstone / Full-stack RAG integration)
        "For production RAG systems, I combine hybrid search (dense vector retrieval + sparse keyword BM25), streaming responses via Server-Sent Events, and token usage tracking."
    ]

    turn_index = 0
    while not response.get("done") and turn_index < len(simulated_answers):
        ans = simulated_answers[turn_index]
        print("\n" + "-" * 70)
        print(f"Turn {turn_index + 1} - Candidate Answer:")
        print(f'"{ans}"')

        turn_payload = {
            "sessionId": session_id,
            "message": ans
        }

        response = engine.process_turn(turn_payload)
        print(f"\nAI Agent Reply:\n{response['reply']}")
        print(f"Done Status: {response['done']}")

        turn_index += 1

    # Check final feedback if interview completed
    if response.get("done"):
        print("\n" + "=" * 70)
        print("INTERVIEW COMPLETED - FINAL STRUCTURED FEEDBACK")
        print("=" * 70)
        feedback = response.get("feedback", {})
        print(json.dumps(feedback, indent=2))

if __name__ == "__main__":
    run_simulated_interview()
