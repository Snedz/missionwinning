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
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
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
