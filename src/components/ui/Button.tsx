"use client";

import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-sm text-sm font-medium transition-all duration-300",
          "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold",
          "disabled:opacity-50 disabled:pointer-events-none",
          {
            "bg-gold text-void hover:bg-gold-dim hover:shadow-[0_0_15px_rgba(201,168,76,0.3)]":
              variant === "primary",
            "bg-obsidian text-smoke hover:bg-abyss border border-obsidian hover:border-gold/30":
              variant === "secondary",
            "border border-gold text-gold hover:bg-gold/10 hover:shadow-[0_0_10px_rgba(201,168,76,0.2)]":
              variant === "outline",
            "text-ash hover:text-gold hover:bg-obsidian/50": variant === "ghost",
            "h-8 px-3 text-xs": size === "sm",
            "h-10 px-6 py-2": size === "md",
            "h-12 px-8 py-3 text-base": size === "lg",
          },
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button };
