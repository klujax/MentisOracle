"use client";
import { useState, useEffect } from "react";
import { Zap, Shield, Crown, Loader2, Check, Coins, Sparkles, ArrowLeft, X, ChevronLeft, ChevronRight, BookOpen } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const PACKAGES = [
  {
    id: "pkg_100",
    title: "Başlangıç Paketi",
    credits: 100,
    price: 200,
    image: "/mentis_100_credits.png",
    glowColor: "group-hover:shadow-[0_0_30px_rgba(201,168,76,0.15)]",
    features: ["100 Hızlı Analiz Kredisi", "Temel Güç Dengesi Değerlendirmesi", "Geçmiş Analizleri Saklama (1 Hafta)"],
  },
  {
    id: "pkg_500",
    title: "Uzman Paketi",
    credits: 350,
    price: 500,
    image: "/mentis_500_credits.png",
    recommended: true,
    glowColor: "shadow-[0_0_50px_rgba(201,168,76,0.15)] hover:shadow-[0_0_60px_rgba(201,168,76,0.25)]",
    features: [
      "350 Derinlikli Analiz Kredisi",
      "Öncelikli Sunucu Desteği",
      "Detaylı Karşı Taraf Motivasyon Çözümleri",
      "Sınırsız Strateji Defteri Arşivi"
    ],
  },
  {
    id: "pkg_1000",
    title: "Elit Paket",
    credits: 800,
    price: 1000,
    image: "/mentis_1000_credits.png",
    glowColor: "group-hover:shadow-[0_0_30px_rgba(201,168,76,0.15)]",
    features: [
      "800 Premium Analiz Kredisi",
      "Gücün Sessiz Mimarisi E-Kitabı (Hediye!)",
      "En Yüksek Hızda Sunucu Önceliği",
      "VIP Kriz Odası Desteği",
      "Ömür Boyu Kalıcı Geçmiş & Yedekleme"
    ],
  },
];

export default function BillingPage() {
  const [loadingPkg, setLoadingPkg] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const [book1Slide, setBook1Slide] = useState(0);
  const [hasBook, setHasBook] = useState<boolean>(false);
  const [hasSecret, setHasSecret] = useState<boolean>(false);
  const [loadingBookCheck, setLoadingBookCheck] = useState<boolean>(true);

  useEffect(() => {
    const checkBookAccess = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data, error: dbErr } = await supabase
            .from("user_credits")
            .select("has_book, has_secret_files")
            .eq("user_id", user.id)
            .single();
          if (dbErr) throw dbErr;
          if (data) {
            setHasBook(data.has_book);
            setHasSecret(data.has_secret_files);
          }
        }
      } catch (err) {
        console.error("Error checking book ownership:", err);
      } finally {
        setLoadingBookCheck(false);
      }
    };
    checkBookAccess();
  }, []);

  const handleCheckout = async (packageId: string) => {
    try {
      setLoadingPkg(packageId);
      setError("");

      const response = await fetch("/api/checkout/shopier", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageId }),
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
      setError(err.message);
      setLoadingPkg(null);
    }
  };

  return (
    <>
      <div className="min-h-[calc(100vh-5rem)] bg-void p-6 md:p-12 animate-fade-in flex flex-col items-center relative overflow-hidden">
      
      {/* Background ambient glows */}
      <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-gold/5 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-1/3 right-1/4 w-[350px] h-[350px] bg-purple-900/5 rounded-full blur-[100px] pointer-events-none -z-10" />

      {/* Back to Karargah link */}
      <div className="w-full max-w-5xl mb-8 flex justify-start">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-ash hover:text-gold transition-colors text-xs font-accent uppercase tracking-widest"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Karargaha Dön
        </Link>
      </div>

      <div className="text-center mb-16 space-y-4 max-w-2xl">
        <div className="text-xs md:text-sm tracking-[0.35em] text-gold font-bold uppercase font-accent">
          STRATEJİK KREDİ YÜKLEME PROTOKOLÜ
        </div>
        <h1 className="font-serif text-4xl md:text-5xl text-smoke uppercase tracking-[0.2em] font-light">
          MENTIS <span className="text-gold font-normal">MAĞAZA</span>
        </h1>
        <p className="font-accent text-ash italic md:text-lg max-w-lg mx-auto">
          Güvenli Shopier altyapısı ile saniyeler içinde kredi takviyesi yapın, masada asla kozsuz kalmayın.
        </p>
      </div>

      {error && (
        <div className="mb-8 p-4 bg-red-900/10 border border-red-900/50 text-red-400 font-accent italic text-sm rounded-sm w-full max-w-md text-center shadow-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl relative z-10">
        {PACKAGES.map((pkg) => {
          return (
            <div
              key={pkg.id}
              className={`group relative bg-abyss/40 backdrop-blur-md border rounded-sm p-6 flex flex-col transition-all duration-500 ${
                pkg.recommended
                  ? "border-gold/50 md:-translate-y-4 shadow-[0_0_40px_rgba(201,168,76,0.1)]"
                  : "border-obsidian/75 hover:border-obsidian-80"
              } ${pkg.glowColor}`}
            >
              {pkg.recommended && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-gold to-[#D4AF37] text-void text-[9px] font-bold font-accent px-4 py-1.5 uppercase tracking-widest rounded-sm shadow-lg flex items-center gap-1.5 z-20">
                  En Popüler Seçim
                </div>
              )}

              {/* Package Cover Image Mockup */}
              <div 
                className="w-full mb-6 border border-obsidian bg-void relative rounded-sm overflow-hidden shadow-xl"
              >
                <img 
                  src={pkg.image} 
                  alt={pkg.title}
                  className="w-full h-auto object-contain block transition-transform duration-700"
                />
              </div>
              
              <div className="mb-6 flex justify-between items-baseline">
                <h3 className="font-serif text-xl text-smoke tracking-wider font-medium">{pkg.title}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-serif text-white font-light tracking-wide">{pkg.price}</span>
                  <span className="text-gold font-accent text-sm ml-0.5">TRY</span>
                </div>
              </div>

              {/* Credit Badge */}
              <div className="flex items-center gap-2 px-3 py-1.5 bg-gold/5 border border-gold/15 rounded-full w-fit mb-6">
                <Coins className="w-4 h-4 text-gold" />
                <span className="text-[10px] font-bold text-gold tracking-widest font-accent">{pkg.credits} ANALİZ KREDİSİ</span>
              </div>

              {/* Divider */}
              <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-obsidian to-transparent mb-6" />

              <div className="mb-8 flex-grow">
                <ul className="space-y-4">
                  {pkg.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3 text-xs md:text-sm text-ash font-accent leading-relaxed">
                      <span className="mt-1 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-gold/60" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-auto pt-4">
                <button
                  onClick={() => handleCheckout(pkg.id)}
                  disabled={!!loadingPkg}
                  className={`w-full py-3.5 rounded-sm font-accent tracking-[0.2em] text-xs font-bold uppercase transition-all duration-500 flex items-center justify-center gap-2 ${
                    pkg.recommended
                      ? "bg-gold text-void hover:bg-[#D4AF37] hover:shadow-[0_0_25px_rgba(201,168,76,0.35)] shadow-md"
                      : "bg-void hover:bg-obsidian/40 text-smoke border border-obsidian/80 hover:border-gold/30"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {loadingPkg === pkg.id ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-inherit" /> Talebiniz İletiliyor...
                    </>
                  ) : (
                    "Protokolü Başlat"
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Custom Styles Injection for Zoom Animations */}
      <style>{`
        @keyframes scaleIn {
          from { transform: scale(0.96); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-scale-in {
          animation: scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-fade-in-fast {
          animation: fadeIn 0.2s ease-out forwards;
        }
      `}</style>

      {/* Mentis Kitabı Section */}
      <div className="w-full max-w-5xl mt-16 bg-abyss/30 border border-gold/20 p-6 md:p-8 rounded-sm relative overflow-hidden flex flex-col md:flex-row gap-8 items-center z-10">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
        
        {/* Book Cover Mockup (Slidable) */}
        <div className="w-40 md:w-44 aspect-[3/4] border border-obsidian bg-void relative rounded-sm overflow-hidden flex-shrink-0 shadow-2xl group transition-all duration-500">
          
          {/* Slide Display */}
          <div 
            onClick={() => setZoomedImage(book1Slide === 0 ? "/mentis_book_cover.png" : "/mentis_book_open.jpg")}
            className="w-full h-full cursor-zoom-in"
            title="Büyütmek için tıklayın"
          >
            <img 
              src={book1Slide === 0 ? "/mentis_book_cover.png" : "/mentis_book_open.jpg"} 
              alt="Mentis Kitabı"
              className="w-full h-full object-cover grayscale opacity-90 hover:grayscale-0 hover:opacity-100 transition-all duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-void/50 via-transparent to-transparent pointer-events-none" />
          </div>

          {/* Navigation Controls */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setBook1Slide(prev => (prev === 0 ? 1 : 0));
            }}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-void/85 border border-obsidian text-gold hover:text-white p-1 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100 shadow-lg z-20"
            title="Önceki görsel"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setBook1Slide(prev => (prev === 0 ? 1 : 0));
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-void/85 border border-obsidian text-gold hover:text-white p-1 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100 shadow-lg z-20"
            title="Sonraki görsel"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          {/* Indicators / Dots */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-20 bg-void/60 px-2 py-1 rounded-full">
            <span 
              onClick={(e) => { e.stopPropagation(); setBook1Slide(0); }}
              className={`w-1.5 h-1.5 rounded-full cursor-pointer transition-all ${book1Slide === 0 ? "bg-gold scale-125" : "bg-ash/40"}`} 
            />
            <span 
              onClick={(e) => { e.stopPropagation(); setBook1Slide(1); }}
              className={`w-1.5 h-1.5 rounded-full cursor-pointer transition-all ${book1Slide === 1 ? "bg-gold scale-125" : "bg-ash/40"}`} 
            />
          </div>
        </div>

        {/* Book Details */}
        <div className="flex-1 text-center md:text-left space-y-4">
          <span className="text-[9px] text-gold font-accent tracking-[0.25em] uppercase font-bold">
            ÖZEL DOKTRİN REHBERİ
          </span>
          <h2 className="font-serif text-2xl md:text-3xl text-smoke tracking-wider uppercase font-medium">
            Mentis: Gücün Sessiz Mimarisi
          </h2>
          <p className="text-xs md:text-sm text-ash/90 leading-relaxed font-sans">
            Müzakerelerde, iş hayatında ve ikili ilişkilerde görünmez bir oyun kurucu olmak için sessizlik ilkeleri, çerçeve kontrolü ve zihinsel savunma mekanizmalarının klinik analizi. 359 sayfalık kapsamlı dijital e-kitap.
          </p>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 pt-2">
            <div className="flex items-center gap-2.5">
              <span className="text-sm line-through text-ash/40 font-serif">500 TRY</span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-serif text-white font-light">299.99</span>
                <span className="text-gold font-accent text-sm ml-0.5">TRY</span>
              </div>
              <span className="text-[9px] text-red-400 bg-red-950/10 border border-red-900/30 px-1.5 py-0.5 rounded-sm font-accent tracking-wider font-bold">
                %40 İNDİRİM
              </span>
            </div>
            {loadingBookCheck ? (
              <button
                disabled
                className="bg-gold/50 text-void/60 px-8 py-3.5 rounded-sm text-xs font-accent tracking-widest uppercase font-bold cursor-not-allowed flex items-center gap-2"
              >
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Yükleniyor
              </button>
            ) : hasBook ? (
              <Link
                href="/dashboard/reader"
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3.5 rounded-sm text-xs font-accent tracking-widest uppercase font-bold transition-all shadow-md hover:shadow-[0_0_20px_rgba(16,185,129,0.25)] flex items-center gap-2"
              >
                <BookOpen className="w-4 h-4" /> Kitabı Çevrimiçi Oku
              </Link>
            ) : (
              <button
                onClick={() => handleCheckout("book_mentis")}
                disabled={loadingPkg === "book_mentis"}
                className="bg-gold text-void px-8 py-3.5 rounded-sm text-xs font-accent tracking-widest uppercase font-bold hover:bg-gold-dim transition-all shadow-md hover:shadow-[0_0_20px_rgba(201,168,76,0.25)] flex items-center gap-2 disabled:opacity-50"
              >
                {loadingPkg === "book_mentis" ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> İletiliyor...
                  </>
                ) : (
                  "Kitabı Satın Al"
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mentis Gizli Dosyalar Cilt 1 Section */}
      <div className="w-full max-w-5xl mt-8 bg-abyss/30 border border-gold/20 p-6 md:p-8 rounded-sm relative overflow-hidden flex flex-col md:flex-row gap-8 items-center z-10">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
        
        {/* Book Cover Mockup */}
        <div 
          onClick={() => setZoomedImage("/mentis_secret_files_vol1.jpg")}
          className="w-40 md:w-44 aspect-[3/4] border border-obsidian bg-void relative rounded-sm overflow-hidden flex-shrink-0 shadow-2xl group hover:border-gold/30 transition-all duration-500 cursor-zoom-in"
          title="Büyütmek için tıklayın"
        >
          <img 
            src="/mentis_secret_files_vol1.jpg" 
            alt="Mentis Gizli Dosyalar: Cilt 1"
            className="w-full h-full object-cover grayscale opacity-90 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-void/50 via-transparent to-transparent pointer-events-none" />
        </div>

        {/* Book Details */}
        <div className="flex-1 text-center md:text-left space-y-4">
          <span className="text-[9px] text-gold font-accent tracking-[0.25em] uppercase font-bold">
            GİZLİ VAKA DOSYALARI
          </span>
          <h2 className="font-serif text-2xl md:text-3xl text-smoke tracking-wider uppercase font-medium">
            Mentis: Gizli Dosyalar - Cilt 1
          </h2>
          <p className="text-xs md:text-sm text-ash/90 leading-relaxed font-sans">
            Gerçek hayattaki güç mücadeleleri, sosyal manipülasyonlar ve karanlık psikoloji taktiklerinin klinik otopsisi. İnsan ilişkilerinde maskelerin arkasındaki gerçek niyetleri deşifre etme rehberi. Özel dijital yayın.
          </p>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 pt-2">
            <div className="flex items-center gap-2.5">
              <span className="text-sm line-through text-ash/40 font-serif">400 TRY</span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-serif text-white font-light">249.99</span>
                <span className="text-gold font-accent text-sm ml-0.5">TRY</span>
              </div>
              <span className="text-[9px] text-red-400 bg-red-950/10 border border-red-900/30 px-1.5 py-0.5 rounded-sm font-accent tracking-wider font-bold">
                %38 İNDİRİM
              </span>
            </div>
            {loadingBookCheck ? (
              <button
                disabled
                className="bg-gold/50 text-void/60 px-8 py-3.5 rounded-sm text-xs font-accent tracking-widest uppercase font-bold cursor-not-allowed flex items-center gap-2"
              >
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Yükleniyor
              </button>
            ) : hasSecret ? (
              <Link
                href="/dashboard/reader?book=secret"
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3.5 rounded-sm text-xs font-accent tracking-widest uppercase font-bold transition-all shadow-md hover:shadow-[0_0_20px_rgba(16,185,129,0.25)] flex items-center gap-2"
              >
                <BookOpen className="w-4 h-4" /> Kitabı Çevrimiçi Oku
              </Link>
            ) : (
              <button
                onClick={() => handleCheckout("book_secret_vol1")}
                disabled={loadingPkg === "book_secret_vol1"}
                className="bg-gold text-void px-8 py-3.5 rounded-sm text-xs font-accent tracking-widest uppercase font-bold hover:bg-gold-dim transition-all shadow-md hover:shadow-[0_0_20px_rgba(201,168,76,0.25)] flex items-center gap-2 disabled:opacity-50"
              >
                {loadingPkg === "book_secret_vol1" ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> İletiliyor...
                  </>
                ) : (
                  "Kitabı Satın Al"
                )}
              </button>
            )}
          </div>
        </div>
      </div>
      
      <div className="mt-20 text-center space-y-2 border-t border-obsidian/40 pt-8 w-full max-w-md">
        <p className="text-[10px] text-ash/50 font-accent tracking-wider leading-relaxed">
          Ödemeler <span className="text-gold font-bold">Shopier</span> güvencesiyle ve TLS 1.3 şifreleme protokolüyle gerçekleşir. Kredi kartı verileriniz asla kayıt altına alınmaz.
        </p>
      </div>
    </div>

    {/* LIGHTBOX ZOOM MODAL */}
    {zoomedImage && (
      <div 
        onClick={() => setZoomedImage(null)}
        className="fixed inset-0 bg-void/96 backdrop-blur-md z-[100] flex items-center justify-center p-4 cursor-zoom-out animate-fade-in-fast"
      >
        <div className="relative max-w-2xl max-h-[90vh] w-full h-full flex items-center justify-center animate-scale-in">
          <img 
            src={zoomedImage} 
            alt="Zoomed Book Cover" 
            className="max-w-full max-h-full object-contain border border-gold/20 rounded-sm shadow-2xl bg-void"
          />

          {/* Slidable navigation inside lightbox for book 1 */}
          {(zoomedImage === "/mentis_book_cover.png" || zoomedImage === "/mentis_book_open.jpg") && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const nextImg = zoomedImage === "/mentis_book_cover.png" ? "/mentis_book_open.jpg" : "/mentis_book_cover.png";
                  setZoomedImage(nextImg);
                  setBook1Slide(prev => (prev === 0 ? 1 : 0));
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-abyss/85 border border-obsidian text-gold hover:text-white p-2.5 rounded-full transition-all duration-300 shadow-xl z-[110] cursor-pointer"
                title="Önceki"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const nextImg = zoomedImage === "/mentis_book_cover.png" ? "/mentis_book_open.jpg" : "/mentis_book_cover.png";
                  setZoomedImage(nextImg);
                  setBook1Slide(prev => (prev === 0 ? 1 : 0));
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-abyss/85 border border-obsidian text-gold hover:text-white p-2.5 rounded-full transition-all duration-300 shadow-xl z-[110] cursor-pointer"
                title="Sonraki"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          <button 
            onClick={() => setZoomedImage(null)}
            className="absolute top-4 right-4 text-smoke hover:text-gold transition-colors bg-abyss/85 border border-obsidian p-2 rounded-full shadow-lg"
            title="Kapat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    )}
  </>
);
}
