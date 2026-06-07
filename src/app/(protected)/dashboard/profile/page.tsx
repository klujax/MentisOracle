import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { User, CreditCard, Shield, ArrowLeft } from "lucide-react";
import { LogoutButton } from "@/components/ui/LogoutButton";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const supabase = await createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();
  const user = session?.user;

  if (!user) {
    redirect("/login");
  }

  // Fetch credits
  const { data: creditsData } = await supabase
    .from("user_credits")
    .select("*")
    .eq("user_id", user.id)
    .single();

  const credits = creditsData?.credits ?? 0;
  const plan = creditsData?.plan ?? "free";
  const planDisplay = plan === "free" ? "Standart" : plan === "pro" ? "Profesyonel" : "Elit";

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-void p-6 md:p-12 animate-fade-in flex flex-col items-center justify-start">
      <div className="w-full max-w-2xl mt-10">
        {/* Back Button */}
        <div className="w-full flex justify-start mb-6">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-ash hover:text-gold transition-colors text-xs font-accent uppercase tracking-widest"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Karargaha Dön
          </Link>
        </div>
        <div className="mb-10 text-center">
          <h1 className="font-serif text-3xl text-smoke uppercase tracking-widest mb-3">
            Ajan <span className="text-gold">Profili</span>
          </h1>
          <p className="font-accent text-ash italic">Kimlik bilgileri ve yetki durumu.</p>
        </div>

        <div className="bg-abyss border border-obsidian/50 rounded-sm p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
          
          <div className="space-y-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-obsidian/30 rounded-full text-gold">
                <User className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-ash uppercase tracking-widest mb-1">Kod Adı (E-Posta)</p>
                <p className="text-smoke text-lg">{user.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="p-3 bg-obsidian/30 rounded-full text-gold">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-ash uppercase tracking-widest mb-1">Yetki Seviyesi</p>
                <p className="text-smoke text-lg">{planDisplay} Erişim</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="p-3 bg-obsidian/30 rounded-full text-gold">
                <CreditCard className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-ash uppercase tracking-widest mb-1">Kalan Danışmanlık Kredisi</p>
                <p className="text-gold text-2xl font-serif">{credits}</p>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="mt-8 w-full h-[1px] bg-gradient-to-r from-transparent via-obsidian to-transparent" />
          
          {/* Logout Button */}
          <LogoutButton />
        </div>
      </div>
    </div>
  );
}
