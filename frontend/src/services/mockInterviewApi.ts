/**
 * Temporary mock of the AI Interview Agent, used for frontend development only.
 * It implements the EXACT official contract for POST /api/interview so that
 * switching to the real FastAPI backend is a single env-var change.
 *
 * Session state lives in memory, keyed by sessionId — same as the backend.
 */
import type { InterviewRequest, InterviewResponse } from "./types";

type MockSession = {
  turn: number;
  answers: string[];
  candidateName: string;
};

const sessions = new Map<string, MockSession>();

/** 8 questions across 5 curriculum days (Day tags are echoed in the reply text
 *  exactly as the real agent is expected to do). */
const SCRIPT: string[] = [
  "[Day 3] Let's start with fundamentals. In your own words, what problem do embeddings solve that keyword search cannot, and how would you explain vector similarity to a non-technical stakeholder?",
  "[Day 3] Follow-up: you mentioned similarity. If two embeddings have a high cosine similarity but the documents are unrelated, what would you check first?",
  "[Day 8] Moving to retrieval. Walk me through how you would chunk a 200-page PDF for a RAG pipeline. What chunk size and overlap would you pick, and why?",
  "[Day 8] Suppose retrieval returns the right chunk but the model still answers incorrectly. How do you isolate whether the failure is retrieval, prompt, or model?",
  "[Day 14] Let's talk prompting. Describe a case where few-shot prompting outperformed fine-tuning for you, and where you would flip that decision.",
  "[Day 19] Agents next. What is the practical difference between a tool-calling loop and a fixed chain, and what failure mode worries you most in production?",
  "[Day 19] Follow-up: how would you bound an agent that keeps calling the same tool repeatedly?",
  "[Day 26] Finally, evaluation. How would you measure whether this interview agent is actually good? Name two concrete metrics and how you'd collect them.",
];

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function mockInterview(body: InterviewRequest): Promise<InterviewResponse> {
  await delay(700 + Math.random() * 600);

  if ("candidate" in body) {
    const name = String((body.candidate as { name?: unknown })?.name ?? "there").split(" ")[0] ?? "there";
    sessions.set(body.sessionId, { turn: 0, answers: [], candidateName: name });
    return {
      reply: `Welcome ${name}. I'm your technical interviewer for the 31-day AI Cohort review. We'll go through about eight questions across several curriculum days. Answer in as much depth as you like — I'll follow up where it's interesting.\n\n${SCRIPT[0]}`,
      done: false,
    };
  }

  const session = sessions.get(body.sessionId);
  if (!session) {
    return { reply: "Session not found. Please start a new interview.", done: true };
  }

  session.answers.push(body.message);
  session.turn += 1;

  if (session.turn < SCRIPT.length) {
    const ack =
      body.message.trim().length < 40
        ? "That's a start, but I'd like more depth as we go.\n\n"
        : "Good — that tracks with what I'd expect.\n\n";
    return { reply: ack + SCRIPT[session.turn], done: false };
  }

  const thorough = session.answers.filter((a) => a.trim().length > 120).length;
  return {
    reply: "Interview completed. Thanks for walking through those in detail — here's my assessment.",
    done: true,
    feedback: {
      summary: `${session.candidateName} completed an 8-question technical interview spanning Days 3, 8, 14, 19 and 26 of the AI Cohort curriculum. Answers showed working familiarity with embeddings and retrieval, with ${thorough >= 4 ? "consistently detailed" : "uneven"} depth on agent design and evaluation. Overall the candidate reasons practically about tradeoffs rather than reciting definitions.`,
      strengths: [
        "Explains embeddings and vector similarity in accessible, non-jargon terms",
        "Practical instinct for debugging RAG pipelines layer by layer",
        "Chooses prompting vs. fine-tuning based on cost and iteration speed",
      ],
      gaps: [
        "Evaluation methodology stays qualitative — few concrete offline metrics",
        "Limited discussion of guardrails and loop bounds for tool-calling agents",
        "Chunking strategy is rule-of-thumb rather than measured against retrieval recall",
      ],
      next: [
        "Revisit Day 26 and build a small eval harness with retrieval recall@k and answer faithfulness",
        "Implement a tool-calling agent with an explicit step budget and repeat-call detection",
        "Run an A/B on two chunking strategies and report the retrieval delta",
      ],
    },
  };
}
