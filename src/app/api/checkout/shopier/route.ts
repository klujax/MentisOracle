import { NextResponse } from "next/server";
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

    let redirectUrl = "";

    switch (packageId) {
      case "pkg_100":
        redirectUrl = process.env.NEXT_PUBLIC_SHOPIER_PKG_100_URL || "https://www.shopier.com/mentis";
        break;
      case "pkg_500":
        redirectUrl = process.env.NEXT_PUBLIC_SHOPIER_PKG_500_URL || "https://www.shopier.com/mentis";
        break;
      case "pkg_1000":
        redirectUrl = process.env.NEXT_PUBLIC_SHOPIER_PKG_1000_URL || "https://www.shopier.com/mentis";
        break;
      case "book_mentis":
        redirectUrl = process.env.NEXT_PUBLIC_SHOPIER_BOOK_URL || "https://www.shopier.com/mentis/47856664";
        break;
      case "book_secret_vol1":
        redirectUrl = process.env.NEXT_PUBLIC_SHOPIER_SECRET_FILES_URL || "https://www.shopier.com/mentis/46416708";
        break;
      default:
        return NextResponse.json({ error: "Invalid package" }, { status: 400 });
    }

    // Return HTML redirect script that will be executed by document.write on frontend
    const paymentPageHTML = `<script>window.location.href = "${redirectUrl}";</script>`;

    return NextResponse.json({ html: paymentPageHTML });
  } catch (error: any) {
    console.error("Shopier checkout error:", error);
    return NextResponse.json({ error: "Checkout failed" }, { status: 500 });
  }
}
