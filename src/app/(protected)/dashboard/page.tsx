"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { StrategyInput } from "@/components/dashboard/StrategyInput";
import { LoadingMentis } from "@/components/ui/LoadingMentis";
import { createClient } from "@/lib/supabase/client";
import { Coins, BookMarked, MessageSquare, Brain, Copy, Send, Trash2 } from "lucide-react";

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

interface DoctrineLink {
  id: string;
  keywords: string[];
}

const DOCTRINES: DoctrineLink[] = [
  { id: "silence", keywords: ["Sessizlik Ambargosu", "Sessizlik İlkesi", "Sessizlik"] },
  { id: "frame-control", keywords: ["Çerçeve Kontrolü", "Çerçeve Kontrol"] },
  { id: "rational-distance", keywords: ["Rasyonel Mesafe"] },
  { id: "anti-gaslighting", keywords: ["Gaslighting Kalkanı", "Gaslighting"] },
  { id: "rhetoric-verbal", keywords: ["Retorik & Sözel Silahlar", "Sözel Silahlar"] },
  { id: "body-language", keywords: ["Baskın Beden Dili", "Beden Dili"] },
  { id: "mirroring", keywords: ["Aynalama Yöntemi", "Aynalama Taktiği", "Aynalama"] },
  { id: "love-bombing", keywords: ["Love Bombing", "Aşk Bombardımanı"] },
  { id: "zero-sum", keywords: ["Sıfır Toplamlı Oyun"] },
  { id: "counter-attack", keywords: ["Karşı Saldırı Protokolü", "Karşı Saldırı"] },
  { id: "pressure-points", keywords: ["Baskı Noktaları", "Tetikleyici"] },
  { id: "cognitive-dissonance", keywords: ["Bilişsel Çelişki"] },
  { id: "anchoring", keywords: ["Algı Çapalama", "Çapalama"] },
  { id: "ego-depletion", keywords: ["Benlik Çökertme", "Ego Depletion"] },
  { id: "double-bind", keywords: ["Çifte Bağ"] },
  { id: "door-in-the-face", keywords: ["Kapıyı Yüzüne Çarpma", "Kademeli Taviz"] },
  { id: "information-asymmetry", keywords: ["Bilgi Asimetrisi", "Bilişsel Karartma"] },
  { id: "psychology-intro", keywords: ["Zihinsel Mimari", "Psikoloji"] },
  { id: "person-psychology", keywords: ["Karakter Analizi", "Klinik Profilleme"] },
  { id: "halo-effect", keywords: ["Halo Etkisi", "Hale Etkisi", "Karizma Kalkanı"] },
  { id: "projection-defense", keywords: ["Projeksiyon Kalkanı", "Yansıtma Kalkanı"] },
  { id: "benjamin-franklin", keywords: ["Benjamin Franklin Etkisi", "Benjamin Franklin"] },
  { id: "pygmalion-effect", keywords: ["Pygmalion Etkisi", "Beklenti Yönetimi"] },
  { id: "reactance-shield", keywords: ["Tepkisellik Zırhı", "Ters Psikoloji"] },
  { id: "trojan-horse", keywords: ["Truva Atı"] },
  { id: "scarcity-hook", keywords: ["Kıtlık Kancası", "Suni Aciliyet"] },
  { id: "counter-gaslighting", keywords: ["Karşı-Gaslighting"] },
  { id: "emotional-leverage", keywords: ["Duygusal Kaldıraç", "Suçluluk Çapası"] },
  { id: "mental-quarantine", keywords: ["Zihinsel Karantina", "Bilgi Diyeti"] },
  { id: "rhythmic-dominance", keywords: ["Ritmik Dominans"] },
  { id: "pupil-autonomic", keywords: ["Göz Bebekleri", "Otonom Kaçaklar"] },
  { id: "spatial-dominance", keywords: ["Mekansal Dominans", "Bölge İstilası"] },
  { id: "micro-expression", keywords: ["Micro-İfade", "Mikro-İfade", "Yüz Kas Taraması"] },
  { id: "tactile-anchoring", keywords: ["Dokunsal Çapa", "Fiziksel Temas"] },
  { id: "masking-protocol", keywords: ["Maskeleme Protokolü", "Duygusal Ekranlama"] },
  { id: "mirror-neuron", keywords: ["Ayna Nöron"] },
  { id: "vertical-split", keywords: ["Dikey Bölünme"] },
  { id: "cross-siege", keywords: ["Çapraz Kuşatma"] },
  { id: "illusion-bridge", keywords: ["Yanılsama Köprüsü", "Rehavet Tuzağı"] },
  { id: "boundary-shifting", keywords: ["Sınır Kaydırma", "Mikro-Dayatma"] },
  { id: "catalyst-sacrifice", keywords: ["Katalizör Kurban", "Taktiksel Feda"] },
  { id: "gray-rock", keywords: ["Gri Kaya Metodu", "Gri Kaya"] },
  { id: "anchor-cutting", keywords: ["Bilişsel Çapa Kesimi", "Çapa Kesimi"] },
  { id: "semantic-shield", keywords: ["Semantik Kalkan", "Tanım Bariyeri"] },
  { id: "projection-arithmetic", keywords: ["Yansıtma Aritmetiği"] },
  { id: "silent-shield", keywords: ["Sessiz Kalkan"] },
  { id: "frame-shifting", keywords: ["Çerçeve Kaydırma"] },
  { id: "counter-interrogation", keywords: ["Sorudan Soruya Kaçış"] },
  { id: "false-choice", keywords: ["Sahte Seçenek", "İkilem Tuzağı"] },
  { id: "irony-absorber", keywords: ["İroni Amortisörü"] },
  { id: "delayed-validation", keywords: ["Yavaşlatılmış Doğrulama"] },
  { id: "micro-withdrawal", keywords: ["Mikro-Geri Çekilme"] },
  { id: "dominant-barrier", keywords: ["Dominant Bariyer"] },
  { id: "blink-blocking", keywords: ["Göz Kırpma Bloku"] },
  { id: "pacifying-gestures", keywords: ["Kravat-Yaka", "Yatıştırıcı Jestler"] },
  { id: "open-palm-hierarchy", keywords: ["Açık Avuç"] },
  { id: "cortisol-loop", keywords: ["Kortizol Döngüsü"] },
  { id: "schema-conflict", keywords: ["Şema Çatışması"] },
  { id: "subliminal-anchor", keywords: ["Bilinçaltı Telkin"] },
  { id: "narcissistic-embargo", keywords: ["Beslenme Ambargosu", "Narsisistik Beslenme"] },
  { id: "emotional-resonance", keywords: ["Duygusal Rezonans"] },
  { id: "social-hierarchy", keywords: ["Sosyal Hiyerarşi", "Hiyerarşi Haritalama", "Güç Hiyerarşisi"] },
  { id: "coalition-building", keywords: ["Koalisyon Kurma", "Taktiksel Koalisyon"] },
  { id: "status-signaling", keywords: ["Statü Sinyalleme", "Statü Sinyali", "Statü Koruma"] },
  { id: "social-shit-test", keywords: ["Shit-Test Savuşturma", "Sosyal Shit-Test"] },
  { id: "social-isolation", keywords: ["Sosyal İzolasyon", "İzolasyon Protokolü"] },
  { id: "rational-valuation", keywords: ["Değerleme Eşiği", "Rasyonel Değerleme"] },
  { id: "win-win-illusion", keywords: ["Kazan-Kazan İllüzyonu", "Kazan Kazan İllüzyonu"] },
  { id: "information-economy", keywords: ["Bilgi Tasarrufu", "Stratejik Bilgi Tasarrufu"] },
  { id: "conditional-concession", keywords: ["Koşullu Taviz", "Taviz İlkesi"] },
  { id: "time-pressure", keywords: ["Zaman Baskısı", "Yapay Aciliyet"] },
  { id: "stoic-armor", keywords: ["Stoik Zırh", "Stoik Zırh Protokolü"] },
  { id: "cognitive-narrowing", keywords: ["Bilişsel Odak", "Odak Daraltma"] },
  { id: "rejection-inoculation", keywords: ["Reddedilme Aşısı"] },
  { id: "mental-distance", keywords: ["Zihinsel Mesafe", "Düşünsel Mesafe"] },
  { id: "anxiety-transmutation", keywords: ["Kaygı Dönüşümü", "Kaygının Yakıta Dönüştürülmesi"] },
  { id: "trojan-protocol", keywords: ["Truva Atı Protokolü", "Truva Protokolü"] },
  { id: "guilt-projection", keywords: ["Suçluluk Yansıtması", "Suçluluk Yansıtma"] },
  { id: "narcissistic-mirroring", keywords: ["Narsisistik Aynalama", "Aynalama Protokolü"] },
  { id: "divide-and-conquer", keywords: ["Böl ve Yönet", "Böl ve Yönet Stratejisi"] },
  { id: "selective-honesty", keywords: ["Seçici Dürüstlük Barajı", "Seçici Dürüstlük"] },
  { id: "mystery-shield", keywords: ["Gizem Kalkanı", "Öngörülemezlik"] },
  { id: "pr-framing", keywords: ["Kişisel PR", "PR Filtresi", "Yeniden Çerçeveleme"] },
  { id: "halo-amplification", keywords: ["Halo Kuvvetlendirme", "Halo Kuvvetlendirme Protokolü"] },
  { id: "controlled-vulnerability", keywords: ["Kontrollü Zafiyet", "Zafiyet Gösterisi"] },
  { id: "strategic-distraction", keywords: ["Stratejik Dikkat Dağıtma", "Dikkat Dağıtma"] }
];

// Flatten and sort keywords by length descending to match longer keywords first
const allKeywords = DOCTRINES.flatMap(d => d.keywords.map(kw => ({ kw, id: d.id })))
  .sort((a, b) => b.kw.length - a.kw.length);

const getDoctrineIdByKeyword = (matchedText: string): string | undefined => {
  const normalizedMatch = matchedText.toLowerCase().trim();
  const found = allKeywords.find(item => {
    return item.kw.toLowerCase() === normalizedMatch ||
           item.kw.toLocaleLowerCase("tr-TR") === matchedText.toLocaleLowerCase("tr-TR");
  });
  return found?.id;
};

const renderMessageWithDoctrineLinks = (text: string) => {
  if (!text) return null;

  const regexPattern = allKeywords.map(item => {
    return item.kw.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  }).join('|');

  const keywordRegex = new RegExp(`(${regexPattern})`, 'gi');

  const parts = text.split(keywordRegex);
  if (parts.length === 1) return text;

  return parts.map((part, idx) => {
    if (idx % 2 === 1) {
      const docId = getDoctrineIdByKeyword(part);
      if (docId) {
        return (
          <span key={idx} className="inline-flex items-center flex-wrap gap-1">
            <span className="text-gold font-bold underline decoration-gold/40 hover:decoration-gold transition-all">{part}</span>
            <Link
              href={`/dashboard/academy?id=${docId}`}
              className="inline-flex items-center bg-gold/10 hover:bg-gold/25 border border-gold/20 hover:border-gold/45 text-[10px] text-gold px-1.5 py-0.5 rounded-sm transition-all duration-300 font-accent tracking-wider uppercase ml-1"
            >
              (buradan okuyabilirsiniz)
            </Link>
          </span>
        );
      }
    }
    return part;
  });
};

export default function DashboardPage() {
  const [status, setStatus] = useState<"idle" | "analyzing" | "complete">("idle");
  const [response, setResponse] = useState<StrategyResponse | null>(null);
  const [headerState, setHeaderState] = useState<"visible" | "animating" | "hidden">("visible");
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
  const [isInitialized, setIsInitialized] = useState(false);

  // Restore active chat from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("mentis_active_chat");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.chatHistory && parsed.chatHistory.length > 0) {
          setChatHistory(parsed.chatHistory);
          setStatus(parsed.status || "complete");
          if (parsed.analysis || parsed.problem) {
            setResponse({
              id: parsed.id,
              analysis: parsed.analysis || "",
              targetWeakness: parsed.targetWeakness || "",
              execution: parsed.execution || "",
              targetName: parsed.targetName || ""
            });
          }
          setCharacter(parsed.character || "mentis");
          setIsSaved(!!parsed.isSaved);
          setHeaderState("hidden");
        }
      }
    } catch (e) {
      console.error("Failed to restore active chat session:", e);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // Sync active chat session to localStorage
  useEffect(() => {
    if (!isInitialized) return;
    try {
      if (chatHistory.length > 0) {
        const activeChat = {
          id: response?.id,
          problem: chatHistory[0]?.content,
          analysis: response?.analysis || "",
          targetWeakness: response?.targetWeakness || "",
          execution: response?.execution || "",
          targetName: response?.targetName || "",
          chatHistory,
          status,
          character,
          isSaved
        };
        localStorage.setItem("mentis_active_chat", JSON.stringify(activeChat));
      } else {
        localStorage.removeItem("mentis_active_chat");
      }
    } catch (e) {
      console.error("Failed to save active chat session:", e);
    }
  }, [chatHistory, response, status, character, isSaved, isInitialized]);

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
    setHeaderState("animating");
    setTimeout(() => {
      setHeaderState("hidden");
    }, 800);
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
      setHeaderState("visible");
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
      
      // Auto-save follow-up to DB in background
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



  const isHeaderHidden = headerState === "hidden";

  return (
    <div className={`flex flex-col w-full transition-all duration-700 ease-in-out max-w-6xl mx-auto px-4 pb-2 animate-fade-in ${
      isHeaderHidden 
        ? "h-[calc(100vh-90px)] md:h-[calc(100vh-105px)]" 
        : "h-[calc(100vh-140px)] md:h-[calc(100vh-150px)]"
    }`}>
      
      {/* Fixed Header: Mentis Analiz Modülü and Brain Emoji */}
      <div className={`flex flex-col items-center text-center flex-shrink-0 w-full select-none transition-all duration-700 ease-in-out ${
        headerState === "animating" ? "animate-header-exit pointer-events-none" : ""
      } ${
        isHeaderHidden ? "max-h-0 opacity-0 py-0 my-0 overflow-hidden" : "max-h-36 pt-2 pb-4 opacity-100"
      }`}>
        {/* Logo */}
        <div className="relative flex items-center justify-center w-14 h-14 mb-1">
          <div className="absolute inset-0 rounded-full border border-gold/20 animate-[spin_8s_linear_infinite]" />
          <div className="absolute inset-2 rounded-full border border-t-gold border-r-transparent border-b-gold/30 border-l-transparent animate-[spin_5s_linear_infinite_reverse]" />
          <Brain className="w-6 h-6 text-gold animate-pulse-gold absolute" strokeWidth={1.5} />
        </div>

        {/* Welcome Text */}
        <div className="text-center space-y-1.5">
          <h3 className="font-serif text-base tracking-[0.2em] text-gold uppercase">MENTIS ANALİZ MODÜLÜ</h3>
          <p className="font-sans text-[11px] text-ash/60 max-w-2xl mx-auto leading-relaxed">
            Rasyonel akıl ve soğukkanlı strateji. Çıkmaza girdiğin durumu aşağıya yazarak eylem reçeteni oluştur.
          </p>
        </div>
      </div>

      {/* Main View Area */}
      <div className="flex-1 min-h-0 flex flex-col justify-between relative mt-2">
        
        {/* Scrollable Chat Feed */}
        <div className="flex-1 overflow-y-auto space-y-6 py-2 pr-2 scrollbar-custom flex flex-col min-h-0">
          
          {/* Suggestions if no history, otherwise Chat Bubbles */}
          {chatHistory.length === 0 ? (
            <div className="my-auto w-full max-w-4xl mx-auto space-y-3 px-4 pt-2 select-none flex-shrink-0">
              <div className="flex items-center gap-2">
                <div className="h-[1px] flex-1 bg-obsidian/45" />
                <span className="text-[9px] uppercase tracking-widest text-ash/40 font-accent font-bold">Örnek Durumlar</span>
                <div className="h-[1px] flex-1 bg-obsidian/45" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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
          ) : (
            <div className="space-y-6 w-full flex-1 px-1">
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

                // Model Message (Initial 3-Part analysis from Mentis)
                if (index === 1 && response) {
                  return (
                    <div key={index} className="flex w-full justify-start animate-fade-in">
                      <div className="max-w-[85%] rounded-sm p-5 bg-abyss border border-gold/20 text-smoke text-xs md:text-sm leading-relaxed shadow-lg space-y-4 w-full">
                        <p className="text-[9px] uppercase tracking-widest font-accent text-gold font-bold">
                          MENTIS REÇETESİ
                        </p>
                        
                        <div className="space-y-4 divide-y divide-obsidian/60">
                          {/* 01 Analysis */}
                          <div className="pt-1">
                            <span className="text-[10px] font-serif text-gold/80 tracking-wider block mb-1">01 | ANALİZ</span>
                            <div className="whitespace-pre-wrap font-sans text-smoke">{renderMessageWithDoctrineLinks(response.analysis)}</div>
                          </div>
                          
                          {/* 02 Target Weakness */}
                          {response.targetWeakness && (
                            <div className="pt-3">
                              <span className="text-[10px] font-serif text-gold/80 tracking-wider block mb-1">02 | KARŞI TARAFIN MOTİVASYONU</span>
                              <div className="whitespace-pre-wrap font-sans text-smoke">{renderMessageWithDoctrineLinks(response.targetWeakness)}</div>
                            </div>
                          )}
                          
                          {/* 03 Strategic Move */}
                          {response.execution && (
                            <div className="pt-3">
                              <span className="text-[10px] font-serif text-gold/80 tracking-wider block mb-1">03 | STRATEJİK HAMLE</span>
                              <div className="whitespace-pre-wrap font-sans text-smoke">{renderMessageWithDoctrineLinks(response.execution)}</div>
                            </div>
                          )}
                        </div>
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
                      <div className="whitespace-pre-wrap font-sans leading-relaxed">{renderMessageWithDoctrineLinks(msg.content)}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* In-chat Loading / Thinking state */}
          {(status === "analyzing" || followUpLoading) && (
            <div className="flex w-full justify-start animate-pulse mt-4 px-1">
              <div className="rounded-sm p-5 bg-abyss/85 border border-obsidian text-smoke max-w-[85%] flex items-start gap-4 shadow-lg w-full">
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
            <div className="p-3 bg-red-950/20 border border-red-900/50 text-red-400 text-xs text-center rounded-sm font-accent italic animate-fade-in mt-4 px-1">
              {followUpError}
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

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
                  className="flex-1 bg-abyss border border-obsidian text-smoke placeholder:text-ash/40 px-4 py-3 rounded-sm text-xs md:text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold focus-visible:border-gold/50 transition-all duration-300 disabled:opacity-50 resize-none scrollbar-none h-[58px]"
                />
                <button
                  type="submit"
                  disabled={followUpLoading || status === "analyzing" || followUpMessage.trim().length < (chatHistory.length === 0 ? 10 : 1)}
                  className="bg-gold text-void rounded-sm hover:bg-gold-dim transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center flex-shrink-0 h-[58px] w-[58px]"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>

              <div className="flex justify-between items-center px-1 text-[10px] text-ash/50 font-accent mt-1.5">
                <div className="flex items-center gap-4">
                  {credits !== null && (
                    <span className="flex items-center gap-1.5">
                      <Coins className="w-3.5 h-3.5 text-gold" />
                      Kalan Kredi: <span className="text-gold font-bold">{plan === "elite" ? "∞" : credits}</span>
                    </span>
                  )}
                  {chatHistory.length > 0 && (
                    <div className="flex items-center gap-3 border-l border-obsidian/60 pl-3 text-ash/70">
                      <button
                        type="button"
                        onClick={handleSaveToJournal}
                        disabled={isSaved || saveLoading || status === "analyzing"}
                        className={`hover:text-gold transition-colors flex items-center gap-1 ${isSaved ? "text-green-500 hover:text-green-500" : ""}`}
                        title="Deftere Kaydet"
                      >
                        <BookMarked className="w-3.5 h-3.5" />
                        {saveLoading ? "..." : isSaved ? "Defterde" : "Kaydet"}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (confirm("Bu sohbeti temizlemek istediğinize emin misiniz?")) {
                            setStatus("idle");
                            setResponse(null);
                            setChatHistory([]);
                            setHeaderState("visible");
                          }
                        }}
                        className="hover:text-gold transition-colors flex items-center gap-1"
                        title="Sohbeti Temizle"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Temizle
                      </button>
                    </div>
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
