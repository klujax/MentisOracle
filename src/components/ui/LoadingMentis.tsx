"use client";

import { useEffect, useState } from "react";
import { BrainCircuit } from "lucide-react";

const LOADING_PHASES = [
  "Zafiyetler analiz ediliyor...",
  "Güç dengeleri haritalanıyor...",
  "Psikolojik profiller çıkarılıyor...",
  "Karşı hamle kurgulanıyor...",
  "Strateji reçetesi hazırlanıyor...",
];

export const LoadingMentis = () => {
  const [phaseIndex, setPhaseIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPhaseIndex((prev) => (prev < LOADING_PHASES.length - 1 ? prev + 1 : prev));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-12 animate-fade-in">
      <div className="relative flex items-center justify-center w-24 h-24 mb-8">
        <div className="absolute inset-0 rounded-full border border-gold/20 animate-[spin_4s_linear_infinite]" />
        <div className="absolute inset-2 rounded-full border border-t-gold border-r-transparent border-b-gold/50 border-l-transparent animate-[spin_3s_linear_infinite_reverse]" />
        <BrainCircuit className="w-8 h-8 text-gold animate-pulse-gold absolute" strokeWidth={1.5} />
      </div>
      
      <div className="h-8 overflow-hidden relative w-full max-w-sm flex justify-center">
        {LOADING_PHASES.map((phase, idx) => (
          <p
            key={idx}
            className={`absolute font-accent italic text-lg tracking-wide text-gold-dim transition-all duration-1000 ${
              idx === phaseIndex
                ? "opacity-100 transform translate-y-0"
                : idx < phaseIndex
                ? "opacity-0 transform -translate-y-8"
                : "opacity-0 transform translate-y-8"
            }`}
          >
            {phase}
          </p>
        ))}
      </div>
    </div>
  );
};
