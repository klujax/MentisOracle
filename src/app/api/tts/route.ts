import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import fs from "fs";
import path from "path";
import bookData from "@/../book_cache_v2.json";
import secretData from "@/../secret_cache_v1.json";

const book1 = bookData as Record<string, string>;
const book2 = secretData as Record<string, string>;

// Free sections of the books that don't require purchase check
const MENTIS_FREE_SECTIONS = ["preface", "intro_1", "1.1"];
const SECRET_FREE_SECTIONS = ["preface", "intro_1", "1.1"];

// Sentence splitter for pagination
const splitIntoSentences = (text: string): string[] => {
  const matches = text.match(/[^.!?]+[.!?]+(?:\s+|$)/g);
  if (!matches) return [text];
  return matches.map(s => s.trim());
};

// Pagination text splitter (900 character limit, matches client exactly)
const paginateSectionText = (text: string): string[][] => {
  if (!text) return [[""]];
  const paragraphs = text.split("\n\n").filter(p => p.trim().length > 0);
  const pagesList: string[][] = [];
  let currentPage: string[] = [];
  let currentPageLen = 0;
  
  const limit = 900;

  for (let pIdx = 0; pIdx < paragraphs.length; pIdx++) {
    const para = paragraphs[pIdx];
    
    if (currentPageLen + para.length <= limit) {
      currentPage.push(para);
      currentPageLen += para.length;
    } else {
      if (para.length <= limit) {
        if (currentPage.length > 0) {
          pagesList.push(currentPage);
        }
        currentPage = [para];
        currentPageLen = para.length;
      } else {
        const sentences = splitIntoSentences(para);
        let sameParagraphOnPage = false;
        
        for (const sent of sentences) {
          if (currentPageLen + sent.length > limit && currentPage.length > 0) {
            pagesList.push(currentPage);
            currentPage = [];
            currentPageLen = 0;
            sameParagraphOnPage = false;
          }
          
          if (sameParagraphOnPage && currentPage.length > 0) {
            const lastIdx = currentPage.length - 1;
            currentPage[lastIdx] = currentPage[lastIdx] + " " + sent;
          } else {
            currentPage.push(sent);
            sameParagraphOnPage = true;
          }
          currentPageLen += sent.length;
        }
      }
    }
  }
  
  if (currentPage.length > 0) {
    pagesList.push(currentPage);
  }
  return pagesList;
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const bookType = searchParams.get("book") || "mentis";
    const section = searchParams.get("section") || "preface";
    const pageIndexStr = searchParams.get("page") || "0";
    const pageIndex = parseInt(pageIndexStr, 10);

    // 1. Parameter Validation
    if (bookType !== "mentis" && bookType !== "secret") {
      return NextResponse.json({ error: "Geçersiz kitap tipi." }, { status: 400 });
    }

    if (isNaN(pageIndex) || pageIndex < 0) {
      return NextResponse.json({ error: "Geçersiz sayfa numarası." }, { status: 400 });
    }

    // 2. Access Authorization Check
    const isFree = bookType === "secret" 
      ? SECRET_FREE_SECTIONS.includes(section)
      : MENTIS_FREE_SECTIONS.includes(section);

    if (!isFree) {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return NextResponse.json({ error: "Kimlik doğrulaması gerekli." }, { status: 401 });
      }

      const { data: creditsData, error: dbErr } = await supabase
        .from("user_credits")
        .select("has_book, has_secret_files")
        .eq("user_id", user.id)
        .single();

      if (dbErr || !creditsData) {
        console.error("TTS access check failed:", dbErr);
        return NextResponse.json({ error: "Kullanıcı hakları kontrol edilemedi." }, { status: 500 });
      }

      const hasAccess = bookType === "secret" 
        ? creditsData.has_secret_files 
        : creditsData.has_book;

      if (!hasAccess) {
        return NextResponse.json({ error: "Bu içeriği dinlemek için satın almalısınız." }, { status: 403 });
      }
    }

    // 3. Extract Text Content for the specific page
    const activeBook = bookType === "secret" ? book2 : book1;
    const textContent = activeBook[section] || "";

    if (!textContent) {
      return NextResponse.json({ error: "Bölüm içeriği bulunamadı." }, { status: 404 });
    }

    const pages = paginateSectionText(textContent);
    const pageParagraphs = pages[pageIndex];

    if (!pageParagraphs || pageParagraphs.length === 0) {
      return NextResponse.json({ error: "Geçersiz sayfa indeksi." }, { status: 404 });
    }

    const textToRead = pageParagraphs.join("\n\n");

    // 4. Check Local Audio Cache
    const cacheDir = path.join(process.cwd(), "public", "audio-cache", bookType);
    const fileName = `${section}_${pageIndex}.mp3`;
    const filePath = path.join(cacheDir, fileName);

    if (fs.existsSync(filePath)) {
      // Stream file directly from local disk cache
      const fileBuffer = fs.readFileSync(filePath);
      return new Response(fileBuffer, {
        headers: {
          "Content-Type": "audio/mpeg",
          "Content-Length": fileBuffer.length.toString(),
          "Cache-Control": "public, max-age=31536000, immutable"
        }
      });
    }

    // 5. Synthesize using ElevenLabs if not cached
    const elevenLabsApiKey = process.env.ELEVENLABS_API_KEY;
    const voiceId = process.env.ELEVENLABS_VOICE_ID || "pNInz6obpgq5paNsJ7Vm"; // Defaults to Marcus multilingual voice if not set

    if (!elevenLabsApiKey) {
      console.warn("ElevenLabs API key is missing. Speech synthesis backend will return 400 to trigger browser TTS fallback.");
      return NextResponse.json({ error: "TTS API key is not configured." }, { status: 400 });
    }

    const elevenLabsUrl = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;
    const response = await fetch(elevenLabsUrl, {
      method: "POST",
      headers: {
        "xi-api-key": elevenLabsApiKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        text: textToRead,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("ElevenLabs TTS request failed:", errorText);
      return NextResponse.json({ error: "Ses sentezlenemedi." }, { status: 502 });
    }

    const audioBuffer = await response.arrayBuffer();
    const nodeBuffer = Buffer.from(audioBuffer);

    // Try to write to local cache filesystem (wrapped in try-catch to support serverless read-only filesystems safely)
    try {
      if (!fs.existsSync(cacheDir)) {
        fs.mkdirSync(cacheDir, { recursive: true });
      }
      fs.writeFileSync(filePath, nodeBuffer);
      console.log(`Successfully cached generated audio to disk: ${filePath}`);
    } catch (fsErr) {
      console.warn("Could not save generated audio to local cache (expected in read-only serverless hostings like Vercel):", fsErr);
    }

    // Return the generated audio stream
    return new Response(nodeBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": nodeBuffer.length.toString(),
        "Cache-Control": "public, max-age=31536000, immutable"
      }
    });

  } catch (error: any) {
    console.error("General TTS API handler error:", error);
    return NextResponse.json({ error: "Sunucu hatası oluştu." }, { status: 500 });
  }
}
