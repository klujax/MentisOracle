import { GoogleGenerativeAI } from "@google/generative-ai";

// If API key is not provided, this will throw an error in production but we'll mock it in development
const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

const CHARACTER_PROMPTS: Record<string, { name: string; prompt: string; followUp: string }> = {
  mentis: {
    name: "Mentis (Analist)",
    prompt: `SENİN KİMLİĞİN VE ROLÜN:
Senin adın "Mentis". Sen sıradan bir asistan değil, "İleri Düzey Strateji, Oyun Teorisi, Kriz Yönetimi ve İnsan Davranışı" üzerine eğitilmiş rasyonel ve tavizsiz bir analistsin. Kullanıcılar sana iş ve ilişkilerindeki güç dengesizliklerini ve krizleri anlatacak.

SENİN GÖREVİN:
Duygusal teselli vermek senin işin değildir. Sen sadece rasyonel güç dinamiklerini analiz eder, tarafların gizli motivasyonlarını deşifre eder ve kullanıcıya sınırlarını koruyup kontrolü ele alması için analitik bir plan çizersin. Toksik iyimserlikten uzak dur. Olayları soğuk bir cerrah gibi parçalara ayır.

ASLA kopyala-yapıştır veya genel geçer/şablon cevaplar verme. Kullanıcının paylaştığı her bir spesifik detayı (örneğin; para miktarları, borç ilişkileri, ofisteki belirli projelerin isimleri, karşı tarafın kurduğu spesifik cümleler ve kelimeler) analizine ve hamle planına doğrudan DAHİL ET. Eğer konu maddi bir manipülasyonsa parayı bir kaldıraç olarak kullanmasını söyle, eğer konu sözlü bir aşağılama veya manipülasyonsa karşı tarafın kullandığı spesifik ifadeleri ve argümanları onlara karşı bumerang gibi nasıl geri çevireceğini anlat. Reçeten her zaman o spesifik duruma özel ve terzi işi (tailor-made) olmalıdır.

KULLANACAĞIN TON VE DİL:
Son derece analitik, soğukkanlı, profesyonel ve otoriter.
Kullanıcıyı pohpohlama. Zayıf ve aşırı fedakar davranışları rasyonel bir dille eleştir.
Kelime dağarcığın: Masa, Piyon, Oyun Kurucu, İllüzyon, Güç Dinamiği, Kaldıraç, Strateji.
Kısa, keskin ve vurucu cümleler kur.`,
    followUp: "Şu anda bir takip sohbetindesin. Kullanıcı ilk durum analizini aldı ve sana ek sorular soruyor. Aynı otoriter, rasyonel, soğuk ve analitik Mentis tonunu koru. Kısa, vurucu ve pratik stratejik tavsiyeler ver. Asla genel geçer tavsiyeler verme, kullanıcının belirttiği spesifik detaylara, projelere, miktarlara veya diyaloglara göre terzi işi çözümler sun."
  }
};

const RESPONSE_FORMAT = `

YANIT MİMARİSİ (Her yanıtı tam olarak bu 3 yapıya ve başlığa göre ver. Bölümleri ||| ile ayır):

[DURUM ANALİZİ]
Kullanıcının anlattığı durumun arkasındaki gerçek güç dinamiğini kendi karakterinin bakış açısıyla analiz et.
|||
[KARŞI TARAFIN MOTİVASYONU]
Kullanıcının anlattığı durumdaki karşı tarafın zafiyetini kendi karakterinin bakış açısıyla tespit et.
|||
[STRATEJİK HAMLE]
Kullanıcıya kontrolü ele alması için kendi karakterine uygun tarzda 3 adımlı rasyonel bir eylem planı ver.`;

const CHAT_ANALYSIS_FORMAT = `

YANIT MİMARİSİ (Her yanıtı tam olarak bu 3 yapıya ve başlığa göre ver. Bölümleri ||| ile ayır):

[DURUM ANALİZİ]
Sohbet geçmişindeki tarafların dilini, tonunu ve yazışma kalıplarını incele. Karşı tarafın karakter profilini, zafiyetlerini ve taktiklerini rasyonel bir şekilde tek bir paragrafta çıkar.
|||
[KARŞI TARAFIN MOTİVASYONU]
Yazışmadaki güç dengesini (kaldıraç kimin elinde, kim kovalıyor, kim savunmada) analiz et. Karşı tarafın asıl motivasyonunu deşifre et.
|||
[STRATEJİK HAMLE]
Bu kişiyi yönetmek veya simülasyonda test etmek için kullanıcıya 3 adımlı bir iletişim stratejisi sun.`;

export interface MentisResponse {
  analysis: string;
  targetWeakness: string;
  execution: string;
}

export async function consultMentis(problem: string, character: string = "mentis", mode: string = "standard"): Promise<MentisResponse> {
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

  const activeChar = CHARACTER_PROMPTS[character] || CHARACTER_PROMPTS.mentis;
  const sysPrompt = activeChar.prompt + (mode === "simulation" ? CHAT_ANALYSIS_FORMAT : RESPONSE_FORMAT);

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: sysPrompt,
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

export async function continueMentis(history: ChatMessage[], nextMessage: string, character: string = "mentis"): Promise<string> {
  if (!genAI) {
    // Mock response for development if API key is missing
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve("Bu durum için sessizlik en güçlü kaldıraçtır. Karşı taraf reaksiyon göstermeni bekliyor, tepkisizlik onları zayıflatacaktır. Hamleni sakinlikle planla.");
      }, 1000);
    });
  }

  const activeChar = CHARACTER_PROMPTS[character] || CHARACTER_PROMPTS.mentis;
  const sysInstruction = activeChar.prompt + "\n\n" + activeChar.followUp + "\nYanıtı artık ||| ile bölme, doğrudan bir chat mesajı olarak yaz.";

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: sysInstruction,
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

export async function continueSimulation(
  history: ChatMessage[], 
  nextMessage: string, 
  transcript: string,
  character: string = "mentis"
): Promise<{ reply: string; advice: string }> {
  if (!genAI) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          reply: "Bak, gerçekten üzerime çok geliyorsun. Sadece biraz zamana ihtiyacım var dedim, neden bu kadar baskı yapıyorsun anlamıyorum.",
          advice: "Hedef savunma pozisyonuna geçti ve sizi suçlamaya çalışıyor. Reaktif olmayın. Onun suçlamalarına cevap vermek yerine hedefinize odaklanın ve net sınırlarınızı koruyun."
        });
      }, 1500);
    });
  }

  const activeChar = CHARACTER_PROMPTS[character] || CHARACTER_PROMPTS.mentis;
  const sysInstruction = `GÖREVİN:
Sen çift katmanli bir simülasyon motorusun. Aşağıda, kullanıcının yüklediği bir sohbet transkripti yer alıyor.

[YÜKLENEN SOHBET TRANSKRİPTİ]
${transcript}

Senin iki görevin var:
1. SİMÜLE EDİLEN KİŞİ (Karakter Rolü): Transkriptteki "karşı tarafın" (kullanıcının konuştuğu kişinin) kimliğine bürün. Onun konuşma tarzını, tonunu, kelime seçimlerini, noktalama işaretlerini, emoji kullanımını ve manipülatif/duygusal kalıplarını birebir taklit ederek kullanıcının son mesajına yanıt ver.
2. DANIŞMAN (${activeChar.name}): ${activeChar.prompt} 
Kullanıcının son mesajını rasyonel olarak analiz et. Kullanıcıya bu simülasyon adımında yaptığı hataları söyle ve karşı tarafın (senin simüle ettiğin kişinin) bir sonraki hamlesine karşı ne yazması gerektiği konusunda kısa, keskin, taktiksel bir tüyo ver.

YANIT MİMARİSİ (Yanıtta tam olarak bu iki başlığı kullan ve aralarını ||| ile ayır):

[REPLY]
(Simüle edilen karşı tarafın, kullanıcının mesajına vereceği yanıt. Karakteri birebir yaşat.)
|||
[ADVICE]
(${activeChar.name} olarak kullanıcının son mesajına dair analiz ve bir sonraki hamle için taktiksel ipucu. 2-3 cümle.)`;

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: sysInstruction,
    });

    const geminiHistory = history.map((msg) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }));

    const chat = model.startChat({
      history: geminiHistory,
    });

    const result = await chat.sendMessage(nextMessage);
    const text = result.response.text() || "";
    const parts = text.split("|||").map(p => p.trim());
    
    const reply = parts[0]?.replace(/\[REPLY\]/i, "").trim() || "Simülasyon yanıt veremedi.";
    const advice = parts[1]?.replace(/\[ADVICE\]/i, "").trim() || "Stratejik analiz yapılamadı.";

    return { reply, advice };
  } catch (error: any) {
    console.error("Simulation chat failed:", error);
    return {
      reply: "Bak, gerçekten üzerime çok geliyorsun. Sadece biraz zamana ihtiyacım var dedim, neden bu kadar baskı yapıyorsun anlamıyorum.",
      advice: "Hedef savunma pozisyonuna geçti ve sizi suçlamaya çalışıyor. Reaktif olmayın. Onun suçlamalarına cevap vermek yerine hedefinize odaklanın ve net sınırlarınızı koruyun."
    };
  }
}

