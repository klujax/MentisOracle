"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { 
  BookMarked, Plus, Trash2, Save, FileText, 
  AlertTriangle, CheckCircle, Calendar, Edit, ChevronRight, ChevronLeft, Brain, ArrowLeft
} from "lucide-react";

interface SavedStrategy {
  id: string;
  problem: string;
  analysis: string;
  target_weakness: string;
  execution: string;
  personal_notes: string;
  character?: string;
  mode?: string;
  target_name?: string;
  created_at: string;
  chat_history?: { role: string; content: string }[];
}

const getCharacterName = (charId?: string) => {
  return "MENTİS";
};

interface CustomNote {
  id: string;
  title: string;
  content: string;
  created_at: string;
}

export default function JournalClient() {
  const [activeTab, setActiveTab] = useState<"strategies" | "notes">("strategies");
  const [loading, setLoading] = useState(true);
  const [dbStatus, setDbStatus] = useState<"connected" | "local">("connected");
  
  // Data lists
  const [strategies, setStrategies] = useState<SavedStrategy[]>([]);
  const [customNotes, setCustomNotes] = useState<CustomNote[]>([]);
  
  // Active items for view/edit
  const [selectedStrategy, setSelectedStrategy] = useState<SavedStrategy | null>(null);
  const [editingPersonalNotes, setEditingPersonalNotes] = useState("");
  const [saveLoading, setSaveLoading] = useState(false);

  // Custom Note Form State
  const [editingNote, setEditingNote] = useState<CustomNote | null>(null);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [isCreatingNote, setIsCreatingNote] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const supabase = createClient();
    let hasDbError = false;
    
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Kullanıcı bulunamadı.");

      // 1. Fetch consultations (strategies) that are starred
      let dbStrats: SavedStrategy[] = [];
      let fetchStratsError = false;
      try {
        const { data: stratData, error: stratErr } = await supabase
          .from("consultations")
          .select("*")
          .eq("is_starred", true)
          .order("created_at", { ascending: false });

        if (stratErr) throw stratErr;
        dbStrats = stratData || [];
      } catch (stratErr: any) {
        console.warn("Consultations DB fetch failed:", stratErr.message || stratErr);
        hasDbError = true;
        fetchStratsError = true;
      }

      // Load local strategies
      const localStrats = JSON.parse(localStorage.getItem("mentis_local_journal") || "[]");
      if (fetchStratsError) {
        setStrategies(localStrats.filter((ls: SavedStrategy) => ls.mode !== "simulation"));
      } else {
        // Merge DB strategies with local-only strategies (e.g. starting with local_ or not present in DB)
        const localOnly = localStrats.filter((ls: SavedStrategy) => 
          ls.id.toString().startsWith("local_") && !dbStrats.some(ds => ds.id === ls.id)
        );
        const merged = [...localOnly, ...dbStrats];
        setStrategies(merged.filter((ls: SavedStrategy) => ls.mode !== "simulation"));
      }

      // 2. Fetch custom notes
      let dbNotes: CustomNote[] = [];
      let fetchNotesError = false;
      try {
        const { data: notesData, error: notesErr } = await supabase
          .from("notes")
          .select("*")
          .order("created_at", { ascending: false });

        if (notesErr) throw notesErr;
        dbNotes = notesData || [];
      } catch (notesErr: any) {
        console.warn("Notes DB fetch failed:", notesErr.message || notesErr);
        hasDbError = true;
        fetchNotesError = true;
      }

      // Load local notes
      const localNotes = JSON.parse(localStorage.getItem("mentis_local_notes") || "[]");
      if (fetchNotesError) {
        setCustomNotes(localNotes);
      } else {
        // Merge DB notes with local-only notes (e.g. starting with note_ or not present in DB)
        const localOnlyNotes = localNotes.filter((ln: CustomNote) => 
          ln.id.toString().startsWith("note_") && !dbNotes.some(dn => dn.id === ln.id)
        );
        setCustomNotes([...localOnlyNotes, ...dbNotes]);
      }

      setDbStatus(hasDbError ? "local" : "connected");
    } catch (err: any) {
      console.warn("Auth check or database loading failed completely:", err.message || err);
      setDbStatus("local");
      
      // Fallback both to localStorage if auth/fetching completely failed
      try {
        const localStrats = JSON.parse(localStorage.getItem("mentis_local_journal") || "[]");
        setStrategies(localStrats.filter((ls: SavedStrategy) => ls.mode !== "simulation"));

        const localNotes = JSON.parse(localStorage.getItem("mentis_local_notes") || "[]");
        setCustomNotes(localNotes);
      } catch (localErr) {
        console.error("Local storage load failed:", localErr);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePersonalNotes = async (strategyId: string) => {
    setSaveLoading(true);
    const isLocal = strategyId.toString().startsWith("local_");
    
    if (!isLocal) {
      try {
        const supabase = createClient();
        const { error } = await supabase
          .from("consultations")
          .update({ personal_notes: editingPersonalNotes })
          .eq("id", strategyId);
        
        if (error) throw error;
        
        setStrategies(prev => prev.map(s => s.id === strategyId ? { ...s, personal_notes: editingPersonalNotes } : s));
        if (selectedStrategy) {
          setSelectedStrategy({ ...selectedStrategy, personal_notes: editingPersonalNotes });
        }
        setSaveLoading(false);
        return;
      } catch (err) {
        console.error("Failed to save personal notes to database, using local fallback:", err);
      }
    }

    // Local fallback
    const localStrats = JSON.parse(localStorage.getItem("mentis_local_journal") || "[]");
    const updated = localStrats.map((s: SavedStrategy) => 
      s.id === strategyId ? { ...s, personal_notes: editingPersonalNotes } : s
    );
    localStorage.setItem("mentis_local_journal", JSON.stringify(updated));
    setStrategies(updated);
    if (selectedStrategy) {
      setSelectedStrategy({ ...selectedStrategy, personal_notes: editingPersonalNotes });
    }
    
    setSaveLoading(false);
  };

  const handleSaveCustomNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim()) return;
    setSaveLoading(true);

    const isLocal = editingNote?.id?.startsWith("note_");

    if (editingNote && isLocal) {
      // Saving local note update
      saveNoteLocally();
      setSaveLoading(false);
      return;
    }

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Yetkisiz işlem.");

      if (editingNote) {
        // Update on database
        const { error } = await supabase
          .from("notes")
          .update({ title: noteTitle, content: noteContent, updated_at: new Date().toISOString() })
          .eq("id", editingNote.id);
        
        if (error) throw error;
      } else {
        // Create on database
        const { error } = await supabase
          .from("notes")
          .insert({
            user_id: user.id,
            title: noteTitle,
            content: noteContent
          });
        
        if (error) throw error;
      }
      await loadData();
      closeNoteModal();
    } catch (err) {
      console.error("Database save failed, using local storage fallback:", err);
      saveNoteLocally();
    }
    setSaveLoading(false);
  };

  const saveNoteLocally = () => {
    const localNotes = JSON.parse(localStorage.getItem("mentis_local_notes") || "[]");
    if (editingNote) {
      // Update
      const updated = localNotes.map((n: CustomNote) => 
        n.id === editingNote.id ? { ...n, title: noteTitle, content: noteContent } : n
      );
      localStorage.setItem("mentis_local_notes", JSON.stringify(updated));
    } else {
      // Create
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

    deleteNoteLocally(noteId);
  };

  const deleteNoteLocally = (noteId: string) => {
    const localNotes = JSON.parse(localStorage.getItem("mentis_local_notes") || "[]");
    const updated = localNotes.filter((n: CustomNote) => n.id !== noteId);
    localStorage.setItem("mentis_local_notes", JSON.stringify(updated));
    setCustomNotes(updated);
  };

  const handleDeleteStarredStrategy = async (stratId: string) => {
    if (!confirm("Bu hamleyi defterden çıkarmak istiyor musunuz? (Geçmişinizden silinmez)")) return;

    const isLocal = stratId.toString().startsWith("local_");

    if (!isLocal) {
      try {
        const supabase = createClient();
        const { error } = await supabase
          .from("consultations")
          .update({ is_starred: false })
          .eq("id", stratId);
        if (error) throw error;
        setStrategies(prev => prev.filter(s => s.id !== stratId));
        if (selectedStrategy?.id === stratId) setSelectedStrategy(null);
        return;
      } catch (err) {
        console.error("Database star removal failed, using local fallback:", err);
      }
    }

    removeStrategyLocally(stratId);
  };

  const removeStrategyLocally = (stratId: string) => {
    const localStrats = JSON.parse(localStorage.getItem("mentis_local_journal") || "[]");
    const updated = localStrats.filter((s: SavedStrategy) => s.id !== stratId);
    localStorage.setItem("mentis_local_journal", JSON.stringify(updated));
    setStrategies(updated);
    if (selectedStrategy?.id === stratId) setSelectedStrategy(null);
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
    return new Date(dateStr).toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  };



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
      <div className="text-center space-y-4 w-full">
        <h2 className="font-serif text-3xl md:text-4xl text-smoke tracking-wider uppercase">Strateji Defteri</h2>
        <p className="font-accent text-ash italic md:text-lg">Hedeflerini kaydet, eylem planları ekle ve hayatına entegre et.</p>
        
        {/* Sync Status Badge */}
        <div className="flex items-center justify-center gap-2 pt-2">
          {dbStatus === "connected" ? (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-950/30 border border-green-800 text-[10px] text-green-500 font-accent tracking-widest uppercase">
              <CheckCircle className="w-3.5 h-3.5" /> Bulut Senkronizasyonu Aktif
            </span>
          ) : (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-950/30 border border-yellow-800 text-[10px] text-yellow-500 font-accent tracking-widest uppercase" title="Supabase tabloları algılanamadı, veriler yerel hafızaya kaydediliyor.">
              <AlertTriangle className="w-3.5 h-3.5" /> Yerel Depolama (Tarayıcı)
            </span>
          )}
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-obsidian/60 w-full justify-center space-x-4 md:space-x-12 pb-0.5">
        <button
          onClick={() => { setActiveTab("strategies"); setSelectedStrategy(null); }}
          className={`pb-4 text-xs md:text-sm font-accent tracking-widest uppercase transition-all duration-300 border-b-2 flex items-center gap-1.5 md:gap-2 ${
            activeTab === "strategies" ? "border-gold text-gold" : "border-transparent text-ash hover:text-smoke"
          }`}
        >
          <BookMarked className="w-3.5 h-3.5 md:w-4 md:h-4 flex-shrink-0" />
          <span className="hidden sm:inline">Stratejik Hedefler ({strategies.length})</span>
          <span className="sm:hidden">Hedeflerim ({strategies.length})</span>
        </button>
        <button
          onClick={() => { setActiveTab("notes"); setSelectedStrategy(null); }}
          className={`pb-4 text-xs md:text-sm font-accent tracking-widest uppercase transition-all duration-300 border-b-2 flex items-center gap-1.5 md:gap-2 ${
            activeTab === "notes" ? "border-gold text-gold" : "border-transparent text-ash hover:text-smoke"
          }`}
        >
          <FileText className="w-3.5 h-3.5 md:w-4 md:h-4 flex-shrink-0" />
          <span className="hidden sm:inline">Karargah Notları ({customNotes.length})</span>
          <span className="sm:hidden">Notlarım ({customNotes.length})</span>
        </button>
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="py-20 text-gold font-accent italic animate-pulse-gold">Defter sayfaları açılıyor...</div>
      ) : (
        <div className="w-full">
          
          {/* Tab 1: Saved Strategies */}
          {activeTab === "strategies" && (
            strategies.length === 0 ? (
              <div className="w-full max-w-2xl mx-auto h-[320px] border border-obsidian bg-abyss/20 flex flex-col items-center justify-center text-center p-8 rounded-sm space-y-4 animate-fade-in relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
                <BookMarked className="w-12 h-12 text-obsidian/30 mb-2 animate-pulse-gold" />
                <p className="text-ash font-accent italic text-base max-w-md leading-relaxed">
                  Henüz deftere eklenmiş bir strateji bulunmuyor. Karargahta danışmanlık aldıktan sonra &quot;Deftere Kaydet&quot; butonuna basabilirsiniz.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start w-full">
                {/* Strategies Sidebar List */}
                <div className={`md:col-span-4 space-y-4 max-h-[600px] overflow-y-auto pr-2 ${selectedStrategy ? "hidden md:block" : "block"}`}>
                  {strategies.map(s => (
                    <button
                      key={s.id}
                      onClick={() => {
                        setSelectedStrategy(s);
                        setEditingPersonalNotes(s.personal_notes || "");
                      }}
                      className={`w-full text-left p-5 border rounded-sm transition-all duration-300 flex flex-col justify-between ${
                        selectedStrategy?.id === s.id 
                          ? "border-gold bg-obsidian/75 shadow-[0_0_15px_rgba(201,168,76,0.05)]" 
                          : "border-obsidian/50 bg-abyss/30 hover:border-obsidian/80 hover:bg-abyss/50"
                      }`}
                    >
                      <span className="text-smoke text-sm font-medium line-clamp-2 pr-4 text-left">
                        {s.mode === "simulation" ? `Simülasyon: ${s.target_name || "Hedef Kişi"}` : s.problem}
                      </span>
                      <div className="flex items-center justify-between w-full mt-4 text-[10px] text-ash/60 font-accent uppercase tracking-widest">
                        <div className="flex flex-col gap-1 text-left">
                          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {formatDate(s.created_at)}</span>
                          {s.mode === "simulation" ? (
                            <span className="text-[9px] text-yellow-500/80">SOHBET SİMÜLASYONU</span>
                          ) : s.character && (
                            <span className="text-[9px] text-gold/60">{getCharacterName(s.character)}</span>
                          )}
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-gold/50" />
                      </div>
                    </button>
                  ))}
                </div>

                {/* Strategy Details Column */}
                <div className={`md:col-span-8 ${selectedStrategy ? "block" : "hidden md:block"}`}>
                  {selectedStrategy ? (
                    <div className="border border-obsidian bg-abyss/40 p-8 rounded-sm space-y-8 animate-fade-in relative">
                      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
                      
                      {/* Mobile Back Button */}
                      <button 
                        onClick={() => setSelectedStrategy(null)}
                        className="md:hidden text-gold text-xs font-accent uppercase tracking-widest flex items-center gap-1.5 mb-4 hover:text-gold-dim transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4" /> Listeye Dön
                      </button>
                      
                      {/* Header */}
                      <div className="flex items-start justify-between border-b border-obsidian/50 pb-6">
                        <div className="space-y-1 text-left">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[10px] text-gold font-accent tracking-widest uppercase">
                              {selectedStrategy.mode === "simulation" ? "KAYITLI CANLI SİMÜLASYON" : "Kayıtlı Hamle Hedefi"}
                            </span>
                            {selectedStrategy.mode === "simulation" ? (
                              <span className="text-[9px] text-yellow-500 bg-void border border-yellow-500/20 px-2 py-0.5 rounded-sm font-accent tracking-widest uppercase">
                                SİMÜLASYON
                              </span>
                            ) : selectedStrategy.character && (
                              <span className="text-[9px] text-ash bg-void border border-obsidian px-2 py-0.5 rounded-sm font-accent tracking-widest uppercase">
                                {getCharacterName(selectedStrategy.character)} İLE
                              </span>
                            )}
                          </div>
                          <h3 className="text-xl font-medium text-smoke font-serif">
                            {selectedStrategy.mode === "simulation" 
                              ? `Simülasyon: ${selectedStrategy.target_name || "Hedef Kişi"}` 
                              : selectedStrategy.problem}
                          </h3>
                        </div>
                        <button 
                          onClick={() => handleDeleteStarredStrategy(selectedStrategy.id)}
                          className="text-ash hover:text-red-500 transition-colors p-2"
                          title="Defterden Kaldır"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>

                      {/* Prescriptions */}
                      <div className="space-y-6">
                        {!selectedStrategy.target_weakness && !selectedStrategy.execution ? (
                          <div>
                            <h4 className="text-xs font-serif text-gold uppercase tracking-widest mb-2">
                              {selectedStrategy.mode === "simulation" ? "Karakter Analizi" : "Mentis Yönlendirmesi"}
                            </h4>
                            <p className="text-sm text-smoke/90 leading-relaxed whitespace-pre-wrap">{selectedStrategy.analysis}</p>
                          </div>
                        ) : (
                          <>
                            <div>
                              <h4 className="text-xs font-serif text-gold uppercase tracking-widest mb-2">
                                01
                              </h4>
                              <p className="text-sm text-smoke/90 leading-relaxed whitespace-pre-wrap">{selectedStrategy.analysis}</p>
                            </div>
                            {selectedStrategy.target_weakness && (
                              <div>
                                <h4 className="text-xs font-serif text-gold uppercase tracking-widest mb-2">
                                  02 — Karşı Tarafın Motivasyonu
                                </h4>
                                <p className="text-sm text-smoke/90 leading-relaxed whitespace-pre-wrap">{selectedStrategy.target_weakness}</p>
                              </div>
                            )}
                            {selectedStrategy.execution && (
                              <div>
                                <h4 className="text-xs font-serif text-gold uppercase tracking-widest mb-2">
                                  03 — Stratejik Hamle
                                </h4>
                                <p className="text-sm text-smoke/90 leading-relaxed whitespace-pre-wrap">{selectedStrategy.execution}</p>
                              </div>
                            )}
                          </>
                        )}
                      </div>

                      {/* Render Chat History Follow-ups if they exist */}
                      {selectedStrategy.chat_history && selectedStrategy.chat_history.length > 2 && (
                        <div className="border-t border-obsidian/50 pt-8 space-y-6">
                          <h4 className="text-sm font-serif text-smoke uppercase tracking-wider text-center mb-6 border-b border-obsidian/30 pb-4">Takip Sohbeti</h4>
                          {selectedStrategy.chat_history.slice(2).map((msg, index) => {
                            const isUser = msg.role === "user";
                            
                            let replyText = msg.content;
                            let adviceText = null;

                            if (!isUser && selectedStrategy.mode === "simulation") {
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
                                      : selectedStrategy.mode === "simulation"
                                        ? (selectedStrategy.target_name || "KARŞI TARAF").toUpperCase()
                                        : getCharacterName(selectedStrategy.character)}
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

                      {/* Personal Progress Notes */}
                      <div className="border-t border-obsidian/50 pt-8 space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <h4 className="text-sm font-serif text-smoke uppercase tracking-wider">Aksiyon Notlarım & Entegrasyon Takibi</h4>
                          <span className="text-[10px] text-ash font-accent italic">Bu stratejiyi hayatına nasıl entegre ediyorsun? Günlük notlar tut.</span>
                        </div>
                        <textarea
                          value={editingPersonalNotes}
                          onChange={(e) => setEditingPersonalNotes(e.target.value)}
                          placeholder="Örn: 'Bugün ilk sessizlik hamlesini uyguladım. Mesajına 4 saat sonra sadece tek cümleyle yanıt verdim. Pozisyonumu koruyorum...'"
                          className="w-full h-32 bg-void border border-obsidian p-4 rounded-sm text-sm text-smoke focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold transition-all duration-300"
                        />
                        <div className="flex justify-end">
                          <button
                            onClick={() => handleUpdatePersonalNotes(selectedStrategy.id)}
                            disabled={saveLoading}
                            className="bg-gold text-void px-6 py-2.5 rounded-sm text-xs font-accent tracking-widest uppercase font-bold hover:bg-gold-dim transition-colors flex items-center gap-2"
                          >
                            <Save className="w-4 h-4" />
                            {saveLoading ? "Kaydediliyor..." : "Notları Güncelle"}
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="h-[400px] border border-obsidian/30 bg-abyss/10 flex flex-col items-center justify-center text-center p-8 rounded-sm">
                      <BookMarked className="w-12 h-12 text-obsidian mb-4" />
                      <p className="text-ash font-accent italic text-base max-w-md">
                        Detayları görmek, aksiyon notları eklemek ve entegrasyonu takip etmek için soldaki listeden bir strateji seçin.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )
          )}

          {/* Tab 2: Custom Notes */}
          {activeTab === "notes" && (
            <div className="space-y-6 w-full">
              {/* New Note Button */}
              <div className="flex justify-end">
                <button
                  onClick={() => openNoteModal()}
                  className="bg-gold text-void px-6 py-2.5 rounded-sm text-xs font-accent tracking-widest uppercase font-bold hover:bg-gold-dim transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Not Ekle
                </button>
              </div>

              {/* Notes Grid */}
              {customNotes.length === 0 ? (
                <div className="text-center py-20 border border-obsidian/30 bg-abyss/10 p-6 rounded-sm text-ash font-accent italic text-base">
                  Karargah not defteriniz henüz boş. Stratejik çıkarımlarınızı kaydetmek için ilk notu ekleyin.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {customNotes.map(n => (
                    <div 
                      key={n.id} 
                      className="border border-obsidian/50 bg-abyss/20 hover:bg-abyss/40 p-6 rounded-sm flex flex-col justify-between space-y-4 transition-all duration-300 relative overflow-hidden"
                    >
                      <div className="absolute top-0 left-0 w-[2px] h-full bg-gold/50" />
                      <div className="space-y-2">
                        <h4 className="text-base font-serif text-smoke tracking-wider line-clamp-1">{n.title}</h4>
                        <p className="text-xs text-ash font-accent tracking-widest uppercase flex items-center gap-1.5 mb-2">
                          <Calendar className="w-3.5 h-3.5" /> {formatDate(n.created_at)}
                        </p>
                        <p className="text-sm text-ash/80 line-clamp-4 whitespace-pre-wrap font-sans">{n.content}</p>
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
                          className="text-ash hover:text-red-500 transition-colors text-xs flex items-center gap-1 font-accent uppercase"
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

      {/* Note Creation/Editing Modal */}
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
                disabled={saveLoading}
                className="bg-gold text-void px-6 py-2.5 rounded-sm text-xs font-accent tracking-widest uppercase font-bold hover:bg-gold-dim transition-colors"
              >
                {saveLoading ? "Kaydediliyor..." : "Kaydet"}
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
