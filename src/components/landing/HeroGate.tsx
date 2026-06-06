"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { GoldDivider } from "./GoldDivider";
import { useEffect, useState, useRef, useCallback } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  size: number;
  life: number;
  maxLife: number;
}

export const HeroGate = () => {
  const [mounted, setMounted] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [introFade, setIntroFade] = useState(false);
  const [imageReady, setImageReady] = useState(false);
  const [introComplete, setIntroComplete] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const requestRef = useRef<number | null>(null);

  /* ─── Phase 1: Mount & pre-decode intro image ─── */
  useEffect(() => {
    setMounted(true);

    // Pre-load AND pre-decode the small logo before starting any animation.
    // This ensures zero main-thread stutter when the CSS animation kicks in.
    const img = new window.Image();
    img.src = "/logo-intro.png";
    img
      .decode()
      .then(() => {
        // Image is fully decoded in GPU memory — safe to animate instantly
        requestAnimationFrame(() => setImageReady(true));
      })
      .catch(() => {
        // Fallback: start anyway after a short delay
        setTimeout(() => setImageReady(true), 200);
      });
  }, []);

  /* ─── Phase 2: Run intro timing AFTER image is decoded ─── */
  useEffect(() => {
    if (!imageReady) return;

    // Fade out the intro overlay (slightly before animation ends for smooth overlap)
    const fadeTimer = setTimeout(() => setIntroFade(true), 1700);

    // Fully remove intro from DOM & start background layers
    const removeTimer = setTimeout(() => {
      setShowIntro(false);
      setIntroComplete(true);
    }, 2300);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, [imageReady]);

  /* ─── Phase 3: Canvas particle system (starts AFTER intro completes) ─── */
  useEffect(() => {
    if (!introComplete) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    // ResizeObserver ensures canvas internal resolution matches CSS size
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          canvas.width = Math.round(width);
          canvas.height = Math.round(height);
        }
      }
    });
    observer.observe(canvas);

    const render = () => {
      const ctx = canvas.getContext("2d");
      if (!ctx || canvas.width === 0) {
        requestRef.current = requestAnimationFrame(render);
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const particles = particlesRef.current;
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.025;
        p.life -= 1;
        p.alpha = p.life / p.maxLife;

        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = p.alpha * 0.9;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = "#C9A84C";
        ctx.shadowBlur = p.size * 2.5;
        ctx.shadowColor = "#C9A84C";
        ctx.fill();
        ctx.restore();
      }

      requestRef.current = requestAnimationFrame(render);
    };

    requestRef.current = requestAnimationFrame(render);

    return () => {
      observer.disconnect();
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [introComplete]);

  /* ─── Mouse tracking with stardust particles ─── */
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    if (!containerRef.current || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const cRect = containerRef.current.getBoundingClientRect();
    containerRef.current.style.setProperty("--mouse-x", `${e.clientX - cRect.left}px`);
    containerRef.current.style.setProperty("--mouse-y", `${e.clientY - cRect.top}px`);

    for (let i = 0; i < 2; i++) {
      particlesRef.current.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 1.6,
        vy: -Math.random() * 0.7 - 0.3,
        size: Math.random() * 1.8 + 0.8,
        maxLife: Math.random() * 45 + 30,
        life: Math.random() * 45 + 30,
        alpha: 1
      });
    }
  }, []);

  const handleMouseEnter = useCallback(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    containerRef.current?.style.setProperty("--mouse-opacity", "1");
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    containerRef.current?.style.setProperty("--mouse-opacity", "0");
  }, []);

  if (!mounted) return null;

  return (
    <main
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative flex flex-col items-center justify-center min-h-screen overflow-hidden bg-void select-none"
    >
      {/* ════════════ INTRO OVERLAY ════════════ */}
      {/* During intro: ONLY this div renders. Zero background layers = zero GPU competition */}
      {showIntro && (
        <div
          className={`fixed inset-0 z-50 bg-void flex items-center justify-center transition-opacity duration-500 ${
            introFade ? "opacity-0 pointer-events-none" : "opacity-100"
          }`}
          style={{ contain: "strict" }}
        >
          <div className="relative w-48 h-48 md:w-64 md:h-64 flex items-center justify-center">
            {/* Static glow — no filters, no animations */}
            <div className="absolute w-32 h-32 bg-gold/15 rounded-full blur-3xl pointer-events-none z-0" />

            {/* 
              KEY PERFORMANCE FIX:
              - Uses logo-sm.png (256x256, 10KB) instead of logo.png (1024x1024, 392KB)
              - scale(6) on 256px = 1536px GPU texture (was 6144px!)
              - No decoding="sync" — image pre-decoded via img.decode() above
              - Animation starts ONLY after decode completes (imageReady state)
            */}
            <img
              src="/logo-intro.png"
              alt="Mentis Intro Logo"
              className={`w-full h-full object-contain z-10 ${
                imageReady ? "intro-logo-anim" : "opacity-0"
              }`}
            />
          </div>
        </div>
      )}

      {/* ════════════ BACKGROUND LAYERS (render ONLY after intro ends) ════════════ */}
      {introComplete && (
        <>
          {/* Background grain */}
          <div
            className="absolute inset-0 opacity-[0.035] pointer-events-none mix-blend-overlay"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")"
            }}
          />

          {/* Subtle radial gradient */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(26,26,26,1)_0%,rgba(10,10,10,1)_100%)] pointer-events-none" />

          {/* Stardust particles canvas */}
          <canvas
            ref={canvasRef}
            className="absolute inset-0 pointer-events-none z-0 mix-blend-screen"
            style={{ width: "100%", height: "100%" }}
          />

          {/* Mouse spotlight glow */}
          <div
            className="absolute inset-0 pointer-events-none transition-opacity duration-300 z-0"
            style={{
              opacity: "var(--mouse-opacity, 0)",
              background: `radial-gradient(320px circle at var(--mouse-x, 0px) var(--mouse-y, 0px), rgba(201, 168, 76, 0.15) 0%, rgba(201, 168, 76, 0.04) 35%, transparent 100%)`
            }}
          />
        </>
      )}

      {/* ════════════ MAIN CONTENT ════════════ */}
      <div
        className={`z-10 flex flex-col items-center text-center max-w-2xl px-6 transition-all duration-[1200ms] ${
          introFade ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        }`}
      >
        <div className="relative w-44 h-44 md:w-56 md:h-56 mb-8 drop-shadow-[0_0_20px_rgba(201,168,76,0.25)]">
          <Image
            src="/logo.png"
            alt="Mentis Logo"
            fill
            sizes="(max-width: 768px) 176px, 224px"
            className="object-contain"
            priority
          />
        </div>

        <h1 className="font-serif text-4xl md:text-6xl tracking-[0.2em] text-gold mb-2 font-light uppercase">
          Mentis
        </h1>

        <GoldDivider className="my-6" />

        <p className="font-accent text-xl md:text-2xl text-ash italic mb-12 tracking-wide font-light max-w-md">
          &quot;Gücü ele almanın sessiz mimarisi.&quot;
        </p>

        <div className="flex flex-col sm:flex-row gap-6 w-full sm:w-auto relative z-20">
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
