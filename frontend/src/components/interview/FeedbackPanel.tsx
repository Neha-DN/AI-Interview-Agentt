import { Button } from "@/components/ui/button";
import type { InterviewFeedback } from "@/services/types";
import { CircleCheck, RotateCcw, TriangleAlert, Compass, FileText } from "lucide-react";
import type { LucideIcon } from "lucide-react";

function List({ title, items, icon: Icon }: { title: string; items: string[]; icon: LucideIcon }) {
  if (!items?.length) return null;
  return (
    <section className="rounded-lg border border-border bg-card p-5">
      <h3 className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-accent">
        <Icon className="size-3.5" />
        {title}
      </h3>
      <ul className="mt-3 space-y-2.5">
        {items.map((item, i) => (
          <li key={i} className="flex gap-2.5 text-sm leading-6 text-foreground">
            <span className="mt-2 size-1 shrink-0 rounded-full bg-accent" aria-hidden />
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}

export function FeedbackPanel({
  feedback,
  candidateName,
  daysCovered,
  questionsAsked,
  onRestart,
}: {
  feedback: InterviewFeedback;
  candidateName: string;
  daysCovered: number[];
  questionsAsked: number;
  onRestart: () => void;
}) {
  return (
    <div className="animate-fade-up mx-auto w-full max-w-3xl px-5 pb-16 pt-8">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">Interview complete</p>
      <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
        Assessment · {candidateName}
      </h2>

      <dl className="mt-5 flex flex-wrap gap-x-8 gap-y-2 border-y border-border py-3 font-mono text-[11px]">
        <div className="flex gap-2">
          <dt className="text-muted-foreground">Questions</dt>
          <dd className="text-foreground">{questionsAsked}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="text-muted-foreground">Curriculum days</dt>
          <dd className="text-foreground">
            {daysCovered.length ? daysCovered.map((d) => `Day ${d}`).join(" · ") : "—"}
          </dd>
        </div>
      </dl>

      <section className="mt-6 rounded-lg border border-border bg-card p-5">
        <h3 className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-accent">
          <FileText className="size-3.5" />
          Summary
        </h3>
        <p className="mt-3 text-[15px] leading-7 text-foreground">{feedback.summary}</p>
      </section>

      <div className="mt-6 grid gap-4">
        <List title="Strengths" items={feedback.strengths} icon={CircleCheck} />
        <List title="Gaps" items={feedback.gaps} icon={TriangleAlert} />
        <List title="Next steps" items={feedback.next} icon={Compass} />
      </div>

      <Button className="mt-8" size="lg" variant="outline" onClick={onRestart}>
        <RotateCcw className="size-4" />
        Start another interview
      </Button>
    </div>
  );
}
