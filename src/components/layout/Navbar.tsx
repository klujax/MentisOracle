"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { User, History, ShoppingCart, BookOpen } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";

export const Navbar = () => {
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUserEmail(session.user.email ?? null);
      }
    });
  }, []);

  const displayName = userEmail ? userEmail.split("@")[0] : "Misafir";

  return (
    <nav className="w-full h-20 border-b border-obsidian bg-void flex items-center justify-between px-4 md:px-12 sticky top-0 z-50">
      <Link href="/dashboard" className="flex items-center gap-2 md:gap-3 hover:opacity-80 transition-opacity">
        <div className="relative w-7 h-7 md:w-8 md:h-8 rounded-sm overflow-hidden border border-gold/30 flex-shrink-0">
          <Image
            src="/logo.png"
            alt="Mentis Logo"
            fill
            sizes="(max-width: 768px) 28px, 32px"
            className="object-cover"
          />
        </div>
        <h1 className="font-serif text-lg md:text-xl tracking-[0.2em] text-gold uppercase">
          Mentis
        </h1>
      </Link>

      <div className="flex items-center gap-3 md:gap-6">
        <div className="hidden md:flex items-center gap-3 text-sm text-ash font-accent">
          <span>Kod Adı: <span className="text-smoke italic">{displayName}</span></span>
        </div>
        
        <div className="flex items-center gap-1 md:gap-2 border-l border-obsidian pl-2 md:pl-4">
          <Link 
            href="/dashboard/journal" 
            className="p-2 rounded-full text-ash hover:text-gold hover:bg-gold/10 hover:shadow-[0_0_15px_rgba(201,168,76,0.25)] transition-all duration-300 hover:scale-110 active:scale-95 flex items-center justify-center" 
            title="Strateji Defteri"
          >
            <BookOpen className="w-4.5 h-4.5 md:w-5 md:h-5" />
          </Link>
          <Link 
            href="/dashboard/history" 
            className="p-2 rounded-full text-ash hover:text-gold hover:bg-gold/10 hover:shadow-[0_0_15px_rgba(201,168,76,0.25)] transition-all duration-300 hover:scale-110 active:scale-95 flex items-center justify-center" 
            title="Geçmiş Stratejiler"
          >
            <History className="w-4.5 h-4.5 md:w-5 md:h-5" />
          </Link>
          <Link 
            href="/dashboard/billing" 
            className="p-2 rounded-full text-ash hover:text-gold hover:bg-gold/10 hover:shadow-[0_0_15px_rgba(201,168,76,0.25)] transition-all duration-300 hover:scale-110 active:scale-95 flex items-center justify-center" 
            title="Mağaza / Kredi Yükle"
          >
            <ShoppingCart className="w-4.5 h-4.5 md:w-5 md:h-5" />
          </Link>
          <Link 
            href="/dashboard/profile" 
            className="p-2 rounded-full text-ash hover:text-gold hover:bg-gold/10 hover:shadow-[0_0_15px_rgba(201,168,76,0.25)] transition-all duration-300 hover:scale-110 active:scale-95 flex items-center justify-center" 
            title="Profil"
          >
            <User className="w-4.5 h-4.5 md:w-5 md:h-5" />
          </Link>
        </div>
      </div>
    </nav>
  );
};
