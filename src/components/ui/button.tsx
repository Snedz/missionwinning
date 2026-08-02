import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  // No focus-visible ring here: `src/index.css` @layer base now declares one outline for
  // every focusable element, so a ring on top of it renders two indicators. That global
  // rule is also what finally covers the 91 raw <button>s this component never reached.
  // font-semibold not font-medium: Archivo loads 400/600/800 only, so 500 would
  // synthesize. Radius-0 comes from the collapsed borderRadius scale.
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold transition-colors disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary-fill text-primary-foreground hover:bg-primary-fill-hover",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        // Modernist ghost = 2px ink border (never a hairline).
        outline: "border-2 border-foreground bg-transparent hover:bg-foreground/[0.07] active:bg-foreground/[0.14]",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        // Legacy branded-CTA variant (10+ call sites) — now the plain red fill;
        // fold into `default` when Phase 3 recuts the app screens.
        fitness: "bg-primary-fill text-primary-foreground hover:bg-primary-fill-hover",
        /**
         * A chosen option — a filter chip, a unit toggle, a days-per-week pick.
         *
         * `.225` — this existed only as the default variant at ~20 sites
         * (`selected ? 'default' : 'outline'`), which paints a *selection* in the screen's one
         * do-this-now colour. The zero-state sweep measured the result: nine of
         * fifteen routes over the one-red-action rule, `/profile` and `/programs`
         * entirely because of chips nobody would call actions.
         *
         * Same treatment `.224` settled for the segmented control and the tab
         * bar draw: tint ground under a 2px poster rule. Selected reads as
         * selected; red stays the thing you do next.
         */
        selected: "is-active-tab border-2 border-border text-primary",
        /**
         * For the ink panels — the rest dock, the guided-session runner. The
         * paper-ground variants invert badly there: `outline` draws an ink
         * border on ink, and `ghost`'s hover is an ink wash on ink, so both
         * disappear entirely.
         */
        onInk:
          "border-2 border-neutral-500 bg-transparent text-neutral-100 hover:bg-neutral-100/10 active:bg-neutral-100/20",
        onInkSolid:
          "border-2 border-transparent bg-neutral-100 text-neutral-900 hover:bg-white",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3",
        lg: "h-11 px-8",
        icon: "h-10 w-10",
        // Full-width buttons put their label at the padding edge, never in the
        // middle — a centred label in a wide button is the single loudest tell
        // that a layout is not on this system. Overrides the base
        // `justify-center`, so it must come after it in the class string.
        block: "h-11 w-full justify-start px-4 text-left",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
