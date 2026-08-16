import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { Candidate, InterviewType, DifficultyLevel } from "@/services/types";
import candidatesData from "@/data/candidates.json";
import {
  ArrowRight,
  Check,
  UserPlus,
  Users,
  Code2,
  Users2,
  Layers,
  Sparkles,
  Gauge,
  GraduationCap,
  ShieldCheck,
  Zap,
} from "lucide-react";

const PRESET_CANDIDATES = candidatesData as Candidate[];

const DOMAINS: Array<{
  id: string;
  name: string;
  desc: string;
  skills: string[];
}> = [
  {
    id: "AI/ML",
    name: "AI & Machine Learning",
    desc: "LLMs, RAG, Embeddings, Agents, Fine-Tuning, MLOps",
    skills: [
      "RAG & Retrieval",
      "Agentic AI & Tools",
      "Vector Databases",
      "Prompt Engineering",
      "Model Evaluation",
      "LoRA / Fine-Tuning",
      "PyTorch / Python",
      "MCP Protocols",
    ],
  },
  {
    id: "Web Development",
    name: "Web Development",
    desc: "React, Next.js, TypeScript, Full-Stack, APIs, Performance",
    skills: [
      "React & Next.js",
      "TypeScript",
      "State Management",
      "REST & GraphQL APIs",
      "Web Performance (CWV)",
      "Tailwind CSS",
      "SSR & Hydration",
      "Node.js / Express",
    ],
  },
  {
    id: "Data Analytics",
    name: "Data Analytics",
    desc: "SQL, Python, Business Intelligence, Data Pipelines, Metrics",
    skills: [
      "Advanced SQL",
      "Python / Pandas",
      "Data Warehousing",
      "BI & Tableau / PowerBI",
      "A/B Testing & Stats",
      "ETL Pipelines / dbt",
      "Metric Modeling",
      "Anomaly Detection",
    ],
  },
  {
    id: "Software Development",
    name: "Software Development",
    desc: "System Design, OOP, Microservices, CI/CD, Distributed Systems",
    skills: [
      "System Design",
      "OOP & Clean Code",
      "Microservices",
      "Concurrency & Async",
      "Database Optimization",
      "CI/CD & Docker",
      "Distributed Caching",
      "Event-Driven Architecture",
    ],
  },
  {
    id: "Other",
    name: "Other / Specialized",
    desc: "Custom domain and tailored specialization",
    skills: ["Domain Architecture", "Problem Solving", "Scalability", "Testing", "Security"],
  },
];

const INTERVIEW_TYPES: Array<{
  id: InterviewType;
  title: string;
  badge: string;
  description: string;
  icon: typeof Code2;
}> = [
  {
    id: "technical",
    title: "Technical Interview",
    badge: "Architecture & Code",
    description:
      "Deep dive into system design, technical trade-offs, algorithms, debugging, and domain mechanics.",
    icon: Code2,
  },
  {
    id: "behavioral",
    title: "HR / Behavioral",
    badge: "STAR & Culture",
    description:
      "Evaluates situational judgment, conflict resolution, leadership, communication, and team alignment.",
    icon: Users2,
  },
  {
    id: "mixed",
    title: "Mixed Interview",
    badge: "Comprehensive",
    description:
      "Balanced evaluation spanning core domain competency, architecture scenarios, and behavioral situational questions.",
    icon: Layers,
  },
];

const DIFFICULTY_LEVELS: Array<{
  id: DifficultyLevel;
  title: string;
  target: string;
  description: string;
  icon: typeof Zap;
}> = [
  {
    id: "beginner",
    title: "Beginner",
    target: "Foundations & Concepts",
    description:
      "Focus on clear fundamentals, key definitions, straightforward scenarios, and practical awareness.",
    icon: GraduationCap,
  },
  {
    id: "intermediate",
    title: "Intermediate",
    target: "Trade-offs & Implementation",
    description:
      "Real-world trade-offs, debugging, practical architecture, and production engineering practices.",
    icon: Gauge,
  },
  {
    id: "advanced",
    title: "Advanced",
    target: "Scale, Edge Cases & Strategy",
    description:
      "High-scale systems, rare failure modes, distributed concurrency, deep optimization, and leadership vision.",
    icon: ShieldCheck,
  },
];

export function CandidatePicker({
  onStart,
  pending,
}: {
  onStart: (c: Candidate) => void;
  pending: boolean;
}) {
  const [mode, setMode] = useState<"custom" | "preset">("custom");

  // Profile Details
  const [name, setName] = useState("");
  const [selectedDomain, setSelectedDomain] = useState<string>("AI/ML");
  const [customField, setCustomField] = useState("");
  const [interviewType, setInterviewType] = useState<InterviewType>("technical");
  const [difficulty, setDifficulty] = useState<DifficultyLevel>("intermediate");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([
    "RAG & Retrieval",
    "Agentic AI & Tools",
    "Vector Databases",
    "Prompt Engineering",
  ]);
  const [newSkillInput, setNewSkillInput] = useState("");
  const [notes, setNotes] = useState("");
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

  // Preset candidate selection
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(
    PRESET_CANDIDATES[0]?.id ?? null,
  );

  const activeDomainObj = DOMAINS.find((d) => d.id === selectedDomain) ?? DOMAINS[0];

  const handleDomainChange = (domainId: string) => {
    setSelectedDomain(domainId);
    const domainObj = DOMAINS.find((d) => d.id === domainId);
    if (domainObj) {
      // Pick the first 4 skills from the new domain
      setSelectedSkills(domainObj.skills.slice(0, 4));
    }
  };

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill],
    );
  };

  const addCustomSkill = () => {
    const trimmed = newSkillInput.trim();
    if (trimmed && !selectedSkills.includes(trimmed)) {
      setSelectedSkills((prev) => [...prev, trimmed]);
      setNewSkillInput("");
    }
  };

  const handleStartCustom = (e: React.FormEvent) => {
    e.preventDefault();
    setHasAttemptedSubmit(true);

    if (!name.trim()) return;
    if (selectedDomain === "Other" && !customField.trim()) return;

    const trimmedName = name.trim();
    const effectiveField = selectedDomain === "Other" ? customField.trim() : activeDomainObj.name;
    const customId = `cand-custom-${Date.now()}`;

    const candidate: Candidate = {
      id: customId,
      name: trimmedName,
      role: effectiveField,
      field: effectiveField,
      domain: selectedDomain,
      interviewType,
      difficulty,
      skills: selectedSkills.length > 0 ? selectedSkills : [effectiveField],
      focusAreas: selectedSkills.length > 0 ? selectedSkills : [effectiveField],
      daysCompleted: 31,
      notes: notes.trim() || `Candidate specializing in ${effectiveField} (${difficulty} level).`,
      member: {
        id: customId,
        name: trimmedName,
        jobRole: effectiveField,
        field: effectiveField,
        domain: selectedDomain,
        yearsExperience: difficulty === "advanced" ? 6 : difficulty === "intermediate" ? 3 : 1,
        education: "Technical Degree / Cohort",
        focusAreas: selectedSkills,
        skills: selectedSkills,
      },
      missions: Array.from({ length: 31 }, (_, i) => ({
        day: i + 1,
        passed: true,
        score: 92,
      })),
    };

    onStart(candidate);
  };

  const handleStartPreset = () => {
    const preset = PRESET_CANDIDATES.find((c) => c.id === selectedPresetId);
    if (!preset) return;

    const days = typeof preset.daysCompleted === "number" ? preset.daysCompleted : 31;
    const enrichedPreset: Candidate = {
      ...preset,
      interviewType: "technical",
      difficulty: "intermediate",
      domain: "AI/ML",
      skills: Array.isArray(preset.focusAreas) ? (preset.focusAreas as string[]) : ["AI"],
      missions: Array.from({ length: days }, (_, i) => ({
        day: i + 1,
        passed: true,
        score: 90,
      })),
      member: {
        id: preset.id,
        name: preset.name,
        jobRole: String(preset.role || "AI Engineer"),
        field: String(preset.role || "AI Engineer"),
        yearsExperience: 3,
        education: "AI Cohort Graduate",
        focusAreas: Array.isArray(preset.focusAreas) ? preset.focusAreas : [],
      },
    };

    onStart(enrichedPreset);
  };

  const nameError = hasAttemptedSubmit && !name.trim();
  const customFieldError = hasAttemptedSubmit && selectedDomain === "Other" && !customField.trim();

  return (
    <div className="mx-auto w-full max-w-4xl px-5 py-8 sm:py-12">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-accent">
          <Sparkles className="size-3.5" />
          <span>AI Interview Agent · Intelligent Simulator</span>
        </div>
        <h1 className="mt-2.5 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Interview Setup &amp; Configuration
        </h1>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
          Configure your candidate profile, interview type, technical domain, and difficulty to
          generate an adaptive, high-signal interview.
        </p>
      </div>

      {/* Mode Switcher */}
      <div className="mt-6 flex rounded-lg border border-border bg-muted/40 p-1">
        <button
          type="button"
          onClick={() => setMode("custom")}
          className={cn(
            "flex flex-1 items-center justify-center gap-2 rounded-md py-2 text-xs font-medium transition-colors sm:text-sm",
            mode === "custom"
              ? "bg-card text-foreground shadow-sm font-semibold"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <UserPlus className="size-4" />
          Interactive Setup (Recommended)
        </button>
        <button
          type="button"
          onClick={() => setMode("preset")}
          className={cn(
            "flex flex-1 items-center justify-center gap-2 rounded-md py-2 text-xs font-medium transition-colors sm:text-sm",
            mode === "preset"
              ? "bg-card text-foreground shadow-sm font-semibold"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <Users className="size-4" />
          Cohort Member Presets ({PRESET_CANDIDATES.length})
        </button>
      </div>

      {/* Mode 1: Custom Configuration Form */}
      {mode === "custom" && (
        <form onSubmit={handleStartCustom} className="mt-7 space-y-6">
          {/* Step 1: Candidate Profile */}
          <div className="rounded-xl border border-border bg-card p-5 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-border/70 pb-3">
              <h2 className="font-mono text-xs font-semibold uppercase tracking-wider text-accent">
                1. Candidate Details
              </h2>
              <span className="text-[11px] text-muted-foreground">Personalized interaction</span>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="candidate-name" className="text-xs font-semibold text-foreground">
                  Candidate Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="candidate-name"
                  type="text"
                  placeholder="e.g. Alex Morgan"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={cn(
                    "bg-background text-sm",
                    nameError && "border-destructive focus-visible:ring-destructive",
                  )}
                  autoFocus
                />
                {nameError ? (
                  <p className="text-xs text-destructive">Please enter your candidate name.</p>
                ) : (
                  <p className="text-[11px] text-muted-foreground">
                    The AI interviewer will address you directly by this name.
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="domain-select" className="text-xs font-semibold text-foreground">
                  Primary Domain / Track <span className="text-destructive">*</span>
                </Label>
                <select
                  id="domain-select"
                  value={selectedDomain}
                  onChange={(e) => handleDomainChange(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  {DOMAINS.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.id})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-muted-foreground">{activeDomainObj.desc}</p>
              </div>
            </div>

            {selectedDomain === "Other" && (
              <div className="mt-4 space-y-1.5 border-t border-border/60 pt-3">
                <Label htmlFor="custom-field" className="text-xs font-semibold text-foreground">
                  Specify Your Custom Technical Role / Domain{" "}
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="custom-field"
                  type="text"
                  placeholder="e.g. Cloud Security Architect / Embedded Systems"
                  value={customField}
                  onChange={(e) => setCustomField(e.target.value)}
                  className={cn(
                    "bg-background text-sm",
                    customFieldError && "border-destructive focus-visible:ring-destructive",
                  )}
                />
                {customFieldError && (
                  <p className="text-xs text-destructive">Please enter your custom domain.</p>
                )}
              </div>
            )}
          </div>

          {/* Step 2: Interview Type Selection */}
          <div className="rounded-xl border border-border bg-card p-5 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-border/70 pb-3">
              <h2 className="font-mono text-xs font-semibold uppercase tracking-wider text-accent">
                2. Select Interview Type
              </h2>
              <span className="text-[11px] text-muted-foreground">
                Format &amp; evaluation style
              </span>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {INTERVIEW_TYPES.map((type) => {
                const isSelected = interviewType === type.id;
                const Icon = type.icon;
                return (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setInterviewType(type.id)}
                    className={cn(
                      "flex flex-col justify-between rounded-lg border p-4 text-left transition-all duration-200",
                      isSelected
                        ? "border-accent bg-accent/10 ring-1 ring-accent/40 shadow-sm"
                        : "border-border bg-card hover:border-foreground/20 hover:bg-secondary/40",
                    )}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              "flex size-6 items-center justify-center rounded-md",
                              isSelected
                                ? "bg-accent text-accent-foreground"
                                : "bg-secondary text-foreground",
                            )}
                          >
                            <Icon className="size-3.5" />
                          </span>
                          <span className="text-xs font-semibold text-foreground">
                            {type.title}
                          </span>
                        </div>
                        {isSelected && <Check className="size-3.5 text-accent" />}
                      </div>
                      <p className="mt-2.5 text-[11px] leading-relaxed text-muted-foreground">
                        {type.description}
                      </p>
                    </div>

                    <div className="mt-3 border-t border-border/50 pt-2">
                      <span className="font-mono text-[10px] uppercase tracking-wider text-accent">
                        {type.badge}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 3: Difficulty Selection */}
          <div className="rounded-xl border border-border bg-card p-5 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-border/70 pb-3">
              <h2 className="font-mono text-xs font-semibold uppercase tracking-wider text-accent">
                3. Select Difficulty Level
              </h2>
              <span className="text-[11px] text-muted-foreground">
                Depth &amp; rigor of probing
              </span>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {DIFFICULTY_LEVELS.map((diff) => {
                const isSelected = difficulty === diff.id;
                const Icon = diff.icon;
                return (
                  <button
                    key={diff.id}
                    type="button"
                    onClick={() => setDifficulty(diff.id)}
                    className={cn(
                      "flex flex-col justify-between rounded-lg border p-4 text-left transition-all duration-200",
                      isSelected
                        ? "border-accent bg-accent/10 ring-1 ring-accent/40 shadow-sm"
                        : "border-border bg-card hover:border-foreground/20 hover:bg-secondary/40",
                    )}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              "flex size-6 items-center justify-center rounded-md",
                              isSelected
                                ? "bg-accent text-accent-foreground"
                                : "bg-secondary text-foreground",
                            )}
                          >
                            <Icon className="size-3.5" />
                          </span>
                          <span className="text-xs font-semibold text-foreground">
                            {diff.title}
                          </span>
                        </div>
                        {isSelected && <Check className="size-3.5 text-accent" />}
                      </div>
                      <p className="mt-2.5 text-[11px] leading-relaxed text-muted-foreground">
                        {diff.description}
                      </p>
                    </div>

                    <div className="mt-3 border-t border-border/50 pt-2">
                      <span className="font-mono text-[10px] text-muted-foreground">
                        Target: <strong className="text-foreground">{diff.target}</strong>
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 4: Skills & Focus Areas */}
          <div className="rounded-xl border border-border bg-card p-5 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-border/70 pb-3">
              <div>
                <h2 className="font-mono text-xs font-semibold uppercase tracking-wider text-accent">
                  4. Skills &amp; Focus Areas ({selectedSkills.length} selected)
                </h2>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Select or type the skills you want the interview questions to target.
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() =>
                  setSelectedSkills(
                    selectedSkills.length === activeDomainObj.skills.length
                      ? []
                      : [...activeDomainObj.skills],
                  )
                }
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                {selectedSkills.length === activeDomainObj.skills.length ? "Clear" : "Select all"}
              </Button>
            </div>

            {/* Quick-pick skills for selected domain */}
            <div className="mt-4 flex flex-wrap gap-2">
              {activeDomainObj.skills.map((skill) => {
                const active = selectedSkills.includes(skill);
                return (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => toggleSkill(skill)}
                    className={cn(
                      "flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs transition-all",
                      active
                        ? "border-accent bg-accent/15 text-accent-foreground ring-1 ring-accent/40 font-medium"
                        : "border-border bg-secondary/40 text-muted-foreground hover:text-foreground hover:bg-secondary",
                    )}
                  >
                    <span
                      className={cn(
                        "flex size-3.5 items-center justify-center rounded-full border text-[9px]",
                        active
                          ? "border-accent bg-accent text-accent-foreground"
                          : "border-muted-foreground/50",
                      )}
                    >
                      {active && <Check className="size-2.5" strokeWidth={3} />}
                    </span>
                    {skill}
                  </button>
                );
              })}
            </div>

            {/* Add custom skill input */}
            <div className="mt-4 flex gap-2 border-t border-border/60 pt-3">
              <Input
                type="text"
                placeholder="Add custom skill or tool (e.g. LangGraph, Redis, Kafka, GraphQL)…"
                value={newSkillInput}
                onChange={(e) => setNewSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addCustomSkill();
                  }
                }}
                className="bg-background text-xs"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addCustomSkill}
                disabled={!newSkillInput.trim()}
                className="text-xs"
              >
                Add
              </Button>
            </div>
          </div>

          {/* Step 5: Optional Background Notes */}
          <div className="rounded-xl border border-border bg-card p-5 sm:p-6 shadow-sm">
            <Label
              htmlFor="candidate-notes"
              className="text-xs font-semibold uppercase tracking-wider text-foreground"
            >
              5. Candidate Notes / Target Projects{" "}
              <span className="font-normal text-muted-foreground">(Optional)</span>
            </Label>
            <p className="mt-1 text-xs text-muted-foreground">
              Provide context on any specific open-source libraries, architectures, or past systems
              you want to discuss.
            </p>
            <Textarea
              id="candidate-notes"
              rows={2}
              placeholder="e.g. Experienced in building multi-tenant RAG systems with hybrid BM25 + dense retrieval and low-latency embeddings."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-3 bg-background text-sm"
            />
          </div>

          {/* Action Row */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border pt-4">
            <div className="space-y-0.5 text-xs text-muted-foreground">
              {name.trim() ? (
                <div>
                  Candidate: <strong className="text-foreground">{name.trim()}</strong> ·{" "}
                  <span className="font-mono text-accent">
                    {interviewType.toUpperCase()} ({difficulty})
                  </span>
                </div>
              ) : (
                <span>Enter candidate name to start</span>
              )}
            </div>

            <Button
              type="submit"
              size="lg"
              disabled={pending}
              className="min-w-[200px] font-semibold shadow-sm"
            >
              {pending ? "Initializing AI Interview…" : "Start AI Interview"}
              {!pending && <ArrowRight className="ml-2 size-4" />}
            </Button>
          </div>
        </form>
      )}

      {/* Mode 2: Presets Selection */}
      {mode === "preset" && (
        <div className="mt-7 space-y-6">
          <ul
            className="grid gap-3 sm:grid-cols-2"
            role="radiogroup"
            aria-label="Cohort Candidates"
          >
            {PRESET_CANDIDATES.map((c) => {
              const active = c.id === selectedPresetId;
              const days = typeof c.daysCompleted === "number" ? c.daysCompleted : 31;
              const focusList = Array.isArray(c.focusAreas) ? (c.focusAreas as string[]) : [];

              return (
                <li key={c.id}>
                  <button
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => setSelectedPresetId(c.id)}
                    className={cn(
                      "group h-full w-full rounded-lg border bg-card p-5 text-left transition-all duration-200",
                      "hover:border-accent/60 hover:bg-card-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      active ? "border-accent ring-1 ring-accent/40" : "border-border",
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h2 className="text-base font-medium text-foreground">{c.name}</h2>
                        {typeof c.role === "string" && (
                          <p className="mt-0.5 text-sm text-muted-foreground">{c.role}</p>
                        )}
                      </div>
                      <span
                        className={cn(
                          "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors",
                          active
                            ? "border-accent bg-accent text-accent-foreground"
                            : "border-border",
                        )}
                        aria-hidden
                      >
                        {active && <Check className="size-3" strokeWidth={3} />}
                      </span>
                    </div>

                    <div className="mt-4">
                      <div className="flex items-center justify-between font-mono text-[11px] text-muted-foreground">
                        <span>Cohort Progress</span>
                        <span>{days}/31 days</span>
                      </div>
                      <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-secondary">
                        <div
                          className="h-full rounded-full bg-accent transition-all duration-500"
                          style={{ width: `${Math.min(100, (days / 31) * 100)}%` }}
                        />
                      </div>
                    </div>

                    {focusList.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-1.5">
                        {focusList.map((f) => (
                          <span
                            key={f}
                            className="rounded border border-border bg-secondary px-2 py-0.5 font-mono text-[11px] text-secondary-foreground"
                          >
                            {f}
                          </span>
                        ))}
                      </div>
                    )}

                    {typeof c.notes === "string" && (
                      <p className="mt-4 border-t border-border pt-3 text-xs leading-relaxed text-muted-foreground">
                        {c.notes}
                      </p>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border pt-4">
            <p className="text-xs text-muted-foreground">
              {selectedPresetId
                ? `Selected: ${PRESET_CANDIDATES.find((c) => c.id === selectedPresetId)?.name}`
                : "Select a preset candidate"}
            </p>

            <Button
              type="button"
              size="lg"
              disabled={!selectedPresetId || pending}
              onClick={handleStartPreset}
              className="min-w-[200px] font-semibold"
            >
              {pending ? "Starting AI Interview…" : "Start AI Interview"}
              {!pending && <ArrowRight className="ml-2 size-4" />}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
