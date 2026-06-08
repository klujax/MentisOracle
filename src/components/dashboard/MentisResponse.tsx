"use client";

import { cn } from "@/lib/utils";

interface StrategyProps {
  analysis: string;
  counterMove: string;
  execution: string;
}

export const MentisResponse = ({ analysis, counterMove, execution }: StrategyProps) => {
  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 animate-fade-in mt-8">
      
      <div className="text-center mb-12">
        <h3 className="font-serif text-2xl text-smoke uppercase tracking-widest mb-2">Mentis Reçetesi</h3>
        <p className="font-accent italic text-ash">Soğukkanlı. Rasyonel. Kesin.</p>
      </div>

      <div className="grid gap-6">
        <StrategyCard 
          step="01" 
          title="" 
          content={analysis} 
          delayClass="delay-100" 
        />
        <StrategyCard 
          step="02" 
          title="KARŞI TARAFIN MOTİVASYONU" 
          content={counterMove} 
          delayClass="delay-300"
          highlight
        />
        <StrategyCard 
          step="03" 
          title="STRATEJİK HAMLE" 
          content={execution} 
          delayClass="delay-500" 
        />
      </div>

    </div>
  );
};

const StrategyCard = ({ step, title, content, delayClass, highlight }: { step: string, title: string, content: string, delayClass: string, highlight?: boolean }) => {
  return (
    <div className={cn(
      "relative p-6 md:p-8 rounded-sm bg-abyss border border-obsidian transition-all duration-700 opacity-0 animate-[fade-in_1s_ease-out_forwards]",
      delayClass,
      highlight ? "border-gold/30 shadow-[0_0_30px_rgba(201,168,76,0.05)]" : ""
    )}>
      <div className="absolute top-0 left-4 md:left-8 -translate-y-1/2 bg-void px-2 md:px-4 font-serif text-gold text-xs sm:text-sm md:text-lg tracking-wider md:tracking-widest flex items-center gap-2 md:gap-4">
        <span className="text-[10px] md:text-sm opacity-50">{step}</span>
        {title}
      </div>
      
      <div className="mt-4 font-sans text-smoke leading-relaxed tracking-wide text-xs md:text-sm whitespace-pre-wrap">
        {content}
      </div>
    </div>
  );
};
