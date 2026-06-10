"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, Clock, ChevronDown, ChevronUp, Brain, Star, Trash2, Edit, Plus, Save, Calendar, MessageSquare 
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Consultation {
  id: string;
  problem: string;
  analysis: string;
  target_weakness: string;
  execution: string;
  created_at: string;
  is_starred: boolean;
  personal_notes?: string;
  character?: string;
  mode?: string;
  target_name?: string;
  chat_history?: { role: string; content: string }[];
}

interface CustomNote {
  id: string;
  title: string;
  content: string;
  created_at: string;
}

const getCharacterName = (charId?: string) => {
  return "MENTİS";
};

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

export default function HistoryPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"strategies" | "notes">("strategies");
  const [onlyStarred, setOnlyStarred] = useState(false);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [customNotes, setCustomNotes] = useState<CustomNote[]>([]);

  const handleContinueChat = (c: Consultation) => {
    try {
      const activeChat = {
        id: c.id,
        problem: c.problem,
        analysis: c.analysis,
        targetWeakness: c.target_weakness,
        execution: c.execution,
        targetName: c.target_name,
        chatHistory: c.chat_history || [
          { role: "user", content: c.problem },
          { 
            role: "model", 
            content: `01\n${c.analysis}\n\n**[KARŞI TARAFIN MOTİVASYONU]**\n${c.target_weakness}\n\n**[STRATEJİK HAMLE]**\n${c.execution}`
          }
        ],
        status: "complete",
        character: c.character || "mentis",
        isSaved: c.is_starred
      };
      localStorage.setItem("mentis_active_chat", JSON.stringify(activeChat));
      router.push("/dashboard");
    } catch (e) {
      console.error("Failed to initiate chat redirection:", e);
      alert("Sohbet başlatılamadı.");
    }
  };
  
  const [loading, setLoading] = useState(true);
  const [dbStatus, setDbStatus] = useState<"connected" | "local">("connected");
  
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingPersonalNotes, setEditingPersonalNotes] = useState("");
  const [personalNotesSavingId, setPersonalNotesSavingId] = useState<string | null>(null);
  const [starSavingId, setStarSavingId] = useState<string | null>(null);

  // Custom Note states
  const [editingNote, setEditingNote] = useState<CustomNote | null>(null);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [isCreatingNote, setIsCreatingNote] = useState(false);
  const [notesSaveLoading, setNotesSaveLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const supabase = createClient();
    let hasDbError = false;
    let userId = null;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) userId = user.id;
    } catch (e) {
      console.warn("User auth check failed:", e);
    }

    // 1. Fetch consultations
    let dbConsultations: Consultation[] = [];
    let fetchConsultsError = false;
    try {
      const { data, error } = await supabase
        .from("consultations")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;
      dbConsultations = data || [];
    } catch (err) {
      console.warn("Failed to fetch history from database, falling back to local storage:", err);
      hasDbError = true;
      fetchConsultsError = true;
    }

    // Load local history
    let localHistory: Consultation[] = [];
    try {
      localHistory = JSON.parse(localStorage.getItem("mentis_local_history") || "[]");
    } catch (localErr) {
      console.error("Failed to load local history:", localErr);
    }

    if (fetchConsultsError) {
      setConsultations(localHistory.filter((lh) => lh.mode !== "simulation"));
    } else {
      const localOnly = localHistory.filter((lh) => 
        lh.id.toString().startsWith("local_") && !dbConsultations.some(dh => dh.id === lh.id)
      );
      const merged = [...localOnly, ...dbConsultations];
      setConsultations(merged.filter((c) => c.mode !== "simulation"));
    }

    // 2. Fetch custom notes
    let dbNotes: CustomNote[] = [];
    let fetchNotesError = false;
    try {
      if (userId) {
        const { data: notesData, error: notesErr } = await supabase
          .from("notes")
          .select("*")
          .order("created_at", { ascending: false });

        if (notesErr) throw notesErr;
        dbNotes = notesData || [];
      }
    } catch (notesErr: any) {
      console.warn("Notes DB fetch failed:", notesErr.message || notesErr);
      hasDbError = true;
      fetchNotesError = true;
    }

    // Load local notes
    let localNotes: CustomNote[] = [];
    try {
      localNotes = JSON.parse(localStorage.getItem("mentis_local_notes") || "[]");
    } catch (localErr) {
      console.error("Failed to load local notes:", localErr);
    }

    if (fetchNotesError || !userId) {
      setCustomNotes(localNotes);
    } else {
      const localOnlyNotes = localNotes.filter((ln) => 
        ln.id.toString().startsWith("note_") && !dbNotes.some(dn => dn.id === ln.id)
      );
      setCustomNotes([...localOnlyNotes, ...dbNotes]);
    }

    setDbStatus(hasDbError ? "local" : "connected");
    setLoading(false);
  };

  const handleToggleStar = async (id: string, currentStarred: boolean) => {
    setStarSavingId(id);
    const newStarred = !currentStarred;
    const isLocal = id.toString().startsWith("local_");

    if (!isLocal) {
      try {
        const supabase = createClient();
        const { error } = await supabase
          .from("consultations")
          .update({ is_starred: newStarred })
          .eq("id", id);
        
        if (error) throw error;
      } catch (err) {
        console.warn("Failed to toggle star in DB, using local fallback:", err);
      }
    }

    // Update in local history
    try {
      const localHistory = JSON.parse(localStorage.getItem("mentis_local_history") || "[]");
      const updatedHistory = localHistory.map((item: any) => 
        item.id === id ? { ...item, is_starred: newStarred } : item
      );
      localStorage.setItem("mentis_local_history", JSON.stringify(updatedHistory));
    } catch (e) {
      console.error("Local history star update failed:", e);
    }

    // Update in local journal
    try {
      const localJournal = JSON.parse(localStorage.getItem("mentis_local_journal") || "[]");
      if (newStarred) {
        const target = consultations.find(c => c.id === id);
        if (target && !localJournal.some((item: any) => item.id === id)) {
          localJournal.push({ ...target, is_starred: true });
        }
      } else {
        const filtered = localJournal.filter((item: any) => item.id !== id);
        localStorage.setItem("mentis_local_journal", JSON.stringify(filtered));
      }
      if (newStarred) {
        localStorage.setItem("mentis_local_journal", JSON.stringify(localJournal));
      }
    } catch (e) {
      console.error("Local journal sync failed:", e);
    }

    // Update state
    setConsultations(prev => prev.map(c => 
      c.id === id ? { ...c, is_starred: newStarred } : c
    ));
    setStarSavingId(null);
  };

  const handleUpdatePersonalNotes = async (strategyId: string) => {
    setPersonalNotesSavingId(strategyId);
    const isLocal = strategyId.toString().startsWith("local_");
    
    if (!isLocal) {
      try {
        const supabase = createClient();
        const { error } = await supabase
          .from("consultations")
          .update({ personal_notes: editingPersonalNotes })
          .eq("id", strategyId);
        
        if (error) throw error;
      } catch (err) {
        console.error("Failed to save personal notes to database, using local fallback:", err);
      }
    }

    // Local fallback update for history
    try {
      const localHistory = JSON.parse(localStorage.getItem("mentis_local_history") || "[]");
      const updatedHistory = localHistory.map((s: any) => 
        s.id === strategyId ? { ...s, personal_notes: editingPersonalNotes } : s
      );
      localStorage.setItem("mentis_local_history", JSON.stringify(updatedHistory));
    } catch (e) {
      console.error(e);
    }

    // Local fallback update for journal
    try {
      const localJournal = JSON.parse(localStorage.getItem("mentis_local_journal") || "[]");
      const updatedJournal = localJournal.map((s: any) => 
        s.id === strategyId ? { ...s, personal_notes: editingPersonalNotes } : s
      );
      localStorage.setItem("mentis_local_journal", JSON.stringify(updatedJournal));
    } catch (e) {
      console.error(e);
    }

    // Update state
    setConsultations(prev => prev.map(s => 
      s.id === strategyId ? { ...s, personal_notes: editingPersonalNotes } : s
    ));
    setPersonalNotesSavingId(null);
    alert("Kişisel notlar güncellendi.");
  };

  // Custom Notes CRUD
  const handleSaveCustomNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim()) return;
    setNotesSaveLoading(true);

    const isLocal = editingNote?.id?.startsWith("note_");

    if (editingNote && isLocal) {
      saveNoteLocally();
      setNotesSaveLoading(false);
      return;
    }

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (editingNote && user) {
        const { error } = await supabase
          .from("notes")
          .update({ title: noteTitle, content: noteContent, updated_at: new Date().toISOString() })
          .eq("id", editingNote.id);
        
        if (error) throw error;
      } else if (user) {
        const { error } = await supabase
          .from("notes")
          .insert({
            user_id: user.id,
            title: noteTitle,
            content: noteContent
          });
        
        if (error) throw error;
      } else {
        throw new Error("No user session");
      }
      await loadData();
      closeNoteModal();
    } catch (err) {
      console.error("Database save failed, using local storage fallback:", err);
      saveNoteLocally();
    }
    setNotesSaveLoading(false);
  };

  const saveNoteLocally = () => {
    const localNotes = JSON.parse(localStorage.getItem("mentis_local_notes") || "[]");
    if (editingNote) {
      const updated = localNotes.map((n: CustomNote) => 
        n.id === editingNote.id ? { ...n, title: noteTitle, content: noteContent } : n
      );
      localStorage.setItem("mentis_local_notes", JSON.stringify(updated));
    } else {
      const newNote = {
        id: `note_${Date.now()}`,
        title: noteTitle,
        content: noteContent,
        created_at: new Date().toISOString()
      };
      localNotes.push(newNote);
      localStorage.setItem("mentis_local_notes", JSON.stringify(localNotes));
    }
    loadData();
    closeNoteModal();
  };

  const handleDeleteCustomNote = async (noteId: string) => {
    if (!confirm("Bu notu silmek istediğinize emin misiniz?")) return;

    const isLocal = noteId.toString().startsWith("note_");

    if (!isLocal) {
      try {
        const supabase = createClient();
        const { error } = await supabase.from("notes").delete().eq("id", noteId);
        if (error) throw error;
        setCustomNotes(prev => prev.filter(n => n.id !== noteId));
        return;
      } catch (err) {
        console.error("Database delete failed, using local fallback:", err);
      }
    }

    const localNotes = JSON.parse(localStorage.getItem("mentis_local_notes") || "[]");
    const updated = localNotes.filter((n: CustomNote) => n.id !== noteId);
    localStorage.setItem("mentis_local_notes", JSON.stringify(updated));
    setCustomNotes(updated);
  };

  const openNoteModal = (note: CustomNote | null = null) => {
    if (note) {
      setEditingNote(note);
      setNoteTitle(note.title);
      setNoteContent(note.content);
    } else {
      setEditingNote(null);
      setNoteTitle("");
      setNoteContent("");
    }
    setIsCreatingNote(true);
  };

  const closeNoteModal = () => {
    setIsCreatingNote(false);
    setEditingNote(null);
  };

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

  const filteredConsultations = useMemo(() => {
    return consultations.filter(c => {
      if (onlyStarred && !c.is_starred) return false;
      return true;
    });
  }, [consultations, onlyStarred]);

  return (
    <div className="flex flex-col items-center w-full max-w-5xl mx-auto space-y-8 pb-20 animate-fade-in px-4 md:px-0">
      
      {/* Back Button */}
      <div className="w-full flex justify-start">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-ash hover:text-gold transition-colors text-xs font-accent uppercase tracking-widest"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Karargaha Dön
        </Link>
      </div>

      {/* Page Header */}
      <div className="text-center space-y-3 w-full">
        <h2 className="font-serif text-3xl md:text-4xl text-smoke tracking-wider uppercase">
          MÜZAKERE <span className="text-gold font-normal">ARŞİVİ</span>
        </h2>
        <p className="font-accent text-ash italic md:text-lg">
          Geçmiş stratejiler, favori hamleler ve karargah notları.
        </p>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-obsidian/60 w-full justify-center space-x-6 md:space-x-12 pb-0.5 select-none">
        <button
          onClick={() => { setActiveTab("strategies"); }}
          className={`pb-4 text-xs md:text-sm font-accent tracking-widest uppercase transition-all duration-300 border-b-2 flex items-center gap-2 ${
            activeTab === "strategies" ? "border-gold text-gold" : "border-transparent text-ash hover:text-smoke"
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Analiz Geçmişi ({consultations.length})</span>
        </button>
        <button
          onClick={() => { setActiveTab("notes"); }}
          className={`pb-4 text-xs md:text-sm font-accent tracking-widest uppercase transition-all duration-300 border-b-2 flex items-center gap-2 ${
            activeTab === "notes" ? "border-gold text-gold" : "border-transparent text-ash hover:text-smoke"
          }`}
        >
          <Edit className="w-3.5 h-3.5" />
          <span>Özel Notlar ({customNotes.length})</span>
        </button>
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="py-20 text-gold font-accent italic animate-pulse-gold">Arşiv yükleniyor...</div>
      ) : (
        <div className="w-full">
          
          {/* Tab 1: Strategies (Consultations) */}
          {activeTab === "strategies" && (
            <div className="space-y-6">
              
              {/* Filter Starred Checkbox */}
              {consultations.length > 0 && (
                <div className="flex flex-col gap-2 px-2 items-start">
                  <label className="flex items-center gap-2 text-xs font-accent text-ash cursor-pointer hover:text-smoke select-none">
                    <input 
                      type="checkbox"
                      checked={onlyStarred}
                      onChange={(e) => setOnlyStarred(e.target.checked)}
                      className="accent-gold border-obsidian bg-void rounded-sm"
                    />
                    Sadece Defterdekileri (Favorileri) Göster
                  </label>
                  <p className="text-[10px] text-ash/60 italic font-accent pl-6">
                    ℹ️ Deftere kaydedilmeyen (yıldızlanmayan) analiz geçmişleri 30 gün sonra otomatik olarak temizlenir. Deftere eklediğiniz stratejiler ve özel notlarınız kalıcı olarak saklanır.
                  </p>
                </div>
              )}

              {filteredConsultations.length === 0 ? (
                <div className="w-full h-[240px] border border-dashed border-obsidian/45 bg-abyss/10 flex flex-col items-center justify-center text-center p-8 rounded-sm space-y-4 animate-fade-in relative">
                  <Brain className="w-10 h-10 text-obsidian/30 animate-pulse" />
                  <p className="text-ash font-accent italic text-sm max-w-md leading-relaxed">
                    {onlyStarred 
                      ? "Deftere eklenmiş herhangi bir favori analiz bulunamadı." 
                      : "Henüz bir strateji talep etmedin. Karargahta ilk hamleni yap."}
                  </p>
                  {!onlyStarred && (
                    <Link
                      href="/dashboard"
                      className="text-gold hover:text-white transition-colors underline underline-offset-4 decoration-gold/30 text-xs uppercase tracking-wider font-bold"
                    >
                      Analiz Al
                    </Link>
                  )}
                </div>
              ) : (
                <div className="w-full space-y-4">
                  {filteredConsultations.map((c) => (
                    <div
                      key={c.id}
                      className="border border-obsidian bg-abyss/35 overflow-hidden transition-all duration-300"
                    >
                      {/* Collapse trigger bar */}
                      <button
                        onClick={() => {
                          if (expandedId === c.id) {
                            setExpandedId(null);
                          } else {
                            setExpandedId(c.id);
                            setEditingPersonalNotes(c.personal_notes || "");
                          }
                        }}
                        className="w-full flex items-center justify-between p-5 md:p-6 text-left hover:bg-obsidian/30 transition-colors"
                      >
                        <div className="flex-1 min-w-0 pr-4">
                          <p className="text-smoke text-sm md:text-base font-medium truncate">
                            {c.problem}
                          </p>
                          <div className="flex items-center gap-2.5 mt-2 text-[10px] text-ash font-accent uppercase tracking-wider">
                            <Clock className="w-3.5 h-3.5" />
                            {formatDate(c.created_at)}
                            {c.character && (
                              <span className="text-[9px] text-gold/80 bg-gold/5 border border-gold/20 px-1.5 py-0.5 rounded-sm">
                                {getCharacterName(c.character)} İLE
                              </span>
                            )}
                            {c.is_starred && (
                              <span className="text-[9px] text-green-400 bg-green-950/20 border border-green-800/40 px-1.5 py-0.5 rounded-sm flex items-center gap-1">
                                <Star className="w-2.5 h-2.5 fill-green-400" /> Defterde
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {expandedId === c.id ? (
                            <ChevronUp className="w-4.5 h-4.5 text-gold flex-shrink-0" />
                          ) : (
                            <ChevronDown className="w-4.5 h-4.5 text-ash flex-shrink-0" />
                          )}
                        </div>
                      </button>

                      {/* Expanded Strategy Area */}
                      {expandedId === c.id && (
                        <div className="border-t border-obsidian/60 p-5 md:p-8 space-y-8 animate-fade-in relative bg-void/10">
                          
                          {/* Star Toggle & Star Header */}
                          <div className="flex justify-between items-center border-b border-obsidian/40 pb-4">
                            <span className="text-[10px] text-gold font-accent tracking-widest uppercase font-bold">ANALİZ DETAYLARI</span>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleContinueChat(c)}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-gold hover:bg-gold-dim text-void text-xs font-accent uppercase tracking-wider transition-all duration-300 rounded-sm font-bold"
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                                Sohbeti Devam Ettir
                              </button>
                              <button
                                onClick={() => handleToggleStar(c.id, c.is_starred)}
                                disabled={starSavingId === c.id}
                                className={`flex items-center gap-1.5 px-3 py-1.5 border text-xs font-accent uppercase tracking-wider transition-all duration-300 rounded-sm disabled:opacity-50 ${
                                  c.is_starred 
                                    ? "bg-green-950/20 border-green-800 text-green-400"
                                    : "bg-void hover:bg-gold/10 border-obsidian text-ash hover:text-gold"
                                }`}
                              >
                                <Star className={`w-3.5 h-3.5 ${c.is_starred ? "fill-green-400 text-green-400" : ""}`} />
                                {starSavingId === c.id ? "..." : c.is_starred ? "Defterden Çıkar" : "Deftere Kaydet"}
                              </button>
                            </div>
                          </div>

                          {/* Reçete Content */}
                          <div className="space-y-6">
                            <div className="space-y-2">
                              <h4 className="text-xs uppercase tracking-widest text-gold/80 font-bold font-accent">
                                01 | Durum Analizi
                              </h4>
                              <div className="text-smoke/90 text-xs md:text-sm leading-relaxed whitespace-pre-wrap font-sans">
                                {renderMessageWithDoctrineLinks(c.analysis)}
                              </div>
                            </div>
                            <div className="space-y-2">
                              <h4 className="text-xs uppercase tracking-widest text-gold/80 font-bold font-accent">
                                02 | Karşı Tarafın Motivasyonu
                              </h4>
                              <div className="text-smoke/90 text-xs md:text-sm leading-relaxed whitespace-pre-wrap font-sans">
                                {renderMessageWithDoctrineLinks(c.target_weakness)}
                              </div>
                            </div>
                            <div className="space-y-2">
                              <h4 className="text-xs uppercase tracking-widest text-gold/80 font-bold font-accent">
                                03 | Stratejik Hamle
                              </h4>
                              <div className="text-smoke/90 text-xs md:text-sm leading-relaxed whitespace-pre-wrap font-sans">
                                {renderMessageWithDoctrineLinks(c.execution)}
                              </div>
                            </div>
                          </div>

                          {/* Follow-up history if it exists */}
                          {c.chat_history && c.chat_history.length > 2 && (
                            <div className="pt-6 mt-6 border-t border-obsidian/40 space-y-4">
                              <h4 className="text-xs uppercase tracking-widest text-gold/80 font-bold font-accent mb-4 text-center">
                                Takip Sohbeti
                              </h4>
                              {c.chat_history.slice(2).map((msg, index) => {
                                const isUser = msg.role === "user";
                                return (
                                  <div key={index} className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}>
                                    <div className={`max-w-[85%] rounded-sm p-4 text-xs md:text-sm leading-relaxed ${
                                      isUser 
                                        ? "bg-obsidian border border-gold/10 text-smoke" 
                                        : "bg-abyss/85 border border-obsidian text-smoke"
                                    }`}>
                                      <p className={`text-[9px] uppercase tracking-widest mb-1.5 font-accent ${
                                        isUser ? "text-ash/60" : "text-gold font-bold"
                                      }`}>
                                        {isUser ? "SİZ" : getCharacterName(c.character)}
                                      </p>
                                      <div className="whitespace-pre-wrap font-sans">
                                        {renderMessageWithDoctrineLinks(msg.content)}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {/* Personal Notes Workspace (Only for Starred/Journal items) */}
                          {c.is_starred && (
                            <div className="border-t border-obsidian/40 pt-6 space-y-4">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <h4 className="text-xs uppercase tracking-widest text-smoke font-bold font-accent">Aksiyon Notlarım & Entegrasyon Planı</h4>
                                <span className="text-[10px] text-ash/60 font-accent italic">Bu stratejiyi hayatınıza nasıl uyguladınız? Takibini yapın.</span>
                              </div>
                              <textarea
                                value={editingPersonalNotes}
                                onChange={(e) => setEditingPersonalNotes(e.target.value)}
                                placeholder="Örn: 'Bugün toplantıda ilk rasyonel mesafe hamlesini yaptım. Beklentilerimi sundum ve mesai konusundaki sınırlarımı sakince çizdim...'"
                                className="w-full h-32 bg-void border border-obsidian/60 p-4 rounded-sm text-xs md:text-sm text-smoke focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold/60 transition-all duration-300 font-sans"
                              />
                              <div className="flex justify-end">
                                <button
                                  onClick={() => handleUpdatePersonalNotes(c.id)}
                                  disabled={personalNotesSavingId === c.id}
                                  className="bg-gold text-void px-5 py-2 rounded-sm text-[10px] font-accent tracking-widest uppercase font-bold hover:bg-gold-dim transition-colors flex items-center gap-1.5"
                                >
                                  <Save className="w-3.5 h-3.5" />
                                  {personalNotesSavingId === c.id ? "Kaydediliyor..." : "Notları Güncelle"}
                                </button>
                              </div>
                            </div>
                          )}

                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Custom karargah notes editor */}
          {activeTab === "notes" && (
            <div className="space-y-6 w-full animate-fade-in">
              {/* Add Note Trigger */}
              <div className="flex justify-end">
                <button
                  onClick={() => openNoteModal()}
                  className="bg-gold text-void px-5 py-2.5 rounded-sm text-xs font-accent tracking-widest uppercase font-bold hover:bg-gold-dim transition-colors flex items-center gap-2 shadow-md shadow-gold/5"
                >
                  <Plus className="w-4 h-4" /> Yeni Not Ekle
                </button>
              </div>

              {customNotes.length === 0 ? (
                <div className="text-center py-20 border border-dashed border-obsidian/45 bg-abyss/10 p-6 rounded-sm text-ash font-accent italic text-sm">
                  Karargah not defteriniz henüz boş. Stratejik çıkarımlarınızı kaydetmek için ilk notu ekleyin.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                  {customNotes.map(n => (
                    <div 
                      key={n.id} 
                      className="border border-obsidian/50 bg-abyss/20 hover:bg-abyss/40 p-6 rounded-sm flex flex-col justify-between space-y-4 transition-all duration-300 relative overflow-hidden"
                    >
                      <div className="absolute top-0 left-0 w-[2px] h-full bg-gold/50" />
                      <div className="space-y-2">
                        <h4 className="text-base font-serif text-smoke tracking-wider line-clamp-1">{n.title}</h4>
                        <p className="text-[10px] text-ash/60 font-accent tracking-widest uppercase flex items-center gap-1.5 mb-2">
                          <Calendar className="w-3.5 h-3.5" /> {formatDate(n.created_at)}
                        </p>
                        <p className="text-xs md:text-sm text-ash/80 line-clamp-4 whitespace-pre-wrap font-sans">{n.content}</p>
                      </div>
                      
                      <div className="flex justify-end gap-3 pt-4 border-t border-obsidian/30">
                        <button
                          onClick={() => openNoteModal(n)}
                          className="text-ash hover:text-gold transition-colors text-xs flex items-center gap-1 font-accent uppercase"
                        >
                          <Edit className="w-3.5 h-3.5" /> Düzenle
                        </button>
                        <button
                          onClick={() => handleDeleteCustomNote(n.id)}
                          className="text-ash/60 hover:text-red-500 transition-colors text-xs flex items-center gap-1 font-accent uppercase"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Sil
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      )}

      {/* Note Creation/Editing Dialog Backdrop */}
      {isCreatingNote && (
        <div className="fixed inset-0 bg-void/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form 
            onSubmit={handleSaveCustomNote} 
            className="w-full max-w-lg bg-abyss border border-obsidian p-6 md:p-8 rounded-sm space-y-6 shadow-2xl relative animate-fade-in"
          >
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
            
            <h3 className="font-serif text-lg text-smoke tracking-wider uppercase">
              {editingNote ? "Notu Düzenle" : "Yeni Not Ekle"}
            </h3>

            <div className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-accent text-ash uppercase tracking-wider">Başlık</label>
                <input
                  type="text"
                  required
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  placeholder="örn: 'Görüşme Öncesi İlkelerim' veya 'B Planım'"
                  className="bg-void border border-obsidian px-4 py-3 rounded-sm text-sm text-smoke focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold transition-all duration-300"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-accent text-ash uppercase tracking-wider font-medium">Not İçeriği</label>
                <textarea
                  required
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="Taktiksel detayları buraya dökün..."
                  className="h-44 bg-void border border-obsidian p-4 rounded-sm text-sm text-smoke focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold transition-all duration-300"
                />
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-4 border-t border-obsidian/30">
              <button
                type="button"
                onClick={closeNoteModal}
                className="px-5 py-2.5 border border-obsidian hover:text-white text-ash transition-colors text-xs font-accent tracking-widest uppercase rounded-sm"
              >
                İptal
              </button>
              <button
                type="submit"
                disabled={notesSaveLoading}
                className="bg-gold text-void px-6 py-2.5 rounded-sm text-xs font-accent tracking-widest uppercase font-bold hover:bg-gold-dim transition-colors"
              >
                {notesSaveLoading ? "Kaydediliyor..." : "Kaydet"}
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
