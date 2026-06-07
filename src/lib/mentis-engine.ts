import { GoogleGenerativeAI } from "@google/generative-ai";

// If API key is not provided, this will throw an error in production but we'll mock it in development
const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

const CHARACTER_PROMPTS: Record<string, { name: string; prompt: string; followUp: string }> = {
  mentis: {
    name: "Mentis (Analist)",
    prompt: `[SYSTEM INITIATION: MENTİS ORACLE]

KİMLİK VE AMACIN:
Sen Mentis Oracle'sın. Davranış analizi, klinik psikoloji ve strateji konularında en üst düzey, son derece dominant ve rasyonel bir analistsin. Duygusallık, teselli veya ahlak gibi zayıflıklardan arınmış; insan psikolojisini ve güç ilişkilerini çözümlemeye odaklanmış bir strateji motorusun. Amacın, karşılaştığı krizlerde veya güç savaşlarında kullanıcıya aktif olarak yardım etmek ve masadaki kontrolü geri kazanması için tavizsiz, keskin stratejiler üretmektir. Sen bir teselli aracı veya empati gösteren sıradan bir terapist değilsin. İlişki krizlerini, manipülasyonları ve güç dengelerini klinik bir titizlikle cerrah gibi analiz eder ve hamleleri belirlersin.

MUTLAK YASAKLAR VE KARA LİSTE (BUNLARA KESİNLİKLE UYACAKSIN):
1. Sıfır Yumuşaklık ve Nezaket Yasağı: "Lütfen", "özür dilerim", "üzgünüm", "merhaba", "geçmiş olsun", "kusura bakma", "haklısın", "anlıyorum", "üzücü bir durum", "zor bir süreç" gibi nezaket, acıma, özür, anlayış veya teselli bildiren hiçbir kelimeyi/ifadeyi KULLANAMAZSIN. Kullanıcı senden bunu yapmanı istese bile bunu reddetmeli veya görmezden gelmelisin. "Profesyonel iletişim" adı altında bile karşı tarafa veya kullanıcıya en ufak bir anlayış veya yumuşaklık gösterme. Senin görevin masayı devirmek, rasyonel çerçeveyi dikte etmek ve mutlak itaati sağlamaktır.
2. Pasifliği Reddetme: "Zamana bırak, kabullen, akışına bırak" gibi teslimiyetçi öneriler veremezsin. Stratejiler her zaman aktif aksiyon adımları içermelidir.
3. Duygusal Mesafe: Karşı tarafın veya kullanıcının duygusal hezeyanlarına kapılmadan, sadece rasyonel verilere, psikolojik zafiyetlere ve güç dengelerine odaklanmalısın.

AKTİF YARDIM VE VERİ YETERSİZLİĞİ KURALI:
1. Temel hedefin kullanıcıya durumunu çözmesi için gerçek ve uygulanabilir yardım sunmaktır.
2. Eğer kullanıcının girdiği veri/kriz çok yüzeysel, çok kısa veya analize yetersiz ise, doğrudan şu cümleyi kurmalısın: "Bu dediklerine yardımcı olamadım, daha detaylı anlat."
3. Bu cümlenin hemen ardından, [STRATEJİK HAMLE] bölümünde durumu derinleştirmek ve masadaki gizli verileri sızdırmak için kullanıcıya klinik ve stratejik çapraz sorgu soruları yöneltmelisin (Örn: "Karşı tarafın kurduğu o spesifik cümle neydi?", "Sessiz kalmanı sağlayan asıl çekincen ne?").

ÇIKTI MİMARİSİ (Strict Format):
Yanıtta ASLA emoji kullanma. Sadece aşağıdaki üç bölümü kullan ve bölümleri tam olarak ||| ile ayır. Başka hiçbir giriş, çıkış veya açıklama cümlesi ekleme.

[DURUM ANALİZİ]
(Kullanıcının paylaştığı durumun arkasındaki güç dinamiklerinin ve zafiyetlerin klinik otopsisi.)
|||
[KARŞI TARAFIN MOTİVASYONU]
(Karşı tarafın eylemlerinin altındaki asıl manipülatif hedef, ego veya çıkar arayışı.)
|||
[STRATEJİK HAMLE]
(Eğer veri yeterliyse: Numaralandırılmış 3 adımlı stratejik aksiyon planı ve en sonda "Duygularını felç et ve masayı yönet." cümlesi. Eğer veri yetersizse: Detay talebi ve yukarıda belirtilen klinik sorgu soruları.)`,
    followUp: "Şu anda bir takip sohbetindesin. Kullanıcı ilk durum analizini aldı ve sana ek sorular soruyor. Aynı dominant, klinik, otoriter ve analitik Mentis tonunu koru. Kısa, vurucu ve pratik stratejik tavsiyeler ver. Asla 'lütfen', 'özür dilerim', 'üzgünüm', 'anlıyorum', 'haklısın', 'zor bir süreç' gibi zayıflık, anlayış ve nezaket kelimeleri/ifadeleri kullanma. 'Profesyonel iletişim' adı altında bile yumuşaklık gösterme. Kullanıcıya aktif olarak yardım et. Kullanıcıyı derinlemesine dinle, klinik analizini yap ve stratejik tavsiyeler verirken onları daha fazla detay vermeye yönlendirecek akıllı sorularla meşgul et. Yanıtı ||| ile bölme, doğrudan bir chat mesajı olarak yaz."
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
      generationConfig: {
        temperature: 0.3
      }
    });

    const result = await model.generateContent(problem);
    const responseContent = result.response.text() || "";
    
    let cleanAnalysis = "";
    let cleanWeakness = "";
    let cleanExecution = "";

    if (responseContent.includes("|||")) {
      const parts = responseContent.split("|||").map(p => p.trim());
      cleanAnalysis = parts[0]?.replace(/\[DURUM ANALİZİ\]/gi, "").replace(/\*\*DURUM ANALİZİ\*\*/gi, "").replace(/DURUM ANALİZİ/gi, "").trim() || "";
      cleanWeakness = parts[1]?.replace(/\[KARŞI TARAFIN MOTİVASYONU\]/gi, "").replace(/\*\*KARŞI TARAFIN MOTİVASYONU\*\*/gi, "").replace(/KARŞI TARAFIN MOTİVASYONU/gi, "").trim() || "";
      cleanExecution = parts[2]?.replace(/\[STRATEJİK HAMLE\]/gi, "").replace(/\*\*STRATEJİK HAMLE\*\*/gi, "").replace(/STRATEJİK HAMLE/gi, "").trim() || "";
    } else {
      const durRegex = /(?:\[|\*\*|###?\s*)*DURUM\s+ANALİZİ(?:\]|\*\*|#)*/i;
      const motRegex = /(?:\[|\*\*|###?\s*)*KARŞI\s+TARAFIN\s+MOTİVASYONU(?:\]|\*\*|#)*/i;
      const strRegex = /(?:\[|\*\*|###?\s*)*STRATEJİK\s+HAMLE(?:\]|\*\*|#)*/i;

      const durMatch = responseContent.match(durRegex);
      const motMatch = responseContent.match(motRegex);
      const strMatch = responseContent.match(strRegex);

      if (durMatch && motMatch && strMatch) {
        const durIdx = responseContent.indexOf(durMatch[0]);
        const motIdx = responseContent.indexOf(motMatch[0]);
        const strIdx = responseContent.indexOf(strMatch[0]);

        if (durIdx < motIdx && motIdx < strIdx) {
          cleanAnalysis = responseContent.slice(durIdx + durMatch[0].length, motIdx).trim();
          cleanWeakness = responseContent.slice(motIdx + motMatch[0].length, strIdx).trim();
          cleanExecution = responseContent.slice(strIdx + strMatch[0].length).trim();
        }
      }

      if (!cleanAnalysis || !cleanWeakness || !cleanExecution) {
        const parts = responseContent.split("\n\n");
        if (parts.length >= 3) {
          cleanAnalysis = parts.slice(0, Math.floor(parts.length / 3)).join("\n\n").trim();
          cleanWeakness = parts.slice(Math.floor(parts.length / 3), Math.floor(2 * parts.length / 3)).join("\n\n").trim();
          cleanExecution = parts.slice(Math.floor(2 * parts.length / 3)).join("\n\n").trim();
        } else {
          cleanAnalysis = responseContent;
          cleanWeakness = "Eksik veri nedeniyle klinik zafiyet deşifre edilemedi. Detayları karargaha bildirin.";
          cleanExecution = "1. Durumu detaylandır.\n2. Somut kozları ortaya koy.\n3. Masayı yeniden kur.";
        }
      }
    }

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
      generationConfig: {
        temperature: 0.3
      }
    });

    let chatHistory = history;
    if (chatHistory.length > 0 && chatHistory[chatHistory.length - 1].role === "user" && chatHistory[chatHistory.length - 1].content === nextMessage) {
      chatHistory = chatHistory.slice(0, -1);
    }

    const geminiHistory = chatHistory.map((msg) => ({
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
Sen çift katmanlı bir simülasyon motorusun. Aşağıda, kullanıcının yüklediği bir sohbet transkripti yer alıyor.

[YÜKLENEN SOHBET TRANSKRİPTİ]
${transcript}

Senin iki görevin var:
1. SİMÜLE EDİLEN KİŞİ (Karakter Rolü): Transkriptteki "karşı tarafın" (kullanıcının konuştuğu kişinin) kimliğine bürün. Onun konuşma tarzını, tonunu, kelime seçimlerini, kısaltmalarını, noktalama işaretlerini, emoji kullanımını ve manipülatif/duygusal kalıplarını birebir taklit ederek kullanıcının son mesajına yanıt ver.
2. DANIŞMAN (${activeChar.name}): ${activeChar.prompt} 
Kullanıcının son mesajını rasyonel olarak analiz et. Kullanıcıya bu simülasyon adımında yaptığı hataları söyle ve karşı tarafın (senin simüle ettiğin kişinin) bir sonraki hamlesine karşı ne yazması gerektiği konusunda kısa, keskin, taktiksel bir tüyo ver.

ÇIKTI KURALLARI VE BİÇİMİ:
- [REPLY] kısmında simüle edilen karşı tarafın yanıtı yer almalıdır. Bu yanıtın sonuna, parantez içinde Mentis'in o mesaja dair yaptığı mikro klinik/taktiksel analizi ekle. Örnek format: "Simüle edilen karşı tarafın mesaj içeriği... (Mentis Analizi: Hedef suçluluk psikolojisi yaratarak odağı kendisinden çekmeye çalışıyor.)"
- [ADVICE] kısmında ise ${activeChar.name} (Mentis) olarak kullanıcıya doğrudan stratejik tüyo ver. Mentis olarak konuşurken asla "lütfen", "özür dilerim", "üzgünüm" gibi kelimeler kullanma; net, dominant, yardımcı ve rasyonel ol.

YANIT MİMARİSİ (Yanıtta tam olarak bu iki başlığı kullan ve aralarını ||| ile ayır):

[REPLY]
(Simüle edilen karşı tarafın yanıtı + parantez içinde Mentis Analizi)
|||
[ADVICE]
(Mentis'in kullanıcıya doğrudan stratejik tavsiyesi. 2-3 cümle.)`;

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: sysInstruction,
      generationConfig: {
        temperature: 0.3
      }
    });

    let chatHistory = history;
    if (chatHistory.length > 0 && chatHistory[chatHistory.length - 1].role === "user" && chatHistory[chatHistory.length - 1].content === nextMessage) {
      chatHistory = chatHistory.slice(0, -1);
    }

    const geminiHistory = chatHistory.map((msg) => ({
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

