import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { consultOracle } from "@/lib/mentis-engine";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { problem } = body;

    if (!problem || problem.length < 10) {
      return NextResponse.json(
        { error: "Masadaki durumu tam olarak izah etmelisin." },
        { status: 400 }
      );
    }

    // Check if Supabase is configured
    const hasSupabase = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    let userId: string | null = null;

    if (hasSupabase) {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        return NextResponse.json(
          { error: "Kimlik doğrulaması gerekli." },
          { status: 401 }
        );
      }

      userId = user.id;

      // Check credits
      const { data: credits } = await supabase
        .from("user_credits")
        .select("credits, plan")
        .eq("user_id", user.id)
        .single();

      if (credits && credits.plan === "free" && credits.credits <= 0) {
        return NextResponse.json(
          { error: "Kredilerin tükendi. Devam etmek için abonelik gerekli.", requiresPayment: true },
          { status: 403 }
        );
      }
    }

    // Call the Mentis Engine
    const strategy = await consultOracle(problem);

    // Save consultation and deduct credit
    if (hasSupabase && userId) {
      const supabase = await createClient();

      // Save to history
      await supabase.from("consultations").insert({
        user_id: userId,
        problem,
        analysis: strategy.analysis,
        target_weakness: strategy.targetWeakness,
        execution: strategy.execution,
      });

      // Deduct 1 credit
      await supabase.rpc("deduct_credit", { p_user_id: userId }).maybeSingle();
      
      // If RPC doesn't exist yet, do it manually
      const { data: currentCredits } = await supabase
        .from("user_credits")
        .select("credits, total_used")
        .eq("user_id", userId)
        .single();

      if (currentCredits && currentCredits.credits > 0) {
        await supabase
          .from("user_credits")
          .update({ 
            credits: currentCredits.credits - 1,
            total_used: currentCredits.total_used + 1,
            updated_at: new Date().toISOString()
          })
          .eq("user_id", userId);
      }
    }

    return NextResponse.json(strategy);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Sistemsel bir anomali var. Tekrar dene." },
      { status: 500 }
    );
  }
}
