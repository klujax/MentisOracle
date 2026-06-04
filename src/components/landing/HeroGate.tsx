"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { GoldDivider } from "./GoldDivider";
import { useEffect, useState } from "react";

export const HeroGate = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <main className="relative flex flex-col items-center justify-center min-h-screen overflow-hidden bg-void">
      {/* Background grain effect placeholder (can be implemented via pseudo-element) */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay" style={{ backgroundImage: "url('https://grainy-gradients.vercel.app/noise.svg')" }}></div>
      
      {/* Subtle radial gradient to center */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(26,26,26,1)_0%,rgba(10,10,10,1)_100%)] pointer-events-none" />

      <div className="z-10 flex flex-col items-center text-center animate-fade-in max-w-2xl px-6">
        
        {/* Placeholder for Logo */}
        <div className="relative w-32 h-32 md:w-40 md:h-40 mb-8 drop-shadow-[0_0_15px_rgba(201,168,76,0.2)]">
          <Image
            src="/logo.png"
            alt="Mentis Logo"
            fill
            className="object-contain"
            priority
          />
        </div>

        <h1 className="font-serif text-4xl md:text-6xl tracking-[0.2em] text-smoke mb-2 font-light uppercase">
          Mentis
        </h1>
        
        <GoldDivider className="my-6" />

        <p className="font-accent text-xl md:text-2xl text-ash italic mb-12 tracking-wide font-light max-w-md">
          &quot;Gücü ele almanın sessiz mimarisi.&quot;
        </p>

        <div className="flex flex-col sm:flex-row gap-6 w-full sm:w-auto">
          <Link href="/login" className="w-full sm:w-auto">
            <Button variant="outline" size="lg" className="w-full tracking-widest uppercase text-xs font-bold">
              Giriş Protokolü
            </Button>
          </Link>
          <Link href="/register" className="w-full sm:w-auto">
            <Button variant="ghost" size="lg" className="w-full tracking-widest uppercase text-xs">
              Kayıt
            </Button>
          </Link>
        </div>
        
      </div>
    </main>
  );
};
