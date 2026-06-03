import { NextResponse } from "next/server";
import { Shopier } from "shopier-api";
import { createClient } from "@supabase/supabase-js";

// We need a Service Role client to bypass RLS in the webhook
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const body: Record<string, any> = Object.fromEntries(formData.entries());

    const apiKey = process.env.SHOPIER_API_KEY || "dummy_api_key";
    const apiSecret = process.env.SHOPIER_API_SECRET || "dummy_api_secret";

    const shopier = new Shopier(apiKey, apiSecret);

    let callbackResult;
    try {
      callbackResult = shopier.callback(body);
    } catch (err: any) {
      console.error("Shopier Signature Error:", err.message);
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    // signature is valid.
    if (!callbackResult) {
      return NextResponse.json({ error: "Payment not successful" }, { status: 400 });
    }
    const { order_id, payment_id } = callbackResult;

    // We encoded user.id and packageId into order_id (buyer_id_nr)
    // format: userId__packageId
    const parts = String(order_id).split("__");
    if (parts.length !== 2) {
      console.error("Invalid custom order format:", order_id);
      return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });
    }

    const [userId, packageId] = parts;

    // Determine how many credits to give
    let creditsToAdd = 0;
    let amount = 0;
    if (packageId === "pkg_100") {
      creditsToAdd = 100;
      amount = 200;
    } else if (packageId === "pkg_500") {
      creditsToAdd = 500;
      amount = 800;
    } else if (packageId === "pkg_1000") {
      creditsToAdd = 1000;
      amount = 1400;
    } else {
      console.error("Unknown packageId:", packageId);
      return NextResponse.json({ error: "Unknown package" }, { status: 400 });
    }

    // 1. Check if this payment_id already exists in `transactions` to prevent double counting
    const { data: existingTx } = await supabase
      .from("transactions")
      .select("id")
      .eq("payment_id", String(payment_id))
      .single();

    if (existingTx) {
      // Already processed
      return NextResponse.json({ success: true, message: "Already processed" });
    }

    // 2. Add transaction record
    const { error: txError } = await supabase.from("transactions").insert({
      user_id: userId,
      amount: amount,
      credits_added: creditsToAdd,
      payment_id: String(payment_id),
      status: "success",
    });

    if (txError) {
      console.error("DB Error inserting transaction:", txError);
      return NextResponse.json({ error: "DB Error" }, { status: 500 });
    }

    // 3. Update user's credits
    // First, fetch current credits
    const { data: currentCredits, error: fetchError } = await supabase
      .from("user_credits")
      .select("credits")
      .eq("user_id", userId)
      .single();

    if (fetchError) {
      console.error("Error fetching credits:", fetchError);
      // Wait, what if they don't have a record yet? They should, due to the handle_new_user trigger.
    }

    const newBalance = (currentCredits?.credits || 0) + creditsToAdd;

    const { error: updateError } = await supabase
      .from("user_credits")
      .update({ credits: newBalance, updated_at: new Date().toISOString() })
      .eq("user_id", userId);

    if (updateError) {
      console.error("Error updating credits:", updateError);
      return NextResponse.json({ error: "DB Error" }, { status: 500 });
    }

    console.log(`Successfully added ${creditsToAdd} credits to user ${userId}`);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Webhook processing error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
