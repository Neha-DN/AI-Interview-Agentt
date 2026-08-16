import { useEffect, useRef } from "react";
import { InterviewProgress } from "./InterviewProgress";
import { MessageBubble, ThinkingIndicator } from "./MessageBubble";
import { AnswerComposer } from "./AnswerComposer";
import { FeedbackPanel } from "./FeedbackPanel";
import type { ChatMessage, InterviewFeedback } from "@/services/types";

export function InterviewRoom({
  candidateName,
  sessionId,
  messages,
  pending,
  done,
  error,
  feedback,
  questionsAsked,
  minQuestions,
  daysCovered,
  domain,
  interviewType,
  difficulty,
  onSend,
  onRestart,
}: {
  candidateName: string;
  sessionId: string;
  messages: ChatMessage[];
  pending: boolean;
  done: boolean;
  error: string | null;
  feedback: InterviewFeedback | null;
  questionsAsked: number;
  minQuestions: number;
  daysCovered: number[];
  domain?: string;
  interviewType?: string;
  difficulty?: string;
  onSend: (text: string) => void;
  onRestart: () => void;
}) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length, pending, done]);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <InterviewProgress
        candidateName={candidateName}
        questionsAsked={questionsAsked}
        minQuestions={minQuestions}
        daysCovered={daysCovered}
        sessionId={sessionId}
        done={done}
        domain={domain}
        interviewType={interviewType}
        difficulty={difficulty}
      />

      <main className="flex-1">
        <div className="mx-auto w-full max-w-3xl space-y-6 px-5 py-8">
          {messages.map((m) => (
            <MessageBubble key={m.id} message={m} />
          ))}
          {pending && <ThinkingIndicator />}
          {error && (
            <p
              role="alert"
              className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
            >
              {error}
            </p>
          )}
        </div>

        {done && feedback && (
          <FeedbackPanel
            feedback={feedback}
            candidateName={candidateName}
            daysCovered={daysCovered}
            questionsAsked={questionsAsked}
            onRestart={onRestart}
          />
        )}
        <div ref={endRef} />
      </main>

      {!done && (
        <div className="sticky bottom-0 z-20">
          <AnswerComposer onSend={onSend} disabled={done} pending={pending} />
        </div>
      )}
    </div>
  );
}
