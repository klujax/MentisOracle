"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { StrategyInput } from "@/components/dashboard/StrategyInput";
import { LoadingMentis } from "@/components/ui/LoadingMentis";
import { MentisResponse } from "@/components/dashboard/MentisResponse";
import { createClient } from "@/lib/supabase/client";
import { Coins, BookMarked, Send, RefreshCw, MessageSquare } from "lucide-react";

interface StrategyResponse {
  id?: string;
  analysis: string;
  targetWeakness: string;
  execution: string;
}

interface ChatMessage {
  role: "user" | "model";
  content: string;
}

export default function DashboardPage() {
  const [status, setStatus] = useState<"idle" | "analyzing" | "complete">("idle");
  const [response, setResponse] = useState<StrategyResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [credits, setCredits] = useState<number | null>(null);
  const [plan, setPlan] = useState<string>("free");
  const [requiresPayment, setRequiresPayment] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Chat follow-up state
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [followUpMessage, setFollowUpMessage] = useState("");
  const [followUpLoading, setFollowUpLoading] = useState(false);
  const [followUpError, setFollowUpError] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Save to Journal state
  const [isSaved, setIsSaved] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  const fetchCredits = async () => {
    const supabase = createClient();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
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
    } catch (err) {
      console.error("Error fetching credits:", err);
    }
  };

  useEffect(() => {
    fetchCredits();
  }, [status]); // Refresh credits after each consultation

  // Scroll to bottom of chat when history updates
  useEffect(() => {
    if (chatHistory.length > 2) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatHistory, followUpLoading]);

  const handleConsult = async (problem: string) => {
    setStatus("analyzing");
    setError(null);
    setRequiresPayment(false);
    setIsSaved(false);
    
    try {
      const res = await fetch("/api/mentis", {
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
      
      // Initialize chat history with the initial turn
      setChatHistory([
        { role: "user", content: problem },
        { 
          role: "model", 
          content: `**[DURUM ANALİZİ]**\n${data.analysis}\n\n**[KARŞI TARAFIN MOTİVASYONU]**\n${data.targetWeakness}\n\n**[STRATEJİK HAMLE]**\n${data.execution}` 
        }
      ]);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Bağlantı koptu.";
      setError(message);
      setStatus("idle");
    }
  };

  const handleSendFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!followUpMessage.trim() || followUpLoading) return;

    const userMsg = followUpMessage.trim();
    setFollowUpMessage("");
    setFollowUpError(null);
    setFollowUpLoading(true);

    const updatedHistory: ChatMessage[] = [...chatHistory, { role: "user", content: userMsg }];
    setChatHistory(updatedHistory);

    try {
      const res = await fetch("/api/mentis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          history: updatedHistory,
          message: userMsg
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.requiresPayment) {
          setRequiresPayment(true);
        }
        throw new Error(data.error || "Yanıt alınamadı.");
      }

      setChatHistory(prev => [...prev, { role: "model", content: data.reply }]);
      
      // Refresh credits
      await fetchCredits();
    } catch (err: any) {
      setFollowUpError(err.message || "Mesaj gönderilemedi. Lütfen tekrar deneyin.");
      // Rollback history if failed
      setChatHistory(chatHistory);
    } finally {
      setFollowUpLoading(false);
    }
  };

  const handleSaveToJournal = async () => {
    if (!response || !userId || saveLoading) return;
    setSaveLoading(true);

    try {
      const supabase = createClient();
      
      // 1. Try Supabase
      if (response.id) {
        const { error } = await supabase
          .from("consultations")
          .update({ 
            is_starred: true,
            chat_history: chatHistory 
          })
          .eq("id", response.id);
        
        if (error) throw error;
      } else {
        // Fallback if id was not returned for some reason
        const { error } = await supabase.from("consultations").insert({
          user_id: userId,
          problem: chatHistory[0]?.content || "Özel Sorun",
          analysis: response.analysis,
          target_weakness: response.targetWeakness,
          execution: response.execution,
          is_starred: true,
          chat_history: chatHistory
        });

        if (error) throw error;
      }
      
      setIsSaved(true);
    } catch (err: any) {
      console.warn("Supabase save failed, falling back to localStorage:", err.message);
      
      // 2. Fallback to localStorage
      try {
        const localJournal = JSON.parse(localStorage.getItem("mentis_local_journal") || "[]");
        const entry = {
          id: response.id || `local_${Date.now()}`,
          problem: chatHistory[0]?.content || "Özel Sorun",
          analysis: response.analysis,
          target_weakness: response.targetWeakness,
          execution: response.execution,
          created_at: new Date().toISOString(),
          is_starred: true,
          personal_notes: "",
          chat_history: chatHistory
        };
        localJournal.push(entry);
        localStorage.setItem("mentis_local_journal", JSON.stringify(localJournal));
        setIsSaved(true);
        alert("Deftere kaydedildi (Veritabanı senkronizasyon hatası nedeniyle geçici olarak tarayıcı hafızasına kaydedildi).");
      } catch (localErr) {
        console.error("Local storage save failed:", localErr);
        alert("Deftere kaydedilirken bir hata oluştu.");
      }
    } finally {
      setSaveLoading(false);
    }
  };
  return (
    <div className={`flex flex-col items-center w-full mx-auto ${status === "complete" ? "h-[calc(100vh-200px)] min-h-[500px] max-w-4xl px-4" : "max-w-5xl space-y-12 pb-24"}`}>
      
      {status !== "complete" && (
        <div className="text-center space-y-4 mb-4 pt-8">
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
      )}
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
                href="/dashboard/billing"
                className="inline-block bg-gold text-void px-8 py-3 text-sm font-bold uppercase tracking-widest hover:bg-gold-dim transition-colors"
              >
                Kredi Yükle
              </Link>
            </div>
          )}
          {!requiresPayment && <StrategyInput onSubmit={handleConsult} />}
        </div>
      )}

      {status === "analyzing" && (
        <div className="w-full">
          <LoadingMentis />
        </div>
      )}

      {status === "complete" && response && (
        <div className="w-full max-w-4xl animate-fade-in flex-1 min-h-0 flex flex-col h-full">
          <div className="w-full border border-obsidian/50 bg-abyss/45 rounded-sm overflow-hidden flex flex-col shadow-2xl relative flex-1 min-h-0 h-full">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
            
            {/* Header with Info and Actions */}
            <div className="p-4 border-b border-obsidian/50 bg-abyss flex flex-col md:flex-row items-center justify-between gap-4 flex-shrink-0">
              <div className="flex items-center gap-3">
                <MessageSquare className="w-5 h-5 text-gold" />
                <div className="text-left">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-sm font-serif text-smoke tracking-wider uppercase">Stratejik Plan ve Diyalog</h4>
                    {credits !== null && (
                      <span className="flex items-center gap-1 text-[10px] font-accent text-ash bg-void border border-obsidian px-2 py-0.5 rounded-sm">
                        <Coins className="w-3 h-3 text-gold" />
                        <span>Kalan: <span className="text-gold font-bold">{plan === "elite" ? "∞" : credits}</span></span>
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-ash">Mentis Reçetesi&apos;ni inceleyin ve sorularınızla derinleştirin.</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                <button
                  onClick={handleSaveToJournal}
                  disabled={isSaved || saveLoading}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-sm font-accent tracking-widest text-[10px] uppercase transition-all duration-300 border ${
                    isSaved 
                      ? "border-green-800 text-green-500 bg-green-950/20" 
                      : "border-gold text-gold hover:bg-gold/10"
                  }`}
                >
                  <BookMarked className="w-3.5 h-3.5" />
                  {saveLoading ? "..." : isSaved ? "Deftere Kaydedildi" : "Deftere Kaydet"}
                </button>
                <button 
                  onClick={() => {
                    setStatus("idle");
                    setResponse(null);
                    setChatHistory([]);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 border border-obsidian bg-obsidian/50 text-ash hover:text-white transition-colors rounded-sm font-accent tracking-widest text-[10px] uppercase"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Yeni Hamle
                </button>
              </div>
            </div>

            {/* Conversation Feed Area */}
            <div className="p-6 flex-1 min-h-0 overflow-y-auto space-y-6 scrollbar-custom">
              
              {/* 3-Part Mentis Analysis */}
              <div className="space-y-8 pb-4">
                <div className="text-center mb-8 border-b border-obsidian/30 pb-4">
                  <h3 className="font-serif text-xl md:text-2xl text-smoke uppercase tracking-widest mb-1.5">Mentis Reçetesi</h3>
                  <p className="font-accent italic text-xs md:text-sm text-ash">Soğukkanlı. Rasyonel. Kesin.</p>
                </div>

                <div className="grid gap-6">
                  {!response.targetWeakness && !response.execution ? (
                    <div className="relative p-5 md:p-6 rounded-sm bg-abyss border border-gold/30 shadow-[0_0_20px_rgba(201,168,76,0.03)] animate-[fade-in_1s_ease-out_forwards]">
                      <div className="absolute top-0 left-4 md:left-6 -translate-y-1/2 bg-void px-2 font-serif text-gold text-xs sm:text-sm tracking-wider flex items-center gap-2">
                        MENTİS YÖNLENDİRMESİ
                      </div>
                      <div className="mt-3 font-sans text-smoke leading-relaxed tracking-wide text-xs md:text-sm whitespace-pre-wrap">
                        {response.analysis}
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Card 1: Durum Analizi */}
                      <div className="relative p-5 md:p-6 rounded-sm bg-abyss border border-obsidian animate-[fade-in_1s_ease-out_forwards]">
                        <div className="absolute top-0 left-4 md:left-6 -translate-y-1/2 bg-void px-2 font-serif text-gold text-xs sm:text-sm tracking-wider flex items-center gap-2">
                          <span className="text-[10px] opacity-50">01</span>
                          DURUM ANALİZİ
                        </div>
                        <div className="mt-3 font-sans text-smoke leading-relaxed tracking-wide text-xs md:text-sm whitespace-pre-wrap">
                          {response.analysis}
                        </div>
                      </div>

                      {/* Card 2: Karşı Tarafın Motivasyonu */}
                      {response.targetWeakness && (
                        <div className="relative p-5 md:p-6 rounded-sm bg-abyss border border-gold/30 shadow-[0_0_20px_rgba(201,168,76,0.03)] animate-[fade-in_1s_ease-out_forwards] delay-200">
                          <div className="absolute top-0 left-4 md:left-6 -translate-y-1/2 bg-void px-2 font-serif text-gold text-xs sm:text-sm tracking-wider flex items-center gap-2">
                            <span className="text-[10px] opacity-50">02</span>
                            KARŞI TARAFIN MOTİVASYONU
                          </div>
                          <div className="mt-3 font-sans text-smoke leading-relaxed tracking-wide text-xs md:text-sm whitespace-pre-wrap">
                            {response.targetWeakness}
                          </div>
                        </div>
                      )}

                      {/* Card 3: Stratejik Hamle */}
                      {response.execution && (
                        <div className="relative p-5 md:p-6 rounded-sm bg-abyss border border-obsidian animate-[fade-in_1s_ease-out_forwards] delay-400">
                          <div className="absolute top-0 left-4 md:left-6 -translate-y-1/2 bg-void px-2 font-serif text-gold text-xs sm:text-sm tracking-wider flex items-center gap-2">
                            <span className="text-[10px] opacity-50">03</span>
                            STRATEJİK HAMLE
                          </div>
                          <div className="mt-3 font-sans text-smoke leading-relaxed tracking-wide text-xs md:text-sm whitespace-pre-wrap">
                            {response.execution}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Follow-up messages */}
              {chatHistory.map((msg, index) => {
                if (index < 2) return null;

                const isUser = msg.role === "user";
                return (
                  <div key={index} className={`flex w-full ${isUser ? "justify-end" : "justify-start"} animate-fade-in`}>
                    <div className={`max-w-[85%] rounded-sm p-4 text-xs md:text-sm leading-relaxed ${
                      isUser 
                        ? "bg-obsidian border border-gold/10 text-smoke" 
                        : "bg-abyss/85 border border-obsidian text-smoke"
                    }`}>
                      <p className={`text-[10px] uppercase tracking-widest mb-1.5 font-accent ${
                        isUser ? "text-ash/60" : "text-gold font-bold"
                      }`}>
                        {isUser ? "SİZ" : "MENTIS"}
                      </p>
                      <div className="whitespace-pre-wrap font-sans">{msg.content}</div>
                    </div>
                  </div>
                );
              })}

              {followUpLoading && (
                <div className="flex justify-start animate-pulse">
                  <div className="bg-abyss/85 border border-obsidian/50 rounded-sm p-4 max-w-[85%] text-smoke text-xs md:text-sm">
                    <p className="text-[10px] text-gold font-bold uppercase tracking-widest mb-1.5 font-accent">Mentis</p>
                    <p className="italic font-accent text-ash">Hamleler hesaplanıyor...</p>
                  </div>
                </div>
              )}

              {followUpError && (
                <div className="p-3 bg-red-950/20 border border-red-900/50 text-red-400 text-xs text-center rounded-sm font-accent italic">
                  {followUpError}
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Chat Input Footer */}
            <form onSubmit={handleSendFollowUp} className="p-4 bg-abyss border-t border-obsidian/50 flex gap-3 flex-shrink-0">
              <input
                type="text"
                value={followUpMessage}
                onChange={(e) => setFollowUpMessage(e.target.value)}
                disabled={followUpLoading}
                placeholder="Eylem planını derinleştirin: 'İlk kelime ne olmalı?' veya 'Yazmazsa ne yapmalıyım?'"
                className="flex-1 bg-void border border-obsidian text-smoke placeholder:text-ash/40 px-4 py-3 rounded-sm text-xs md:text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold focus-visible:border-gold/50 transition-all duration-300 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!followUpMessage.trim() || followUpLoading}
                className="bg-gold text-void p-3 rounded-sm hover:bg-gold-dim transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
