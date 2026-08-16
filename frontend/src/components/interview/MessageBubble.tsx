import { useState } from "react";
import { cn } from "@/lib/utils";
import type { ChatMessage, AnswerEvaluation } from "@/services/types";
import { Sparkles, ChevronDown, ChevronUp, CheckCircle, AlertCircle } from "lucide-react";

function EvaluationCard({ evaluation }: { evaluation: AnswerEvaluation }) {
  const [expanded, setExpanded] = useState(true);

  const avgScore = Math.round(
    ((evaluation.relevance +
      evaluation.clarity +
      evaluation.technicalKnowledge +
      evaluation.communication) /
      4) *
      10,
  );

  return (
    <div className="mt-2.5 overflow-hidden rounded-lg border border-border/80 bg-card text-card-foreground shadow-sm">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between bg-muted/40 px-3.5 py-2 text-left transition-colors hover:bg-muted/60"
      >
        <div className="flex items-center gap-2">
          <span className="flex size-4 items-center justify-center rounded-full bg-accent/20 text-accent">
            <Sparkles className="size-2.5" />
          </span>
          <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-accent">
            AI Answer Evaluation
          </span>
          <span
            className={cn(
              "rounded px-1.5 py-0.2 font-mono text-[10px] font-bold",
              avgScore >= 80
                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                : avgScore >= 60
                  ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                  : "bg-rose-500/15 text-rose-600 dark:text-rose-400",
            )}
          >
            {avgScore}/100
          </span>
        </div>

        <div className="flex items-center gap-1 font-mono text-[11px] text-muted-foreground">
          <span>{expanded ? "Hide" : "Details"}</span>
          {expanded ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
        </div>
      </button>

      {expanded && (
        <div className="p-3.5 space-y-3 text-xs border-t border-border/50">
          {/* 4 Core Evaluation Meters */}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 font-mono text-[11px]">
            <div className="rounded border border-border/60 bg-background/50 p-2">
              <div className="flex justify-between text-muted-foreground">
                <span>Relevance</span>
                <span className="font-bold text-foreground">{evaluation.relevance}/10</span>
              </div>
              <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full bg-accent"
                  style={{ width: `${(evaluation.relevance / 10) * 100}%` }}
                />
              </div>
            </div>

            <div className="rounded border border-border/60 bg-background/50 p-2">
              <div className="flex justify-between text-muted-foreground">
                <span>Clarity</span>
                <span className="font-bold text-foreground">{evaluation.clarity}/10</span>
              </div>
              <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full bg-accent"
                  style={{ width: `${(evaluation.clarity / 10) * 100}%` }}
                />
              </div>
            </div>

            <div className="rounded border border-border/60 bg-background/50 p-2">
              <div className="flex justify-between text-muted-foreground">
                <span>Tech Depth</span>
                <span className="font-bold text-foreground">
                  {evaluation.technicalKnowledge}/10
                </span>
              </div>
              <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full bg-accent"
                  style={{ width: `${(evaluation.technicalKnowledge / 10) * 100}%` }}
                />
              </div>
            </div>

            <div className="rounded border border-border/60 bg-background/50 p-2">
              <div className="flex justify-between text-muted-foreground">
                <span>Comms</span>
                <span className="font-bold text-foreground">{evaluation.communication}/10</span>
              </div>
              <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full bg-accent"
                  style={{ width: `${(evaluation.communication / 10) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Feedback Observation */}
          {evaluation.feedbackNote && (
            <p className="rounded border border-border/40 bg-secondary/30 px-3 py-2 text-[12px] leading-relaxed text-foreground">
              <strong className="text-accent font-semibold">Insight:</strong>{" "}
              {evaluation.feedbackNote}
            </p>
          )}

          {/* Strengths / Gaps if present */}
          {evaluation.strengths?.length || evaluation.gaps?.length ? (
            <div className="grid gap-2 sm:grid-cols-2 pt-1">
              {evaluation.strengths && evaluation.strengths.length > 0 && (
                <div className="space-y-1">
                  <span className="flex items-center gap-1 font-mono text-[10px] font-semibold uppercase text-emerald-600 dark:text-emerald-400">
                    <CheckCircle className="size-3" /> Key Strengths
                  </span>
                  <ul className="space-y-0.5 text-[11px] text-muted-foreground">
                    {evaluation.strengths.map((s, i) => (
                      <li key={i} className="line-clamp-1">
                        · {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {evaluation.gaps && evaluation.gaps.length > 0 && (
                <div className="space-y-1">
                  <span className="flex items-center gap-1 font-mono text-[10px] font-semibold uppercase text-amber-600 dark:text-amber-400">
                    <AlertCircle className="size-3" /> Area to Hone
                  </span>
                  <ul className="space-y-0.5 text-[11px] text-muted-foreground">
                    {evaluation.gaps.map((g, i) => (
                      <li key={i} className="line-clamp-1">
                        · {g}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

export function MessageBubble({ message }: { message: ChatMessage }) {
  const isInterviewer = message.role === "interviewer";

  return (
    <div className={cn("animate-fade-up", isInterviewer ? "" : "flex justify-end")}>
      {isInterviewer ? (
        <div className="max-w-2xl">
          <p className="mb-1.5 font-mono text-[11px] uppercase tracking-[0.16em] text-accent">
            AI Interviewer
          </p>
          <div className="whitespace-pre-wrap rounded-lg rounded-tl-sm border border-border/70 bg-card px-4 py-3.5 text-[15px] leading-7 text-foreground shadow-xs">
            {message.content}
          </div>
        </div>
      ) : (
        <div className="w-full max-w-2xl">
          <p className="mb-1.5 text-right font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
            Your Response
          </p>
          <div className="whitespace-pre-wrap rounded-lg rounded-tr-sm bg-primary px-4 py-3 text-[15px] leading-7 text-primary-foreground shadow-xs">
            {message.content}
          </div>

          {/* Turn Evaluation Card */}
          {message.evaluation && <EvaluationCard evaluation={message.evaluation} />}
        </div>
      )}
    </div>
  );
}

export function ThinkingIndicator() {
  return (
    <div className="animate-fade-up">
      <p className="mb-1.5 font-mono text-[11px] uppercase tracking-[0.16em] text-accent">
        AI Interviewer
      </p>
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground" aria-live="polite">
        <span className="size-1.5 animate-pulse rounded-full bg-accent [animation-delay:0ms]" />
        <span className="size-1.5 animate-pulse rounded-full bg-accent [animation-delay:150ms]" />
        <span className="size-1.5 animate-pulse rounded-full bg-accent [animation-delay:300ms]" />
        <span className="ml-1.5 font-mono text-xs">
          Analyzing response &amp; adapting follow-up…
        </span>
      </div>
    </div>
  );
}
