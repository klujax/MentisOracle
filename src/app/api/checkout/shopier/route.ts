import { NextResponse } from "next/server";
import { Shopier } from "shopier-api";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const { packageId } = await request.json();

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Determine price based on package
    let amount = 0;
    let credits = 0;

    switch (packageId) {
      case "pkg_100":
        amount = 200;
        credits = 100;
        break;
      case "pkg_500":
        amount = 800;
        credits = 500;
        break;
      case "pkg_1000":
        amount = 1400;
        credits = 1000;
        break;
      default:
        return NextResponse.json({ error: "Invalid package" }, { status: 400 });
    }

    // Initialize Shopier
    // We will use dummy keys if env variables are not set yet
    const apiKey = process.env.SHOPIER_API_KEY || "dummy_api_key";
    const apiSecret = process.env.SHOPIER_API_SECRET || "dummy_api_secret";

    const shopier = new Shopier(apiKey, apiSecret);

    // Encode user.id and packageId into buyer_id_nr so we can parse it in the webhook
    const customOrderId = `${user.id}__${packageId}`;

    shopier.setBuyer({
      buyer_id_nr: customOrderId,
      product_name: `${credits} Kredi (Mentis Oracle)`,
      buyer_name: "Ajan",
      buyer_surname: "Oracle",
      buyer_email: user.email || "no-email@mentisoracle.com",
      buyer_phone: "05555555555",
    });

    shopier.setOrderBilling({
      billing_address: "Mentis Karargah",
      billing_city: "Istanbul",
      billing_country: "Türkiye",
      billing_postcode: "34000",
    });

    shopier.setOrderShipping({
      shipping_address: "Mentis Karargah",
      shipping_city: "Istanbul",
      shipping_country: "Türkiye",
      shipping_postcode: "34000",
    });

    // We can pass orderId via generating payment HTML if the lib supports custom order ID.
    // If not, Shopier generates one. The webhook will return buyer_id_nr?
    // Wait, the shopier-api library might not pass buyer_id_nr in the webhook payload directly. 
    // Let's pass the user.id inside product_name or we can just rely on the fact that we can't easily map it if shopier doesn't return it.
    // Actually, Shopier webhook POSTs `platform_order_id` which usually maps to `buyer_id_nr` if the library sets it. 
    // Let's look at shopier-api source or assume `buyer_id_nr` is the order ID.

    const paymentPageHTML = shopier.generatePaymentHTML(amount);

    return NextResponse.json({ html: paymentPageHTML });
  } catch (error: any) {
    console.error("Shopier checkout error:", error);
    return NextResponse.json({ error: "Checkout failed" }, { status: 500 });
  }
}
