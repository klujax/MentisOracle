"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { StrategyInput } from "@/components/dashboard/StrategyInput";
import { LoadingOracle } from "@/components/ui/LoadingOracle";
import { OracleResponse } from "@/components/dashboard/OracleResponse";
import { createClient } from "@/lib/supabase/client";
import { Coins } from "lucide-react";

interface StrategyResponse {
  analysis: string;
  targetWeakness: string;
  execution: string;
}

export default function DashboardPage() {
  const [status, setStatus] = useState<"idle" | "analyzing" | "complete">("idle");
  const [response, setResponse] = useState<StrategyResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [credits, setCredits] = useState<number | null>(null);
  const [plan, setPlan] = useState<string>("free");
  const [requiresPayment, setRequiresPayment] = useState(false);

  useEffect(() => {
    const fetchCredits = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("user_credits")
          .select("credits, plan")
          .eq("user_id", user.id)
          .single();
        if (data) {
          setCredits(data.credits);
          setPlan(data.plan);
        }
      }
    };
    fetchCredits();
  }, [status]); // Refresh credits after each consultation

  const handleConsult = async (problem: string) => {
    setStatus("analyzing");
    setError(null);
    setRequiresPayment(false);
    
    try {
      const res = await fetch("/api/oracle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problem }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.requiresPayment) {
          setRequiresPayment(true);
        }
        throw new Error(data.error || "Mentis ağına bağlanılamadı.");
      }

      setResponse(data);
      setStatus("complete");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Bağlantı koptu.";
      setError(message);
      setStatus("idle");
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-5xl mx-auto space-y-12">
      
      <div className="text-center space-y-4 mb-4">
        <h2 className="font-serif text-3xl md:text-4xl text-smoke tracking-wider">Zihin Karargahı</h2>
        <p className="font-accent text-ash italic md:text-lg">Duygularını dışarıda bırak. Burada sadece saf rasyonel strateji var.</p>
        
        {credits !== null && (
          <div className="flex items-center justify-center gap-2 text-sm font-accent">
            <Coins className="w-4 h-4 text-gold" />
            <span className="text-ash">
              Kalan Kredi: <span className={`font-bold ${credits > 0 ? "text-gold" : "text-red-500"}`}>
                {plan === "elite" ? "∞" : credits}
              </span>
            </span>
            <span className="text-obsidian mx-2">|</span>
            <span className="text-ash">
              Plan: <span className="text-smoke uppercase text-xs tracking-wider">{plan}</span>
            </span>
          </div>
        )}
      </div>

      {status === "idle" && (
        <div className="w-full animate-fade-in flex flex-col items-center">
          {error && (
            <div className="mb-6 px-6 py-3 border border-red-900/50 bg-red-900/10 text-red-500/90 text-sm font-accent italic text-center max-w-lg">
              {error}
            </div>
          )}
          {requiresPayment && (
            <div className="mb-6 text-center space-y-3">
              <p className="text-ash font-accent italic text-sm">Bedava kredilerin tükendi. Oyun burada bitmiyor.</p>
              <Link
                href="/pricing"
                className="inline-block bg-gold text-void px-8 py-3 text-sm font-bold uppercase tracking-widest hover:bg-gold-dim transition-colors"
              >
                Planları İncele
              </Link>
            </div>
          )}
          {!requiresPayment && <StrategyInput onSubmit={handleConsult} />}
        </div>
      )}

      {status === "analyzing" && (
        <div className="w-full">
          <LoadingOracle />
        </div>
      )}

      {status === "complete" && response && (
        <div className="w-full flex flex-col items-center">
          <OracleResponse 
            analysis={response.analysis}
            counterMove={response.targetWeakness}
            execution={response.execution}
          />
          <button 
            onClick={() => {
              setStatus("idle");
              setResponse(null);
            }}
            className="mt-12 text-sm text-ash hover:text-gold uppercase tracking-widest font-bold transition-colors underline underline-offset-4 decoration-gold/30"
          >
            Yeni Hamle Planla
          </button>
        </div>
      )}
    </div>
  );
}
