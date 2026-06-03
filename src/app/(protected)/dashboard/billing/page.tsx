"use client";

import { useState } from "react";
import { Zap, Shield, Crown, Loader2, Check } from "lucide-react";

const PACKAGES = [
  {
    id: "pkg_100",
    title: "Çaylak",
    credits: 100,
    price: 200,
    icon: Zap,
    color: "text-blue-400",
    features: ["Temel analiz yeteneği", "Günlük işlem kayıtları", "Standart hız"],
  },
  {
    id: "pkg_500",
    title: "Uzman",
    credits: 500,
    price: 800,
    icon: Shield,
    color: "text-gold",
    recommended: true,
    features: ["Derinlemesine strateji", "Gelişmiş risk yönetimi", "Öncelikli hız"],
  },
  {
    id: "pkg_1000",
    title: "Oracle",
    credits: 1000,
    price: 1400,
    icon: Crown,
    color: "text-purple-400",
    features: ["Sınırsız potansiyel", "VIP destek", "Işık hızında analiz"],
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

      // Shopier returns an auto-submitting HTML form
      // We write it to the document to redirect the user to Shopier
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
    <div className="min-h-[calc(100vh-5rem)] bg-void p-6 md:p-12 animate-fade-in flex flex-col items-center">
      <div className="text-center mb-12">
        <h1 className="font-serif text-3xl md:text-4xl text-smoke uppercase tracking-widest mb-3">
          Mentis <span className="text-gold">Mağaza</span>
        </h1>
        <p className="font-accent text-ash max-w-lg mx-auto">
          Güvenli altyapı (Shopier) ile anında kredi yükle. Sistem analizlerine kesintisiz devam et.
        </p>
      </div>

      {error && (
        <div className="mb-8 p-4 bg-red-900/30 border border-red-900/50 text-red-200 rounded-sm w-full max-w-md text-center">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
        {PACKAGES.map((pkg) => {
          const Icon = pkg.icon;
          return (
            <div
              key={pkg.id}
              className={`relative bg-abyss border rounded-sm p-8 flex flex-col ${
                pkg.recommended
                  ? "border-gold/50 shadow-[0_0_30px_rgba(201,168,76,0.15)] transform md:-translate-y-4"
                  : "border-obsidian/50"
              }`}
            >
              {pkg.recommended && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gold text-void text-xs font-bold px-3 py-1 uppercase tracking-wider rounded-sm">
                  Tavsiye Edilen
                </div>
              )}
              
              <div className="mb-6 flex justify-between items-start">
                <div>
                  <h3 className="font-serif text-xl text-smoke tracking-wider mb-1">{pkg.title}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-white">{pkg.price}</span>
                    <span className="text-ash text-sm">₺</span>
                  </div>
                </div>
                <div className={`p-3 bg-obsidian/40 rounded-full ${pkg.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>

              <div className="mb-8">
                <div className="text-gold font-bold text-xl mb-4">{pkg.credits} Kredi</div>
                <ul className="space-y-3">
                  {pkg.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-ash">
                      <Check className="w-4 h-4 text-gold/70" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-auto">
                <button
                  onClick={() => handleCheckout(pkg.id)}
                  disabled={!!loadingPkg}
                  className={`w-full py-3 rounded-sm font-accent tracking-widest uppercase transition-all duration-300 flex items-center justify-center gap-2 ${
                    pkg.recommended
                      ? "bg-gold text-void hover:bg-[#D4AF37] hover:shadow-[0_0_20px_rgba(201,168,76,0.3)]"
                      : "bg-obsidian text-smoke hover:bg-obsidian/80 border border-gold/20"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {loadingPkg === pkg.id ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" /> İşleniyor...
                    </>
                  ) : (
                    "Satın Al"
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-16 text-center">
        <p className="text-xs text-ash/60">
          Ödemeler <span className="font-bold">Shopier</span> güvencesiyle gerçekleşmektedir. Kredi kartı bilgileriniz sistemimizde saklanmaz.
        </p>
      </div>
    </div>
  );
}
