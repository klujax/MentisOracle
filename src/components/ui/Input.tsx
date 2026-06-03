"use client";

import { forwardRef, InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label className="text-sm text-ash font-medium tracking-wide">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            "flex h-12 w-full rounded-sm border border-obsidian bg-obsidian/50 px-3 py-2 text-sm text-smoke ring-offset-void file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-ash/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold focus-visible:border-gold/50 transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-red-900/50 focus-visible:ring-red-900",
            className
          )}
          {...props}
        />
        {error && <span className="text-xs text-red-500/80 mt-1">{error}</span>}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };
