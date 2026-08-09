import { useCallback, useMemo, useState } from "react";
import { postInterview, InterviewApiError } from "@/services/interviewApi";
import type { Candidate, ChatMessage, InterviewFeedback } from "@/services/types";

/** Minimum number of interviewer questions per the Technical Specification. */
export const MIN_QUESTIONS = 8;

const newId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;

/** Curriculum days are surfaced by the agent inside the reply text
 *  (e.g. "[Day 8] ..."), since the contract exposes no separate field. */
function extractDays(text: string): number[] {
  return [...text.matchAll(/day\s*(\d{1,2})/gi)]
    .map((m) => Number(m[1]))
    .filter((n) => n >= 1 && n <= 31);
}

export function useInterview() {
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [feedback, setFeedback] = useState<InterviewFeedback | null>(null);
  const [done, setDone] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const append = useCallback((role: ChatMessage["role"], content: string) => {
    setMessages((prev) => [...prev, { id: newId(), role, content, at: Date.now() }]);
  }, []);

  const questionsAsked = messages.filter((m) => m.role === "interviewer").length;
  const answersGiven = messages.filter((m) => m.role === "candidate").length;

  const daysCovered = useMemo(() => {
    const set = new Set<number>();
    for (const m of messages) {
      if (m.role === "interviewer") extractDays(m.content).forEach((d) => set.add(d));
    }
    return [...set].sort((a, b) => a - b);
  }, [messages]);

  const start = useCallback(
    async (selected: Candidate) => {
      const id = newId();
      setCandidate(selected);
      setSessionId(id);
      setMessages([]);
      setFeedback(null);
      setDone(false);
      setError(null);
      setPending(true);
      try {
        const res = await postInterview({ sessionId: id, candidate: selected });
        append("interviewer", res.reply);
        setDone(res.done);
        if (res.feedback) setFeedback(res.feedback);
      } catch (e) {
        setError(e instanceof InterviewApiError ? e.message : "Unexpected error starting interview.");
        setSessionId(null);
        setCandidate(null);
      } finally {
        setPending(false);
      }
    },
    [append],
  );

  const send = useCallback(
    async (message: string) => {
      const text = message.trim();
      if (!text || !sessionId || pending || done) return;
      append("candidate", text);
      setError(null);
      setPending(true);
      try {
        const res = await postInterview({ sessionId, message: text });
        append("interviewer", res.reply);
        setDone(res.done);
        if (res.feedback) setFeedback(res.feedback);
      } catch (e) {
        setError(e instanceof InterviewApiError ? e.message : "Unexpected error sending answer.");
      } finally {
        setPending(false);
      }
    },
    [append, done, pending, sessionId],
  );

  const reset = useCallback(() => {
    setCandidate(null);
    setSessionId(null);
    setMessages([]);
    setFeedback(null);
    setDone(false);
    setError(null);
    setPending(false);
  }, []);

  return {
    candidate,
    sessionId,
    messages,
    feedback,
    done,
    pending,
    error,
    questionsAsked,
    answersGiven,
    daysCovered,
    start,
    send,
    reset,
  };
}
