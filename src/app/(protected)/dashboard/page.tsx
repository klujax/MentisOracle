"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { StrategyInput } from "@/components/dashboard/StrategyInput";
import { LoadingMentis } from "@/components/ui/LoadingMentis";
import { MentisResponse } from "@/components/dashboard/MentisResponse";
import { createClient } from "@/lib/supabase/client";
import { Coins, BookMarked, Send, RefreshCw, MessageSquare, Brain, Flame, FlaskConical, ShieldAlert, Search, Trash2, UserPlus, User } from "lucide-react";

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
  },
  {
    id: "tyler_durden",
    name: "Tyler Durden",
    title: "Fight Club",
    description: "Korkularını ve sistem kurallarını yıkan radikal anarşist.",
    icon: Flame,
    color: "from-red-500/20 to-orange-600/20",
    textColor: "text-red-500",
    borderColor: "border-red-900/50"
  },
  {
    id: "walter_white",
    name: "Walter White",
    title: "Heisenberg",
    description: "Riskleri kimyasal hassasiyetle hesaplayan deha oyun kurucu.",
    icon: FlaskConical,
    color: "from-emerald-500/20 to-teal-600/20",
    textColor: "text-emerald-500",
    borderColor: "border-emerald-900/50"
  },
  {
    id: "don_corleone",
    name: "Don Corleone",
    title: "Baba",
    description: "Saygınlık, onur ve sadakatle sessiz gücü yöneten lider.",
    icon: ShieldAlert,
    color: "from-purple-500/20 to-indigo-600/20",
    textColor: "text-purple-400",
    borderColor: "border-purple-900/50"
  },
  {
    id: "sherlock",
    name: "Sherlock Holmes",
    title: "Dedektif",
    description: "Duyguları yok sayıp sadece verilere odaklanan hiper-aktif zeka.",
    icon: Search,
    color: "from-blue-500/20 to-cyan-600/20",
    textColor: "text-blue-400",
    borderColor: "border-blue-900/50"
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
  const [mode, setMode] = useState<"standard" | "simulation">("standard");
  const [activeAdvice, setActiveAdvice] = useState<string | null>(null);

  // Custom simulation target contacts state
  interface SimulationTarget {
    id: string;
    name: string;
    transcript: string;
  }
  const [targets, setTargets] = useState<SimulationTarget[]>([]);
  const [selectedTarget, setSelectedTarget] = useState<SimulationTarget | null>(null);
  const [isCreatingTarget, setIsCreatingTarget] = useState(false);
  const [newTargetName, setNewTargetName] = useState("");
  const [newTargetTranscript, setNewTargetTranscript] = useState("");
  const [targetLoading, setTargetLoading] = useState(false);

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

  // Fetch simulation targets from Supabase
  const fetchTargets = async () => {
    if (!userId) return;
    const supabase = createClient();
    try {
      const { data, error } = await supabase
        .from("simulation_targets")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setTargets(data || []);
    } catch (err) {
      console.warn("Failed to fetch simulation targets, using localStorage fallback:", err);
      try {
        const local = JSON.parse(localStorage.getItem("mentis_local_targets") || "[]");
        setTargets(local);
      } catch (localErr) {
        console.error("Local storage load for targets failed:", localErr);
      }
    }
  };

  useEffect(() => {
    if (mode === "simulation" && userId) {
      fetchTargets();
    }
  }, [mode, userId]);

  const handleSaveTarget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTargetName.trim() || !newTargetTranscript.trim() || !userId) return;
    setTargetLoading(true);

    const newTarget = {
      user_id: userId,
      name: newTargetName.trim(),
      transcript: newTargetTranscript.trim()
    };

    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("simulation_targets")
        .insert(newTarget)
        .select()
        .single();
      
      if (error) throw error;
      
      if (data) {
        setTargets(prev => [data, ...prev]);
        setSelectedTarget(data);
        setIsCreatingTarget(false);
        setNewTargetName("");
        setNewTargetTranscript("");
        handleStartSimulation(data);
      }
    } catch (err: any) {
      console.warn("Failed to save target to DB, using localStorage fallback:", err.message);
      try {
        const local = JSON.parse(localStorage.getItem("mentis_local_targets") || "[]");
        const entry = {
          id: `local_target_${Date.now()}`,
          name: newTargetName.trim(),
          transcript: newTargetTranscript.trim(),
          created_at: new Date().toISOString()
        };
        local.unshift(entry);
        localStorage.setItem("mentis_local_targets", JSON.stringify(local));
        setTargets(local);
        setSelectedTarget(entry);
        setIsCreatingTarget(false);
        setNewTargetName("");
        setNewTargetTranscript("");
        handleStartSimulation(entry);
      } catch (localErr) {
        console.error("Local storage save for target failed:", localErr);
        alert("Kişi kaydedilirken bir hata oluştu.");
      }
    } finally {
      setTargetLoading(false);
    }
  };

  const handleDeleteTarget = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Bu kişiyi ve tüm yazışma geçmişini silmek istediğinize emin misiniz?")) return;

    const isLocal = id.toString().startsWith("local_target_");

    if (!isLocal) {
      try {
        const supabase = createClient();
        const { error } = await supabase
          .from("simulation_targets")
          .delete()
          .eq("id", id);
        
        if (error) throw error;
        setTargets(prev => prev.filter(t => t.id !== id));
        if (selectedTarget?.id === id) setSelectedTarget(null);
      } catch (err) {
        console.error("Failed to delete target from DB:", err);
        alert("Kişi silinirken bir hata oluştu.");
      }
    } else {
      try {
        const local = JSON.parse(localStorage.getItem("mentis_local_targets") || "[]");
        const updated = local.filter((t: any) => t.id !== id);
        localStorage.setItem("mentis_local_targets", JSON.stringify(updated));
        setTargets(updated);
        if (selectedTarget?.id === id) setSelectedTarget(null);
      } catch (localErr) {
        console.error("Failed to delete target from localStorage:", localErr);
      }
    }
  };

  const handleStartSimulation = async (target: SimulationTarget) => {
    setStatus("analyzing");
    setError(null);
    setRequiresPayment(false);
    setIsSaved(false);
    setActiveAdvice(null);
    
    try {
      const res = await fetch("/api/mentis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          problem: target.transcript, 
          character: "mentis", 
          mode: "simulation",
          targetName: target.name
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.requiresPayment) {
          setRequiresPayment(true);
        }
        throw new Error(data.error || "Simülasyon başlatılamadı.");
      }

      setResponse({
        ...data,
        targetName: target.name
      });
      setStatus("complete");
      
      setChatHistory([
        { role: "user", content: target.transcript },
        { 
          role: "model", 
          content: `**[KARAKTER PROFİLİ]**\n${data.analysis}\n\n**[MASADAKİ DENGE]**\n${data.targetWeakness}\n\n**[STRATEJİK PLAN]**\n${data.execution}` 
        }
      ]);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Bağlantı koptu.";
      setError(message);
      setStatus("idle");
    }
  };

  const handleConsult = async (problem: string) => {
    setStatus("analyzing");
    setError(null);
    setRequiresPayment(false);
    setIsSaved(false);
    
    try {
      setActiveAdvice(null);
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
      const botAdvice = mode === "simulation" ? data.advice : null;

      if (botAdvice) {
        setActiveAdvice(botAdvice);
      }

      const finalContent = botAdvice 
        ? `${botReply}\n\n**[MENTİS ÖNERİSİ]**\n${botAdvice}` 
        : botReply;

      const newHistory: ChatMessage[] = [...updatedHistory, { role: "model", content: finalContent }];
      setChatHistory(newHistory);
      
      // Auto-save follow-up to DB in background
      if (response?.id && userId) {
        const supabase = createClient();
        supabase
          .from("consultations")
          .update({ chat_history: newHistory })
          .eq("id", response.id)
          .then(({ error }) => {
            if (error) console.error("Error auto-saving follow-up:", error);
          });
      }

      // Update in localStorage if saved locally
      try {
        const localJournal = JSON.parse(localStorage.getItem("mentis_local_journal") || "[]");
        const entryId = response?.id;
        if (entryId) {
          const updatedLocal = localJournal.map((entry: any) => {
            if (entry.id === entryId || entry.id === `local_${entryId}`) {
              return { ...entry, chat_history: newHistory };
            }
            return entry;
          });
          localStorage.setItem("mentis_local_journal", JSON.stringify(updatedLocal));
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
          character: mode === "simulation" ? "mentis" : character,
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
          character: mode === "simulation" ? "mentis" : character,
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
          {!requiresPayment && (
            <div className="w-full flex flex-col items-center space-y-6">
              {/* Mode Toggle */}
              <div className="flex border border-obsidian/80 bg-abyss/45 p-1 rounded-sm max-w-sm w-full">
                <button
                  type="button"
                  onClick={() => setMode("standard")}
                  className={`flex-1 py-1.5 text-[10px] font-accent tracking-widest uppercase transition-colors rounded-sm ${
                    mode === "standard" 
                      ? "bg-gold text-void font-bold shadow-md" 
                      : "text-ash hover:text-smoke bg-transparent"
                  }`}
                >
                  Durum Analizi
                </button>
                <button
                  type="button"
                  onClick={() => setMode("simulation")}
                  className={`flex-1 py-1.5 text-[10px] font-accent tracking-widest uppercase transition-colors rounded-sm ${
                    mode === "simulation" 
                      ? "bg-gold text-void font-bold shadow-md" 
                      : "text-ash hover:text-smoke bg-transparent"
                  }`}
                >
                  Sohbet Simülasyonu
                </button>
              </div>

              {mode === "standard" ? (
                <div className="w-full flex flex-col items-center space-y-6">
                  <div className="w-full max-w-3xl">
                    <p className="text-xs uppercase tracking-widest text-ash/80 font-accent mb-3 text-center sm:text-left">Stratejik Karakter Seçimi</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                      {CHARACTERS.map((char) => {
                        const Icon = char.icon;
                        const isSelected = character === char.id;
                        return (
                          <button
                            key={char.id}
                            onClick={() => setCharacter(char.id)}
                            className={`relative p-3 rounded-sm border flex flex-col items-center text-center transition-all duration-300 ${
                              isSelected 
                                ? `bg-gradient-to-b ${char.color} ${char.borderColor} shadow-[0_0_15px_rgba(201,168,76,0.05)]` 
                                : 'border-obsidian bg-abyss/20 hover:border-obsidian/80 hover:bg-abyss/45'
                            }`}
                          >
                            <Icon className={`w-5 h-5 mb-2 ${isSelected ? char.textColor : 'text-ash/60'}`} />
                            <span className={`text-xs font-serif tracking-wider font-semibold ${isSelected ? 'text-smoke' : 'text-ash'}`}>
                              {char.name}
                            </span>
                            <span className="text-[9px] text-ash/40 font-accent mt-0.5 tracking-wider uppercase">
                              {char.title}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                    {/* Description of active character */}
                    <div className="mt-3 p-3 bg-abyss/30 border border-obsidian/40 rounded-sm text-center sm:text-left">
                      <p className="text-[11px] text-ash font-accent leading-relaxed">
                        <span className="text-gold font-bold">Karakter Analizi: </span>
                        {CHARACTERS.find(c => c.id === character)?.description}
                      </p>
                    </div>
                  </div>
                  
                  <StrategyInput 
                    onSubmit={handleConsult} 
                    placeholder="Masadaki konumunu zayıflatan o son hamleyi anlat..."
                  />
                </div>
              ) : (
                /* Custom Targets Selector */
                <div className="w-full max-w-3xl space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs uppercase tracking-widest text-ash/80 font-accent">Simüle Edilecek Kişiler</p>
                    {!isCreatingTarget && (
                      <button
                        type="button"
                        onClick={() => setIsCreatingTarget(true)}
                        className="flex items-center gap-1.5 text-[10px] text-gold border border-gold/30 bg-gold/5 px-2.5 py-1 rounded-sm font-accent tracking-widest uppercase hover:bg-gold/15 transition-all"
                      >
                        <UserPlus className="w-3.5 h-3.5" /> Yeni Kişi Ekle
                      </button>
                    )}
                  </div>

                  {isCreatingTarget ? (
                    <form onSubmit={handleSaveTarget} className="p-5 border border-obsidian bg-abyss/45 rounded-sm space-y-4 animate-fade-in relative text-left">
                      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
                      <h4 className="text-sm font-serif text-smoke tracking-wider uppercase mb-2">Yeni Simülasyon Hedefi Oluştur</h4>
                      
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-ash uppercase tracking-wider font-accent">Kişi Adı veya Takma Ad (Örn: Merve, Ahmet, Patron)</label>
                        <input
                          type="text"
                          required
                          value={newTargetName}
                          onChange={(e) => setNewTargetName(e.target.value)}
                          placeholder="Örn: Merve"
                          className="w-full bg-void border border-obsidian text-smoke placeholder:text-ash/40 px-4 py-2.5 rounded-sm text-xs md:text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold transition-all"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] text-ash uppercase tracking-wider font-accent">Örnek Yazışma Geçmişi (Konuşma Tarzı Analizi İçin)</label>
                        <textarea
                          required
                          value={newTargetTranscript}
                          onChange={(e) => setNewTargetTranscript(e.target.value)}
                          placeholder="Karşı tarafın konuşma tarzını, noktalama işaretlerini, emoji alışkanlıklarını taklit edebilmesi için ondan gelen birkaç mesajı veya aranızdaki eski bir diyaloğu kopyalayıp buraya yapıştırın..."
                          className="w-full h-32 bg-void border border-obsidian text-smoke placeholder:text-ash/40 p-4 rounded-sm text-xs md:text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold resize-none transition-all"
                        />
                      </div>

                      <div className="flex justify-end gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            setIsCreatingTarget(false);
                            setNewTargetName("");
                            setNewTargetTranscript("");
                          }}
                          className="px-4 py-2 text-[10px] font-accent uppercase tracking-widest text-ash border border-obsidian hover:text-white transition-colors"
                        >
                          İptal
                        </button>
                        <button
                          type="submit"
                          disabled={targetLoading || !newTargetName.trim() || !newTargetTranscript.trim()}
                          className="bg-gold text-void px-5 py-2 text-[10px] font-bold font-accent uppercase tracking-widest hover:bg-gold-dim transition-colors disabled:opacity-50"
                        >
                          {targetLoading ? "Kaydediliyor..." : "Kaydet ve Simüle Et"}
                        </button>
                      </div>
                    </form>
                  ) : (
                    targets.length === 0 ? (
                      <div className="p-10 border border-dashed border-obsidian bg-abyss/10 text-center rounded-sm space-y-3">
                        <User className="w-8 h-8 text-obsidian/30 mx-auto" />
                        <p className="text-xs text-ash font-accent italic">Henüz simüle edilecek bir kişi eklemediniz.</p>
                        <button
                          type="button"
                          onClick={() => setIsCreatingTarget(true)}
                          className="inline-block text-[10px] text-gold border border-gold/30 bg-gold/5 px-4 py-2 rounded-sm font-accent tracking-widest uppercase hover:bg-gold/15 transition-all"
                        >
                          İlk Kişiyi Ekle
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {targets.map((t) => {
                          const isSelected = selectedTarget?.id === t.id;
                          return (
                            <button
                              key={t.id}
                              type="button"
                              onClick={() => {
                                setSelectedTarget(t);
                                handleStartSimulation(t);
                              }}
                              className={`p-4 rounded-sm border flex items-center justify-between text-left transition-all duration-300 ${
                                isSelected 
                                  ? 'bg-gradient-to-b from-gold/10 to-yellow-600/10 border-gold shadow-[0_0_15px_rgba(201,168,76,0.05)]' 
                                  : 'border-obsidian bg-abyss/20 hover:border-obsidian/80 hover:bg-abyss/45'
                              }`}
                            >
                              <div className="flex items-center gap-3 overflow-hidden">
                                <div className={`p-2 rounded-full ${isSelected ? 'bg-gold/10 text-gold' : 'bg-obsidian/40 text-ash/60'}`}>
                                  <User className="w-4 h-4 flex-shrink-0" />
                                </div>
                                <div className="overflow-hidden">
                                  <p className={`text-xs font-serif tracking-wider font-semibold truncate ${isSelected ? 'text-smoke' : 'text-ash'}`}>
                                    {t.name}
                                  </p>
                                  <p className="text-[9px] text-ash/40 font-accent mt-0.5 tracking-wider uppercase">
                                    Simüle Et
                                  </p>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={(e) => handleDeleteTarget(t.id, e)}
                                className="text-ash/40 hover:text-red-500 transition-colors p-1"
                                title="Kişiyi Sil"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </button>
                          );
                        })}
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
          )}
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
                    <h4 className="text-sm font-serif text-smoke tracking-wider uppercase">
                      {mode === "simulation" 
                        ? `Sohbet Simülasyonu (${response?.targetName || "Hedef Kişi"} ile)` 
                        : `Stratejik Plan ve Diyalog (${CHARACTERS.find(c => c.id === character)?.name} ile)`}
                    </h4>
                    {credits !== null && (
                      <span className="flex items-center gap-1 text-[10px] font-accent text-ash bg-void border border-obsidian px-2 py-0.5 rounded-sm">
                        <Coins className="w-3 h-3 text-gold" />
                        <span>Kalan: <span className="text-gold font-bold">{plan === "elite" ? "∞" : credits}</span></span>
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-ash">
                    {mode === "simulation" 
                      ? "Karşı tarafın simülasyonunu test edin. Verdiğiniz cevaplara göre yapay zeka onu taklit edecektir." 
                      : "Mentis Reçetesi'ni inceleyin ve sorularınızla derinleştirin."}
                  </p>
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
                    setActiveAdvice(null);
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
                          {mode === "simulation" ? "KARAKTER PROFİLİ" : "DURUM ANALİZİ"}
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
                            {mode === "simulation" ? "MASADAKİ DENGE" : "KARŞI TARAFIN MOTİVASYONU"}
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
                            {mode === "simulation" ? "STRATEJİK PLAN" : "STRATEJİK HAMLE"}
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
                let replyText = msg.content;
                let adviceText = null;

                if (!isUser && mode === "simulation") {
                  const adviceSplitKey = "**[MENTİS ÖNERİSİ]**";
                  if (msg.content.includes(adviceSplitKey)) {
                    const parts = msg.content.split(adviceSplitKey);
                    replyText = parts[0]?.trim();
                    adviceText = parts[1]?.trim();
                  }
                }

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
                        {isUser 
                          ? "SİZ" 
                          : mode === "simulation" 
                            ? (response?.targetName || "KARŞI TARAF").toUpperCase()
                            : (CHARACTERS.find(c => c.id === character)?.name || "MENTIS").toUpperCase()}
                      </p>
                      <div className="whitespace-pre-wrap font-sans">{replyText}</div>

                      {!isUser && adviceText && (
                        <div className="mt-3 pt-3 border-t border-gold/20 text-left flex items-start gap-2 bg-gold/5 -mx-4 -mb-4 p-4 rounded-b-sm">
                          <Brain className="w-3.5 h-3.5 text-gold flex-shrink-0 mt-0.5 animate-pulse-gold" />
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

              {followUpLoading && (
                <div className="flex justify-start animate-pulse">
                  <div className="bg-abyss/85 border border-obsidian/50 rounded-sm p-4 max-w-[85%] text-smoke text-xs md:text-sm">
                    <p className="text-[10px] text-gold font-bold uppercase tracking-widest mb-1.5 font-accent">
                      {mode === "simulation" ? "KARŞI TARAF" : (CHARACTERS.find(c => c.id === character)?.name || "Mentis")}
                    </p>
                    <p className="italic font-accent text-ash">
                      {mode === "simulation" ? "Yazıyor..." : "Hamleler hesaplanıyor..."}
                    </p>
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

            {/* Advisor Advice Banner for Simulation Mode */}
            {mode === "simulation" && activeAdvice && (
              <div className="mx-4 my-2 p-3 bg-gold/5 border border-gold/20 rounded-sm text-left animate-fade-in flex items-start gap-3">
                <Brain className="w-4.5 h-4.5 text-gold flex-shrink-0 mt-0.5 animate-pulse-gold" />
                <div className="text-xs text-smoke/90 leading-relaxed font-accent">
                  <span className="text-gold font-bold uppercase tracking-wider block mb-1">
                    {CHARACTERS.find(c => c.id === character)?.name} Stratejik Tavsiyesi
                  </span>
                  {activeAdvice}
                </div>
              </div>
            )}

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
