"use client";

import { useEffect, useState } from "react";
import { X, Smartphone, Info, Share2, MoreVertical } from "lucide-react";

export const MobilePwaBanner = () => {
  const [show, setShow] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if on mobile device
    const isMobile = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(
      navigator.userAgent
    );

    // Check if already in standalone (PWA) mode
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;

    // Check if dismissed in localStorage
    const isDismissed = localStorage.getItem("mentis_pwa_dismissed") === "true";

    if (isMobile && !isStandalone && !isDismissed) {
      setShow(true);
      // Detect iOS for specific instructions
      setIsIOS(/iPhone|iPad|iPod/i.test(navigator.userAgent));
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem("mentis_pwa_dismissed", "true");
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-96 z-50 animate-fade-in">
      <div className="bg-abyss/95 border border-gold/30 rounded-sm p-5 shadow-[0_10px_30px_rgba(201,168,76,0.15)] relative overflow-hidden backdrop-blur-md">
        {/* Glow border line */}
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
        
        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 text-ash/60 hover:text-smoke hover:bg-obsidian/40 p-1.5 rounded-full transition-colors cursor-pointer"
          aria-label="Kapat"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex gap-4">
          <div className="p-2.5 bg-gold/10 rounded-full text-gold h-fit flex-shrink-0 animate-pulse">
            <Smartphone className="w-5 h-5" />
          </div>
          <div className="text-left space-y-2 pr-6">
            <h4 className="font-serif text-sm text-smoke uppercase tracking-wider font-semibold">
              Mobil Uygulama Olarak Ekle
            </h4>
            
            {isIOS ? (
              <p className="font-accent text-xs text-ash leading-relaxed">
                Bu uygulamayı ana ekranınıza eklemek için tarayıcının altındaki{" "}
                <strong className="text-gold font-sans inline-flex items-center gap-0.5">
                  <Share2 className="w-3.5 h-3.5" /> Paylaş
                </strong>{" "}
                butonuna tıklayın ve açılan menüyü aşağı kaydırıp{" "}
                <strong className="text-smoke">Ana Ekrana Ekle</strong> seçeneğini seçin.
              </p>
            ) : (
              <p className="font-accent text-xs text-ash leading-relaxed">
                Uygulamayı telefona kurmak için tarayıcının sağ altındaki veya sağ üstündeki{" "}
                <strong className="text-gold font-sans inline-flex items-center gap-0.5">
                  <MoreVertical className="w-3.5 h-3.5" /> 3 Noktaya
                </strong>{" "}
                tıklayın, açılan listede aşağı kaydırarak{" "}
                <strong className="text-smoke">Ana Ekrana Ekle</strong> (veya <strong className="text-smoke">Uygulamayı Yükle</strong>) deyin.
              </p>
            )}
            
            <div className="flex items-center gap-1.5 text-[9px] text-gold/60 uppercase tracking-widest font-mono pt-1">
              <Info className="w-3.5 h-3.5" />
              <span>Mentis Mobil Ağı</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
