import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-xl text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-glow hover:opacity-90",
        outline: "border border-border bg-white/60 text-foreground hover:bg-white",
        ghost: "text-foreground hover:bg-white/70",
        danger: "bg-rose-600 text-white hover:bg-rose-700",
      },
      size: {
        default: "h-11 px-5",
        sm: "h-9 rounded-lg px-3",
        lg: "h-12 px-6",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export function Button({ className, variant, size, ...props }) {
  return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
