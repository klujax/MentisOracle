import { NextResponse } from "next/server";
import { Shopier } from "shopier-api";
import { createClient } from "@supabase/supabase-js";

function getAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Supabase yapılandırması eksik.");
  }
  return createClient(supabaseUrl, supabaseServiceKey);
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const body: Record<string, any> = Object.fromEntries(formData.entries());

    const apiKey = process.env.SHOPIER_API_KEY;
    const apiSecret = process.env.SHOPIER_API_SECRET;

    if (!apiKey || !apiSecret) {
      return NextResponse.json({ error: "Shopier yapılandırması eksik." }, { status: 503 });
    }

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
    let isBookPurchase = false;

    if (packageId === "pkg_100") {
      creditsToAdd = 100;
      amount = 200;
    } else if (packageId === "pkg_500") {
      creditsToAdd = 500;
      amount = 800;
    } else if (packageId === "pkg_1000") {
      creditsToAdd = 1000;
      amount = 1400;
    } else if (packageId === "book_mentis") {
      creditsToAdd = 0;
      amount = 299.99;
      isBookPurchase = true;
    } else if (packageId === "book_secret_vol1") {
      creditsToAdd = 0;
      amount = 249.99;
      isBookPurchase = true;
    } else {
      console.error("Unknown packageId:", packageId);
      return NextResponse.json({ error: "Unknown package" }, { status: 400 });
    }

    const supabase = getAdminClient();

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

    // 3. Update user credits or book status
    if (isBookPurchase) {
      const isSecret = packageId === "book_secret_vol1";
      const { error: updateError } = await supabase
        .from("user_credits")
        .update({ 
          [isSecret ? "has_secret_files" : "has_book"]: true, 
          updated_at: new Date().toISOString() 
        })
        .eq("user_id", userId);

      if (updateError) {
        console.error("Error updating user_credits for book:", updateError);
        return NextResponse.json({ error: "DB Error" }, { status: 500 });
      }
    } else {
      const { data: currentCredits, error: fetchError } = await supabase
        .from("user_credits")
        .select("credits")
        .eq("user_id", userId)
        .single();

      if (fetchError) {
        console.error("Error fetching credits:", fetchError);
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
    }

    console.log(`Successfully added ${creditsToAdd} credits to user ${userId}`);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Webhook processing error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
