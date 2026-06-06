"use client";

import { useState } from "react";
import { LogOut, Terminal, Lock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export const LogoutButton = () => {
  const [transitionState, setTransitionState] = useState<"idle" | "disconnecting" | "disconnected">("idle");

  const handleLogout = async () => {
    setTransitionState("disconnecting");
    
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      
      // Show disconnected screen before redirect
      setTransitionState("disconnected");
      setTimeout(() => {
        window.location.href = "/";
      }, 2200);
    } catch (err) {
      console.error("Logout failed:", err);
      // Fallback
      window.location.href = "/";
    }
  };

  return (
    <>
      {/* Logout Transition Overlay */}
      {transitionState !== "idle" && (
        <div className="fixed inset-0 z-[100] bg-void flex flex-col items-center justify-center transition-all duration-500 animate-fade-in text-smoke">
          {/* Cybernetic Scanner Graphic (Red Theme for Disconnection) */}
          <div className="relative w-32 h-32 mb-8 flex items-center justify-center">
            {/* Ambient red glow */}
            <div className="absolute w-28 h-28 bg-red-950/20 rounded-full blur-3xl pointer-events-none" />
            
            {/* Tech Rings */}
            <div className="absolute inset-0 rounded-full border border-dashed border-red-900/25 animate-[spin_15s_linear_infinite]" />
            <div className="absolute inset-3 rounded-full border border-red-900/15 border-t-red-500/50 animate-[spin_4s_linear_infinite_reverse]" />
            <div className="absolute inset-6 rounded-full border border-dashed border-red-900/10" />
            
            {/* Core Icon */}
            <div className="absolute inset-8 rounded-full bg-abyss border border-red-900/40 flex items-center justify-center shadow-[0_0_20px_rgba(239,68,68,0.05)]">
              {transitionState === "disconnecting" ? (
                <Terminal className="w-5 h-5 text-red-500/60 animate-pulse" />
              ) : (
                <Lock className="w-5 h-5 text-red-500 animate-[bounce_1s_infinite]" />
              )}
            </div>
          </div>
          
          {/* Status Text Console */}
          <div className="flex flex-col items-center text-center space-y-4 max-w-sm px-6">
            <div className="space-y-1">
              <span className="text-[10px] tracking-[0.3em] font-bold text-red-500/50 uppercase font-mono">
                {transitionState === "disconnecting" ? "ÇIKIŞ PROTOKOLÜ" : "OTURUM KAPATILDI"}
              </span>
              <h3 className="font-serif text-xl md:text-2xl text-smoke tracking-wider">
                {transitionState === "disconnecting" ? "Bağlantı Kesiliyor..." : "Güvenli Çıkış Yapıldı"}
              </h3>
            </div>

            {/* Personalized Info */}
            <div className="flex flex-col items-center space-y-2">
              {transitionState === "disconnecting" ? (
                <p className="font-accent text-sm text-ash/60 italic animate-pulse">
                  Karargah veri erişim oturumu güvenli şekilde sonlandırılıyor...
                </p>
              ) : (
                <p className="font-accent text-sm text-red-400/80 italic animate-fade-in">
                  Erişim kanalı kapatıldı. Karargah dışı güvenli bölgeye yönlendiriliyorsunuz.
                </p>
              )}
            </div>

            {/* Glowing progress line */}
            <div className="w-48 h-[1px] bg-obsidian relative overflow-hidden rounded-full">
              <div 
                className={`absolute top-0 h-full bg-gradient-to-r from-transparent via-red-500 to-transparent ${
                  transitionState === "disconnecting" 
                    ? "w-24 animate-shimmer" 
                    : "w-full bg-red-600 transition-all duration-1000"
                }`} 
                style={{
                  left: transitionState === "disconnecting" ? undefined : "0px",
                }}
              />
            </div>
          </div>
        </div>
      )}

      <button
        onClick={handleLogout}
        className="w-full mt-8 flex items-center justify-center gap-3 px-6 py-3.5 bg-red-950/20 border border-red-900/30 text-red-400/80 hover:bg-red-950/40 hover:text-red-400 hover:border-red-900/50 transition-all duration-300 rounded-sm group cursor-pointer"
      >
        <LogOut className="w-4.5 h-4.5 group-hover:translate-x-[-2px] transition-transform duration-300" />
        <span className="text-sm uppercase tracking-widest font-medium">Oturumu Kapat</span>
      </button>
    </>
  );
};
