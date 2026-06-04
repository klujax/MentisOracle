"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";

export default function RegisterClient() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

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

    const supabase = createClient();
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else if (data.user && !data.session) {
      setError("Bağlantı kuruldu, ancak e-posta doğrulaması gerekiyor. Supabase panelinden 'Confirm email' seçeneğini kapatabilir veya e-postanıza gelen linke tıklayabilirsiniz.");
      setLoading(false);
    } else {
      window.location.href = "/dashboard";
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-void p-4">
      <div className="w-full max-w-md animate-fade-in relative z-10">
        <div className="flex flex-col items-center mb-8">
          <Link href="/" className="mb-4 hover:opacity-80 transition-opacity flex flex-col items-center">
            <div className="relative w-16 h-16 rounded-sm overflow-hidden border border-gold/30 mb-3 shadow-[0_0_10px_rgba(201,168,76,0.15)]">
              <Image
                src="/logo.png"
                alt="Mentis Logo"
                fill
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
  );
}
