"use client";

export const GoldDivider = ({ className }: { className?: string }) => {
  return (
    <div className={`w-full flex justify-center items-center py-4 ${className || ""}`}>
      <div className="h-[1px] w-12 bg-gradient-to-r from-transparent via-gold to-transparent opacity-50" />
      <div className="w-1.5 h-1.5 rotate-45 bg-gold mx-2 shadow-[0_0_8px_rgba(201,168,76,0.5)]" />
      <div className="h-[1px] w-12 bg-gradient-to-r from-gold via-transparent to-transparent opacity-50" />
    </div>
  );
};
