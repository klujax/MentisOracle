"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Clock, ChevronDown, ChevronUp, Brain } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Consultation {
  id: string;
  problem: string;
  analysis: string;
  target_weakness: string;
  execution: string;
  created_at: string;
  is_starred: boolean;
  character?: string;
  mode?: string;
  target_name?: string;
  chat_history?: { role: string; content: string }[];
}

const getCharacterName = (charId?: string) => {
  return "MENTİS";
};

export default function HistoryPage() {
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

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

  const handleSaveToJournal = async (id: string) => {
    setSavingId(id);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("consultations")
        .update({ is_starred: true })
        .eq("id", id);
      
      if (error) throw error;
      
      setConsultations(prev => prev.map(c => 
        c.id === id ? { ...c, is_starred: true } : c
      ));
    } catch (err) {
      console.error("Failed to save to journal:", err);
      alert("Deftere kaydedilirken bir hata oluştu.");
    } finally {
      setSavingId(null);
    }
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
                  <p className="text-smoke font-medium truncate">
                    {c.mode === "simulation" ? `Simülasyon: ${c.target_name || "Hedef Kişi"}` : c.problem}
                  </p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-ash font-accent">
                    <Clock className="w-3 h-3" />
                    {formatDate(c.created_at)}
                    {c.mode === "simulation" ? (
                      <span className="text-[9px] text-yellow-500 bg-yellow-500/5 border border-yellow-500/20 px-1.5 py-0.5 rounded-sm">
                        SOHBET SİMÜLASYONU
                      </span>
                    ) : c.character && (
                      <span className="text-[9px] text-gold/80 bg-gold/5 border border-gold/20 px-1.5 py-0.5 rounded-sm">
                        {getCharacterName(c.character)} İLE
                      </span>
                    )}
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
                      01 — {c.mode === "simulation" ? "KARAKTER PROFİLİ" : "Durum Analizi"}
                    </h4>
                    <p className="text-smoke/90 text-sm leading-relaxed whitespace-pre-wrap">
                      {c.analysis}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-xs uppercase tracking-widest text-gold font-bold">
                      02 — {c.mode === "simulation" ? "MASADAKİ DENGE" : "Karşı Tarafın Motivasyonu"}
                    </h4>
                    <p className="text-smoke/90 text-sm leading-relaxed whitespace-pre-wrap">
                      {c.target_weakness}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-xs uppercase tracking-widest text-gold font-bold">
                      03 — {c.mode === "simulation" ? "STRATEJİK PLAN" : "Stratejik Hamle"}
                    </h4>
                    <p className="text-smoke/90 text-sm leading-relaxed whitespace-pre-wrap">
                      {c.execution}
                    </p>
                  </div>

                  {c.chat_history && c.chat_history.length > 2 && (
                    <div className="pt-4 mt-4 border-t border-obsidian/30 space-y-4">
                      <h4 className="text-xs uppercase tracking-widest text-gold font-bold mb-4">
                        Takip Sohbeti
                      </h4>
                      {c.chat_history.slice(2).map((msg, index) => {
                        const isUser = msg.role === "user";
                        
                        let replyText = msg.content;
                        let adviceText = null;

                        if (!isUser && c.mode === "simulation") {
                          const adviceSplitKey = "**[MENTİS ÖNERİSİ]**";
                          if (msg.content.includes(adviceSplitKey)) {
                            const parts = msg.content.split(adviceSplitKey);
                            replyText = parts[0]?.trim();
                            adviceText = parts[1]?.trim();
                          }
                        }

                        return (
                          <div key={index} className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}>
                            <div className={`max-w-[85%] rounded-sm p-4 text-xs md:text-sm leading-relaxed ${
                              isUser 
                                ? "bg-obsidian border border-gold/10 text-smoke" 
                                : "bg-abyss/85 border border-obsidian text-smoke"
                            }`}>
                              <p className={`text-[10px] uppercase tracking-widest mb-1.5 font-accent ${
                                isUser ? "text-ash/60" : "text-gold font-bold"
                              }`}>
                                {isUser 
                                  ? "SİZ" 
                                  : c.mode === "simulation"
                                    ? (c.target_name || "KARŞI TARAF").toUpperCase()
                                    : getCharacterName(c.character)}
                              </p>
                              <div className="whitespace-pre-wrap font-sans">{replyText}</div>

                              {!isUser && adviceText && (
                                <div className="mt-3 pt-3 border-t border-gold/20 text-left flex items-start gap-2 bg-gold/5 -mx-4 -mb-4 p-4 rounded-b-sm">
                                  <Brain className="w-3.5 h-3.5 text-gold flex-shrink-0 mt-0.5" />
                                  <div className="text-[11px] text-smoke/90 leading-relaxed font-accent">
                                    <span className="text-gold font-bold uppercase tracking-wider block mb-0.5">
                                      Mentis Önerisi
                                    </span>
                                    {adviceText}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {!c.is_starred && (
                    <div className="pt-4 flex justify-end">
                      <button
                        onClick={() => handleSaveToJournal(c.id)}
                        disabled={savingId === c.id}
                        className="bg-gold text-void px-6 py-2.5 rounded-sm text-xs font-accent tracking-widest uppercase font-bold hover:bg-gold-dim transition-colors disabled:opacity-50"
                      >
                        {savingId === c.id ? "Kaydediliyor..." : "Deftere Kaydet"}
                      </button>
                    </div>
                  )}
                  {c.is_starred && (
                    <div className="pt-4 flex justify-end">
                      <span className="text-green-500/80 text-xs font-accent uppercase tracking-widest flex items-center gap-1.5 border border-green-900/50 bg-green-950/20 px-4 py-2 rounded-sm">
                        Defterde Kayıtlı
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
