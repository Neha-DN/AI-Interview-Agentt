import { cn } from "@/lib/utils";

export function InterviewProgress({
  candidateName,
  questionsAsked,
  minQuestions,
  daysCovered,
  sessionId,
  done,
  domain,
  interviewType,
  difficulty,
}: {
  candidateName: string;
  questionsAsked: number;
  minQuestions: number;
  daysCovered: number[];
  sessionId: string;
  done: boolean;
  domain?: string;
  interviewType?: string;
  difficulty?: string;
}) {
  const current = Math.max(1, questionsAsked);
  const pct = done ? 100 : Math.min(100, (current / minQuestions) * 100);

  const typeDisplay =
    interviewType === "behavioral"
      ? "HR / Behavioral"
      : interviewType === "mixed"
        ? "Mixed Interview"
        : "Technical Interview";

  return (
    <header className="sticky top-0 z-10 border-b border-border bg-background/90 backdrop-blur-md">
      <div className="mx-auto w-full max-w-3xl px-5 py-3">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="truncate text-sm font-semibold text-foreground">
                {typeDisplay} · {candidateName}
              </h1>
              {domain && (
                <span className="hidden sm:inline-block rounded border border-border/80 bg-secondary px-1.5 py-0.2 font-mono text-[10px] text-secondary-foreground">
                  {domain}
                </span>
              )}
              {difficulty && (
                <span className="hidden sm:inline-block rounded border border-accent/30 bg-accent/10 px-1.5 py-0.2 font-mono text-[10px] font-semibold text-accent capitalize">
                  {difficulty}
                </span>
              )}
            </div>
            <p className="mt-0.5 truncate font-mono text-[11px] text-muted-foreground">
              session {sessionId.slice(0, 8)}
            </p>
          </div>

          <div className="text-right">
            <p className="font-mono text-xs text-muted-foreground">
              {done ? (
                <span className="font-semibold text-accent">Interview Completed</span>
              ) : (
                <>
                  Question <span className="font-semibold text-foreground">{current}</span> of{" "}
                  {minQuestions}
                </>
              )}
            </p>
          </div>
        </div>

        <div className="mt-2.5 h-1 overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full bg-accent transition-all duration-700 ease-out"
            style={{ width: `${pct}%` }}
            role="progressbar"
            aria-valuenow={Math.min(current, minQuestions)}
            aria-valuemin={0}
            aria-valuemax={minQuestions}
            aria-label="Interview progress"
          />
        </div>

        {daysCovered.length > 0 && (
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <span className="font-mono text-[10px] uppercase text-muted-foreground">
              Topics Covered:
            </span>
            {daysCovered.map((d) => (
              <span
                key={d}
                className={cn(
                  "rounded border border-accent/30 bg-accent/10 px-1.5 py-0.5 font-mono text-[10px] font-medium text-accent",
                )}
              >
                Day {d}
              </span>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
