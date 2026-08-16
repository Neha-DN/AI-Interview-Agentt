import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, MessagesSquare, Target, SlidersHorizontal } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const BENEFITS: { title: string; body: string; icon: LucideIcon }[] = [
  {
    title: "Tailored Types & Domains",
    body: "Choose Technical, HR/Behavioral, or Mixed interviews across AI/ML, Web Dev, Data, or Custom tracks.",
    icon: SlidersHorizontal,
  },
  {
    title: "Real-Time Turn Evaluation",
    body: "Receive live feedback on relevance, clarity, technical depth, and communication on every response.",
    icon: MessagesSquare,
  },
  {
    title: "100-Point Score & Detailed Assessment",
    body: "Get a comprehensive score breakdown across 4 categories, demonstrated strengths, and actionable gap analysis.",
    icon: Target,
  },
];

const DOMAIN_PILLS = [
  "AI & Agentic Systems",
  "RAG & Embeddings",
  "Full-Stack Web Dev",
  "Data Analytics & SQL",
  "Distributed Systems",
  "Behavioral (STAR)",
];

export function WelcomeScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="animate-fade-up mx-auto w-full max-w-5xl px-5 py-12 sm:py-16">
      <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-accent">
        <Sparkles className="size-4" />
        <span>Next-Gen Interview Intelligence</span>
      </div>

      <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
        AI Interview Agent Simulator
      </h1>

      <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
        Practice realistic, multi-turn technical and behavioral interviews calibrated to your exact
        domain, skill level, and difficulty. Get instant answer scoring and comprehensive evaluation
        reports.
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        {BENEFITS.map(({ title, body, icon: Icon }) => (
          <section key={title} className="rounded-xl border border-border bg-card p-5 shadow-xs">
            <h2 className="flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-wider text-accent">
              <Icon className="size-4" />
              {title}
            </h2>
            <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">{body}</p>
          </section>
        ))}
      </div>

      <div className="mt-10 border-t border-border pt-6">
        <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
          Supported Domains &amp; Specializations
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {DOMAIN_PILLS.map((t) => (
            <span
              key={t}
              className="rounded-md border border-border bg-secondary/60 px-3 py-1 font-mono text-xs text-foreground"
            >
              {t}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-10 flex flex-wrap items-center gap-4">
        <Button size="lg" onClick={onStart} className="gap-2 font-semibold shadow-sm">
          Setup &amp; Start Interview
          <ArrowRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
