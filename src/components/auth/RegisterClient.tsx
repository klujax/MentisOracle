"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";
import { Shield, Terminal } from "lucide-react";

export default function RegisterClient() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [transitionState, setTransitionState] = useState<"idle" | "authenticating" | "approved">("idle");
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const phone = formData.get("phone") as string;
    
    // Sanitize phone number: strip non-digits
    let sanitizedPhone = phone.replace(/\D/g, "");
    if (sanitizedPhone.startsWith("90") && sanitizedPhone.length === 12) {
      sanitizedPhone = sanitizedPhone.substring(2);
    }
    if (sanitizedPhone.startsWith("0") && sanitizedPhone.length === 11) {
      sanitizedPhone = sanitizedPhone.substring(1);
    }

    // Validation: must start with 5 and be exactly 10 digits
    if (!/^[5]\d{9}$/.test(sanitizedPhone)) {
      setError("Lütfen geçerli bir cep telefonu numarası girin (örn: 5551234567).");
      setLoading(false);
      return;
    }

    setUserEmail(email);
    setTransitionState("authenticating");

    const supabase = createClient();
    
    // Check if phone number is already registered in user_credits
    try {
      const { data: phoneExists, error: phoneCheckError } = await supabase.rpc("check_phone_exists", {
        phone_num: sanitizedPhone
      });

      if (phoneCheckError) {
        console.error("Phone check error:", phoneCheckError);
        setError("Telefon numarası doğrulanırken bir hata oluştu. Lütfen tekrar deneyin.");
        setLoading(false);
        setTransitionState("idle");
        return;
      }

      if (phoneExists) {
        setError("Bu telefon numarası zaten kayıtlı ve kullanımda.");
        setLoading(false);
        setTransitionState("idle");
        return;
      }
    } catch (err) {
      console.error("RPC check error:", err);
      // Fail-safe: if RPC fails (e.g. migration not applied yet), log but continue or block depending on requirement.
      // Let's block to enforce uniqueness.
      setError("Sunucu bağlantı hatası. Lütfen daha sonra tekrar deneyin.");
      setLoading(false);
      setTransitionState("idle");
      return;
    }

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          phone: sanitizedPhone
        }
      }
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      setTransitionState("idle");
      return;
    }

    // Check if the user already exists (identities will be empty due to Supabase enumeration protection)
    const isExistingUser = data.user && data.user.identities && data.user.identities.length === 0;
    if (isExistingUser) {
      setError("Bu e-posta adresi zaten kayıtlı ve kullanımda.");
      setLoading(false);
      setTransitionState("idle");
      return;
    }

    // If email confirmation is required, try auto-login immediately
    if (data.user && !data.session) {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError("Kayıt başarılı! E-posta doğrulaması gerekiyor olabilir. Giriş sayfasından dene.");
        setLoading(false);
        setTransitionState("idle");
        return;
      }
    }

    // Show premium success transition before redirect
    setTransitionState("approved");
    setTimeout(() => {
      window.location.href = "/dashboard";
    }, 2200);
  };

  return (
    <>
      {/* Premium transition overlay */}
      {transitionState !== "idle" && (
        <div className="fixed inset-0 z-[100] bg-void flex flex-col items-center justify-center transition-all duration-500 animate-fade-in">
          {/* Cybernetic Scanner Graphic */}
          <div className="relative w-32 h-32 mb-8 flex items-center justify-center">
            {/* Ambient gold glow */}
            <div className="absolute w-28 h-28 bg-gold/5 rounded-full blur-3xl pointer-events-none" />
            
            {/* Tech Rings */}
            <div className="absolute inset-0 rounded-full border border-dashed border-gold/25 animate-[spin_15s_linear_infinite]" />
            <div className="absolute inset-3 rounded-full border border-gold/15 border-t-gold/50 animate-[spin_4s_linear_infinite_reverse]" />
            <div className="absolute inset-6 rounded-full border border-dashed border-gold/10" />
            
            {/* Core Icon */}
            <div className="absolute inset-8 rounded-full bg-abyss border border-gold/30 flex items-center justify-center shadow-[0_0_20px_rgba(201,168,76,0.1)]">
              {transitionState === "authenticating" ? (
                <Terminal className="w-5 h-5 text-gold/60 animate-pulse" />
              ) : (
                <Shield className="w-5 h-5 text-gold animate-[bounce_1s_infinite]" />
              )}
            </div>
          </div>
          
          {/* Status Text Console */}
          <div className="flex flex-col items-center text-center space-y-4 max-w-sm px-6">
            <div className="space-y-1">
              <span className="text-[10px] tracking-[0.3em] font-bold text-gold/50 uppercase font-mono">
                {transitionState === "authenticating" ? "BAĞLANTI TALEBİ" : "ERİŞİM İZNİ VERİLDİ"}
              </span>
              <h3 className="font-serif text-xl md:text-2xl text-smoke tracking-wider">
                {transitionState === "authenticating" ? "Talep Gönderiliyor..." : "Hoş Geldin, Yeni Ajan"}
              </h3>
            </div>

            {/* Personalized Info */}
            <div className="flex flex-col items-center space-y-2">
              <p className="font-mono text-xs text-ash/80 bg-abyss border border-obsidian px-3 py-1 rounded-sm">
                ID: <span className="text-smoke font-semibold">{userEmail ? userEmail.split("@")[0] : "misafir"}</span>
              </p>
              
              {transitionState === "authenticating" ? (
                <p className="font-accent text-sm text-ash/60 italic animate-pulse">
                  Yeni kimlik kaydı karargah sunucularına iletiliyor...
                </p>
              ) : (
                <p className="font-accent text-sm text-gold/80 italic animate-fade-in">
                  Erişim kanalı başarıyla kuruldu. Karargaha yönlendiriliyorsunuz.
                </p>
              )}
            </div>

            {/* Glowing progress line */}
            <div className="w-48 h-[1px] bg-obsidian relative overflow-hidden rounded-full">
              <div 
                className={`absolute top-0 h-full bg-gradient-to-r from-transparent via-gold to-transparent ${
                  transitionState === "authenticating" 
                    ? "w-24 animate-shimmer" 
                    : "w-full bg-gold transition-all duration-1000"
                }`} 
                style={{
                  left: transitionState === "authenticating" ? undefined : "0px",
                }}
              />
            </div>
          </div>
        </div>
      )}

      <main className="min-h-screen flex items-center justify-center bg-void p-4">
        <div className="w-full max-w-md animate-fade-in relative z-10">
          <div className="flex flex-col items-center mb-8">
            <Link href="/" className="mb-4 hover:opacity-80 transition-opacity flex flex-col items-center">
              <div className="relative w-16 h-16 rounded-sm overflow-hidden border border-gold/30 mb-3 shadow-[0_0_10px_rgba(201,168,76,0.15)]">
                <Image
                  src="/logo.png"
                  alt="Mentis Logo"
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </div>
              <h1 className="font-serif text-2xl tracking-[0.2em] text-gold uppercase text-center">
                Mentis
              </h1>
            </Link>
            <h2 className="text-xl font-medium tracking-wide text-smoke mb-2">Erişim Talebi</h2>
            <p className="text-sm text-ash font-accent italic text-center">
              Sıradanlar içeri giremez. Zihniyetini kanıtla.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 bg-abyss p-8 rounded-sm border border-obsidian/50 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
            
            {error && (
              <div className="p-3 bg-red-900/10 border border-red-900/50 text-red-500/90 text-sm font-accent italic text-center">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <Input 
                name="email"
                type="email" 
                placeholder="Geçerli bir e-posta" 
                required 
              />
              <Input 
                name="phone"
                type="tel" 
                placeholder="Telefon Numarası (örn: 5551234567)" 
                required 
              />
              <Input 
                name="password"
                type="password" 
                placeholder="••••••••" 
                required 
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Talep İletiliyor..." : "Bağlantı Kur"}
            </Button>

            <p className="text-center text-sm text-ash">
              Zaten bir yetkin var mı?{" "}
              <Link href="/login" className="text-gold hover:text-gold-dim underline underline-offset-4 decoration-gold/30 transition-colors">
                Giriş yap
              </Link>
            </p>
          </form>
        </div>
      </main>
    </>
  );
}
