"use client";

import { useState, useEffect, useRef } from "react";
import { 
  BookOpen, 
  Lock, 
  ChevronLeft, 
  ChevronRight, 
  ArrowLeft, 
  Menu, 
  X, 
  ZoomIn, 
  ZoomOut, 
  Loader2, 
  Bookmark, 
  Sparkles, 
  ShieldCheck, 
  Volume2,
  Search
} from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
// Precalculated page counts for each chapter/section at the static 900 character limit
const MENTIS_PAGE_COUNTS: Record<string, number> = {
  "preface": 2, "intro_1": 2, "1.1": 6, "1.2": 6, "1.3": 7, "1.4": 7, "1.5": 7,
  "intro_2": 2, "2.1": 7, "2.2": 7, "2.3": 6, "2.4": 6, "2.5": 6,
  "intro_3": 2, "3.1": 6, "3.2": 6, "3.3": 7, "3.4": 7, "3.5": 7,
  "intro_4": 2, "4.1": 6, "4.2": 7, "4.3": 6, "4.4": 6, "4.5": 8,
  "intro_5": 2, "5.1": 7, "5.2": 7, "5.3": 7, "5.4": 7, "5.5": 7,
  "intro_6": 2, "6.1": 7, "6.2": 8, "6.3": 7, "6.4": 7, "6.5": 6,
  "intro_7": 2, "7.1": 6, "7.2": 7, "7.3": 7, "7.4": 6, "7.5": 6,
  "intro_8": 2, "8.1": 6, "8.2": 7, "8.3": 7, "8.4": 7, "8.5": 7,
  "intro_9": 1, "9.1": 7, "9.2": 7, "9.3": 7, "9.4": 7, "9.5": 6,
  "intro_10": 2, "10.1": 8, "10.2": 7, "10.3": 6, "10.4": 7, "10.5": 7,
  "epilogue": 3
};

const SECRET_PAGE_COUNTS: Record<string, number> = {
  "preface": 4, "intro_1": 3, "1.1": 4, "1.2": 5, "1.3": 5, "1.4": 5, "1.5": 5,
  "intro_2": 3, "2.1": 4, "2.2": 5, "2.3": 5, "2.4": 4, "2.5": 5,
  "intro_3": 3, "3.1": 6, "3.2": 5, "3.3": 6, "3.4": 5, "3.5": 6,
  "intro_4": 3, "4.1": 5, "4.2": 5, "4.3": 6, "4.4": 6, "4.5": 6,
  "intro_5": 3, "5.1": 5, "5.2": 5, "5.3": 6, "5.4": 5, "5.5": 4,
  "intro_6": 3, "6.1": 5, "6.2": 5, "6.3": 5, "6.4": 5, "6.5": 5,
  "intro_7": 3, "7.1": 4, "7.2": 6, "7.3": 5, "7.4": 4, "7.5": 5,
  "intro_8": 3, "8.1": 6, "8.2": 6, "8.3": 6, "8.4": 6, "8.5": 6,
  "intro_9": 3, "9.1": 5, "9.2": 6, "9.3": 6, "9.4": 5, "9.5": 4,
  "intro_10": 2, "10.1": 4, "10.2": 5, "10.3": 4, "10.4": 5, "10.5": 4,
  "epilogue": 2
};

// Order of chapters/sections in the reader for Book 1
const MENTIS_SECTIONS = [
  { id: "preface", title: "Önsöz", isFree: true },
  { id: "intro_1", title: "Bölüm 1: Piyonların Uykusu", isFree: true },
  { id: "1.1", title: "1.1 \"İyi İnsan\" Masalı", isFree: true },
  { id: "1.2", title: "1.2 Fedakarlık Hastalığı", isFree: false },
  { id: "1.3", title: "1.3 Sahte Erdemler", isFree: false },
  { id: "1.4", title: "1.4 Onay Bağımlılığı", isFree: false },
  { id: "1.5", title: "1.5 Uyanış Protokolü", isFree: false },
  
  { id: "intro_2", title: "Bölüm 2: Yokluğun Şiddeti", isFree: false },
  { id: "2.1", title: "2.1 Kıtlık Yasası", isFree: false },
  { id: "2.2", title: "2.2 Sessizlik Ambargosu", isFree: false },
  { id: "2.3", title: "2.3 Geri Çekilme Taktikleri", isFree: false },
  { id: "2.4", title: "2.4 \"Belki\"nin Karanlık Gücü", isFree: false },
  { id: "2.5", title: "2.5 İlgi Para Birimidir", isFree: false },

  { id: "intro_3", title: "Bölüm 3: Duygusal Felç", isFree: false },
  { id: "3.1", title: "3.1 Reaksiyon Zafiyeti", isFree: false },
  { id: "3.2", title: "3.2 Soğukkanlılık İllüzyonu", isFree: false },
  { id: "3.3", title: "3.3 Mikro İfadelerin Kontrolü", isFree: false },
  { id: "3.4", title: "3.4 Beklenti Suikastı", isFree: false },
  { id: "3.5", title: "3.5 Manipülatif Suskunluk", isFree: false },

  { id: "intro_4", title: "Bölüm 4: Algı Mühendisliği", isFree: false },
  { id: "4.1", title: "4.1 Sessiz Lüks Felsefesi", isFree: false },
  { id: "4.2", title: "4.2 Bilinçli Gizem", isFree: false },
  { id: "4.3", title: "4.3 Çerçeve (Frame) Kontrolü", isFree: false },
  { id: "4.4", title: "4.4 Alan Hakimiyeti", isFree: false },
  { id: "4.5", title: "4.5 Zayıflıkları Saklama Sanatı", isFree: false },

  { id: "intro_5", title: "Bölüm 5: Gerçeğin Peşinde", isFree: false },
  { id: "5.1", title: "5.1 Sızıntı Noktaları", isFree: false },
  { id: "5.2", title: "5.2 Hikayedeki Boşluklar", isFree: false },
  { id: "5.3", title: "5.3 Göz Teması Miti", isFree: false },
  { id: "5.4", title: "5.4 Sözel Kamuflaj", isFree: false },
  { id: "5.5", title: "5.5 Sessiz Sorgu Tekniği", isFree: false },

  { id: "intro_6", title: "Bölüm 6: Tohum Ekmek", isFree: false },
  { id: "6.1", title: "6.1 Doğrulama Önyargısı", isFree: false },
  { id: "6.2", title: "6.2 Hikaye Anlatıcılığının Hipnotik Gücü", isFree: false },
  { id: "6.3", title: "6.3 Sosyal Kanıt ve Sürü Psikolojisi", isFree: false },
  { id: "6.4", title: "6.4 Azlık (Kıtlık) İlkesi", isFree: false },
  { id: "6.5", title: "6.5 Taahhüt ve Tutarlılık", isFree: false },

  { id: "intro_7", title: "Bölüm 7: Maskelerin Düştüğü An", isFree: false },
  { id: "7.1", title: "7.1 Savaş, Kaç veya Donakal", isFree: false },
  { id: "7.2", title: "7.2 Stres Altında Karar Alma", isFree: false },
  { id: "7.3", title: "7.3 Duygusal Patlamaları Soğurma", isFree: false },
  { id: "7.4", title: "7.4 Kendini Kalibre Etme", isFree: false },
  { id: "7.5", title: "7.5 Kriz Sonrası Toparlanma", isFree: false },

  { id: "intro_8", title: "Bölüm 8: Dijital Zihin Okuma", isFree: false },
  { id: "8.1", title: "8.1 Tipografi ve Mesajlaşma Analizi", isFree: false },
  { id: "8.2", title: "8.2 Sosyal Medya Vitrini", isFree: false },
  { id: "8.3", title: "8.3 Dijital Güç Oyunları", isFree: false },
  { id: "8.4", title: "8.4 Açık Kaynak İstihbaratı (OSINT)", isFree: false },
  { id: "8.5", title: "8.5 Dijital Aynalama ve Yemleme", isFree: false },

  { id: "intro_9", title: "Bölüm 9: Karanlık Yönetim", isFree: false },
  { id: "9.1", title: "9.1 Onaylanma İhtiyacı", isFree: false },
  { id: "9.2", title: "9.2 Suçluluk Mühendisliği", isFree: false },
  { id: "9.3", title: "9.3 Gerçeklik Bükülmesi", isFree: false },
  { id: "9.4", title: "9.4 Aralıklı Pekiştirme ve Travma Bağı", isFree: false },
  { id: "9.5", title: "9.5 İzolasyon ve Ortak Düşman Yaratma", isFree: false },

  { id: "intro_10", title: "Bölüm 10: Mutlak İktidar ve Sessiz Zirve", isFree: false },
  { id: "10.1", title: "10.1 Odadaki Yerçekimi", isFree: false },
  { id: "10.2", title: "10.2 Avcıyı Avlamak", isFree: false },
  { id: "10.3", title: "10.3 Hayalet Çıkışı", isFree: false },
  { id: "10.4", title: "10.4 Uçuruma Bakmak", isFree: false },
  { id: "10.5", title: "10.5 Final: Kusursuz Yalnızlık ve İmparatorluk", isFree: false },

  { id: "epilogue", title: "Sonsöz", isFree: false }
];

// Order of chapters/sections in the reader for Book 2
const SECRET_SECTIONS = [
  { id: "preface", title: "Önsöz", isFree: true },
  { id: "intro_1", title: "Bölüm 1: Gözlem ve Algı", isFree: true },
  { id: "1.1", title: "1.1 Kalibrasyon Kuralı", isFree: true },
  { id: "1.2", title: "1.2 Detayların Fısıltısı", isFree: false },
  { id: "1.3", title: "1.3 Mikro İfadeler", isFree: false },
  { id: "1.4", title: "1.4 Mekan ve Hakimiyet", isFree: false },
  { id: "1.5", title: "1.5 Kör Noktalarımız", isFree: false },

  { id: "intro_2", title: "Bölüm 2: Görünmez Bağ", isFree: false },
  { id: "2.1", title: "2.1 Aynalamanın Püf Noktası", isFree: false },
  { id: "2.2", title: "2.2 Ritim ve Solunum Senkronizasyonu", isFree: false },
  { id: "2.3", title: "2.3 Sözel Yankı (Eko Tekniği)", isFree: false },
  { id: "2.4", title: "2.4 Duygusal Etiketleme", isFree: false },
  { id: "2.5", title: "2.5 Dozaj ve Geri Çekilme", isFree: false },

  { id: "intro_3", title: "Bölüm 3: İnsan Mimarisi", isFree: false },
  { id: "3.1", title: "3.1 Karanlık Üçlü Tespiti", isFree: false },
  { id: "3.2", title: "3.2 Karar Alma Mekanizmaları", isFree: false },
  { id: "3.3", title: "3.3 Güvence vs. Risk Profililleri", isFree: false },
  { id: "3.4", title: "3.4 Kurban Mantalitesi ve Pasif-Agresifler", isFree: false },
  { id: "3.5", title: "3.5 Maske ve Gölge", isFree: false },

  { id: "intro_4", title: "Bölüm 4: Manipülasyonun Mekaniği", isFree: false },
  { id: "4.1", title: "4.1 Çerçeve (Frame) Kontrolü", isFree: false },
  { id: "4.2", title: "4.2 Gaslighting", isFree: false },
  { id: "4.3", title: "4.3 Otorite İllüzyonu", isFree: false },
  { id: "4.4", title: "4.4 Zehirli Dil", isFree: false },
  { id: "4.5", title: "4.5 İrade Aşınması", isFree: false },

  { id: "intro_5", title: "Bölüm 5: Gerçeğin Peşinde", isFree: false },
  { id: "5.1", title: "5.1 Sızıntı Noktaları", isFree: false },
  { id: "5.2", title: "5.2 Hikayedeki Boşluklar", isFree: false },
  { id: "5.3", title: "5.3 Göz Teması Miti", isFree: false },
  { id: "5.4", title: "5.4 Sözel Kamuflaj", isFree: false },
  { id: "5.5", title: "5.5 Sessiz Sorgu Tekniği", isFree: false },

  { id: "intro_6", title: "Bölüm 6: Tohum Ekmek", isFree: false },
  { id: "6.1", title: "6.1 Doğrulama Önyargısı", isFree: false },
  { id: "6.2", title: "6.2 Hikaye Anlatıcılığının Hipnotik Gücü", isFree: false },
  { id: "6.3", title: "6.3 Sosyal Kanıt ve Sürü Psikolojisi", isFree: false },
  { id: "6.4", title: "6.4 Azlık (Kıtlık) İlkesi", isFree: false },
  { id: "6.5", title: "6.5 Taahhüt ve Tutarlılık", isFree: false },

  { id: "intro_7", title: "Bölüm 7: Maskelerin Düştüğü An", isFree: false },
  { id: "7.1", title: "7.1 Savaş, Kaç veya Donakal", isFree: false },
  { id: "7.2", title: "7.2 Stres Altında Karar Alma", isFree: false },
  { id: "7.3", title: "7.3 Duygusal Patlamaları Soğurma", isFree: false },
  { id: "7.4", title: "7.4 Kendini Kalibre Etme", isFree: false },
  { id: "7.5", title: "7.5 Kriz Sonrası Toparlanma", isFree: false },

  { id: "intro_8", title: "Bölüm 8: Dijital Zihin Okuma", isFree: false },
  { id: "8.1", title: "8.1 Tipografi ve Mesajlaşma Analizi", isFree: false },
  { id: "8.2", title: "8.2 Sosyal Medya Vitrini", isFree: false },
  { id: "8.3", title: "8.3 Dijital Güç Oyunları", isFree: false },
  { id: "8.4", title: "8.4 Açık Kaynak İstihbaratı (OSINT)", isFree: false },
  { id: "8.5", title: "8.5 Dijital Aynalama ve Yemleme", isFree: false },

  { id: "intro_9", title: "Bölüm 9: Karanlık Yönetim", isFree: false },
  { id: "9.1", title: "9.1 Onaylanma İhtiyacı", isFree: false },
  { id: "9.2", title: "9.2 Suçluluk Mühendisliği", isFree: false },
  { id: "9.3", title: "9.3 Gerçeklik Bükülmesi", isFree: false },
  { id: "9.4", title: "9.4 Aralıklı Pekiştirme ve Travma Bağı", isFree: false },
  { id: "9.5", title: "9.5 İzolasyon ve Ortak Düşman Yaratma", isFree: false },

  { id: "intro_10", title: "Bölüm 10: Mutlak İktidar ve Sessiz Zirve", isFree: false },
  { id: "10.1", title: "10.1 Odadaki Yerçekimi", isFree: false },
  { id: "10.2", title: "10.2 Avcıyı Avlamak", isFree: false },
  { id: "10.3", title: "10.3 Hayalet Çıkışı", isFree: false },
  { id: "10.4", title: "10.4 Uçuruma Bakmak", isFree: false },
  { id: "10.5", title: "10.5 Final: Kusursuz Yalnızlık ve İmparatorluk", isFree: false },

  { id: "epilogue", title: "Sonsöz", isFree: false }
];

const MENTIS_INSIGHTS: Record<string, { character: string; quote: string }> = {
  "preface": { character: "Mentis Analist", quote: "Gözlerini ovuşturup da seni besleyen yalanların pamuk tarlasından çık. Masayı görüyorsan, artık oyuna dahilsin." },
  "intro_1": { character: "Niccolò Machiavelli", quote: "İnsanlar ya kazanılmalı ya da ezilmelidir; çünkü hafif yaraların intikamını alabilirler ama ağır olanlarınkini alamazlar." },
  "1.1": { character: "Hannibal Lecter", quote: "Önyargılar zırhtır, ancak aynı zamanda sizi gerçeklikten koparan birer hapishanedir." },
  "1.2": { character: "Thomas Shelby", quote: "Sınırlarınızı çizmezseniz, başkaları sizin yerinize oraya kendi duvarlarını inşa eder." },
  "1.3": { character: "Rust Cohle", quote: "İnsanların erdem dedikleri şey, genellikle cesaret edemedikleri günahların toplamıdır." },
  "1.4": { character: "Joe Goldberg", quote: "Beni onaylamanıza ihtiyacım yok. Sadece ne kadar kontrol edilebilir olduğunuzu bilmem yeterli." },
  "1.5": { character: "Walter White", quote: "Bir kurban gibi sızlanmayı bırak. Eğer masada eziliyorsan, bunun tek sebebi senin hamle yapmayı reddetmendir." },
  "intro_2": { character: "Sun Tzu", quote: "Mükemmellik, her savaşta dövüşüp kazanmak değildir; asıl mükemmellik savaşmadan düşmanın direncini kırmaktır." },
  "2.1": { character: "Patrick Bateman", quote: "Ulaşılabilirlik ucuzlatır. Eğer her an oradaysanız, insanların gözünde hiçbir değeriniz kalmaz." },
  "2.2": { character: "Sherlock Holmes", quote: "Sessizlik en büyük yanıttır. İnsanlar cevapsız kaldıklarında kendi içlerindeki şüphelerin esiri olurlar." },
  "2.3": { character: "Michael Scofield", quote: "Geri çekilmek teslim olmak değildir. Bazen en güçlü darbeyi vurmak için sadece alanın boşalmasını beklersiniz." },
  "2.4": { character: "Patrick Jane", quote: "Belki kelimesi zihne ekilen en tehlikeli tohumdur. O tohum kendi kendine büyür ve merak çiçeği açar." },
  "2.5": { character: "Harvey Specter", quote: "Kendi oyununu kur. Başkalarının kurallarıyla oynarsan, en iyi ihtimalle onların izin verdiği kadar kazanırsın." }
};

const SECRET_INSIGHTS: Record<string, { character: string; quote: string }> = {
  "preface": { character: "Mentis Analist", quote: "Gizli vaka dosyaları, görünmeyen gerçeğin otopsisidir. Maskeleri çıkarın." },
  "intro_1": { character: "Frank Underwood", quote: "İnsanları yönlendirmek, onlara kendi kararlarını aldıkları hissini verme sanatıdır." },
  "1.1": { character: "Hannibal Lecter", quote: "Karşındakinin zafiyeti senin en keskin silahındır. O şemayı bulduğunda onu yönetirsin." },
  "1.2": { character: "Michael Scofield", quote: "En güçlü kilit, kendi ego ve kibrinizle ördüğünüz hapishanedir." },
  "1.3": { character: "Joe Goldberg", quote: "Suçluluk duygusu en uysal piyonları yaratır. Karşı tarafı borçlandırın." },
  "epilogue": { character: "Mentis Analist", quote: "Dosya kapandı. Ancak mücadele ve gerçek hayat stratejisi yeni başlıyor." }
};

export default function BookReaderPage() {
  const [bookType, setBookType] = useState<"mentis" | "secret">("mentis");
  const [hasBook, setHasBook] = useState<boolean>(false);
  const [hasSecret, setHasSecret] = useState<boolean>(false);
  const [loadingAccess, setLoadingAccess] = useState<boolean>(true);
  const [currentSection, setCurrentSection] = useState<string>("preface");
  const [fontSize, setFontSize] = useState<number>(15); // px
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [bookmarkedSection, setBookmarkedSection] = useState<string | null>(null);
  const [showBookmarkAlert, setShowBookmarkAlert] = useState<boolean>(false);
  const [loadingPkg, setLoadingPkg] = useState<boolean>(false);
  const [checkoutError, setCheckoutError] = useState<string>("");

  const [textContent, setTextContent] = useState<string>("");
  const [loadingContent, setLoadingContent] = useState<boolean>(true);
  const [contentError, setContentError] = useState<string>("");
  const [sectionCache, setSectionCache] = useState<Record<string, string>>({});

  const fetchSectionContent = async (secId: string) => {
    const cacheKey = `${bookType}_${secId}`;
    if (sectionCache[cacheKey]) {
      return sectionCache[cacheKey];
    }
    try {
      const res = await fetch(`/api/book?book=${bookType}&section=${secId}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Bölüm yüklenemedi.");
      }
      const content = data.content || "";
      setSectionCache(prev => ({ ...prev, [cacheKey]: content }));
      return content;
    } catch (err: any) {
      console.error("Failed to load section content dynamically:", err);
      throw err;
    }
  };

  useEffect(() => {
    const loadCurrentSection = async () => {
      setLoadingContent(true);
      setContentError("");
      try {
        const content = await fetchSectionContent(currentSection);
        setTextContent(content);
      } catch (err: any) {
        setContentError(err.message || "Bölüm içeriği yüklenemedi.");
        setTextContent("");
      } finally {
        setLoadingContent(false);
      }
    };

    if (bookType && currentSection) {
      loadCurrentSection();
    }
  }, [bookType, currentSection]);

  // Page Index within the current section/chapter (0-indexed page list)
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(0);
  const [isMobile, setIsMobile] = useState<boolean>(false);

  // Magnifying Glass Mode States
  const [isMagnifierMode, setIsMagnifierMode] = useState<boolean>(false);
  const [mousePos, setMousePos] = useState<{ x: number; y: number; show: boolean }>({ x: 0, y: 0, show: false });
  const bookRef = useRef<HTMLDivElement>(null);
  const leftPageRef = useRef<HTMLDivElement>(null);
  const rightPageRef = useRef<HTMLDivElement>(null);
  
  // 3D Flipping Animation States
  const [flipDirection, setFlipDirection] = useState<"next" | "prev" | null>(null);
  const [animatingSection, setAnimatingSection] = useState<string>("preface");

  // Disable scrollbars and viewport bouncing on document body and html when mounted
  useEffect(() => {
    const originalBodyOverflow = document.body.style.overflow;
    const originalBodyPosition = document.body.style.position;
    const originalBodyWidth = document.body.style.width;
    const originalBodyHeight = document.body.style.height;
    
    const originalHtmlOverflow = document.documentElement.style.overflow;
    const originalHtmlHeight = document.documentElement.style.height;

    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.width = "100%";
    document.body.style.height = "100%";
    
    document.documentElement.style.overflow = "hidden";
    document.documentElement.style.height = "100%";
    
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      document.body.style.overflow = originalBodyOverflow;
      document.body.style.position = originalBodyPosition;
      document.body.style.width = originalBodyWidth;
      document.body.style.height = originalBodyHeight;
      
      document.documentElement.style.overflow = originalHtmlOverflow;
      document.documentElement.style.height = originalHtmlHeight;
      
      window.removeEventListener("resize", handleResize);
    };
  }, []);
 
  // Reset page scroll positions to top when page or section changes
  useEffect(() => {
    if (leftPageRef.current) {
      leftPageRef.current.scrollTop = 0;
    }
    if (rightPageRef.current) {
      rightPageRef.current.scrollTop = 0;
    }
  }, [currentPageIndex, currentSection]);

  // Check URL parameter for book type client-side safely
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const b = params.get("book");
      if (b === "secret") {
        setBookType("secret");
      } else {
        setBookType("mentis");
      }
    }
  }, []);

  // Fetch access from Supabase once bookType is determined
  useEffect(() => {
    const fetchAccess = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data } = await supabase
            .from("user_credits")
            .select("has_book, has_secret_files")
            .eq("user_id", user.id)
            .single();
          if (data) {
            setHasBook(data.has_book);
            setHasSecret(data.has_secret_files);
          }
        }
      } catch (err) {
        console.error("Access check error:", err);
      } finally {
        setLoadingAccess(false);
      }
    };
    fetchAccess();

    // Check bookmarks in localStorage for specific book
    const savedKey = bookType === "secret" ? "mentis_secret_bookmark" : "mentis_reader_bookmark";
    const saved = localStorage.getItem(savedKey);
    const sections = bookType === "secret" ? SECRET_SECTIONS : MENTIS_SECTIONS;
    if (saved && sections.some(s => s.id === saved)) {
      setBookmarkedSection(saved);
      if (saved !== "preface") {
        setShowBookmarkAlert(true);
      }
    } else {
      setBookmarkedSection(null);
      setShowBookmarkAlert(false);
    }
    setCurrentSection("preface"); // Reset page when changing books
    setAnimatingSection("preface");
    setCurrentPageIndex(0);
  }, [bookType]);

  const handleCheckout = async () => {
    try {
      setLoadingPkg(true);
      setCheckoutError("");

      const response = await fetch("/api/checkout/shopier", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          packageId: bookType === "secret" ? "book_secret_vol1" : "book_mentis" 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Ödeme başlatılamadı");
      }

      document.open();
      document.write(data.html);
      document.close();
    } catch (err: any) {
      console.error(err);
      setCheckoutError(err.message || "Checkout failed");
      setLoadingPkg(false);
    }
  };

  const handleToggleBookmark = () => {
    const savedKey = bookType === "secret" ? "mentis_secret_bookmark" : "mentis_reader_bookmark";
    if (bookmarkedSection === currentSection) {
      localStorage.removeItem(savedKey);
      setBookmarkedSection(null);
    } else {
      localStorage.setItem(savedKey, currentSection);
      setBookmarkedSection(currentSection);
    }
  };

  const SECTIONS_ORDER = bookType === "secret" ? SECRET_SECTIONS : MENTIS_SECTIONS;
  const currentSectionMeta = SECTIONS_ORDER.find(s => s.id === currentSection) || SECTIONS_ORDER[0];
  
  // Gate check depends on selected book
  const hasAccess = bookType === "secret" ? hasSecret : hasBook;
  const isLocked = !hasAccess && !currentSectionMeta.isFree;

  // textContent is loaded dynamically from the secure API

  // Split paragraphs into sentences for pagination
  const splitIntoSentences = (text: string): string[] => {
    const matches = text.match(/[^.!?]+[.!?]+(?:\s+|$)/g);
    if (!matches) return [text];
    return matches.map(s => s.trim());
  };

  // Dynamic Pagination Splitter based on font size.
  // Scales limit dynamically to prevent overflow and splits long paragraphs.
  const paginateSectionText = (text: string) => {
    if (!text) return [[""]];
    const paragraphs = text.split("\n\n").filter(p => p.trim().length > 0);
    const pagesList: string[][] = [];
    let currentPage: string[] = [];
    let currentPageLen = 0;
    
    // Limit based on screen width at smallest font size (pagination remains completely static when zooming font)
    const limit = 900;

    for (let pIdx = 0; pIdx < paragraphs.length; pIdx++) {
      const para = paragraphs[pIdx];
      
      if (currentPageLen + para.length <= limit) {
        currentPage.push(para);
        currentPageLen += para.length;
      } else {
        // Can it fit on a fresh page as a whole?
        if (para.length <= limit) {
          if (currentPage.length > 0) {
            pagesList.push(currentPage);
          }
          currentPage = [para];
          currentPageLen = para.length;
        } else {
          // Paragraph itself is larger than the limit, split into sentences
          const sentences = splitIntoSentences(para);
          let sameParagraphOnPage = false;
          
          for (const sent of sentences) {
            if (currentPageLen + sent.length > limit && currentPage.length > 0) {
              pagesList.push(currentPage);
              currentPage = [];
              currentPageLen = 0;
              sameParagraphOnPage = false;
            }
            
            if (sameParagraphOnPage && currentPage.length > 0) {
              const lastIdx = currentPage.length - 1;
              currentPage[lastIdx] = currentPage[lastIdx] + " " + sent;
            } else {
              currentPage.push(sent);
              sameParagraphOnPage = true;
            }
            currentPageLen += sent.length;
          }
        }
      }
    }
    
    if (currentPage.length > 0) {
      pagesList.push(currentPage);
    }
    return pagesList;
  };

  const pagesList = paginateSectionText(textContent);

  // Whenever pagesList changes (due to fontSize or section changes), make sure currentPageIndex doesn't exceed bounds
  useEffect(() => {
    if (currentPageIndex >= pagesList.length) {
      setCurrentPageIndex(Math.max(0, pagesList.length - 1));
    }
  }, [pagesList.length, currentPageIndex]);

  const totalSpreads = Math.ceil(pagesList.length / 2);

  // Magnifier Event Handlers
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isMagnifierMode || !bookRef.current) return;
    const rect = bookRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    if (x < 0 || y < 0 || x > rect.width || y > rect.height) {
      setMousePos(prev => ({ ...prev, show: false }));
    } else {
      setMousePos({ x, y, show: true });
    }
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isMagnifierMode || !bookRef.current) return;
    const rect = bookRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    if (x >= 0 && y >= 0 && x <= rect.width && y <= rect.height) {
      setMousePos({ x, y, show: true });
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isMagnifierMode || !bookRef.current) return;
    const rect = bookRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    if (x < 0 || y < 0 || x > rect.width || y > rect.height) {
      setMousePos(prev => ({ ...prev, show: false }));
    } else {
      setMousePos({ x, y, show: true });
    }
  };

  const handleMouseLeave = () => {
    setMousePos(prev => ({ ...prev, show: false }));
  };

  // Left and Right page content indexes based on screen size (mobile has 1 page, desktop has 2 pages)
  const leftPageIdx = isMobile ? currentPageIndex : Math.floor(currentPageIndex / 2) * 2;
  const rightPageIdx = leftPageIdx + 1;

  const leftPageParagraphs = pagesList[leftPageIdx] || [];
  const rightPageParagraphs = !isMobile ? (pagesList[rightPageIdx] || []) : [];

  // Animation previews
  const nextPageParagraphs = isMobile 
    ? (pagesList[currentPageIndex + 1] || []) 
    : rightPageParagraphs;

  const prevPageParagraphs = isMobile 
    ? (pagesList[currentPageIndex - 1] || []) 
    : leftPageParagraphs;

  const currentIndex = SECTIONS_ORDER.findIndex(s => s.id === currentSection);
  const progressPercent = Math.round(((currentIndex + 1) / SECTIONS_ORDER.length) * 100);

  // Navigation handlers
  const goPrev = () => {
    if (flipDirection) return;
    
    if (isMobile) {
      if (currentPageIndex > 0) {
        setFlipDirection("prev");
        setTimeout(() => {
          setCurrentPageIndex(prev => prev - 1);
          setFlipDirection(null);
        }, 400);
      } else if (currentIndex > 0) {
        // Go to previous section, start at its last page index
        const prevSecId = SECTIONS_ORDER[currentIndex - 1].id;
        setLoadingContent(true);
        fetchSectionContent(prevSecId)
          .then((prevText) => {
            const prevPages = paginateSectionText(prevText);
            setFlipDirection("prev");
            setTimeout(() => {
              setCurrentSection(prevSecId);
              setAnimatingSection(prevSecId);
              setCurrentPageIndex(prevPages.length - 1);
              setFlipDirection(null);
            }, 400);
          })
          .catch((err) => {
            setContentError(err.message || "Önceki bölüm yüklenemedi.");
          })
          .finally(() => {
            setLoadingContent(false);
          });
      }
    } else {
      const currentSpread = Math.floor(currentPageIndex / 2);
      if (currentSpread > 0) {
        setFlipDirection("prev");
        setTimeout(() => {
          setCurrentPageIndex((currentSpread - 1) * 2);
          setFlipDirection(null);
        }, 400);
      } else if (currentIndex > 0) {
        // Go to previous section, start at its last spread
        const prevSecId = SECTIONS_ORDER[currentIndex - 1].id;
        setLoadingContent(true);
        fetchSectionContent(prevSecId)
          .then((prevText) => {
            const prevPages = paginateSectionText(prevText);
            const prevTotalSpreads = Math.ceil(prevPages.length / 2);
            setFlipDirection("prev");
            setTimeout(() => {
              setCurrentSection(prevSecId);
              setAnimatingSection(prevSecId);
              setCurrentPageIndex((prevTotalSpreads - 1) * 2);
              setFlipDirection(null);
            }, 400);
          })
          .catch((err) => {
            setContentError(err.message || "Önceki bölüm yüklenemedi.");
          })
          .finally(() => {
            setLoadingContent(false);
          });
      }
    }
  };

  const goNext = () => {
    if (flipDirection) return;

    if (isMobile) {
      if (currentPageIndex < pagesList.length - 1) {
        setFlipDirection("next");
        setTimeout(() => {
          setCurrentPageIndex(prev => prev + 1);
          setFlipDirection(null);
        }, 400);
      } else if (currentIndex < SECTIONS_ORDER.length - 1) {
        const nextSecId = SECTIONS_ORDER[currentIndex + 1].id;
        
        setFlipDirection("next");
        setTimeout(() => {
          setCurrentSection(nextSecId);
          setAnimatingSection(nextSecId);
          setCurrentPageIndex(0);
          setFlipDirection(null);
        }, 400);
      }
    } else {
      const currentSpread = Math.floor(currentPageIndex / 2);
      if (currentSpread < totalSpreads - 1) {
        setFlipDirection("next");
        setTimeout(() => {
          setCurrentPageIndex((currentSpread + 1) * 2);
          setFlipDirection(null);
        }, 400);
      } else if (currentIndex < SECTIONS_ORDER.length - 1) {
        const nextSecId = SECTIONS_ORDER[currentIndex + 1].id;
        
        setFlipDirection("next");
        setTimeout(() => {
          setCurrentSection(nextSecId);
          setAnimatingSection(nextSecId);
          setCurrentPageIndex(0);
          setFlipDirection(null);
        }, 400);
      }
    }
  };

  const handleResumeBookmark = () => {
    if (bookmarkedSection) {
      setCurrentSection(bookmarkedSection);
      setAnimatingSection(bookmarkedSection);
      setCurrentPageIndex(0);
      setShowBookmarkAlert(false);
    }
  };

  // Calculate dynamic global page numbers for the entire book based on pagination limits
  let globalPageStart = 1;
  const pageCounts = bookType === "secret" ? SECRET_PAGE_COUNTS : MENTIS_PAGE_COUNTS;
  for (let i = 0; i < currentIndex; i++) {
    const secId = SECTIONS_ORDER[i].id;
    const count = pageCounts[secId] || 0;
    globalPageStart += count;
  }
  const leftPageNumber = globalPageStart + leftPageIdx;
  const rightPageNumber = leftPageNumber + 1;

  const renderBookPages = () => {
    return (
      <>
        {/* Central gutter fold shadow */}
        <div className="gutter-fold absolute left-1/2 top-0 bottom-0 w-[24px] -translate-x-1/2 z-20 pointer-events-none hidden lg:block" />
        
        {/* LEFT PAGE - NO VERTICAL SCROLLBAR */}
        <div className="w-full lg:w-1/2 h-full bg-[#121212] p-5 md:p-8 lg:p-10 flex flex-col justify-between lg:border-r lg:border-black/40 overflow-hidden relative">
          <div className="flex-1 flex flex-col justify-start min-h-0">
            {/* Left Page metadata */}
            <div className="flex items-center justify-between text-[8px] text-ash/40 font-accent tracking-widest uppercase border-b border-obsidian/30 pb-2 mb-6">
              <span>{bookType === "secret" ? "GİZLİ DOSYALAR CİLT 1" : "GÜCÜN SESSİZ MİMARİSİ"}</span>
              <span>{leftPageNumber}</span>
            </div>

            {/* Paragraph content */}
            <div 
              ref={leftPageRef}
              className="space-y-4 text-ash/90 font-serif leading-relaxed text-justify overflow-y-auto pr-1.5 flex-1 min-h-0 custom-reader-scrollbar"
              style={{ fontSize: isMobile ? "15px" : `${fontSize}px` }}
            >
              {/* Section title header in gold at the start of the chapter */}
              {leftPageIdx === 0 && (
                <div className="mb-6 pb-4 border-b border-gold/15">
                  <h2 className="text-sm md:text-base font-accent uppercase text-gold tracking-widest font-bold">
                    {currentSectionMeta.title}
                  </h2>
                </div>
              )}

              {leftPageParagraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
              
              {/* Final decorative close in the last chapter for mobile */}
              {isMobile && currentSection === "epilogue" && currentPageIndex === pagesList.length - 1 && (
                <div className="mt-8 pt-6 border-t border-gold/15 text-center space-y-3">
                  <div className="text-[8px] text-gold font-accent tracking-widest uppercase font-bold">
                    DOKTRİN TAMAMLANDI
                  </div>
                  <div className="w-12 h-[1px] bg-gold/30 mx-auto" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT PAGE - NO VERTICAL SCROLLBAR */}
        <div className="hidden lg:flex w-1/2 h-full bg-[#121212] p-5 md:p-8 lg:p-10 flex-col justify-between overflow-hidden relative">
          <div className="flex-1 flex flex-col justify-start min-h-0">
            {/* Right Page metadata */}
            <div className="flex items-center justify-between text-[8px] text-ash/40 font-accent tracking-widest uppercase border-b border-obsidian/30 pb-2 mb-6">
              <span>{progressPercent}% OKUNDU</span>
              <span>{rightPageNumber}</span>
            </div>

            {/* Paragraph content */}
            <div 
              ref={rightPageRef}
              className="space-y-4 text-ash/90 font-serif leading-relaxed text-justify overflow-y-auto pr-1.5 flex-1 min-h-0 custom-reader-scrollbar"
              style={{ fontSize: isMobile ? "15px" : `${fontSize}px` }}
            >
              {rightPageParagraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
              
              {/* Final decorative close in the last chapter */}
              {currentSection === "epilogue" && (isMobile ? currentPageIndex === pagesList.length - 1 : Math.floor(currentPageIndex / 2) === totalSpreads - 1) && (
                <div className="mt-8 pt-6 border-t border-gold/15 text-center space-y-3">
                  <div className="text-[8px] text-gold font-accent tracking-widest uppercase font-bold">
                    DOKTRİN TAMAMLANDI
                  </div>
                  <div className="w-12 h-[1px] bg-gold/30 mx-auto" />
                </div>
              )}
            </div>
          </div>
        </div>
      </>
    );
  };

  const activeInsight = bookType === "secret" 
    ? SECRET_INSIGHTS[currentSection] 
    : MENTIS_INSIGHTS[currentSection];

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden bg-void text-smoke flex flex-col font-sans select-none antialiased z-50">
      
      {/* 3D Flip Custom CSS Injection */}
      <style>{`
        /* Custom range slider styling */
        input[type="range"] {
          background: #1a1a1a;
          appearance: none;
          outline: none;
        }
        input[type="range"]::-webkit-slider-runnable-track {
          background: #1a1a1a;
          height: 4px;
          border-radius: 2px;
        }
        input[type="range"]::-webkit-slider-thumb {
          background: #C9A84C;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          cursor: pointer;
          margin-top: -4px;
          transition: transform 0.1s;
          appearance: none;
        }
        input[type="range"]::-webkit-slider-thumb:hover {
          transform: scale(1.2);
        }
        .perspective-container {
          perspective: 2000px;
        }
        .gutter-fold {
          background: linear-gradient(
            to right,
            rgba(0, 0, 0, 0.05) 0%,
            rgba(0, 0, 0, 0.5) 40%,
            rgba(0, 0, 0, 0.85) 50%,
            rgba(0, 0, 0, 0.5) 60%,
            rgba(0, 0, 0, 0.05) 100%
          );
        }
        @keyframes pageTurnRightToLeft {
          0% {
            transform: rotateY(0deg);
            z-index: 50;
            box-shadow: 0 0 15px rgba(0,0,0,0.5);
          }
          100% {
            transform: rotateY(-180deg);
            z-index: 50;
            box-shadow: -15px 0 30px rgba(0,0,0,0.7);
          }
        }
        @keyframes pageTurnLeftToRight {
          0% {
            transform: rotateY(-180deg);
            z-index: 50;
            box-shadow: -15px 0 30px rgba(0,0,0,0.7);
          }
          100% {
            transform: rotateY(0deg);
            z-index: 50;
            box-shadow: 0 0 15px rgba(0,0,0,0.5);
          }
        }
        .animate-flip-next {
          animation: pageTurnRightToLeft 0.4s cubic-bezier(0.25, 1, 0.5, 1) forwards;
          transform-origin: left center;
        }
        .animate-flip-prev {
          animation: pageTurnLeftToRight 0.4s cubic-bezier(0.25, 1, 0.5, 1) forwards;
          transform-origin: right center;
        }
        .custom-reader-scrollbar::-webkit-scrollbar {
          width: 3px;
        }
        .custom-reader-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-reader-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(201, 168, 76, 0.15);
          border-radius: 2px;
        }
        .custom-reader-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(201, 168, 76, 0.35);
        }
      `}</style>

      {/* HEADER PROTOCOL BAR */}
      <header className="h-16 flex-shrink-0 bg-void/90 backdrop-blur-md border-b border-obsidian/85 z-40 px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/billing"
            className="p-2 border border-obsidian rounded-sm hover:border-gold/30 hover:text-gold transition-colors text-ash"
            title="Mağazaya Dön"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-[10px] sm:text-xs tracking-[0.2em] font-accent uppercase text-gold font-bold truncate max-w-[180px] min-[360px]:max-w-none">
              MENTİS E-OKUYUCU
            </h1>
            <p className="text-[9px] text-ash font-serif italic uppercase tracking-wider hidden md:block">
              {bookType === "secret" ? "Vaka Otopsisi & Taktik Raporlar" : "Gücün Sessiz Mimarisi"}
            </p>
          </div>
        </div>

        {/* CONTROLS */}
        <div className="flex items-center gap-3">
          {/* Font size range slider input */}
          <div className="hidden sm:flex items-center gap-2 border border-obsidian/90 rounded-sm bg-void/50 px-2.5 py-1">
            <ZoomOut className="w-3.5 h-3.5 text-ash/50" />
            <input
              type="range"
              min="12"
              max="18"
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="w-16 sm:w-24 accent-gold cursor-pointer bg-obsidian h-1 rounded-lg appearance-none"
              title="Yazı Boyutu"
            />
            <ZoomIn className="w-3.5 h-3.5 text-ash/50" />
            <span className="text-[10px] font-accent text-ash/70 min-w-[24px] text-right">
              {fontSize}px
            </span>
          </div>

          {/* Magnifier Toggle Button */}
          <button
            onClick={() => {
              setIsMagnifierMode(!isMagnifierMode);
              setMousePos({ x: 0, y: 0, show: false });
            }}
            disabled={isLocked}
            className={`p-2 border rounded-sm transition-colors ${
              isMagnifierMode
                ? "bg-gold/10 border-gold text-gold"
                : "border-obsidian text-ash hover:text-gold hover:border-gold/20"
            } disabled:opacity-30 disabled:cursor-not-allowed`}
            title={isMagnifierMode ? "Büyüteci Kapat" : "Büyüteç Modunu Aç"}
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Toggle Sidebar (Mobile) */}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 border border-obsidian text-ash hover:text-white hover:border-gold/20 rounded-sm"
            title="İçindekiler Menüsü"
          >
            {isSidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* READING PROGRESS BAR */}
      <div className="h-[2px] w-full bg-abyss/10 relative z-40">
        <div 
          className="h-full bg-gradient-to-r from-gold to-[#D4AF37] transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* BODY VIEWPORT - FLEX EXPAND */}
      <div className="flex-1 flex min-h-0 relative">
        
        {/* SIDEBAR - TABLE OF CONTENTS */}
        <aside 
          className={`absolute lg:relative inset-y-0 left-0 bg-void border-obsidian/60 z-30 transform transition-all duration-300 ${
            isSidebarOpen 
              ? "translate-x-0 w-72 opacity-100 border-r overflow-y-auto" 
              : "-translate-x-full lg:w-0 lg:opacity-0 border-r-0 pointer-events-none overflow-hidden"
          }`}
        >
          <div className="p-6 space-y-6">
            <div className="text-xs font-accent tracking-widest text-gold font-bold border-b border-obsidian/30 pb-3 flex items-center justify-between">
              <span>İÇİNDEKİLER</span>
              <BookOpen className="w-3.5 h-3.5 text-gold" />
            </div>

            <nav className="space-y-1">
              {SECTIONS_ORDER.map((sec) => {
                const isActive = currentSection === sec.id;
                const canAccess = hasAccess || sec.isFree;
                
                return (
                  <button
                    key={sec.id}
                    onClick={() => {
                      setCurrentSection(sec.id);
                      setAnimatingSection(sec.id);
                      setCurrentPageIndex(0);
                      if (window.innerWidth < 1024) {
                        setIsSidebarOpen(false);
                      }
                    }}
                    className={`w-full text-left py-2 px-3 rounded-sm font-accent text-[11px] tracking-wider transition-all flex items-center justify-between ${
                      isActive 
                        ? "bg-gold/5 border-l-2 border-gold text-gold font-bold" 
                        : "text-ash/75 hover:bg-abyss/10 hover:text-smoke"
                    }`}
                  >
                    <span className="truncate pr-2">{sec.title}</span>
                    <div className="flex-shrink-0">
                      {isActive ? (
                        <span className="w-1.5 h-1.5 rounded-full bg-gold animate-ping" />
                      ) : !canAccess ? (
                        <Lock className="w-3 h-3 text-ash/40" />
                      ) : null}
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* MAIN READER AREA - EXPANDED TO COVER VERTICAL LIMITS */}
        <main 
          className="flex-1 bg-[#080808] p-4 md:p-6 lg:p-10 flex flex-col justify-between items-center relative overflow-hidden min-h-0"
          style={{ touchAction: "none" }}
        >
          
          {/* Ambient background glow */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gold/[0.01] rounded-full blur-[160px] pointer-events-none -z-10" />

          {/* Bookmark alert toast */}
          {showBookmarkAlert && bookmarkedSection && (
            <div className="mb-4 w-full max-w-5xl bg-abyss/90 border border-gold/30 p-2.5 rounded-sm flex items-center justify-between text-xs font-accent tracking-wide shadow-xl backdrop-blur-md z-30">
              <div className="flex items-center gap-2.5">
                <Bookmark className="w-4 h-4 text-gold fill-current" />
                <span>
                  Bu kitapta en son kalınan yer: <span className="text-gold font-bold">{SECTIONS_ORDER.find(s => s.id === bookmarkedSection)?.title}</span>
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={handleResumeBookmark}
                  className="bg-gold text-void px-3 py-1 rounded-sm font-bold uppercase tracking-wider hover:bg-[#D4AF37] transition-all text-[10px]"
                >
                  Devam Et
                </button>
                <button 
                  onClick={() => setShowBookmarkAlert(false)}
                  className="text-ash hover:text-white p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* FULL HEIGHT DOUBLE-PAGE BOOK FRAME */}
          <div className="w-full flex-1 flex flex-col justify-center min-h-0 relative">
            {loadingAccess ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-3 text-ash font-accent">
                <Loader2 className="w-6 h-6 animate-spin text-gold" />
                <span>Erişim durumu kontrol ediliyor...</span>
              </div>
            ) : isLocked ? (
              /* LOCKED SCREEN / ACCESS GATE */
              <div className="w-full h-full max-w-5xl max-h-[75vh] flex flex-col items-center justify-center text-center p-8 md:p-12 border border-gold/15 bg-abyss/45 backdrop-blur-md rounded-sm shadow-2xl overflow-hidden mx-auto">
                <div className="p-4 border border-gold/30 bg-gold/5 rounded-full mb-6 text-gold animate-pulse">
                  <Lock className="w-10 h-10" />
                </div>
                
                <h3 className="font-serif text-2xl uppercase tracking-[0.2em] text-smoke mb-4">
                  Mentis Premium Erişim Protokolü
                </h3>
                
                <p className="text-xs md:text-sm text-ash font-accent leading-relaxed max-w-md mb-8">
                  {bookType === "secret" 
                    ? "Mentis: Gizli Dosyalar - Cilt 1 kitabının bu bölümü ve kalan vaka etütleri sadece kitabı satın alan ajanlara özeldir."
                    : "Mentis: Gücün Sessiz Mimarisi kitabının bu bölümü ve kalan tüm doktrinler sadece kitabı satın alan üyelere özeldir."}
                </p>

                <div className="flex items-baseline gap-1.5 mb-8 bg-void/50 border border-obsidian/75 px-5 py-2.5 rounded-sm">
                  <span className="text-xs line-through text-ash/40 font-serif">
                    {bookType === "secret" ? "400 TRY" : "500 TRY"}
                  </span>
                  <span className="text-2xl font-serif text-white font-light">
                    {bookType === "secret" ? "249.99" : "299.99"}
                  </span>
                  <span className="text-gold font-accent text-sm">TRY</span>
                  <span className="text-[8px] text-red-400 bg-red-950/15 border border-red-900/30 px-1.5 py-0.5 rounded-sm ml-2 font-accent font-bold">
                    {bookType === "secret" ? "%38 İNDİRİM" : "%40 İNDİRİM"}
                  </span>
                </div>

                {checkoutError && (
                  <div className="mb-6 p-3 bg-red-950/20 border border-red-900/40 text-red-400 text-xs font-accent rounded-sm max-w-xs">
                    {checkoutError}
                  </div>
                )}

                <button
                  onClick={handleCheckout}
                  disabled={loadingPkg}
                  className="bg-gold text-void px-10 py-4 rounded-sm text-xs font-accent tracking-widest uppercase font-bold hover:bg-gold-dim transition-all shadow-lg hover:shadow-[0_0_30px_rgba(201,168,76,0.3)] flex items-center justify-center gap-2"
                >
                  {loadingPkg ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-inherit" /> Talebiniz İletiliyor...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" /> Kitabı Satın Al ve Kilidi Aç
                    </>
                  )}
                </button>

                <div className="mt-8 flex items-center gap-2 text-[10px] text-ash/40 font-accent uppercase tracking-widest">
                  <ShieldCheck className="w-3.5 h-3.5" /> Secure TLS 1.3 Shopier Gateway
                </div>
              </div>
            ) : loadingContent ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-3 text-ash font-accent">
                <Loader2 className="w-6 h-6 animate-spin text-gold" />
                <span>Doktrin yükleniyor...</span>
              </div>
            ) : contentError ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-3 text-red-400 font-accent">
                <span>{contentError}</span>
              </div>
            ) : (
              /* REAL 2-PAGE SPREAD - ABSOLUTELY NO SCROLLING INSIDE THE PAGES */
              <div className="perspective-container w-full h-full max-w-6xl max-h-[80vh] lg:max-h-[82vh] flex flex-col justify-center mx-auto relative select-text">
                
                {/* Book frame container */}
                <div 
                  ref={bookRef}
                  onMouseMove={handleMouseMove}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onMouseLeave={handleMouseLeave}
                  onTouchEnd={handleMouseLeave}
                  className="relative w-full h-full bg-[#0c0c0c] border border-obsidian rounded-md shadow-[0_25px_60px_rgba(0,0,0,0.85)] flex overflow-hidden"
                >
                  {renderBookPages()}

                  {/* Magnifier lens overlay */}
                  {isMagnifierMode && mousePos.show && (() => {
                    const lensWidth = 160;
                    const lensHeight = 160;
                    const offsetMobileY = isMobile ? -60 : 0;
                    
                    let lensLeft = mousePos.x - lensWidth / 2;
                    let lensTop = mousePos.y - lensHeight / 2 + offsetMobileY;
                    
                    if (bookRef.current) {
                      const w = bookRef.current.offsetWidth;
                      const h = bookRef.current.offsetHeight;
                      lensLeft = Math.max(0, Math.min(w - lensWidth, lensLeft));
                      lensTop = Math.max(0, Math.min(h - lensHeight, lensTop));
                    }
                    
                    return (
                      <div 
                        className="absolute pointer-events-none rounded-full border border-gold/60 shadow-[0_0_25px_rgba(201,168,76,0.35)] overflow-hidden bg-[#121212] z-40"
                        style={{
                          left: `${lensLeft}px`,
                          top: `${lensTop}px`,
                          width: `${lensWidth}px`,
                          height: `${lensHeight}px`,
                        }}
                      >
                        <div 
                          className="absolute origin-top-left flex"
                          style={{
                            width: bookRef.current ? `${bookRef.current.offsetWidth}px` : '100%',
                            height: bookRef.current ? `${bookRef.current.offsetHeight}px` : '100%',
                            transform: 'scale(1.6)',
                            left: `${-mousePos.x * 1.6 + 80}px`,
                            top: `${-mousePos.y * 1.6 + 80}px`,
                          }}
                        >
                          {renderBookPages()}
                        </div>
                      </div>
                    );
                  })()}

                  {/* 3D FLIPPING PAGE SHEET OVERLAY */}
                  {flipDirection === "next" && (
                    <div className="absolute right-0 top-0 w-full lg:w-1/2 h-full bg-[#111111] z-30 p-6 md:p-8 lg:p-10 lg:border-l lg:border-black/40 shadow-2xl animate-flip-next flex flex-col justify-between overflow-hidden">
                      <div className="opacity-40 pointer-events-none">
                        <div className="flex items-center justify-between text-[8px] text-ash/40 font-accent tracking-widest uppercase border-b border-obsidian/30 pb-2 mb-6">
                          <span>Sayfa Çevriliyor...</span>
                        </div>
                        <div className="space-y-4 text-ash/90 font-serif leading-relaxed text-justify" style={{ fontSize: isMobile ? "15px" : `${fontSize}px` }}>
                          {nextPageParagraphs.slice(0, 2).map((p, i) => (
                            <p key={i}>{p}</p>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {flipDirection === "prev" && (
                    <div className="absolute left-0 top-0 w-full lg:w-1/2 h-full bg-[#111111] z-30 p-6 md:p-8 lg:p-10 lg:border-r lg:border-black/40 shadow-2xl animate-flip-prev flex flex-col justify-between overflow-hidden">
                      <div className="opacity-40 pointer-events-none">
                        <div className="flex items-center justify-between text-[8px] text-ash/40 font-accent tracking-widest uppercase border-b border-obsidian/30 pb-2 mb-6">
                          <span>Sayfa Çevriliyor...</span>
                        </div>
                        <div className="space-y-4 text-ash/90 font-serif leading-relaxed text-justify" style={{ fontSize: isMobile ? "15px" : `${fontSize}px` }}>
                          {prevPageParagraphs.slice(0, 2).map((p, i) => (
                            <p key={i}>{p}</p>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            )}
          </div>

          {/* PAGE TURNER BUTTONS */}
          <div className="w-full max-w-5xl h-12 flex-shrink-0 flex items-center justify-between text-[11px] font-accent tracking-widest z-10 border-t border-obsidian/45 mt-4 pt-2">
            <button
              onClick={goPrev}
              disabled={(currentIndex === 0 && (isMobile ? currentPageIndex === 0 : Math.floor(currentPageIndex / 2) === 0)) || !!flipDirection}
              className="flex items-center gap-1.5 text-ash hover:text-gold transition-colors disabled:opacity-30 disabled:cursor-not-allowed uppercase font-bold"
            >
              <ChevronLeft className="w-4 h-4" /> Önceki Sayfa
            </button>

            <span className="text-[10px] text-ash/40 font-bold uppercase">
              {isMobile ? `Sayfa ${leftPageNumber}` : `Sayfa ${leftPageNumber}-${rightPageNumber}`}
            </span>

            <button
              onClick={goNext}
              disabled={(currentIndex === SECTIONS_ORDER.length - 1 && (isMobile ? currentPageIndex === pagesList.length - 1 : Math.floor(currentPageIndex / 2) === totalSpreads - 1)) || !!flipDirection}
              className="flex items-center gap-1.5 text-ash hover:text-gold transition-colors disabled:opacity-30 disabled:cursor-not-allowed uppercase font-bold"
            >
              Sonraki Sayfa <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </main>

      </div>
      
      {/* Lightbox / Sidebar Overlays */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-void/60 backdrop-blur-xs z-20 lg:hidden cursor-pointer"
        />
      )}
    </div>
  );
}
