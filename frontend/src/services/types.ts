/**
 * Types mirroring the OFFICIAL ABTalks API contract for POST /api/interview.
 * Do not rename any field in this file — the contract is fixed by the
 * Technical Specification and shared with backend + ai-agent.
 */

/** Opaque candidate profile. Shape is owned by the organizer-provided
 *  Candidate Profiles JSON — the frontend forwards it untouched. */
export type Candidate = {
  id: string;
  name: string;
  [key: string]: unknown;
};

export type InterviewStartRequest = {
  sessionId: string;
  candidate: Candidate;
};

export type InterviewTurnRequest = {
  sessionId: string;
  message: string;
};

export type InterviewRequest = InterviewStartRequest | InterviewTurnRequest;

export type InterviewFeedback = {
  summary: string;
  strengths: string[];
  gaps: string[];
  next: string[];
};

export type InterviewResponse = {
  reply: string;
  done: boolean;
  feedback?: InterviewFeedback;
};

/** UI-only model. Never sent to the backend. */
export type ChatMessage = {
  id: string;
  role: "interviewer" | "candidate";
  content: string;
  at: number;
};
