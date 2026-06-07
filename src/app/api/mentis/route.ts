import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { consultMentis, continueMentis, continueSimulation } from "@/lib/mentis-engine";

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { problem, history, message, character, mode, transcript, targetName, target_name } = body;
    const resolvedTargetName = targetName || target_name || null;

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

      // Auto-delete unsaved (is_starred = false) consultations older than 30 days
      try {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - 30);
        await supabase
          .from("consultations")
          .delete()
          .eq("user_id", userId)
          .eq("is_starred", false)
          .lt("created_at", cutoffDate.toISOString());
      } catch (cleanErr) {
        console.error("Auto clean-up error:", cleanErr);
      }
    }

    // Process follow-up chat message (Costs 1 credit always)
    if (history && message) {
      if (hasSupabase && userId) {
        const supabase = await createClient();

        // Check credits
        const { data: credits } = await supabase
          .from("user_credits")
          .select("credits, plan, total_used")
          .eq("user_id", userId)
          .single();

        if (!credits || (credits.plan !== "elite" && credits.credits <= 0)) {
          return NextResponse.json(
            { error: "Kredilerin tükendi. Devam etmek için kredi yükle.", requiresPayment: true },
            { status: 403 }
          );
        }

        // Deduct 1 credit (atomic)
        if (credits && credits.plan !== "elite" && credits.credits > 0) {
          await supabase
            .from("user_credits")
            .update({ 
              credits: credits.credits - 1,
              total_used: (credits.total_used || 0) + 1,
              updated_at: new Date().toISOString()
            })
            .eq("user_id", userId);
        }
      }
      if (mode === "simulation") {
        const simResult = await continueSimulation(history, message, transcript || "", "mentis");
        return NextResponse.json(simResult);
      } else {
        const reply = await continueMentis(history, message, character);
        return NextResponse.json({ reply });
      }
    }

    if (!problem || problem.length < 10) {
      return NextResponse.json(
        { error: "Masadaki durumu tam olarak izah etmelisin." },
        { status: 400 }
      );
    }

    const cost = mode === "simulation" ? 15 : 1;

    if (hasSupabase && userId) {
      const supabase = await createClient();

      // Check credits
      const { data: credits } = await supabase
        .from("user_credits")
        .select("credits, plan")
        .eq("user_id", userId)
        .single();

      if (!credits || (credits.plan !== "elite" && credits.credits < cost)) {
        const errorMsg = mode === "simulation"
          ? `Kişi analizi başlatmak için en az 15 kredin olmalı. Şu anki kredin: ${credits?.credits || 0}`
          : "Kredilerin tükendi. Devam etmek için abonelik gerekli.";
        return NextResponse.json(
          { error: errorMsg, requiresPayment: true },
          { status: 403 }
        );
      }
    }

    // Call the Mentis Engine
    const resolvedCharacter = mode === "simulation" ? "mentis" : (character || "mentis");
    const strategy = await consultMentis(problem, resolvedCharacter, mode);

    // Save consultation and deduct credits
    if (hasSupabase && userId) {
      const supabase = await createClient();

      // Save to history
      const { data: inserted } = await supabase.from("consultations").insert({
        user_id: userId,
        problem,
        analysis: strategy.analysis,
        target_weakness: strategy.targetWeakness,
        execution: strategy.execution,
        character: resolvedCharacter,
        mode: mode || "standard",
        target_name: resolvedTargetName,
        chat_history: [
          { role: "user", content: problem },
          { 
            role: "model", 
            content: mode === "simulation"
              ? `**[KARAKTER PROFİLİ]**\n${strategy.analysis}\n\n**[MASADAKİ DENGE]**\n${strategy.targetWeakness}\n\n**[STRATEJİK PLAN]**\n${strategy.execution}`
              : `**[DURUM ANALİZİ]**\n${strategy.analysis}\n\n**[KARŞI TARAFIN MOTİVASYONU]**\n${strategy.targetWeakness}\n\n**[STRATEJİK HAMLE]**\n${strategy.execution}`
          }
        ]
      }).select("id").single();

      if (inserted) {
        (strategy as any).id = inserted.id;
      }

      // Deduct credits based on cost (15 for simulation target start, 1 for standard start)
      const { data: currentCredits } = await supabase
        .from("user_credits")
        .select("credits, plan, total_used")
        .eq("user_id", userId)
        .single();

      if (currentCredits && currentCredits.plan !== "elite" && currentCredits.credits >= cost) {
        await supabase
          .from("user_credits")
          .update({ 
            credits: currentCredits.credits - cost,
            total_used: (currentCredits.total_used || 0) + cost,
            updated_at: new Date().toISOString()
          })
          .eq("user_id", userId);
      }
    }

    return NextResponse.json(strategy);
  } catch (error: any) {
    console.error("API Error:", error);
    const msg = error?.message || "Sistemsel bir anomali var. Tekrar dene.";
    return NextResponse.json(
      { error: msg },
      { status: 500 }
    );
  }
}
