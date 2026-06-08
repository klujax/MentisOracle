"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { StrategyInput } from "@/components/dashboard/StrategyInput";
import { LoadingMentis } from "@/components/ui/LoadingMentis";
import { createClient } from "@/lib/supabase/client";
import { Coins, BookMarked, RefreshCw, MessageSquare, Brain, Copy, Send } from "lucide-react";

interface StrategyResponse {
  id?: string;
  analysis: string;
  targetWeakness: string;
  execution: string;
  targetName?: string;
}

interface ChatMessage {
  role: "user" | "model";
  content: string;
}

const LOADING_PHASES = [
  "Zafiyetler analiz ediliyor...",
  "Güç dengeleri haritalanıyor...",
  "Psikolojik profiller çıkarılıyor...",
  "Karşı hamle kurgulanıyor...",
  "Strateji reçetesi hazırlanıyor...",
];

const CHARACTERS = [
  {
    id: "mentis",
    name: "Mentis",
    title: "Analist",
    description: "Soğuk, analitik ve duygu barındırmayan rasyonel zihin.",
    icon: Brain,
    color: "from-gold/30 to-yellow-600/30",
    textColor: "text-gold",
    borderColor: "border-gold/30"
  }
];

export default function DashboardPage() {
  const [status, setStatus] = useState<"idle" | "analyzing" | "complete">("idle");
  const [response, setResponse] = useState<StrategyResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [credits, setCredits] = useState<number | null>(null);
  const [plan, setPlan] = useState<string>("free");
  const [requiresPayment, setRequiresPayment] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [character, setCharacter] = useState<string>("mentis");
  const mode = "standard";

  // Chat follow-up state
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [followUpMessage, setFollowUpMessage] = useState("");
  const [followUpLoading, setFollowUpLoading] = useState(false);
  const [followUpError, setFollowUpError] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Save to Journal state
  const [isSaved, setIsSaved] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  const [loadingPhaseIndex, setLoadingPhaseIndex] = useState(0);

  useEffect(() => {
    if (status === "analyzing" || followUpLoading) {
      setLoadingPhaseIndex(0);
      const interval = setInterval(() => {
        setLoadingPhaseIndex((prev) => (prev < LOADING_PHASES.length - 1 ? prev + 1 : prev));
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [status, followUpLoading]);

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
    if (chatHistory.length > 0) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatHistory, followUpLoading, status]);





  const saveToLocalHistory = (strat: any, problem: string, char: string, m: string, targetName?: string) => {
    try {
      const localHistory = JSON.parse(localStorage.getItem("mentis_local_history") || "[]");
      const entryId = strat.id || `local_${Date.now()}`;
      const entry = {
        id: entryId,
        problem,
        analysis: strat.analysis,
        target_weakness: strat.targetWeakness,
        execution: strat.execution,
        created_at: new Date().toISOString(),
        is_starred: false,
        personal_notes: "",
        character: char,
        mode: m,
        target_name: targetName || null,
        chat_history: [
          { role: "user", content: problem },
          { 
            role: "model", 
            content: `01\n${strat.analysis}\n\n**[KARŞI TARAFIN MOTİVASYONU]**\n${strat.targetWeakness}\n\n**[STRATEJİK HAMLE]**\n${strat.execution}`
          }
        ]
      };
      
      const exists = localHistory.some((item: any) => item.id === entryId);
      if (!exists) {
        localHistory.unshift(entry);
        localStorage.setItem("mentis_local_history", JSON.stringify(localHistory));
      }
      return entryId;
    } catch (err) {
      console.error("Failed to save local history:", err);
      return null;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!followUpMessage.trim() || followUpLoading || status === "analyzing") return;
    
    if (chatHistory.length === 0) {
      if (followUpMessage.trim().length >= 10) {
        handleConsult(followUpMessage);
        setFollowUpMessage("");
      }
    } else {
      handleSendFollowUp(e);
    }
  };

  const handleConsult = async (problem: string) => {
    setStatus("analyzing");
    setError(null);
    setRequiresPayment(false);
    setIsSaved(false);
    setChatHistory([{ role: "user", content: problem }]);
    
    try {
      const res = await fetch("/api/mentis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problem, character, mode }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.requiresPayment) {
          setRequiresPayment(true);
        }
        throw new Error(data.error || "Mentis ağına bağlanılamadı.");
      }

      const localId = saveToLocalHistory(data, problem, character, mode);
      const updatedData = {
        ...data,
        id: data.id || localId
      };
      setResponse(updatedData);
      setStatus("complete");
      
      // Initialize chat history with the initial turn
      setChatHistory([
        { role: "user", content: problem },
        { 
          role: "model", 
          content: `01\n${data.analysis}\n\n**[KARŞI TARAFIN MOTİVASYONU]**\n${data.targetWeakness}\n\n**[STRATEJİK HAMLE]**\n${data.execution}` 
        }
      ]);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Bağlantı koptu.";
      setError(message);
      setStatus("idle");
      setChatHistory([]);
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
          message: userMsg,
          character,
          mode,
          transcript: chatHistory[0]?.content || ""
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.requiresPayment) {
          setRequiresPayment(true);
        }
        throw new Error(data.error || "Yanıt alınamadı.");
      }

      const botReply = data.reply;
      const finalContent = botReply;

      const newHistory: ChatMessage[] = [...updatedHistory, { role: "model", content: finalContent }];
      setChatHistory(newHistory);
      
      // Auto-save follow-up to DB in background (only if it's a real database UUID and not a local fallback ID)
      if (response?.id && !response.id.toString().startsWith("local_") && userId) {
        const supabase = createClient();
        supabase
          .from("consultations")
          .update({ chat_history: newHistory })
          .eq("id", response.id)
          .then(({ error }) => {
            if (error) console.error("Error auto-saving follow-up:", error);
          });
      }

      // Update in localStorage if saved locally (Journal and History)
      try {
        const entryId = response?.id;
        if (entryId) {
          // 1. Update in local history
          const localHistory = JSON.parse(localStorage.getItem("mentis_local_history") || "[]");
          const updatedHistory = localHistory.map((entry: any) => {
            if (entry.id === entryId || entry.id === `local_${entryId}`) {
              return { ...entry, chat_history: newHistory };
            }
            return entry;
          });
          localStorage.setItem("mentis_local_history", JSON.stringify(updatedHistory));

          // 2. Update in local journal
          const localJournal = JSON.parse(localStorage.getItem("mentis_local_journal") || "[]");
          const updatedJournal = localJournal.map((entry: any) => {
            if (entry.id === entryId || entry.id === `local_${entryId}`) {
              return { ...entry, chat_history: newHistory };
            }
            return entry;
          });
          localStorage.setItem("mentis_local_journal", JSON.stringify(updatedJournal));
        }
      } catch (localErr) {
        console.error("Failed to update chat history in local storage:", localErr);
      }
      
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

        // Update star status in local history too
        try {
          const entryId = response.id;
          const localHistory = JSON.parse(localStorage.getItem("mentis_local_history") || "[]");
          const updated = localHistory.map((item: any) => {
            if (item.id === entryId) {
              return { ...item, is_starred: true };
            }
            return item;
          });
          localStorage.setItem("mentis_local_history", JSON.stringify(updated));
        } catch (err) {
          console.error("Failed to update star in local history:", err);
        }
      } else {
        // Fallback if id was not returned for some reason
        const { error } = await supabase.from("consultations").insert({
          user_id: userId,
          problem: chatHistory[0]?.content || "Özel Sorun",
          analysis: response.analysis,
          target_weakness: response.targetWeakness,
          execution: response.execution,
          is_starred: true,
          chat_history: chatHistory,
          character: character,
          mode: mode,
          target_name: (response as any).targetName || null
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
          chat_history: chatHistory,
          character: character,
          mode: mode,
          target_name: (response as any).targetName || null
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
    <div className="flex flex-col w-full h-[calc(100vh-100px)] max-w-4xl mx-auto px-4 pb-4 animate-fade-in">
      
      {/* Centered Sticky Header Bar */}
      <div className="flex items-center justify-center py-4 border-b border-obsidian/45 flex-shrink-0 w-full relative">
        <div className="flex items-center gap-2.5">
          <Brain className="w-6 h-6 text-gold animate-pulse-gold" />
          <h2 className="font-serif text-xl md:text-2xl text-smoke tracking-wider uppercase">Zihin Karargahı</h2>
        </div>

        {/* Action buttons shown only when chat is active */}
        {chatHistory.length > 0 && (
          <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-2">
            <button
              onClick={handleSaveToJournal}
              disabled={isSaved || saveLoading || status === "analyzing"}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-sm font-accent tracking-widest text-[9px] uppercase transition-all duration-300 border ${
                isSaved 
                  ? "border-green-800 text-green-500 bg-green-950/20" 
                  : "border-gold text-gold hover:bg-gold/15"
              }`}
              title={isSaved ? "Defterde Kayıtlı" : "Deftere Kaydet"}
            >
              <BookMarked className="w-3 h-3" />
              {saveLoading ? "..." : isSaved ? <span className="hidden sm:inline">Defterde</span> : <span className="hidden sm:inline">Kaydet</span>}
            </button>
            <button 
              onClick={() => {
                setStatus("idle");
                setResponse(null);
                setChatHistory([]);
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 border border-obsidian bg-obsidian/40 text-ash hover:text-white transition-all rounded-sm font-accent tracking-widest text-[9px] uppercase"
              title="Sohbeti Temizle"
            >
              <RefreshCw className="w-3 h-3" />
              <span className="hidden sm:inline">Temizle</span>
            </button>
          </div>
        )}
      </div>

      {/* Main View Area */}
      <div className="flex-1 min-h-0 flex flex-col justify-between relative mt-4">
        
        {chatHistory.length === 0 ? (
          /* Sleek, Minimal Welcome / Onboarding State */
          <div className="flex-1 flex flex-col items-center justify-center p-4 max-w-2xl mx-auto space-y-8 animate-fade-in select-none">
            {/* Logo */}
            <div className="relative flex items-center justify-center w-16 h-16 mb-2">
              <div className="absolute inset-0 rounded-full border border-gold/20 animate-[spin_8s_linear_infinite]" />
              <div className="absolute inset-2 rounded-full border border-t-gold border-r-transparent border-b-gold/30 border-l-transparent animate-[spin_5s_linear_infinite_reverse]" />
              <Brain className="w-7 h-7 text-gold animate-pulse-gold absolute" strokeWidth={1.5} />
            </div>

            {/* Welcome Text */}
            <div className="text-center space-y-3">
              <h3 className="font-serif text-lg tracking-[0.2em] text-gold uppercase">MENTIS ANALİZ MODÜLÜ</h3>
              <p className="font-sans text-xs text-ash/70 max-w-sm mx-auto leading-relaxed">
                Rasyonel akıl ve soğukkanlı strateji. Çıkmaza girdiğin durumu aşağıya yazarak eylem reçeteni oluştur.
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="w-full px-4 py-2.5 border border-red-900/45 bg-red-900/10 text-red-400 text-xs font-accent italic text-center rounded-sm animate-fade-in">
                {error}
              </div>
            )}

            {/* Suggestion Chips */}
            <div className="w-full space-y-3 pt-4">
              <div className="flex items-center gap-2">
                <div className="h-[1px] flex-1 bg-obsidian/45" />
                <span className="text-[9px] uppercase tracking-widest text-ash/40 font-accent font-bold">Örnek Durumlar</span>
                <div className="h-[1px] flex-1 bg-obsidian/45" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {[
                  "Yöneticim hak ettiğim terfiyi sürekli erteliyor ve geçiştiriyor.",
                  "Ortağım kararları benden gizli alıyor, gücümü kazanmak istiyorum.",
                  "Müşterim fiyat indirimi istiyor, aksi halde gitmekle tehdit ediyor.",
                  "Çatışma yaşadığım meslektaşımla masada üstünlük kurmak istiyorum."
                ].map((suggestion, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleConsult(suggestion)}
                    className="text-left p-3 border border-obsidian/60 bg-abyss/10 hover:border-gold/45 hover:bg-gold/5 text-xs text-ash hover:text-gold rounded-sm transition-all duration-300 font-sans leading-relaxed cursor-pointer hover:shadow-[0_0_10px_rgba(201,168,76,0.05)]"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Active Chat View */
          <div className="flex-1 overflow-y-auto space-y-6 py-4 pr-2 scrollbar-custom">
            
            {chatHistory.map((msg, index) => {
              const isUser = msg.role === "user";
              
              if (isUser) {
                return (
                  <div key={index} className="flex w-full justify-end animate-fade-in">
                    <div className="max-w-[85%] rounded-sm p-4 bg-obsidian border border-gold/10 text-smoke text-xs md:text-sm leading-relaxed shadow-lg">
                      <p className="text-[9px] uppercase tracking-widest mb-1.5 font-accent text-ash/60 font-bold">
                        SİZ
                      </p>
                      <div className="whitespace-pre-wrap font-sans font-medium">{msg.content}</div>
                    </div>
                  </div>
                );
              }

              // Model Message
              if (index === 1 && response) {
                // Initial 3-Part analysis from Mentis
                return (
                  <div key={index} className="space-y-6 animate-fade-in w-full">
                    <div className="text-center my-6 border-b border-obsidian/30 pb-3 max-w-md mx-auto">
                      <h4 className="font-serif text-lg text-smoke uppercase tracking-widest mb-1">Mentis Reçetesi</h4>
                      <p className="font-accent italic text-[10px] text-ash">Soğukkanlı. Rasyonel. Kesin.</p>
                    </div>

                    <div className="grid gap-6 max-w-4xl mx-auto">
                      {/* Card 1: 01 */}
                      <div className="relative p-5 md:p-6 rounded-sm bg-abyss border border-obsidian shadow-md">
                        <div className="absolute top-0 left-4 md:left-6 -translate-y-1/2 bg-void px-2 font-serif text-gold text-xs sm:text-sm tracking-wider flex items-center gap-2">
                          <span className="text-[10px] opacity-50">01</span>
                        </div>
                        <div className="mt-3 font-sans text-smoke leading-relaxed tracking-wide text-xs md:text-sm whitespace-pre-wrap animate-[fade-in_0.5s_ease-out]">
                          {response.analysis}
                        </div>
                      </div>

                      {/* Card 2: Karşı Tarafın Motivasyonu */}
                      {response.targetWeakness && (
                        <div className="relative p-5 md:p-6 rounded-sm bg-abyss border border-gold/30 shadow-[0_0_20px_rgba(201,168,76,0.03)]">
                          <div className="absolute top-0 left-4 md:left-6 -translate-y-1/2 bg-void px-2 font-serif text-gold text-xs sm:text-sm tracking-wider flex items-center gap-2">
                            <span className="text-[10px] opacity-50">02</span>
                            KARŞI TARAFIN MOTİVASYONU
                          </div>
                          <div className="mt-3 font-sans text-smoke leading-relaxed tracking-wide text-xs md:text-sm whitespace-pre-wrap animate-[fade-in_0.5s_ease-out]">
                            {response.targetWeakness}
                          </div>
                        </div>
                      )}

                      {/* Card 3: Stratejik Hamle */}
                      {response.execution && (
                        <div className="relative p-5 md:p-6 rounded-sm bg-abyss border border-obsidian shadow-md">
                          <div className="absolute top-0 left-4 md:left-6 -translate-y-1/2 bg-void px-2 font-serif text-gold text-xs sm:text-sm tracking-wider flex items-center gap-2">
                            <span className="text-[10px] opacity-50">03</span>
                            STRATEJİK HAMLE
                          </div>
                          <div className="mt-3 font-sans text-smoke leading-relaxed tracking-wide text-xs md:text-sm whitespace-pre-wrap animate-[fade-in_0.5s_ease-out]">
                            {response.execution}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              }

              // Subsequent follow-up model replies
              return (
                <div key={index} className="flex w-full justify-start animate-fade-in">
                  <div className="max-w-[85%] rounded-sm p-4 bg-abyss border border-obsidian text-smoke text-xs md:text-sm leading-relaxed shadow-lg">
                    <p className="text-[9px] uppercase tracking-widest mb-1.5 font-accent text-gold font-bold">
                      {(CHARACTERS.find(c => c.id === character)?.name || "MENTIS").toUpperCase()}
                    </p>
                    <div className="whitespace-pre-wrap font-sans leading-relaxed">{msg.content}</div>
                  </div>
                </div>
              );
            })}

            {/* In-chat Loading / Thinking state */}
            {(status === "analyzing" || followUpLoading) && (
              <div className="flex w-full justify-start animate-pulse">
                <div className="rounded-sm p-5 bg-abyss/85 border border-obsidian text-smoke max-w-[85%] flex items-start gap-4 shadow-lg">
                  <div className="relative flex items-center justify-center w-8 h-8 flex-shrink-0">
                    <div className="absolute inset-0 rounded-full border border-gold/25 animate-[spin_3s_linear_infinite]" />
                    <Brain className="w-4 h-4 text-gold animate-pulse-gold absolute" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] uppercase tracking-widest font-accent text-gold font-bold">
                      {(CHARACTERS.find(c => c.id === character)?.name || "MENTIS").toUpperCase()}
                    </p>
                    <p className="text-xs italic font-accent text-ash animate-pulse">
                      {LOADING_PHASES[loadingPhaseIndex]}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {followUpError && (
              <div className="p-3 bg-red-950/20 border border-red-900/50 text-red-400 text-xs text-center rounded-sm font-accent italic animate-fade-in">
                {followUpError}
              </div>
            )}

            <div ref={chatEndRef} />
          </div>
        )}

        {/* Input Footer Container */}
        <div className="bg-void border-t border-obsidian/40 pt-4 flex-shrink-0">
          {requiresPayment ? (
            <div className="text-center py-4 bg-red-950/15 border border-red-900/40 rounded-sm">
              <p className="text-ash font-accent italic text-xs mb-2">Bedava kredilerin tükendi. Oyun burada bitmiyor.</p>
              <Link
                href="/dashboard/billing"
                className="inline-block bg-gold text-void px-6 py-2 text-xs font-bold uppercase tracking-widest hover:bg-gold-dim transition-colors"
              >
                Kredi Yükle
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">
              <div className="flex gap-3 items-end">
                <textarea
                  rows={2}
                  value={followUpMessage}
                  onChange={(e) => setFollowUpMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      if (followUpMessage.trim().length >= (chatHistory.length === 0 ? 10 : 1)) {
                        handleSubmit(e);
                      }
                    }
                  }}
                  disabled={followUpLoading || status === "analyzing"}
                  placeholder={chatHistory.length === 0 
                    ? "Masadaki durumu ve seni çıkmaza sokan son hamleyi detaylıca anlat..." 
                    : "Eylem planını derinleştirin: 'İlk kelime ne olmalı?' veya 'Yazmazsa ne yapmalıyım?'"}
                  className="flex-1 bg-abyss border border-obsidian text-smoke placeholder:text-ash/40 px-4 py-3 rounded-sm text-xs md:text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold focus-visible:border-gold/50 transition-all duration-300 disabled:opacity-50 resize-none scrollbar-none"
                />
                <button
                  type="submit"
                  disabled={followUpLoading || status === "analyzing" || followUpMessage.trim().length < (chatHistory.length === 0 ? 10 : 1)}
                  className="bg-gold text-void p-3.5 rounded-sm hover:bg-gold-dim transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center flex-shrink-0 h-[46px] w-[46px]"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>

              <div className="flex justify-between items-center px-1 text-[10px] text-ash/50 font-accent">
                <div>
                  {credits !== null && (
                    <span className="flex items-center gap-1.5">
                      <Coins className="w-3.5 h-3.5 text-gold" />
                      Kalan Kredi: <span className="text-gold font-bold">{plan === "elite" ? "∞" : credits}</span>
                    </span>
                  )}
                </div>
                <div>
                  {chatHistory.length === 0 ? (
                    followUpMessage.trim().length > 0 && followUpMessage.trim().length < 10 ? (
                      <span className="text-red-400/80 font-bold">Durumu analiz etmek için en az 10 karakter yazın ({followUpMessage.trim().length}/10)</span>
                    ) : (
                      <span className="opacity-60">Durumu detaylandırıp gönderin (En az 10 karakter)</span>
                    )
                  ) : (
                    <span className="opacity-60">Enter ile gönder, Shift + Enter ile yeni satır</span>
                  )}
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
