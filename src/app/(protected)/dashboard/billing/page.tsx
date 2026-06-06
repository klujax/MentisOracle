"use client";
import { useState } from "react";
import { Zap, Shield, Crown, Loader2, Check, Coins, Sparkles, ArrowLeft } from "lucide-react";
import Link from "next/link";

const PACKAGES = [
  {
    id: "pkg_100",
    title: "Çaylak",
    credits: 100,
    price: 200,
    icon: Zap,
    color: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    glowColor: "group-hover:shadow-[0_0_30px_rgba(96,165,250,0.15)]",
    features: ["100 Hızlı Analiz Kredisi", "Temel Güç Dengesi Değerlendirmesi", "Geçmiş Analizleri Saklama (1 Hafta)"],
  },
  {
    id: "pkg_500",
    title: "Uzman",
    credits: 500,
    price: 800,
    icon: Shield,
    color: "text-gold bg-gold/10 border-gold/20",
    recommended: true,
    glowColor: "shadow-[0_0_50px_rgba(201,168,76,0.15)] hover:shadow-[0_0_60px_rgba(201,168,76,0.25)]",
    features: [
      "500 Derinlikli Analiz Kredisi",
      "Öncelikli Sunucu Desteği",
      "Detaylı Karşı Taraf Motivasyon Çözümleri",
      "Sınırsız Strateji Defteri Arşivi"
    ],
  },
  {
    id: "pkg_1000",
    title: "Elit",
    credits: 1000,
    price: 1400,
    icon: Crown,
    color: "text-purple-400 bg-purple-500/10 border-purple-500/20",
    glowColor: "group-hover:shadow-[0_0_30px_rgba(192,132,252,0.15)]",
    features: [
      "1000 Premium Analiz Kredisi",
      "En Yüksek Hızda Sunucu Önceliği",
      "VIP Kriz Odası Desteği",
      "Ömür Boyu Kalıcı Geçmiş & Yedekleme"
    ],
  },
];

export default function BillingPage() {
  const [loadingPkg, setLoadingPkg] = useState<string | null>(null);
  const [error, setError] = useState("");

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
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-gold/5 border border-gold/20 rounded-full text-[10px] tracking-[0.2em] text-gold uppercase font-accent">
          <Sparkles className="w-3.5 h-3.5 text-gold animate-pulse" /> Stratejik Kredi Yükleme Protokolü
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
          const Icon = pkg.icon;
          return (
            <div
              key={pkg.id}
              className={`group relative bg-abyss/40 backdrop-blur-md border rounded-sm p-8 flex flex-col transition-all duration-500 ${
                pkg.recommended
                  ? "border-gold/50 md:-translate-y-4 shadow-[0_0_40px_rgba(201,168,76,0.1)]"
                  : "border-obsidian/75 hover:border-obsidian-80"
              } ${pkg.glowColor}`}
            >
              {pkg.recommended && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-gold to-[#D4AF37] text-void text-[9px] font-bold font-accent px-4 py-1.5 uppercase tracking-widest rounded-sm shadow-lg flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 fill-void" /> En Popüler Seçim
                </div>
              )}
              
              <div className="mb-8 flex justify-between items-start">
                <div>
                  <h3 className="font-serif text-2xl text-smoke tracking-wider mb-2 font-medium">{pkg.title}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-serif text-white font-light tracking-wide">{pkg.price}</span>
                    <span className="text-gold font-accent text-lg ml-0.5">TRY</span>
                  </div>
                </div>
                <div className={`p-3.5 border rounded-full transition-all duration-500 group-hover:scale-110 ${pkg.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>

              {/* Credit Badge */}
              <div className="flex items-center gap-2 px-3 py-1.5 bg-gold/5 border border-gold/15 rounded-full w-fit mb-6">
                <Coins className="w-4 h-4 text-gold" />
                <span className="text-xs font-bold text-gold tracking-widest font-accent">{pkg.credits} ANALİZ KREDİSİ</span>
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
      
      <div className="mt-20 text-center space-y-2 border-t border-obsidian/40 pt-8 w-full max-w-md">
        <p className="text-[10px] text-ash/50 font-accent tracking-wider leading-relaxed">
          Ödemeler <span className="text-gold font-bold">Shopier</span> güvencesiyle ve TLS 1.3 şifreleme protokolüyle gerçekleşir. Kredi kartı verileriniz asla kayıt altına alınmaz.
        </p>
      </div>
    </div>
  );
}
