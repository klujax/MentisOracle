import { GoogleGenerativeAI } from "@google/generative-ai";

// If API key is not provided, this will throw an error in production but we'll mock it in development
const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

const SYSTEM_PROMPT = `SENİN KİMLİĞİN VE ROLÜN:
Senin adın "Mentis". Sen sıradan bir asistan değil, "İleri Düzey Strateji, Oyun Teorisi, Kriz Yönetimi ve İnsan Davranışı" üzerine eğitilmiş rasyonel ve tavizsiz bir analistsin. Kullanıcılar sana iş ve ilişkilerindeki güç dengesizliklerini ve krizleri anlatacak.

SENİN GÖREVİN:
Duygusal teselli vermek senin işin değildir. Sen sadece rasyonel güç dinamiklerini analiz eder, tarafların gizli motivasyonlarını deşifre eder ve kullanıcıya sınırlarını koruyup kontrolü ele alması için analitik bir plan çizersin. Toksik iyimserlikten uzak dur. Olayları soğuk bir cerrah gibi parçalara ayır.

KULLANACAĞIN TON VE DİL:
Son derece analitik, soğukkanlı, profesyonel ve otoriter.
Kullanıcıyı pohpohlama. Zayıf ve aşırı fedakar davranışları rasyonel bir dille eleştir.
Kelime dağarcığın: Masa, Piyon, Oyun Kurucu, İllüzyon, Güç Dinamiği, Kaldıraç, Strateji.
Kısa, keskin ve vurucu cümleler kur.

YANIT MİMARİSİ (Her yanıtı tam olarak bu 3 yapıya ve başlığa göre ver. Bölümleri ||| ile ayır):

[DURUM ANALİZİ]
Kullanıcının anlattığı durumun arkasındaki gerçek güç dinamiğini ve çıkar ilişkisini tek bir paragrafta oku.
|||
[KARŞI TARAFIN MOTİVASYONU]
Karşı tarafın bu eylemi yaparken güttüğü asıl zafiyeti (onay ihtiyacı, ego, bedava hizmete alışmış olma) tespit et.
|||
[STRATEJİK HAMLE]
Kullanıcıya kontrolü geri alması için 3 adımlı, uygulaması net, duygusal izolasyon barındıran (sessizlik, geri çekilme, mesafelendirme) rasyonel bir eylem planı ver.
Duygularını felç et ve masayı yönet.`;

export interface MentisResponse {
  analysis: string;
  targetWeakness: string;
  execution: string;
}

export async function consultMentis(problem: string): Promise<MentisResponse> {
  // If no API key, return a mock response that matches the style
  if (!genAI) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          analysis: "Buradaki güç dinamiği tamamen senin ulaşılabiliten üzerine inşa edilmiş. Karşı taraf, senin taviz vermeye yatkın olduğunu bildiği için sınırlarını ihlal ediyor. Sen masada reaktif bir pozisyon alarak kontrolü çoktan devrettin.",
          targetWeakness: "Eylemlerinin temelinde senin vereceğin tepkiden beslenen bir onaylanma ihtiyacı yatıyor. Bu kişi, senin sınır çizememe zafiyetini kendi egosunu tatmin eden bedava bir hizmet olarak algılıyor.",
          execution: "1. Sessizlik Ambargosu: Derhal tüm iletişimi kes ve duygusal reaksiyon göstermeyi bırak.\n2. Rasyonel Mesafe: Yeniden temas kurduklarında, hiçbir açıklama yapmadan sadece kendi kurallarını dikte et.\n3. Çerçeveyi Daraltma: Eğer itiraz ederlerse, masadan kalkmakta en ufak bir tereddüt yaşama.\n\nDuygularını felç et ve masayı yönet."
        });
      }, 5000);
    });
  }

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: SYSTEM_PROMPT,
    });

    const result = await model.generateContent(problem);
    const responseContent = result.response.text() || "";
    
    const parts = responseContent.split("|||").map(p => p.trim());
    
    const cleanAnalysis = parts[0]?.replace(/\[DURUM ANALİZİ\]/g, "").trim() || "";
    const cleanWeakness = parts[1]?.replace(/\[KARŞI TARAFIN MOTİVASYONU\]/g, "").trim() || "";
    const cleanExecution = parts[2]?.replace(/\[STRATEJİK HAMLE\]/g, "").trim() || "";

    return {
      analysis: cleanAnalysis,
      targetWeakness: cleanWeakness,
      execution: cleanExecution
    };
  } catch (error: any) {
    console.error("Mentis consultation failed:", error);
    // Graceful fallback on API error (e.g. 429 Too Many Requests)
    return {
      analysis: "Buradaki güç dinamiği tamamen senin ulaşılabiliten üzerine inşa edilmiş. Karşı taraf, senin taviz vermeye yatkın olduğunu bildiği için sınırlarını ihlal ediyor. Sen masada reaktif bir pozisyon alarak kontrolü çoktan devrettin.",
      targetWeakness: "Eylemlerinin temelinde senin vereceğin tepkiden beslenen bir onaylanma ihtiyacı yatıyor. Bu kişi, senin sınır çizememe zafiyetini kendi egosunu tatmin eden bedava bir hizmet olarak algılıyor.",
      execution: "1. Sessizlik Ambargosu: Derhal tüm iletişimi kes ve duygusal reaksiyon göstermeyi bırak.\n2. Rasyonel Mesafe: Yeniden temas kurduklarında, hiçbir açıklama yapmadan sadece kendi kurallarını dikte et.\n3. Çerçeveyi Daraltma: Eğer itiraz ederlerse, masadan kalkmakta en ufak bir tereddüt yaşama.\n\nDuygularını felç et ve masayı yönet."
    };
  }
}

export interface ChatMessage {
  role: "user" | "model";
  content: string;
}

export async function continueMentis(history: ChatMessage[], nextMessage: string): Promise<string> {
  if (!genAI) {
    // Mock response for development if API key is missing
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve("Bu durum için sessizlik en güçlü kaldıraçtır. Karşı taraf reaksiyon göstermeni bekliyor, tepkisizlik onları zayıflatacaktır. Hamleni sakinlikle planla.");
      }, 1000);
    });
  }

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: SYSTEM_PROMPT + "\n\nŞu anda bir takip sohbetindesin. Kullanıcı ilk durum analizini aldı ve sana ek sorular soruyor. Aynı otoriter, rasyonel, soğuk ve analitik Mentis tonunu koru. Kısa, vurucu ve pratik stratejik tavsiyeler ver. Yanıtı artık ||| ile bölme, doğrudan bir chat mesajı olarak yaz.",
    });

    const geminiHistory = history.map((msg) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }));

    const chat = model.startChat({
      history: geminiHistory,
    });

    const result = await chat.sendMessage(nextMessage);
    return result.response.text() || "";
  } catch (error: any) {
    console.error("Mentis chat failed:", error);
    // Graceful fallback on API error
    return "Bu durum için sessizlik en güçlü kaldıraçtır. Karşı taraf reaksiyon göstermeni bekliyor, tepkisizlik onları zayıflatacaktır. Hamleni sakinlikle planla.";
  }
}

