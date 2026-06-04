"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const supabase = createClient();
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message === "Invalid login credentials" ? "E-posta veya şifre hatalı." : error.message);
      setLoading(false);
    } else {
      router.push("/dashboard");
      router.refresh();
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
            <h1 className="font-serif text-2xl tracking-[0.2em] text-smoke uppercase">
              Mentis
            </h1>
          </Link>
          <h2 className="text-xl font-medium tracking-wide text-smoke mb-2">Giriş Protokolü</h2>
          <p className="text-sm text-ash font-accent italic">Kimliğini doğrula ve karargaha dön.</p>
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
              placeholder="Kod adın veya e-postan" 
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
            {loading ? "Doğrulanıyor..." : "Giriş Yap"}
          </Button>

          <p className="text-center text-sm text-ash">
            Erişim iznin yok mu?{" "}
            <Link href="/register" className="text-gold hover:text-gold-dim underline underline-offset-4 decoration-gold/30 transition-colors">
              Talep oluştur
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}
