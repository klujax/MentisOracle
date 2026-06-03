"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Crown, Zap, ArrowLeft } from "lucide-react";

const plans = [
  {
    id: "free",
    name: "Gözlemci",
    price: "0",
    period: "",
    description: "Sistemi tanımak isteyenler için.",
    features: [
      "3 ücretsiz strateji kredisi",
      "Temel analiz derinliği",
      "Strateji arşivi",
    ],
    cta: "Mevcut Plan",
    disabled: true,
    highlight: false,
    icon: null,
  },
  {
    id: "pro",
    name: "Pro Stratejist",
    price: "149",
    period: "/ay",
    description: "Masada kalıcı olmak isteyenler için.",
    features: [
      "Aylık 30 strateji danışmanlığı",
      "Gelişmiş analiz derinliği",
      "Geçmiş strateji arşivi",
      "Öncelikli yanıt süresi",
    ],
    cta: "Yükselt",
    disabled: false,
    highlight: false,
    icon: Zap,
  },
  {
    id: "elite",
    name: "Elit Oyun Kurucu",
    price: "349",
    period: "/ay",
    description: "Oyunu kuranlar için.",
    features: [
      "Sınırsız strateji danışmanlığı",
      "En derin analiz katmanı",
      "Geçmiş strateji arşivi",
      "En yüksek öncelikli yanıt",
      "Özel Mentis modeli",
    ],
    cta: "Elit Ağa Katıl",
    disabled: false,
    highlight: true,
    icon: Crown,
  },
];

export default function PricingPage() {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handleSubscribe = async (planId: string) => {
    setLoadingPlan(planId);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: planId,
          priceId: planId === "pro"
            ? process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID
            : process.env.NEXT_PUBLIC_STRIPE_ELITE_PRICE_ID,
        }),
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setLoadingPlan(null);
    }
  };

  return (
    <main className="min-h-screen bg-void text-smoke">
      <div className="max-w-6xl mx-auto px-6 py-20">
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-ash hover:text-gold transition-colors text-sm font-accent uppercase tracking-wider"
          >
            <ArrowLeft className="w-4 h-4" />
            Karargaha Dön
          </Link>
        </div>

        <div className="text-center mb-16 space-y-4">
          <h1 className="font-serif text-4xl md:text-5xl tracking-wider">
            Gücün <span className="text-gold">Fiyatı</span>
          </h1>
          <p className="font-accent text-ash italic text-lg max-w-lg mx-auto">
            Piyon kalmanın bedeli, her zaman abonelikten daha ağırdır.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 md:gap-4 lg:gap-8">
          {plans.map((plan) => {
            const Icon = plan.icon;
            return (
              <div
                key={plan.id}
                className={`relative flex flex-col p-8 border transition-all duration-300 ${
                  plan.highlight
                    ? "border-gold/60 bg-abyss shadow-[0_0_40px_rgba(201,168,76,0.08)]"
                    : "border-obsidian bg-abyss/50 hover:border-obsidian/80"
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gold text-void text-xs font-bold uppercase tracking-widest px-4 py-1">
                    Tavsiye Edilen
                  </div>
                )}

                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-3">
                    {Icon && <Icon className="w-5 h-5 text-gold" />}
                    <h3 className="font-serif text-xl tracking-wide">{plan.name}</h3>
                  </div>
                  <p className="text-sm text-ash font-accent italic">{plan.description}</p>
                </div>

                <div className="mb-8">
                  <span className="font-serif text-4xl text-smoke">{plan.price}</span>
                  {plan.period && (
                    <span className="text-ash font-accent ml-1">₺{plan.period}</span>
                  )}
                  {!plan.period && plan.price === "0" && (
                    <span className="text-ash font-accent ml-2">₺</span>
                  )}
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-smoke/80">
                      <Check className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => !plan.disabled && handleSubscribe(plan.id)}
                  disabled={plan.disabled || loadingPlan === plan.id}
                  className={`w-full py-3 text-sm font-bold uppercase tracking-widest transition-all duration-300 ${
                    plan.highlight
                      ? "bg-gold text-void hover:bg-gold-dim"
                      : plan.disabled
                      ? "bg-obsidian/50 text-ash cursor-not-allowed"
                      : "border border-gold/50 text-gold hover:bg-gold/10"
                  }`}
                >
                  {loadingPlan === plan.id ? "Yönlendiriliyor..." : plan.cta}
                </button>
              </div>
            );
          })}
        </div>

        <p className="text-center text-xs text-ash/60 font-accent mt-12">
          Tüm ödemeler Stripe altyapısı ile güvenli şekilde işlenir. İstediğin zaman iptal edebilirsin.
        </p>
      </div>
    </main>
  );
}
