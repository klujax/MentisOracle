import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import bookData from "@/../book_cache_v2.json";
import secretData from "@/../secret_cache_v1.json";

const book1 = bookData as Record<string, string>;
const book2 = secretData as Record<string, string>;

// Free sections of the books that don't require purchase
const MENTIS_FREE_SECTIONS = ["preface", "intro_1", "1.1"];
const SECRET_FREE_SECTIONS = ["preface", "intro_1", "1.1"];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const bookType = searchParams.get("book") || "mentis";
    const section = searchParams.get("section") || "preface";

    // Validate parameters
    if (bookType !== "mentis" && bookType !== "secret") {
      return NextResponse.json({ error: "Geçersiz kitap tipi." }, { status: 400 });
    }

    // Determine if section is free
    const isFree = bookType === "secret" 
      ? SECRET_FREE_SECTIONS.includes(section)
      : MENTIS_FREE_SECTIONS.includes(section);

    if (!isFree) {
      // Authenticate user server-side
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return NextResponse.json({ error: "Kimlik doğrulaması gerekli." }, { status: 401 });
      }

      // Check database ownership status
      const { data: creditsData, error: dbErr } = await supabase
        .from("user_credits")
        .select("has_book, has_secret_files")
        .eq("user_id", user.id)
        .single();

      if (dbErr || !creditsData) {
        console.error("Database user_credits check failed:", dbErr);
        return NextResponse.json({ error: "Kullanıcı hakları kontrol edilemedi." }, { status: 500 });
      }

      const hasAccess = bookType === "secret" 
        ? creditsData.has_secret_files 
        : creditsData.has_book;

      if (!hasAccess) {
        return NextResponse.json({ error: "Bu içeriğe erişmek için satın almalısınız." }, { status: 403 });
      }
    }

    // Return content
    const activeBook = bookType === "secret" ? book2 : book1;
    const textContent = activeBook[section] || "";

    if (!textContent) {
      return NextResponse.json({ error: "Bölüm içeriği bulunamadı." }, { status: 404 });
    }

    return NextResponse.json({ content: textContent });
  } catch (error: any) {
    console.error("Error fetching book content:", error);
    return NextResponse.json({ error: "Sunucu hatası oluştu." }, { status: 500 });
  }
}
