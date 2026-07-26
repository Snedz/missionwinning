import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// Modernist tags: square, uppercase, 10–11px/600, tinted from the ramps.
// No focus ring — the global :focus-visible outline covers every focusable
// element. Where the handoff sheet and its README disagree this follows the
// README, because both of its values are the legible ones: neutral-200 fill
// (neutral-100 #f8f4f4 is invisible against paper #f3f2f2) and accent-900 text
// on accent-100 (accent-800 is ~4pt of contrast worse for no gain).
const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-none px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.06em] transition-colors",
  {
    variants: {
      variant: {
        default: "border-2 border-transparent bg-accent-100 text-accent-900",
        secondary: "border-2 border-transparent bg-neutral-200 text-neutral-800",
        // Border and text are --primary, never poster: 11px is exactly the size
        // poster red fails at on paper.
        outline: "border-2 border-primary text-primary",
        muscle: "border-2 border-transparent bg-neutral-200 text-neutral-800",
        // Honor tier. PRs and victories ONLY — if it marks anything else it
        // stops meaning anything. The ★ is rendered by the component so a
        // caller cannot ship a starless honor tag.
        honor: "border-2 border-transparent bg-accent-800 text-white",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, children, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props}>
      {variant === "honor" && <span aria-hidden>★</span>}
      {children}
    </div>
  );
}

export { Badge, badgeVariants };
