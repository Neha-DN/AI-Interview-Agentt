import { cn } from "@/lib/utils";

export function InterviewProgress({
  candidateName,
  questionsAsked,
  minQuestions,
  daysCovered,
  sessionId,
  done,
}: {
  candidateName: string;
  questionsAsked: number;
  minQuestions: number;
  daysCovered: number[];
  sessionId: string;
  done: boolean;
}) {
  const current = Math.max(1, questionsAsked);
  const pct = done ? 100 : Math.min(100, (current / minQuestions) * 100);

  return (
    <header className="sticky top-0 z-10 border-b border-border bg-background/85 backdrop-blur-sm">
      <div className="mx-auto w-full max-w-3xl px-5 py-3.5">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
          <div className="min-w-0">
            <h1 className="truncate text-sm font-medium text-foreground">
              Technical interview · {candidateName}
            </h1>
            <p className="mt-0.5 truncate font-mono text-[11px] text-muted-foreground">
              session {sessionId.slice(0, 8)}
            </p>
          </div>
          <p className="font-mono text-xs text-muted-foreground">
            {done ? (
              <span className="text-accent">Completed</span>
            ) : (
              <>
                Question <span className="text-foreground">{current}</span> of {minQuestions}+
              </>
            )}
          </p>
        </div>

        <div className="mt-2.5 h-0.5 overflow-hidden rounded-full bg-secondary">
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

        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
          <span className="font-mono text-[11px] text-muted-foreground">Days covered:</span>
          {daysCovered.length === 0 ? (
            <span className="font-mono text-[11px] text-muted-foreground">—</span>
          ) : (
            daysCovered.map((d) => (
              <span
                key={d}
                className={cn(
                  "rounded border border-accent/30 bg-accent/10 px-1.5 py-0.5 font-mono text-[11px] text-accent",
                )}
              >
                Day {d}
              </span>
            ))
          )}
        </div>
      </div>
    </header>
  );
}
