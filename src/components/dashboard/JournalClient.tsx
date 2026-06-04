"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { 
  BookMarked, Plus, Trash2, Save, FileText, 
  AlertTriangle, CheckCircle, Calendar, Edit, ChevronRight, ChevronLeft
} from "lucide-react";

interface SavedStrategy {
  id: string;
  problem: string;
  analysis: string;
  target_weakness: string;
  execution: string;
  personal_notes: string;
  created_at: string;
}

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
    
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Kullanıcı bulunamadı.");

      // 1. Fetch consultations (strategies) that are starred
      const { data: stratData, error: stratErr } = await supabase
        .from("consultations")
        .select("*")
        .eq("is_starred", true)
        .order("created_at", { ascending: false });

      if (stratErr) throw stratErr;
      setStrategies(stratData || []);

      // 2. Fetch custom notes
      const { data: notesData, error: notesErr } = await supabase
        .from("notes")
        .select("*")
        .order("created_at", { ascending: false });

      if (notesErr) throw notesErr;
      setCustomNotes(notesData || []);
      setDbStatus("connected");
    } catch (err: any) {
      console.warn("Supabase fetch failed, loading from local storage:", err.message);
      setDbStatus("local");
      
      // Fallback to localStorage
      try {
        const localStrats = JSON.parse(localStorage.getItem("mentis_local_journal") || "[]");
        setStrategies(localStrats);

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
    
    if (dbStatus === "connected") {
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
      } catch (err) {
        console.error("Failed to save to database, trying local fallback:", err);
      }
    } else {
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
    }
    
    setSaveLoading(false);
  };

  const handleSaveCustomNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim()) return;
    setSaveLoading(true);

    const supabase = createClient();

    if (dbStatus === "connected") {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Yetkisiz işlem.");

        if (editingNote) {
          // Update
          const { error } = await supabase
            .from("notes")
            .update({ title: noteTitle, content: noteContent, updated_at: new Date().toISOString() })
            .eq("id", editingNote.id);
          
          if (error) throw error;
        } else {
          // Create
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
    } else {
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

    if (dbStatus === "connected") {
      try {
        const supabase = createClient();
        const { error } = await supabase.from("notes").delete().eq("id", noteId);
        if (error) throw error;
        setCustomNotes(prev => prev.filter(n => n.id !== noteId));
      } catch (err) {
        console.error("Database delete failed, using local fallback:", err);
        deleteNoteLocally(noteId);
      }
    } else {
      deleteNoteLocally(noteId);
    }
  };

  const deleteNoteLocally = (noteId: string) => {
    const localNotes = JSON.parse(localStorage.getItem("mentis_local_notes") || "[]");
    const updated = localNotes.filter((n: CustomNote) => n.id !== noteId);
    localStorage.setItem("mentis_local_notes", JSON.stringify(updated));
    setCustomNotes(updated);
  };

  const handleDeleteStarredStrategy = async (stratId: string) => {
    if (!confirm("Bu hamleyi defterden çıkarmak istiyor musunuz? (Geçmişinizden silinmez)")) return;

    if (dbStatus === "connected") {
      try {
        const supabase = createClient();
        const { error } = await supabase
          .from("consultations")
          .update({ is_starred: false })
          .eq("id", stratId);
        if (error) throw error;
        setStrategies(prev => prev.filter(s => s.id !== stratId));
        if (selectedStrategy?.id === stratId) setSelectedStrategy(null);
      } catch (err) {
        console.error("Database star removal failed, using local fallback:", err);
        removeStrategyLocally(stratId);
      }
    } else {
      removeStrategyLocally(stratId);
    }
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
    <div className="flex flex-col items-center w-full max-w-5xl mx-auto space-y-8 pb-20 animate-fade-in">
      
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
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start w-full">
              {/* Strategies Sidebar List */}
              <div className={`md:col-span-4 space-y-4 max-h-[600px] overflow-y-auto pr-2 ${selectedStrategy ? "hidden md:block" : "block"}`}>
                {strategies.length === 0 ? (
                  <div className="text-center py-12 border border-obsidian/30 bg-abyss/20 p-6 rounded-sm text-ash font-accent italic text-sm">
                    Henüz deftere eklenmiş bir strateji bulunmuyor. Karargahta danışmanlık aldıktan sonra &quot;Deftere Kaydet&quot; butonuna basabilirsiniz.
                  </div>
                ) : (
                  strategies.map(s => (
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
                      <span className="text-smoke text-sm font-medium line-clamp-2 pr-4">{s.problem}</span>
                      <div className="flex items-center justify-between w-full mt-4 text-[10px] text-ash/60 font-accent uppercase tracking-widest">
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {formatDate(s.created_at)}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-gold/50" />
                      </div>
                    </button>
                  ))
                )}
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
                      <div className="space-y-1">
                        <span className="text-[10px] text-gold font-accent tracking-widest uppercase">Kayıtlı Hamle Hedefi</span>
                        <h3 className="text-xl font-medium text-smoke">{selectedStrategy.problem}</h3>
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
                      <div>
                        <h4 className="text-xs font-serif text-gold uppercase tracking-widest mb-2">01 — Durum Analizi</h4>
                        <p className="text-sm text-smoke/90 leading-relaxed whitespace-pre-wrap">{selectedStrategy.analysis}</p>
                      </div>
                      <div>
                        <h4 className="text-xs font-serif text-gold uppercase tracking-widest mb-2">02 — Karşı Tarafın Motivasyonu</h4>
                        <p className="text-sm text-smoke/90 leading-relaxed whitespace-pre-wrap">{selectedStrategy.target_weakness}</p>
                      </div>
                      <div>
                        <h4 className="text-xs font-serif text-gold uppercase tracking-widest mb-2">03 — Stratejik Hamle</h4>
                        <p className="text-sm text-smoke/90 leading-relaxed whitespace-pre-wrap">{selectedStrategy.execution}</p>
                      </div>
                    </div>

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
