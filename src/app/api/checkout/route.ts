import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";

export async function POST(req: Request) {
  try {
    // Check if Stripe is configured
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: "Ödeme sistemi henüz aktif değil." },
        { status: 503 }
      );
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Giriş yapmalısın." }, { status: 401 });
    }

    const { priceId, plan } = await req.json();

    const origin = req.headers.get("origin") || "http://localhost:3000";

    const session = await getStripe().checkout.sessions.create({
      customer_email: user.email,
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "subscription",
      success_url: `${origin}/dashboard?payment=success&plan=${plan}`,
      cancel_url: `${origin}/pricing?payment=cancelled`,
      metadata: {
        userId: user.id,
        plan: plan,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Ödeme oturumu oluşturulamadı." },
      { status: 500 }
    );
  }
}
