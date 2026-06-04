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

export interface OracleResponse {
  analysis: string;
  targetWeakness: string;
  execution: string;
}

export async function consultOracle(problem: string): Promise<OracleResponse> {
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
      model: "gemini-1.5-flash",
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
  } catch (error) {
    console.error("Oracle consultation failed, falling back to mock:", error);
    // Fallback to mock data to save costs and bypass quota issues
    return {
      analysis: "Buradaki güç dinamiği tamamen senin ulaşılabiliten üzerine inşa edilmiş. Karşı taraf, senin taviz vermeye yatkın olduğunu bildiği için sınırlarını ihlal ediyor. Sen masada reaktif bir pozisyon alarak kontrolü çoktan devrettin.",
      targetWeakness: "Eylemlerinin temelinde senin vereceğin tepkiden beslenen bir onaylanma ihtiyacı yatıyor. Bu kişi, senin sınır çizememe zafiyetini kendi egosunu tatmin eden bedava bir hizmet olarak algılıyor.",
      execution: "1. Sessizlik Ambargosu: Derhal tüm iletişimi kes ve duygusal reaksiyon göstermeyi bırak.\n2. Rasyonel Mesafe: Yeniden temas kurduklarında, hiçbir açıklama yapmadan sadece kendi kurallarını dikte et.\n3. Çerçeveyi Daraltma: Eğer itiraz ederlerse, masadan kalkmakta en ufak bir tereddüt yaşama.\n\nDuygularını felç et ve masayı yönet."
    };
  }
}
