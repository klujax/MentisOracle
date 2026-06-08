import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { consultMentis, continueMentis } from "@/lib/mentis-engine";

export const maxDuration = 60;

export async function POST(req: Request) {
  let creditsDeducted = false;
  let cost = 1;
  let userId: string | null = null;
  let hasSupabase = false;

  try {
    const body = await req.json();
    const { problem, history, message, character, mode, transcript, targetName, target_name } = body;
    const resolvedTargetName = targetName || target_name || null;

    // Check if Supabase is configured
    hasSupabase = !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

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
      cost = 1;
      if (hasSupabase && userId) {
        const adminSupabase = createAdminClient();
        const { data: success, error: rpcError } = await adminSupabase
          .rpc("deduct_credits", { target_user_id: userId, cost: cost });

        if (rpcError || !success) {
          return NextResponse.json(
            { error: "Kredilerin tükendi. Devam etmek için kredi yükle.", requiresPayment: true },
            { status: 403 }
          );
        }
        creditsDeducted = true;
      }

      const reply = await continueMentis(history, message, character);
      return NextResponse.json({ reply });
    }

    if (!problem || problem.length < 10) {
      return NextResponse.json(
        { error: "Masadaki durumu tam olarak izah etmelisin." },
        { status: 400 }
      );
    }

    cost = 1;

    if (hasSupabase && userId) {
      const adminSupabase = createAdminClient();
      const { data: success, error: rpcError } = await adminSupabase
        .rpc("deduct_credits", { target_user_id: userId, cost: cost });

      if (rpcError || !success) {
        const { data: credits } = await adminSupabase
          .from("user_credits")
          .select("credits")
          .eq("user_id", userId)
          .single();

        const errorMsg = "Kredilerin tükendi. Devam etmek için abonelik gerekli.";
        return NextResponse.json(
          { error: errorMsg, requiresPayment: true },
          { status: 403 }
        );
      }
      creditsDeducted = true;
    }

    // Call the Mentis Engine
    const resolvedCharacter = character || "mentis";
    const strategy = await consultMentis(problem, resolvedCharacter, "standard");

    // Save consultation
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
        mode: "standard",
        target_name: resolvedTargetName,
        chat_history: [
          { role: "user", content: problem },
          { 
            role: "model", 
            content: `01\n${strategy.analysis}\n\n**[KARŞI TARAFIN MOTİVASYONU]**\n${strategy.targetWeakness}\n\n**[STRATEJİK HAMLE]**\n${strategy.execution}`
          }
        ]
      }).select("id").single();

      if (inserted) {
        (strategy as any).id = inserted.id;
      }
    }

    return NextResponse.json(strategy);
  } catch (error: any) {
    console.error("API Error:", error);
    
    // Refund credits if they were pre-deducted but the process failed
    if (hasSupabase && userId && creditsDeducted) {
      try {
        const adminSupabase = createAdminClient();
        const { data: currentCredits } = await adminSupabase
          .from("user_credits")
          .select("credits, total_used, plan")
          .eq("user_id", userId)
          .single();

        if (currentCredits && currentCredits.plan !== "elite") {
          await adminSupabase
            .from("user_credits")
            .update({
              credits: currentCredits.credits + cost,
              total_used: Math.max(0, (currentCredits.total_used || 0) - cost),
              updated_at: new Date().toISOString()
            })
            .eq("user_id", userId);
        }
      } catch (refundErr) {
        console.error("Refund error:", refundErr);
      }
    }

    const msg = error?.message || "Sistemsel bir anomali var. Tekrar dene.";
    return NextResponse.json(
      { error: msg },
      { status: 500 }
    );
  }
}
