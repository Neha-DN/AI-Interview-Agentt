import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Candidate } from "@/services/types";
import candidatesData from "@/data/candidates.json";
import { ArrowRight, Check } from "lucide-react";

const candidates = candidatesData as Candidate[];

function meta(c: Candidate) {
  return {
    role: typeof c["role"] === "string" ? c["role"] : undefined,
    days: typeof c["daysCompleted"] === "number" ? c["daysCompleted"] : undefined,
    focus: Array.isArray(c["focusAreas"]) ? (c["focusAreas"] as string[]) : [],
    notes: typeof c["notes"] === "string" ? c["notes"] : undefined,
  };
}

export function CandidatePicker({
  onStart,
  pending,
}: {
  onStart: (c: Candidate) => void;
  pending: boolean;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = candidates.find((c) => c.id === selectedId) ?? null;

  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-14 sm:py-20">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">
        ABTalks · 31-Day AI Cohort
      </p>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        AI Technical Interview
      </h1>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
        Select a candidate to begin a personalised technical interview. Questions are drawn from the
        candidate&apos;s learning journey across the cohort curriculum.
      </p>

      <ul className="mt-10 grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Candidates">
        {candidates.map((c) => {
          const m = meta(c);
          const active = c.id === selectedId;
          return (
            <li key={c.id}>
              <button
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setSelectedId(c.id)}
                className={cn(
                  "group h-full w-full rounded-lg border bg-card p-5 text-left transition-all duration-200",
                  "hover:border-accent/60 hover:bg-card-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  active ? "border-accent ring-1 ring-accent/40" : "border-border",
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-base font-medium text-foreground">{c.name}</h2>
                    {m.role && <p className="mt-0.5 text-sm text-muted-foreground">{m.role}</p>}
                  </div>
                  <span
                    className={cn(
                      "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors",
                      active ? "border-accent bg-accent text-accent-foreground" : "border-border",
                    )}
                    aria-hidden
                  >
                    {active && <Check className="size-3" strokeWidth={3} />}
                  </span>
                </div>

                {m.days !== undefined && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between font-mono text-[11px] text-muted-foreground">
                      <span>Curriculum progress</span>
                      <span>{m.days}/31 days</span>
                    </div>
                    <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-secondary">
                      <div
                        className="h-full rounded-full bg-accent transition-all duration-500"
                        style={{ width: `${Math.min(100, (m.days / 31) * 100)}%` }}
                      />
                    </div>
                  </div>
                )}

                {m.focus.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {m.focus.map((f) => (
                      <span
                        key={f}
                        className="rounded border border-border bg-secondary px-2 py-0.5 font-mono text-[11px] text-secondary-foreground"
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                )}

                {m.notes && (
                  <p className="mt-4 border-t border-border pt-3 text-xs leading-relaxed text-muted-foreground">
                    {m.notes}
                  </p>
                )}
              </button>
            </li>
          );
        })}
      </ul>

      <div className="mt-10 flex flex-wrap items-center gap-4">
        <Button
          size="lg"
          disabled={!selected || pending}
          onClick={() => selected && onStart(selected)}
        >
          {pending ? "Starting interview…" : "Start interview"}
          {!pending && <ArrowRight className="size-4" />}
        </Button>
        <p className="text-xs text-muted-foreground">
          {selected ? `Interviewing ${selected.name}` : "Select a candidate to continue"}
        </p>
      </div>
    </div>
  );
}
