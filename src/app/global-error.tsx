'use client'

export const dynamic = "force-dynamic";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body className="bg-black text-white min-h-screen flex flex-col items-center justify-center p-4 font-sans">
        <div className="text-center max-w-md space-y-6">
          <h2 className="text-2xl font-serif text-[#C9A84C] tracking-widest uppercase">Bir Hata Oluştu</h2>
          <p className="text-sm text-gray-400 italic">Sistemsel bir anomali tespit edildi. Bağlantı kesildi.</p>
          <button
            onClick={() => reset()}
            className="inline-block bg-[#C9A84C] text-black px-6 py-2.5 text-xs font-bold uppercase tracking-widest hover:bg-[#8B7635] transition-colors rounded-sm"
          >
            Sistemi Yeniden Yükle
          </button>
        </div>
      </body>
    </html>
  )
}
