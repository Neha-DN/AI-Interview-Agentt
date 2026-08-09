import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, MessagesSquare, ClipboardList } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const BENEFITS: { title: string; body: string; icon: LucideIcon }[] = [
  {
    title: "Personalised",
    body: "Questions are drawn from the candidate's own learning journey through the cohort.",
    icon: Sparkles,
  },
  {
    title: "Adaptive",
    body: "The interviewer follows up on your answers instead of reading a fixed script.",
    icon: MessagesSquare,
  },
  {
    title: "Actionable",
    body: "You finish with a structured summary of strengths, gaps and next steps.",
    icon: ClipboardList,
  },
];

const TOPICS = [
  "RAG",
  "Vector Databases",
  "Prompt Engineering",
  "Agentic AI",
  "MCP",
  "AI Deployment",
];

export function WelcomeScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="animate-fade-up mx-auto w-full max-w-5xl px-5 py-14 sm:py-20">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">
        ABTalks · 31-Day AI Cohort
      </p>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        AI Interview Agent
      </h1>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
        A personalised technical interviewer for AI Cohort graduates. It asks adaptive questions,
        follows up on your answers, and closes with structured feedback.
      </p>

      <div className="mt-10 grid gap-3 sm:grid-cols-3">
        {BENEFITS.map(({ title, body, icon: Icon }) => (
          <section key={title} className="rounded-lg border border-border bg-card p-5">
            <h2 className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-accent">
              <Icon className="size-3.5" />
              {title}
            </h2>
            <p className="mt-2.5 text-sm leading-6 text-muted-foreground">{body}</p>
          </section>
        ))}
      </div>

      <div className="mt-10 border-t border-border pt-6">
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
          31-Day AI Cohort
        </p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {TOPICS.map((t) => (
            <span
              key={t}
              className="rounded border border-border bg-secondary px-2 py-0.5 font-mono text-[11px] text-secondary-foreground"
            >
              {t}
            </span>
          ))}
        </div>
      </div>

      <Button className="mt-10" size="lg" onClick={onStart}>
        Start Interview
        <ArrowRight className="size-4" />
      </Button>
    </div>
  );
}
