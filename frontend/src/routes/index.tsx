import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { WelcomeScreen } from "@/components/interview/WelcomeScreen";
import { CandidatePicker } from "@/components/interview/CandidatePicker";
import { InterviewRoom } from "@/components/interview/InterviewRoom";
import { useInterview, MIN_QUESTIONS } from "@/hooks/useInterview";
import { apiMode, apiEndpoint } from "@/services/interviewApi";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AI Technical Interview — ABTalks AI Cohort" },
      {
        name: "description",
        content:
          "Personalised AI technical interviewer for the ABTalks 31-day AI Cohort. Multi-turn interviews with adaptive follow-ups and structured feedback.",
      },
      { property: "og:title", content: "AI Technical Interview — ABTalks AI Cohort" },
      {
        property: "og:description",
        content:
          "Run a personalised, multi-turn AI technical interview based on a candidate's cohort learning journey.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const iv = useInterview();
  const [started, setStarted] = useState(false);

  const handleRestart = () => {
    iv.reset();
    setStarted(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {iv.sessionId && iv.candidate ? (
        <InterviewRoom
          candidateName={iv.candidate.name}
          sessionId={iv.sessionId}
          messages={iv.messages}
          pending={iv.pending}
          done={iv.done}
          error={iv.error}
          feedback={iv.feedback}
          questionsAsked={iv.questionsAsked}
          minQuestions={MIN_QUESTIONS}
          daysCovered={iv.daysCovered}
          onSend={iv.send}
          onRestart={handleRestart}
        />
      ) : !started ? (
        <WelcomeScreen onStart={() => setStarted(true)} />
      ) : (
        <>
          <CandidatePicker onStart={iv.start} pending={iv.pending} />
          {iv.error && (
            <p role="alert" className="mx-auto max-w-5xl px-5 pb-6 text-sm text-destructive">
              {iv.error}
            </p>
          )}
          <footer className="mx-auto max-w-5xl px-5 pb-10 font-mono text-[11px] text-muted-foreground">
            API: POST {apiEndpoint} · mode: {apiMode}
          </footer>
        </>
      )}
    </div>
  );
}
