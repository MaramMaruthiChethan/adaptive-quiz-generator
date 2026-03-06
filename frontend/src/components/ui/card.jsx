import { cn } from "@/lib/utils";

export function Card({ className, ...props }) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-white/70 bg-card p-6 text-card-foreground shadow-glow backdrop-blur-xl",
        className
      )}
      {...props}
    />
  );
}
