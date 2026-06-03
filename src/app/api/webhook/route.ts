import { NextResponse } from "next/server";
import { getStripe, PLANS } from "@/lib/stripe";
import { createClient as createAdminClient } from "@supabase/supabase-js";

function getAdminClient() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const stripe = getStripe();

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const userId = session.metadata?.userId;
    const plan = session.metadata?.plan as keyof typeof PLANS;

    if (userId && plan && PLANS[plan]) {
      const supabase = getAdminClient();
      const credits = PLANS[plan].credits;

      await supabase
        .from("user_credits")
        .upsert({
          user_id: userId,
          credits: credits === -1 ? 99999 : credits,
          plan: plan,
          updated_at: new Date().toISOString(),
        }, { onConflict: "user_id" });
    }
  }

  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object;
    const customerId = subscription.customer as string;
    
    const customer = await stripe.customers.retrieve(customerId);
    if (customer && !customer.deleted && customer.email) {
      const supabase = getAdminClient();
      
      const { data } = await supabase.auth.admin.listUsers();
      const user = data?.users?.find((u: { email?: string }) => u.email === customer.email);
      
      if (user) {
        await supabase
          .from("user_credits")
          .update({ plan: "free", credits: 0, updated_at: new Date().toISOString() })
          .eq("user_id", user.id);
      }
    }
  }

  return NextResponse.json({ received: true });
}
