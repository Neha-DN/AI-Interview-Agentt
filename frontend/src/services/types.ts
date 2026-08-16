/**
 * Types for the AI Interview Agent.
 * Compatible with the official contract for POST /api/interview with rich extensions
 * for interview type, domain, difficulty, turn evaluation, scores, and practice drills.
 */

export type InterviewType = "technical" | "behavioral" | "mixed";
export type DifficultyLevel = "beginner" | "intermediate" | "advanced";

export type CandidateMember = {
  id?: string;
  name: string;
  jobRole?: string;
  field?: string;
  domain?: string;
  yearsExperience?: number;
  education?: string;
  focusAreas?: string[];
  skills?: string[];
};

export type Candidate = {
  id: string;
  name: string;
  role?: string;
  field?: string;
  domain?: string;
  skills?: string[];
  interviewType?: InterviewType;
  difficulty?: DifficultyLevel;
  focusAreas?: string[];
  notes?: string;
  daysCompleted?: number;
  member?: CandidateMember;
  missions?: Array<{ day: number; passed: boolean; score: number }>;
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

export type AnswerEvaluation = {
  relevance: number; // 1-10
  clarity: number; // 1-10
  technicalKnowledge: number; // 1-10 (or domain knowledge)
  communication: number; // 1-10
  rating?: "strong" | "moderate" | "weak";
  feedbackNote: string;
  strengths?: string[];
  gaps?: string[];
};

export type ScoreBreakdown = {
  overallScore: number; // 1-100
  technicalKnowledge: number; // 1-100
  communication: number; // 1-100
  answerRelevance: number; // 1-100
  problemSolving: number; // 1-100
  performanceTier?: "Exceptional" | "Strong Hire" | "Solid Competency" | "Needs Practice";
};

export type PracticeQuestion = {
  id: string;
  topic: string;
  question: string;
  context?: string;
  keyPointsToInclude: string[];
};

export type WeakAreaPractice = {
  weakAreaTitle: string;
  weakAreaDescription: string;
  recommendedFocus: string;
  questions: PracticeQuestion[];
};

export type InterviewFeedback = {
  summary: string;
  strengths: string[];
  gaps: string[];
  next: string[];
  scores?: ScoreBreakdown;
  weakAreaPractice?: WeakAreaPractice;
  answerEvaluations?: AnswerEvaluation[];
};

export type InterviewResponse = {
  reply: string;
  done: boolean;
  feedback?: InterviewFeedback;
  evaluation?: AnswerEvaluation;
};

/** UI-only model. Never sent to the backend. */
export type ChatMessage = {
  id: string;
  role: "interviewer" | "candidate";
  content: string;
  at: number;
  evaluation?: AnswerEvaluation;
};
