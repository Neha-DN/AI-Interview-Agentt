import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/services/types";

export function MessageBubble({ message }: { message: ChatMessage }) {
  const isInterviewer = message.role === "interviewer";

  return (
    <div className={cn("animate-fade-up", isInterviewer ? "" : "flex justify-end")}>
      {isInterviewer ? (
        <div className="max-w-2xl">
          <p className="mb-1.5 font-mono text-[11px] uppercase tracking-[0.16em] text-accent">
            Interviewer
          </p>
          <div className="whitespace-pre-wrap text-[15px] leading-7 text-foreground">
            {message.content}
          </div>
        </div>
      ) : (
        <div className="max-w-xl">
          <p className="mb-1.5 text-right font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
            You
          </p>
          <div className="whitespace-pre-wrap rounded-lg rounded-tr-sm bg-primary px-4 py-3 text-[15px] leading-7 text-primary-foreground">
            {message.content}
          </div>
        </div>
      )}
    </div>
  );
}

export function ThinkingIndicator() {
  return (
    <div className="animate-fade-up">
      <p className="mb-1.5 font-mono text-[11px] uppercase tracking-[0.16em] text-accent">
        Interviewer
      </p>
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground" aria-live="polite">
        <span className="size-1.5 animate-pulse rounded-full bg-accent [animation-delay:0ms]" />
        <span className="size-1.5 animate-pulse rounded-full bg-accent [animation-delay:150ms]" />
        <span className="size-1.5 animate-pulse rounded-full bg-accent [animation-delay:300ms]" />
        <span className="ml-1.5">Considering your answer…</span>
      </div>
    </div>
  );
}
