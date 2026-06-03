import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY is not set");
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2026-05-27.dahlia",
    });
  }
  return _stripe;
}

export const PLANS = {
  pro: {
    name: "Pro Stratejist",
    price: 149,
    credits: 30,
    stripePriceId: process.env.STRIPE_PRO_PRICE_ID || "",
    features: [
      "Aylık 30 strateji danışmanlığı",
      "Geçmiş strateji arşivi",
      "Öncelikli yanıt süresi",
    ],
  },
  elite: {
    name: "Elit Oyun Kurucu",
    price: 349,
    credits: -1,
    stripePriceId: process.env.STRIPE_ELITE_PRICE_ID || "",
    features: [
      "Sınırsız strateji danışmanlığı",
      "Geçmiş strateji arşivi",
      "En yüksek öncelikli yanıt",
      "Gelişmiş analiz derinliği",
    ],
  },
} as const;
