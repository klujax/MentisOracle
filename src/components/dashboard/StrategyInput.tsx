"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

interface StrategyInputProps {
  onSubmit: (problem: string) => void;
  disabled?: boolean;
}

export const StrategyInput = ({ onSubmit, disabled }: StrategyInputProps) => {
  const [problem, setProblem] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (problem.trim().length > 10) {
      onSubmit(problem);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-3xl mx-auto space-y-6">
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-b from-gold/20 to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity duration-1000 blur-md rounded-sm" />
        <textarea
          value={problem}
          onChange={(e) => setProblem(e.target.value)}
          disabled={disabled}
          placeholder="Masadaki konumunu zayıflatan o son hamleyi anlat..."
          className="relative w-full h-48 md:h-64 bg-abyss border border-obsidian rounded-sm p-6 text-smoke font-sans text-base leading-relaxed resize-none focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/30 transition-all duration-500 placeholder:text-ash/40 disabled:opacity-50"
        />
      </div>

      <div className="flex justify-end">
        <Button 
          type="submit" 
          size="lg" 
          disabled={disabled || problem.trim().length < 10}
          className="tracking-widest uppercase font-bold text-sm w-full md:w-auto"
        >
          Oracle&apos;a Danış
        </Button>
      </div>
    </form>
  );
};
