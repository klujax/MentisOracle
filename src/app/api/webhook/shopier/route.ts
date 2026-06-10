import { NextResponse } from "next/server";
import { Shopier } from "shopier-api";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

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
    const osbUser = (process.env.SHOPIER_OSB_USER || apiKey) as string;
    const osbKey = (process.env.SHOPIER_OSB_KEY || apiSecret) as string;

    if (!apiKey || !apiSecret) {
      return new NextResponse("Shopier yapılandırması eksik.", { status: 503 });
    }

    let orderId = "";
    let paymentId = "";

    // Check if request is OSB (res and hash) or API (platform_order_id, random_nr, signature)
    const isOSB = typeof body.res === "string" && typeof body.hash === "string";

    if (isOSB) {
      const { res, hash } = body;
      // OSB Verification: HMAC-SHA256 of (res + osbUser) using osbKey, output as hex
      const calculatedHash = crypto
        .createHmac("sha256", osbKey)
        .update(res + osbUser)
        .digest("hex");

      if (hash !== calculatedHash) {
        console.error("OSB Signature mismatch. Received:", hash, "Expected:", calculatedHash);
        return new NextResponse("Invalid signature", { status: 400 });
      }

      // Decode base64 encoded OSB data
      try {
        const decoded = Buffer.from(res, "base64").toString("utf8");
        const orderData = JSON.parse(decoded);
        orderId = String(orderData.orderid || "");
        paymentId = String(orderData.orderid || ""); // Use orderid as payment_id fallback
      } catch (e: any) {
        console.error("Failed to parse OSB data:", e.message);
        return new NextResponse("success", {
          status: 200,
          headers: { "Content-Type": "text/plain" },
        });
      }
    } else {
      // API Verification
      const shopier = new Shopier(apiKey, apiSecret);
      let callbackResult;
      try {
        callbackResult = shopier.callback(body);
      } catch (err: any) {
        console.error("Shopier Signature Error:", err.message);
        return new NextResponse("Invalid signature", { status: 400 });
      }

      if (!callbackResult) {
        return new NextResponse("success", {
          status: 200,
          headers: { "Content-Type": "text/plain" },
        });
      }
      orderId = String(callbackResult.order_id);
      paymentId = String(callbackResult.payment_id);
    }

    // We encoded user.id and packageId into order_id (buyer_id_nr)
    // format: userId__packageId
    const parts = orderId.split("__");
    if (parts.length !== 2) {
      console.warn("Shopier system test or invalid order format received:", orderId);
      // Signature is verified. To make Shopier's webhook test pass, we must return "success".
      return new NextResponse("success", {
        status: 200,
        headers: { "Content-Type": "text/plain" },
      });
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
      return new NextResponse("success", {
        status: 200,
        headers: { "Content-Type": "text/plain" },
      });
    }

    const supabase = getAdminClient();

    // 1. Check if this payment_id already exists in `transactions` to prevent double counting
    const { data: existingTx } = await supabase
      .from("transactions")
      .select("id")
      .eq("payment_id", paymentId)
      .single();

    if (existingTx) {
      // Already processed
      return new NextResponse("success", {
        status: 200,
        headers: { "Content-Type": "text/plain" },
      });
    }

    // 2. Add transaction record
    const { error: txError } = await supabase.from("transactions").insert({
      user_id: userId,
      amount: amount,
      credits_added: creditsToAdd,
      payment_id: paymentId,
      status: "success",
    });

    if (txError) {
      console.error("DB Error inserting transaction:", txError);
      return new NextResponse("DB Error", { status: 500 });
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
        return new NextResponse("DB Error", { status: 500 });
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
        return new NextResponse("DB Error", { status: 500 });
      }
    }

    console.log(`Successfully added ${creditsToAdd} credits to user ${userId}`);
    return new NextResponse("success", {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  } catch (error: any) {
    console.error("Webhook processing error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
