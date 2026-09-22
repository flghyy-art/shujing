import * as React from "react";
import { cn } from "@/lib/utils";

export function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(
        "flex min-h-32 w-full rounded-lg bg-secondary px-3 py-3 text-sm text-foreground shadow-[var(--shadow-border)] outline-none transition-[box-shadow] duration-150 placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring/70 disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}
