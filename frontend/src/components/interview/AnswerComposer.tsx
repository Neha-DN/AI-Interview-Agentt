import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { SendHorizontal } from "lucide-react";

export function AnswerComposer({
  onSend,
  disabled,
  pending,
}: {
  onSend: (text: string) => void;
  disabled: boolean;
  pending: boolean;
}) {
  const [value, setValue] = useState("");
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!disabled && !pending) ref.current?.focus();
  }, [disabled, pending]);

  const submit = () => {
    const text = value.trim();
    if (!text || disabled || pending) return;
    onSend(text);
    setValue("");
  };

  return (
    <div className="border-t border-border bg-background">
      <div className="mx-auto w-full max-w-3xl px-5 py-4">
        <div className="rounded-lg border border-border bg-card transition-colors focus-within:border-accent/60">
          <label htmlFor="answer" className="sr-only">
            Your answer
          </label>
          <textarea
            id="answer"
            ref={ref}
            rows={3}
            value={value}
            disabled={disabled || pending}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                submit();
              }
            }}
            placeholder={disabled ? "Interview closed." : "Type your answer…"}
            className="w-full resize-none bg-transparent px-4 py-3 text-[15px] leading-7 text-foreground placeholder:text-muted-foreground focus:outline-none disabled:opacity-60"
          />
          <div className="flex items-center justify-between gap-3 border-t border-border px-3 py-2">
            <span className="font-mono text-[11px] text-muted-foreground">⌘ + Enter to send</span>
            <Button size="sm" onClick={submit} disabled={disabled || pending || !value.trim()}>
              {pending ? "Sending…" : "Send"}
              {!pending && <SendHorizontal className="size-3.5" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
