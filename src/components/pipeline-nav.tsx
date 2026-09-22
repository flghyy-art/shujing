import { Check } from "lucide-react";
import { canEnter, isStepComplete, STEPS } from "@/lib/pipeline";
import { useStudio } from "@/lib/store";
import type { StepId } from "@/lib/types";
import { cn } from "@/lib/utils";

export function PipelineNav() {
  const project = useStudio((s) => s.active());
  const setStep = useStudio((s) => s.setStep);
  if (!project) return null;

  return (
    <nav aria-label="拍摄准备步骤" className="flex gap-1 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible">
      {STEPS.map((s) => {
        const active = project.currentStep === s.id;
        const done = isStepComplete(project, s.id);
        const locked = !canEnter(project, s.id);
        return (
          <button
            key={s.id}
            type="button"
            disabled={locked}
            onClick={() => setStep(s.id as StepId)}
            className={cn(
              "flex min-w-[9.5rem] items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors duration-150 lg:min-w-0 lg:w-full",
              active && "bg-paper text-paper-foreground",
              !active && !locked && "text-muted-foreground hover:bg-accent hover:text-foreground",
              locked && "cursor-not-allowed opacity-35",
            )}
          >
            <span
              className={cn(
                "flex size-8 shrink-0 items-center justify-center rounded-lg font-serif text-xs tabular-nums",
                active && "bg-paper-foreground/8",
                !active && done && "bg-sage/20 text-sage",
                !active && !done && "bg-secondary",
              )}
            >
              {done && !active ? <Check className="size-3.5" /> : s.n}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-medium">{s.name}</span>
              <span
                className={cn(
                  "hidden truncate text-[11px] lg:block",
                  active ? "text-paper-foreground/55" : "text-muted-foreground",
                )}
              >
                {s.en}
              </span>
            </span>
          </button>
        );
      })}
    </nav>
  );
}
