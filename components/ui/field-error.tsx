import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface FieldErrorProps {
  id: string;
  message?: string;
  className?: string;
}

/**
 * Inline field validation error with icon and aria support.
 * Pair with aria-describedby={id} on the associated input.
 */
export function FieldError({ id, message, className }: FieldErrorProps) {
  if (!message) return null;

  return (
    <p
      id={id}
      role="alert"
      className={cn("flex items-center gap-1.5 text-xs text-red-400 mt-1", className)}
    >
      <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      {message}
    </p>
  );
}

/**
 * Returns the border class for a field based on its validation state.
 */
export function fieldBorderClass(
  error?: string,
  valid?: boolean
): string {
  if (error) return "border-red-500/60 focus:border-red-500";
  if (valid) return "border-accent-500/60 focus:border-accent-400";
  return "border-white/10 focus:border-brand-400";
}
