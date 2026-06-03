"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Clock, ChevronDown, ChevronUp } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Consultation {
  id: string;
  problem: string;
  analysis: string;
  target_weakness: string;
  execution: string;
  created_at: string;
}

export default function HistoryPage() {
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("consultations")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (data) {
        setConsultations(data);
      }
      setLoading(false);
    };

    fetchHistory();
  }, []);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex flex-col items-center w-full max-w-5xl mx-auto space-y-8">
      <div className="w-full flex items-center justify-between">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-ash hover:text-gold transition-colors text-sm font-accent uppercase tracking-wider"
        >
          <ArrowLeft className="w-4 h-4" />
          Karargaha Dön
        </Link>
      </div>

      <div className="text-center space-y-4 mb-4">
        <h2 className="font-serif text-3xl md:text-4xl text-smoke tracking-wider">
          Geçmiş Stratejiler
        </h2>
        <p className="font-accent text-ash italic md:text-lg">
          Her hamle bir iz bırakır. Arşivini oku.
        </p>
      </div>

      {loading && (
        <div className="text-gold font-accent italic animate-pulse-gold">
          Arşiv yükleniyor...
        </div>
      )}

      {!loading && consultations.length === 0 && (
        <div className="text-center py-20 space-y-4">
          <p className="text-ash font-accent italic text-lg">
            Henüz bir strateji talep etmedin.
          </p>
          <Link
            href="/dashboard"
            className="text-gold hover:text-white transition-colors underline underline-offset-4 decoration-gold/30 text-sm uppercase tracking-wider font-bold"
          >
            İlk Hamleyi Yap
          </Link>
        </div>
      )}

      {!loading && consultations.length > 0 && (
        <div className="w-full space-y-4">
          {consultations.map((c) => (
            <div
              key={c.id}
              className="border border-obsidian bg-abyss/50 overflow-hidden transition-all duration-300"
            >
              <button
                onClick={() => setExpandedId(expandedId === c.id ? null : c.id)}
                className="w-full flex items-center justify-between p-6 text-left hover:bg-obsidian/30 transition-colors"
              >
                <div className="flex-1 min-w-0 pr-4">
                  <p className="text-smoke font-medium truncate">{c.problem}</p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-ash font-accent">
                    <Clock className="w-3 h-3" />
                    {formatDate(c.created_at)}
                  </div>
                </div>
                {expandedId === c.id ? (
                  <ChevronUp className="w-5 h-5 text-gold flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-ash flex-shrink-0" />
                )}
              </button>

              {expandedId === c.id && (
                <div className="border-t border-obsidian p-6 space-y-6 animate-fade-in">
                  <div className="space-y-2">
                    <h4 className="text-xs uppercase tracking-widest text-gold font-bold">
                      01 — Durum Analizi
                    </h4>
                    <p className="text-smoke/90 text-sm leading-relaxed whitespace-pre-wrap">
                      {c.analysis}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-xs uppercase tracking-widest text-gold font-bold">
                      02 — Karşı Tarafın Motivasyonu
                    </h4>
                    <p className="text-smoke/90 text-sm leading-relaxed whitespace-pre-wrap">
                      {c.target_weakness}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-xs uppercase tracking-widest text-gold font-bold">
                      03 — Stratejik Hamle
                    </h4>
                    <p className="text-smoke/90 text-sm leading-relaxed whitespace-pre-wrap">
                      {c.execution}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
