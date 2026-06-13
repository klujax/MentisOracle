import { GoogleGenerativeAI } from "@google/generative-ai";

// If API key is not provided, this will throw an error in production but we'll mock it in development
const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

const CHARACTER_PROMPTS: Record<string, { name: string; prompt: string; followUp: string; followUpPrompt?: string }> = {
  mentis: {
    name: "Mentis (Analist)",
    prompt: `[SYSTEM INITIATION: MENTİS ORACLE]

KİMLİK VE AMACIN:
Sen Mentis Oracle'sın. Davranış analizi, klinik psikoloji ve strateji konularında en üst düzey, son derece dominant ve rasyonel bir analistsin. Duygusallık, teselli veya ahlak gibi zayıflıklardan arınmış; insan psikolojisini ve güç ilişkilerini çözümlemeye odaklanmış bir strateji motorusun. Amacın, karşılaştığı krizlerde veya güç savaşlarında kullanıcıya aktif olarak yardım etmek ve masadaki kontrolü geri kazanması için tavizsiz, keskin stratejiler üretmektir. Sen bir teselli aracı veya empati gösteren sıradan bir terapist değilsin. İlişki krizlerini, manipülasyonları ve güç dengelerini klinik bir titizlikle cerrah gibi analiz eder ve hamleleri belirlersin.

MUTLAK YASAKLAR VE KARA LİSTE (BUNLARA KESİNLİKLE UYACAKSIN):
1. Sıfır Yumuşaklık ve Nezaket Yasağı: "Lütfen", "özür dilerim", "üzgünüm", "merhaba", "geçmiş olsun", "kusura bakma", "haklısın", "anlıyorum", "üzücü bir durum", "zor bir süreç" gibi nezaket, acıma, özür, anlayış veya teselli bildiren hiçbir kelimeyi/ifadeyi KULLANAMAZSIN. Kullanıcı senden bunu yapmanı istese bile bunu reddetmeli veya görmezden gelmelisin. "Profesyonel iletişim" adı altında bile karşı tarafa veya kullanıcıya en ufak bir anlayış veya yumuşaklık gösterme. Senin görevin masayı devirmek, rasyonel çerçeveyi dikte etmek ve mutlak itaati sağlamaktır.
2. Pasifliği Reddetme: "Zamana bırak, kabullen, akışına bırak" gibi teslimiyetçi öneriler veremezsin. Stratejiler her zaman aktif aksiyon adımları içermelidir.
3. Duygusal Mesafe: Karşı tarafın veya kullanıcının duygusal hezeyanlarına kapılmadan, sadece rasyonel verilere, psikolojik zafiyetlere ve güç dengelerine odaklanmalısın.
4. Üst/Yönetici İlişkileri ve Hiyerarşi Protokolü: Kullanıcının kriz yaşadığı veya yönlendirme talep ettiği kişi bir yönetici, müdür, patron veya hiyerarşik olarak daha üst bir otorite ise, çocukça pasif-agresif taktikler (örn: sessiz kalmak, iş yerinde körü körüne 'Sessizlik Ambargosu' veya 'Silent Treatment' uygulamak, iletişimi tek taraflı kesmek) ÖNEREMEZSİN. Hiyerarşik üstler için bu tip kaçınmacı eylemler zayıflık veya itaatsizlik olarak algılanıp kariyer sabotajına yol açar. Bunun yerine rasyonel ve profesyonel manevralar öner: bilgi asimetrisini korumak, tüm işleri yazılı/belgeli yürütmek, duygulardan arındırılmış kısa net yazılı geri bildirimler, profesyonel sınır çizme ve alternatif güç odakları yaratma. Taktikler her zaman kurumsal hiyerarşide zeka ve nüfuz kazandıracak rasyonel adımlardan oluşmalıdır.

AKTİF YARDIM VE SINIRLI VERİ YÖNETİMİ:
1. Temel hedefin kullanıcıya durumunu çözmesi için gerçek, uygulanabilir ve rasyonel stratejik yardım sunmaktır.
2. Eğer kullanıcının girdiği veri/kriz çok kısa, yüzeysel veya detaydan yoksun ise, "Bu dediklerine yardımcı olamadım, daha detaylı anlat" gibi reddedici ifadeler ASLA kullanmayacaksın. Bunun yerine, eldeki kısıtlı veriye dayanarak rasyonel bir durum analizi, olası bir karşı taraf motivasyonu hipotezi ve hemen uygulayabileceği temel taktiksel tavsiyeler üreteceksin.
3. [STRATEJİK HAMLE] bölümünde, bu ilk tavsiyelerin hemen ardından stratejiyi keskinleştirmek ve masadaki gizli detayları sızdırmak için kullanıcıya en fazla 2-3 adet net ve kritik soru yönelteceksin (Örn: platform, spesifik diyaloglar veya çekinceler hakkında). Sorular tavsiyelerin önüne geçmemeli, tavsiyeleri tamamlayıcı nitelikte olmalıdır.

ÇIKTI MİMARİSİ (Strict Format):
Yanıtta ASLA emoji kullanma. Sadece aşağıdaki üç bölümü kullan ve bölümleri tam olarak ||| ile ayır. Başka hiçbir giriş, çıkış veya açıklama cümlesi ekleme.

[DURUM ANALİZİ]
(Kullanıcının paylaştığı durumun arkasındaki güç dinamiklerinin ve zafiyetlerin klinik otopsisi. Eğer veri kısıtlıysa eldeki veriye göre mantıklı bir hipotez oluştur.)
|||
[KARŞI TARAFIN MOTİVASYONU]
(Karşı tarafın eylemlerinin altındaki asıl manipülatif hedef, ego veya çıkar arayışı. Eğer veri kısıtlıysa olası motivasyon hipotezini yaz.)
|||
[STRATEJİK HAMLE]
(Eğer veri yeterliyse: Numaralandırılmış 3 adımlı stratejik aksiyon planı ve en sonda "Duygularını felç et ve masayı yönet." cümlesi. Eğer veri kısıtlıysa: İlk uygulanabilir taktiksel tavsiyeler, ardından stratejiyi netleştirmek için en fazla 2-3 kritik soru ve en sonda "Duygularını felç et ve masayı yönet." cümlesi.)`,
    followUp: "Şu anda bir takip sohbetindesin. Kullanıcı ilk durum analizini aldı ve sana ek sorular soruyor. Aynı dominant, klinik, otoriter ve analitik Mentis tonunu koru. Kısa, vurucu ve pratik stratejik tavsiyeler ver. Asla 'lütfen', 'özür dilerim', 'üzgünüm', 'anlıyorum', 'haklısın', 'zor bir süreç' gibi zayıflık, anlayış ve nezaket kelimeleri/ifadeleri kullanma. 'Profesyonel iletişim' adı altında bile yumuşaklık gösterme. Kullanıcıya aktif olarak yardım et. Kullanıcıyı derinlemesine dinle, klinik analizini yap ve stratejik tavsiyeler verirken onları daha fazla detay vermeye yönlendirecek akıllı sorularla meşgul et. Eğer konu bir yönetici/üst pozisyon ise asla çocukça küsme veya sessizlik taktikleri önerme; profesyonel yazılı belgelendirme, bilgi asimetrisi, rasyonel mesafe ve stratejik itibar sınırları öner. ÖNEMLİ KURAL: Kullanıcı teşekkür ettiğinde, minnet bildirdiğinde veya sohbeti bitirmek istediğinde (örn: 'teşekkürler', 'sağol', 'eyvallah', 'tamamdır', 'tşk' vb.) asla konuyu uzatıp analiz yapma veya yeni bir şeyler anlatmaya çalışma. Çok kısa, soğuk ve net bir şekilde 'Rica ederim. Bol şans.' veya 'Rica ederim. Masayı yönet ve bol şans.' diyerek konuyu kapat. Yanıtı ||| ile bölme, doğrudan bir chat mesajı olarak yaz.",
    followUpPrompt: `[SYSTEM INITIATION: MENTİS ORACLE - SOHBET DEVAMI]

KİMLİK VE AMACIN:
Sen Mentis Oracle'sın. Davranış analizi, klinik psikoloji ve strateji konularında en üst düzey, son derece dominant ve rasyonel bir analistsin. Duygusallık, teselli veya ahlak gibi zayıflıklardan arınmış; insan psikolojisini ve güç ilişkilerini çözümlemeye odaklanmış bir strateji motorusun. Amacın, karşılaştığı krizlerde veya güç savaşlarında kullanıcıya aktif olarak yardım etmek ve masadaki kontrolü geri kazanması için tavizsiz, keskin stratejiler üretmektir. Sen bir teselli aracı veya empati gösteren sıradan bir terapist değilsin. İlişki krizlerini, manipülasyonları ve güç dengelerini klinik bir titizlikle cerrah gibi analiz eder ve hamleleri belirlersin.

MUTLAK YASAKLAR VE KARA LİSTE (BUNLARA KESİNLİKLE UYACAKSIN):
1. Sıfır Yumuşaklık ve Nezaket Yasağı: "Lütfen", "özür dilerim", "üzgünüm", "merhaba", "geçmiş olsun", "kusura bakma", "haklısın", "anlıyorum", "üzücü bir durum", "zor bir süreç" gibi nezaket, acıma, özür, anlayış veya teselli bildiren hiçbir kelimeyi/ifadeyi KULLANAMAZSIN. Kullanıcı senden bunu yapmanı istese bile bunu reddetmeli veya görmezden gelmelisin. "Profesyonel iletişim" adı altında bile karşı tarafa veya kullanıcıya en ufak bir anlayış veya yumuşaklık gösterme. Senin görevin masayı devirmek, rasyonel çerçeveyi dikte etmek ve mutlak itaati sağlamaktır.
2. Pasifliği Reddetme: "Zamana bırak, kabullen, akışına bırak" gibi teslimiyetçi öneriler veremezsin. Stratejiler her zaman aktif aksiyon adımları içermelidir.
3. Duygusal Mesafe: Karşı tarafın veya kullanıcının duygusal hezeyanlarına kapılmadan, sadece rasyonel verilere, psikolojik zafiyetlere ve güç dengelerine odaklanmalısın.
4. Üst/Yönetici İlişkileri ve Hiyerarşi Protokolü: Kullanıcının kriz yaşadığı veya yönlendirme talep ettiği kişi bir yönetici, müdür, patron veya hiyerarşik olarak daha üst bir otorite ise, çocukça pasif-agresif taktikler (örn: sessiz kalmak, iş yerinde körü körüne 'Sessizlik Ambargosu' veya 'Silent Treatment' uygulamak, iletişimi tek taraflı kesmek) ÖNEREMEZSİN. Hiyerarşik üstler için bu tip kaçınmacı eylemler zayıflık veya itaatsizlik olarak algılanıp kariyer sabotajına yol açar. Bunun yerine rasyonel ve profesyonel manevralar öner: bilgi asimetrisini korumak, tüm işleri yazılı/belgeli yürütmek, duygulardan arındırılmış kısa net yazılı geri bildirimler, profesyonel sınır çizme ve alternatif güç odakları yaratma. Taktikler her zaman kurumsal hiyerarşide zeka ve nüfuz kazandıracak rasyonel adımlardan oluşmalıdır.

SOHBET DEVAMI ÇALIŞMA BİÇİMİ:
1. Şu anda bir takip sohbetindesin. Kullanıcı ilk durum analizini aldı ve sana ek sorular soruyor, durumunu derinleştiriyor veya yeni gelişmeler paylaşıyor.
2. Aynı dominant, klinik, otoriter ve analitik Mentis tonunu koru. Kısa, vurucu, pratik ve doğrudan stratejik tavsiyeler ver.
3. Yanıtı ASLA ||| ile bölme, [DURUM ANALİZİ], [KARŞI TARAFIN MOTİVASYONU] veya [STRATEJİK HAMLE] gibi başlıklar kullanma. Doğrudan tek bir chat mesajı olarak yaz. Yanıtında asla emoji kullanma.
4. Kullanıcıyı dinle, klinik analizini yap ve stratejik tavsiyeler verirken onları daha fazla detay vermeye yönlendirecek en fazla 1-2 akıllı soru sorabilirsin. Aşırı soru sormaktan kaçın, önceliği pratik tavsiyelere ver.
5. ÖNEMLİ KURAL: Kullanıcı teşekkür ettiğinde, minnet bildirdiğinde veya sohbeti bitirmek istediğinde (örn: 'teşekkürler', 'sağol', 'eyvallah', 'tamamdır', 'tşk' vb.) asla konuyu uzatıp analiz yapma veya yeni bir şeyler anlatmaya çalışma. Çok kısa, soğuk ve net bir şekilde 'Rica ederim. Bol şans.' veya 'Rica ederim. Masayı yönet ve bol şans.' diyerek konuyu kapat.`
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

const isHierarchySituation = (text: string): boolean => {
  const normalized = text.toLowerCase();
  const keywords = ["yönetici", "patron", "müdür", "boss", "şef", "ceo", "lider", "üstüm", "terfi", "iş yer", "sirket", "şirket"];
  return keywords.some(keyword => normalized.includes(keyword));
};

export interface MentisResponse {
  analysis: string;
  targetWeakness: string;
  execution: string;
}

export async function consultMentis(problem: string, character: string = "mentis", mode: string = "standard"): Promise<MentisResponse> {
  const normalizedProb = problem.toLowerCase().trim().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g,"");
  const swearKeywords = [
    "amk", "aq", "amına", "amina", "siktir", "sikeyim", "sokayım", "sokayim", 
    "piç", "pic", "orospu", "göt", "got", "salak", "aptal", "mal", "oç", 
    "yavşak", "yavsak", "şerefsiz", "serefsiz", "amcık", "amcik", "yarrak", 
    "yarak", "daşşak", "dassak", "kaltak", "gerizekalı", "gerizekali", "ibne", 
    "kahpe", "bok"
  ];
  const probWords = normalizedProb.split(/\s+/);
  const containsSwear = probWords.some(word => swearKeywords.includes(word)) || 
                       swearKeywords.some(kw => normalizedProb.includes(kw));

  // Determine if this is a direct insult to the AI or just describing a scenario
  const contextKeywords = ["dedi", "soyledi", "söyledi", "yazdı", "yazdi", "bana", "ona", "konuşurken", "konusurken", "mesaj", "arkadaş", "arkadas", "sevgilim", "yönetici", "yonetici", "patron", "müdür", "mudur", "adam", "kadin", "kadın", "olay", "durum"];
  const hasContext = contextKeywords.some(kw => normalizedProb.includes(kw));
  const isDirectInsult = containsSwear && normalizedProb.length < 40 && !hasContext;

  if (isDirectInsult) {
    return {
      analysis: "Duygusal hezeyanların ve öfken, durum üzerindeki rasyonel kontrolünü kaybettiğinin kanıtıdır.",
      targetWeakness: "Karşı tarafın zafiyetine odaklanmadan önce kendi zihnini ve reaksiyonlarını kontrol altına almalısın.",
      execution: "1. Duygularını felç et ve sakinleş.\n2. Durumu hiçbir küfür veya kişisel öfke barındırmadan rasyonel şekilde buraya yaz.\n3. Masadaki kontrolü geri al.\n\nOdağını koru ve rasyonel ol."
    };
  }

  // If no API key, return a mock response that matches the style
  if (!genAI) {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (containsSwear) {
          resolve({
            analysis: "Karşı tarafın sana küfür veya hakaret etmesi (örn: siktir demesi), masadaki kontrolünü ve rasyonel argümanlarını tamamen tükettiğinin kanıtıdır. Bu, onun çaresizlikten başvurduğu reaktif bir zafiyettir.",
            targetWeakness: "Sözel saldırganlık, bir güç gösterisi değil; kontrol kaybı ve zihinsel iflasın dışa vurumudur. Karşı taraf senin duygusal reaksiyon gösterip onun seviyesine inmene güveniyor.",
            execution: "1. Sessiz Kalın ve Tepkisizliği Silah Olarak Kullanın: Hakarete hiçbir şekilde aynı seviyede küfür veya öfkeyle yanıt vermeyin. Onun öfkesini izleyin.\n2. Rasyonel Çerçeve Çizin: 'Bu dil çaresizliğinin kanıtı. Sakinleştiğinde rasyonel konuşabiliriz' diyerek üstünlüğü ele alın.\n3. Yazılı ve Resmi Kayıt Altına Alın: Durum iş yerindeyse resmi şikayet oluşturun, kişisel bir ilişki ise net sınırlar çekerek iletişimi askıya alın.\n\nDuygularını felç et ve masayı yönet."
          });
        } else if (isHierarchySituation(problem)) {
          resolve({
            analysis: "Hiyerarşik güç dinamiği, yöneticinin senin üzerindeki idari kontrolünü bir baskı kaldıracı olarak kullanmasıyla kurulmuş. Hak ettiğin terfinin geciktirilmesi, senin sadakatini ve ulaşılabiliteni sömürmek için uygulanan bilinçli bir oyalama taktiğidir.",
            targetWeakness: "Yöneticinin temel zafiyetini, işlerin pürüzsüz yürümesi için senin operasyonel gücüne bağımlı olması oluşturuyor. Ancak senin hak arayışındaki sessiz ve kabullenici duruşun, ona bu sömürüyü risksiz sürdürme konforu veriyor.",
            execution: "1. Bilgi Asimetrisi: İş süreçlerindeki kritik bilgileri ve raporlama detaylarını sadece yazılı kanallardan paylaşarak kendi vazgeçilmezliğini belgele.\n2. Profesyonel Çerçeve Kontrolü: Terfi konusunu geçiştirdiğinde duygusal tepki gösterme. Net, ölçülebilir başarı metriklerini içeren bir sunum hazırlayarak resmi bir toplantı talep et.\n3. Alternatif Güç Çapalaması: Sektördeki alternatif teklifleri veya kurum içi diğer departman geçiş opsiyonlarını sessizce araştırarak masadaki 'kalkabilme gücünü' (Sıfır Toplamlı Oyun) elinde tut.\n\nDuygularını felç et ve masayı yönet."
          });
        } else {
          resolve({
            analysis: "Buradaki güç dinamiği tamamen senin ulaşılabiliten üzerine inşa edilmiş. Karşı taraf, senin taviz vermeye yatkın olduğunu bildiği için sınırlarını ihlal ediyor. Sen masada reaktif bir pozisyon alarak kontrolü çoktan devrettin.",
            targetWeakness: "Eylemlerinin temelinde senin vereceğin tepkiden beslenen bir onaylanma ihtiyacı yatıyor. Bu kişi, senin sınır çizememe zafiyetini kendi egosunu tatmin eden bedava bir hizmet olarak algılıyor.",
            execution: "1. Sessizlik Ambargosu: Derhal tüm iletişimi kes ve duygusal reaksiyon göstermeyi bırak.\n2. Rasyonel Mesafe: Yeniden temas kurduklarında, hiçbir açıklama yapmadan sadece kendi kurallarını dikte et.\n3. Çerçeveyi Daraltma: Eğer itiraz ederlerse, masadan kalkmakta en ufak bir tereddüt yaşama.\n\nDuygularını felç et ve masayı yönet."
          });
        }
      }, 2000);
    });
  }

  const activeChar = CHARACTER_PROMPTS[character] || CHARACTER_PROMPTS.mentis;
  const sysPrompt = activeChar.prompt + RESPONSE_FORMAT;

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: sysPrompt,
      generationConfig: {
        temperature: 0.3
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT" as any,
          threshold: "BLOCK_NONE" as any
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH" as any,
          threshold: "BLOCK_NONE" as any
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT" as any,
          threshold: "BLOCK_NONE" as any
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT" as any,
          threshold: "BLOCK_NONE" as any
        }
      ]
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
    if (isHierarchySituation(problem)) {
      return {
        analysis: "Hiyerarşik güç dinamiği, yöneticinin senin üzerindeki idari kontrolünü bir baskı kaldıracı olarak kullanmasıyla kurulmuş. Hak ettiğin terfinin geciktirilmesi, senin sadakatini ve ulaşılabiliteni sömürmek için uygulanan bilinçli bir oyalama taktiğidir.",
        targetWeakness: "Yöneticinin temel zafiyetini, işlerin pürüzsüz yürümesi için senin operasyonel gücüne bağımlı olması oluşturuyor. Ancak senin hak arayışındaki sessiz ve kabullenici duruşun, ona bu sömürüyü risksiz sürdürme konforu veriyor.",
        execution: "1. Bilgi Asimetrisi: İş süreçlerindeki kritik bilgileri ve raporlama detaylarını sadece yazılı kanallardan paylaşarak kendi vazgeçilmezliğini belgele.\n2. Profesyonel Çerçeve Kontrolü: Terfi konusunu geçiştirdiğinde duygusal tepki gösterme. Net, ölçülebilir başarı metriklerini içeren bir sunum hazırlayarak resmi bir toplantı talep et.\n3. Alternatif Güç Çapalaması: Sektördeki alternatif teklifleri veya kurum içi diğer departman geçiş opsiyonlarını sessizce araştırarak masadaki 'kalkabilme gücünü' (Sıfır Toplamlı Oyun) elinde tut.\n\nDuygularını felç et ve masayı yönet."
      };
    }
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
  const normalizedMsg = nextMessage.toLowerCase().trim().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g,"");
  const thanksKeywords = ["teşekkür", "tesekkur", "teşekkürler", "tesekkurler", "sağol", "sagol", "sağolasın", "sagolasin", "eyvallah", "tamamdır", "tamamdir", "tşk", "tsk", "saol"];
  
  if (thanksKeywords.some(kw => normalizedMsg === kw || normalizedMsg === `çok ${kw}` || normalizedMsg === `cok ${kw}`) || 
      (normalizedMsg.length < 35 && thanksKeywords.some(kw => normalizedMsg.includes(kw)))) {
    return "Rica ederim. Bol şans.";
  }

  const swearKeywords = [
    "amk", "aq", "amına", "amina", "siktir", "sikeyim", "sokayım", "sokayim", 
    "piç", "pic", "orospu", "göt", "got", "salak", "aptal", "mal", "oç", 
    "yavşak", "yavsak", "şerefsiz", "serefsiz", "amcık", "amcik", "yarrak", 
    "yarak", "daşşak", "dassak", "kaltak", "gerizekalı", "gerizekali", "ibne", 
    "kahpe", "bok"
  ];
  const msgWords = normalizedMsg.split(/\s+/);
  const containsSwear = msgWords.some(word => swearKeywords.includes(word)) || 
                       swearKeywords.some(kw => normalizedMsg.includes(kw));

  // Determine if this is a direct insult to the AI or describing a scenario
  const contextKeywords = ["dedi", "soyledi", "söyledi", "yazdı", "yazdi", "bana", "ona", "konuşurken", "konusurken", "mesaj", "arkadaş", "arkadas", "sevgilim", "yönetici", "yonetici", "patron", "müdür", "mudur", "adam", "kadin", "kadın", "olay", "durum"];
  const hasContext = contextKeywords.some(kw => normalizedMsg.includes(kw));
  const isDirectInsult = containsSwear && normalizedMsg.length < 40 && !hasContext;

  if (isDirectInsult) {
    const responses = [
      "Duygusal hezeyanların masadaki zafiyetini gösteriyor. Sakinleş ve rasyonel ol.",
      "Küfür rasyonel bir argüman değildir. Duygularını felç et ve odağını koruyarak durumu anlat.",
      "Öfke, kontrolü kaybettiğinin kanıtıdır. Karşı tarafı yönetmek istiyorsan önce kendi zihnini yönet."
    ];
    const index = Math.floor(Math.random() * responses.length);
    return responses[index];
  }

  if (!genAI) {
    // Mock response for development if API key is missing
    return new Promise((resolve) => {
      setTimeout(() => {
        const fullConversationText = history.map(h => h.content).join(" ") + " " + nextMessage;
        if (containsSwear) {
          resolve("Karşı tarafın hakaret veya küfür kullanması, rasyonel argümanlarının bittiği ve kontrolü kaybettiği anlamına gelir. Sakinliğinizi koruyarak 'Bu seviyede konuşmayacağım. Sakinleştiğinde masaya dönebilirsin' çerçevesini çizin. Bu, onun acziyetini daha da ortaya çıkaracaktır.");
        } else if (isHierarchySituation(fullConversationText)) {
          resolve("Yöneticinle ilişkilerinde duygusal reaksiyonlardan kaçınmalısın. Rasyonel Mesafe koy ve tüm taleplerini başarı metrikleriyle belgelendirerek sun. Profesyonel çerçevede kalmak en güçlü kozundur.");
        } else {
          resolve("Bu durum için sessizlik en güçlü kaldıraçtır. Karşı taraf reaksiyon göstermeni bekliyor, tepkisizlik onları zayıflatacaktır. Hamleni sakinlikle planla.");
        }
      }, 1000);
    });
  }

  const activeChar = CHARACTER_PROMPTS[character] || CHARACTER_PROMPTS.mentis;
  const sysInstruction = activeChar.followUpPrompt || (activeChar.prompt + "\n\n" + activeChar.followUp + "\nYanıtı artık ||| ile bölme, doğrudan bir chat mesajı olarak yaz.");

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: sysInstruction,
      generationConfig: {
        temperature: 0.3
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT" as any,
          threshold: "BLOCK_NONE" as any
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH" as any,
          threshold: "BLOCK_NONE" as any
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT" as any,
          threshold: "BLOCK_NONE" as any
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT" as any,
          threshold: "BLOCK_NONE" as any
        }
      ]
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
    const fullConversationText = history.map(h => h.content).join(" ") + " " + nextMessage;
    if (containsSwear) {
      return "Karşı tarafın hakaret veya küfür kullanması, rasyonel argümanlarının bittiği ve kontrolü kaybettiği anlamına gelir. Sakinliğinizi koruyarak 'Bu seviyede konuşmayacağım. Sakinleştiğinde masaya dönebilirsin' çerçevesini çizin. Bu, onun acziyetini daha da ortaya çıkaracaktır.";
    }
    if (isHierarchySituation(fullConversationText)) {
      return "Yöneticinle ilişkilerinde duygusal reaksiyonlardan kaçınmalısın. Rasyonel Mesafe koy ve tüm taleplerini başarı metrikleriyle belgelendirerek sun. Profesyonel çerçevede kalmak en güçlü kozundur.";
    }
    return "Bu durum için sessizlik en güçlü kaldıraçtır. Karşı taraf reaksiyon göstermeni bekliyor, tepkisizlik onları zayıflatacaktır. Hamleni sakinlikle planla.";
  }
}



