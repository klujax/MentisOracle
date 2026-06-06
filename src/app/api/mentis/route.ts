import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { consultMentis, continueMentis } from "@/lib/mentis-engine";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { problem, history, message } = body;

    // Check if Supabase is configured
    const hasSupabase = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // Process follow-up chat message
    if (history && message) {
      if (hasSupabase) {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          return NextResponse.json(
            { error: "Kimlik doğrulaması gerekli." },
            { status: 401 }
          );
        }

        const userId = user.id;

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
      const reply = await continueMentis(history, message);
      return NextResponse.json({ reply });
    }

    if (!problem || problem.length < 10) {
      return NextResponse.json(
        { error: "Masadaki durumu tam olarak izah etmelisin." },
        { status: 400 }
      );
    }

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

      if (!credits || (credits.plan !== "elite" && credits.credits <= 0)) {
        return NextResponse.json(
          { error: "Kredilerin tükendi. Devam etmek için abonelik gerekli.", requiresPayment: true },
          { status: 403 }
        );
      }
    }

    // Call the Mentis Engine
    const strategy = await consultMentis(problem);

    // Save consultation and deduct credit
    if (hasSupabase && userId) {
      const supabase = await createClient();

      // Save to history
      const { data: inserted } = await supabase.from("consultations").insert({
        user_id: userId,
        problem,
        analysis: strategy.analysis,
        target_weakness: strategy.targetWeakness,
        execution: strategy.execution,
      }).select("id").single();

      if (inserted) {
        (strategy as any).id = inserted.id;
      }

      // Deduct 1 credit (atomic: only deduct if credits > 0)
      const { data: currentCredits } = await supabase
        .from("user_credits")
        .select("credits, plan, total_used")
        .eq("user_id", userId)
        .single();

      if (currentCredits && currentCredits.plan !== "elite" && currentCredits.credits > 0) {
        await supabase
          .from("user_credits")
          .update({ 
            credits: currentCredits.credits - 1,
            total_used: (currentCredits.total_used || 0) + 1,
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

