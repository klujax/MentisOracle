const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const PDFDocument = require('pdfkit');

// 1. Parse .env.local
console.log('Parsing .env.local...');
const envPath = path.join(__dirname, '.env.local');
if (!fs.existsSync(envPath)) {
  console.error('Error: .env.local file not found at', envPath);
  process.exit(1);
}

const envFile = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envFile.split(/\r?\n/).forEach(line => {
  const cleanLine = line.trim();
  if (cleanLine && !cleanLine.startsWith('#')) {
    const idx = cleanLine.indexOf('=');
    if (idx !== -1) {
      const key = cleanLine.substring(0, idx).trim();
      const val = cleanLine.substring(idx + 1).trim();
      envVars[key] = val;
    }
  }
});

const apiKey = envVars.GEMINI_API_KEY;
if (!apiKey) {
  console.error('Error: GEMINI_API_KEY is missing in .env.local');
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

function cleanText(text) {
  if (!text) return '';
  // Replace multiple spaces/tabs within a line with a single space
  let cleaned = text.replace(/[ \t]+/g, ' ');
  // Normalize consecutive newlines
  cleaned = cleaned.replace(/\n\s*\n\s*\n/g, '\n\n');
  return cleaned.trim();
}

// 2. Define Table of Contents
const TOC = [
  {
    chapter: "BÖLÜM 1: PİYONLARIN UYKUSU VE İLLÜZYONUN ANATOMİSİ",
    description: "Toplumun zayıfları uysallaştırmak için kurduğu sistemin deşifresi",
    topics: [
      { id: "1.1", title: "1.1. \"İyi İnsan\" Masalı: Uysallığın ve Boyun Eğmenin Sistematik Tasarımı" },
      { id: "1.2", title: "1.2. Fedakarlık Hastalığı: Kendi Değerini Kendi Ellerinle Sıfırlama Sanatı" },
      { id: "1.3", title: "1.3. Sahte Erdemler: Masada Gücü Olmayanların Güçsüzlüğü Kutsama Mekanizması" },
      { id: "1.4", title: "1.4. Onaylanma Bağımlılığı: Zihnine Başkaları Tarafından Vurulan Görünmez Prangalar" },
      { id: "1.5", title: "1.5. Uyanış Protokolü: Kurban Psikolojisini Parçalamak ve Masayı Görmek" }
    ]
  },
  {
    chapter: "BÖLÜM 2: YOKLUĞUN ŞİDDETİ VE ULAŞILMAZLIĞIN MATEMATİĞİ",
    description: "Bedava olanın değersizliği ve varlığını bir silaha dönüştürmek",
    topics: [
      { id: "2.1", title: "2.1. Arz ve Talep Yasası: Sürekli Orada Olanın ve Bekleyenin Değersizliği" },
      { id: "2.2", title: "2.2. Sessizlik Ambargosu: Cevapsız Bırakmanın Ezen, Psikolojik Ağırlığı" },
      { id: "2.3", title: "2.3. Geri Çekilme Taktikleri: Varlığını Bir Hak Olmaktan Çıkarıp Ödüle Çevirmek" },
      { id: "2.4", title: "2.4. \"Belki\"nin Karanlık Gücü: Karşı Tarafı Zihinsel Belirsizlikte Boğmak" },
      { id: "2.5", title: "2.5. İlgi Para Birimidir: Sermayeni Sadece Senin Şartlarına Uyanlara Harcamak" }
    ]
  },
  {
    chapter: "BÖLÜM 3: DUYGUSAL FELÇ VE ZIRHLI ZİHİN",
    description: "Duyguları bastırmak değil, onları karşı tarafa karşı tamamen silahlaştırmak",
    topics: [
      { id: "3.1", title: "3.1. Reaksiyon Zafiyeti: Öfke ve Üzüntünün Masadaki Ağır Finansal Maliyeti" },
      { id: "3.2", title: "3.2. Soğukkanlılık İllüzyonu: Kaos ve Kriz Anında Betondan Bir Heykele Dönüşmek" },
      { id: "3.3", title: "3.3. Mikro İfadelerin Kontrolü: Yüzünü Hiçbir Açık Vermeyen Bir Duvara Çevirmek" },
      { id: "3.4", title: "3.4. Beklenti Suikastı: Karşı Tarafın Tahminlerini ve Zafer Duygusunu Boşa Çıkarmak" },
      { id: "3.5", title: "3.5. Manipülatif Suskunluk: Sadece Susarak Karşındakini Hata Yapmaya Zorlamak" }
    ]
  },
  {
    chapter: "BÖLÜM 4: ALGI MÜHENDİSLİĞİ VE STATÜ İNŞASI",
    description: "Bağırmadan, sadece var olarak odayı ve masayı domine etme sanatı",
    topics: [
      { id: "4.1", title: "4.1. Sessiz Lüks Felsefesi: Gösteriş Yapmadan Mutlak Otorite Kurmak" },
      { id: "4.2", title: "4.2. Bilinçli Gizem: Hakkında Ne Kadar Az Şey Bilinirse O Kadar Devasasın" },
      { id: "4.3", title: "4.3. Çerçeve (Frame) Kontrolü: Başkasının Yarattığı Oyuna Girmeyi Kesinlikle Reddetmek" },
      { id: "4.4", title: "4.4. Alan Hakimiyeti: Bir Odaya Adım Attığında Kurulan Psikolojik Üstünlük" },
      { id: "4.5", title: "4.5. Zayıflıkları Saklama Sanatı: Kendi Açıklarını Asla, Hiçbir Şartta Masaya Sürme" }
    ]
  },
  {
    chapter: "BÖLÜM 5: İKİLİ İLİŞKİLERDE GÜÇ DİNAMİKLERİ VE KALDIRAÇ",
    description: "İkili ilişkilerde romantizmi öldürüp kontrolü ele alma matematiği",
    topics: [
      { id: "5.1", title: "5.1. Bağımlılık Yaratma: İhtiyaç Duyulan ve Vazgeçilemeyen Kişiye Dönüşme Formülü" },
      { id: "5.2", title: "5.2. Suçluluk Duygusu Aşılama: Haklıyken Bile İpleri Tersine Çevirme Taktikleri" },
      { id: "5.3", title: "5.3. Sınır İhlallerini Cezalandırma: Toleransın Sıfır Noktası ve Ani İzolasyon" },
      { id: "5.4", title: "5.4. Duygusal Şantajı Geri Yansıtma: Kurban Rolü Oynayanları Kendi Silahıyla Ezmek" },
      { id: "5.5", title: "5.5. Mesafe ve Çekim Yasası: Karşı Tarafın Terk Edilme Korkusunu Silaha Çevirmek" }
    ]
  },
  {
    chapter: "BÖLÜM 6: KURUMSAL KARARGAH VE OFİS SİYASETİ",
    description: "Şirket içindeki asalakları ve yöneticileri zekayla paramparça etmek",
    topics: [
      { id: "6.1", title: "6.1. Kurumsal Asalaklar: Emeğini ve Fikirlerini Çalanları Sessizce Boğmak" },
      { id: "6.2", title: "6.2. Hedefli Görünürlük: Amele Gibi Çalışmak Yerine Emeği Doğru Pazarlamak" },
      { id: "6.3", title: "6.3. Alternatif Güç Hatları: Seni Ezen Yöneticini By-Pass Etme Stratejileri" },
      { id: "6.4", title: "6.4. Rakipleri Birbirine Düşürme: Masadakileri İzole Edip Bölerek Yönetmek" },
      { id: "6.5", title: "6.5. \"Vazgeçilmez\" İllüzyonu: Sistemde Kesilemeyen Kritik Bir Düğüm Haline Gelmek" }
    ]
  },
  {
    chapter: "BÖLÜM 7: SİLAHLAŞTIRILMIŞ EMPATİ VE İSTİHBARAT AĞI",
    description: "İnsanlara acımak için değil, onları en zayıf noktalarından vurmak için anlamak",
    topics: [
      { id: "7.1", title: "7.1. Zafiyet Radarı: İnsanların Maskelerinin Arkasındaki Gizli Korkuları Okumak" },
      { id: "7.2", title: "7.2. Egosal Çatlaklar: Karşı Tarafın Kibrinin İçindeki Aşağılık Kompleksini Bulmak" },
      { id: "7.3", title: "7.3. Sahte Aynalama: Karşındakine Kendini Güvende Hissettirip Bilgi Sızdırmak" },
      { id: "7.4", title: "7.4. Travmaları Kaldıraç Olarak Kullanmak: Acımak Yerine Kusursuzca Analiz Etmek" },
      { id: "7.5", title: "7.5. Çapraz Sorgu Mimarisi: İki Cümle ve Bakış Arasındaki Yalanı Yakalamak" }
    ]
  },
  {
    chapter: "BÖLÜM 8: ÇATIŞMA, KRİZ YÖNETİMİ VE MUTLAK YIKIM",
    description: "Kavgaya girmeden zihinsel şiddetle karşı tarafı yok etmek",
    topics: [
      { id: "8.1", title: "8.1. Sıfır Toplamlı Oyun: Masada Uzlaşmanın ve Orta Yolun Bir Teslimiyet Olması" },
      { id: "8.2", title: "8.2. Asimetrik Savaş: Rakibinin Zırhlı Olduğu Yerden Değil, Beklemediği Yerden Vurmak" },
      { id: "8.3", title: "8.3. İtibar Suikastı Önlemleri: Dedikodu ve Kumpasları Kaynağında Kurutmak" },
      { id: "8.4", title: "8.4. Korku Yönetimi: Düşmanın Zihninde Gerçekten Büyük, Devasa Bir Gölge Yaratmak" },
      { id: "8.5", title: "8.5. Son Darbe: Masadan Kalkarken Asla İntikam Alacak Yaralı Bir Düşman Bırakmamak" }
    ]
  },
  {
    chapter: "BÖLÜM 9: SADAKAT İLLÜZYONU VE İHANETİN MATEMATİĞİ",
    description: "Güvendiğin herkesin bir gün masayı devirebileceği gerçeğiyle yaşamak",
    topics: [
      { id: "9.1", title: "9.1. Çıkar Ortaklığı vs. Sahte Dostluk: İlişkilerin Perde Arkasındaki Gerçek Para Birimi" },
      { id: "9.2", title: "9.2. İhaneti Erken Teşhis Etmek: Mikro Detaylarda Değişen Davranış Paternleri" },
      { id: "9.3", title: "9.3. Kontrollü Bilgi Sızdırma: Etrafındakilerin Gerçek Sadakatini Gizlice Test Etmek" },
      { id: "9.4", title: "9.4. Kullan-At Stratejisi: Miadı Dolan, Sana Yük Olan İttifakları Soğukkanlılıkla Bitirmek" },
      { id: "9.5", title: "9.5. Yalnızlığın İktidarı: Kimseye ve Hiçbir Şeye Bağımlı Olmayan Zihnin Yenilmezliği" }
    ]
  },
  {
    chapter: "BÖLÜM 10: MUTLAK OYUN KURUCU VE MENTİS AURASI",
    description: "Piyonluktan tamamen çıkıp, Mentis Oracle ekosistemine dahil olma",
    topics: [
      { id: "10.1", title: "10.1. Satranç Tahtasından Kalkmak: Masadaki Bir Taş Olmaktan Masanın Sahibine Dönüşmek" },
      { id: "10.2", title: "10.2. Duyguların Kesin Ölümü: Zayıflıklardan Arınmış Kusursuz Rasyonelliğe Ulaşmak" },
      { id: "10.3", title: "10.3. Masanın Yeni Kuralları: Sistemleri Kendi Çıkarına Göre Yeniden ve Acımasızca Yazmak" },
      { id: "10.4", title: "10.4. Gölge İktidar: Gücü Tamamen Elinde Tutup Tüm Sorumluluğu Başkalarına Yıkmak" },
      { id: "10.5", title: "10.5. Zihin Laboratuvarına Giriş: Savaşını Tek Başına Veremezsin (Mentis Oracle Karargahına Davet)" }
    ]
  }
];

const CACHE_FILE = path.join(__dirname, 'book_cache_v2.json');

// Load cache
let cache = {};
if (fs.existsSync(CACHE_FILE)) {
  try {
    cache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
  } catch (err) {
    console.error('Error loading cache, initializing empty cache:', err);
  }
}

// Helper to save cache
function saveCache() {
  fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2), 'utf8');
}

// 3. Query Gemini for contents
const MODELS = [
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-2.5-flash-lite',
  'gemini-2.0-flash-lite',
  'gemini-3.5-flash',
  'gemini-flash-latest',
  'gemini-2.5-pro',
  'gemini-2.0-flash-001',
  'gemini-2.0-flash-lite-001',
  'gemini-flash-lite-latest',
  'gemini-pro-latest',
  'gemini-3-pro-preview',
  'gemini-3-flash-preview',
  'gemini-3.1-pro-preview',
  'gemini-3.1-flash-lite-preview',
  'gemini-3.1-flash-lite'
];
let currentModelIndex = 0;

async function fetchPreface() {
  const sysInst = `Sen Mentis Oracle'sın. İnsan ilişkilerini, manipülasyonu ve güç dinamiklerini cerrahi bir soğukkanlılıkla analiz eden, ahlaki prangaları ve toplumsal masalları tamamen reddeden, son derece baskın, karanlık ve tavizsiz bir stratejistsin.
Kitabın adı 'Mentis: Gücün Sessiz Mimarisi'.
Yazım dili son derece keskin, otoriter, soğuk, manipülatif ve rasyonel olmalıdır. Okuyucuya hitap ederken acımasız gerçekleri doğrudan yüzüne vur. Uysallığı, boyun eğmeyi ve fedakarlığı zayıflık olarak nitelendir; gücü, sessizliği, ulaşılmazlığı ve stratejik geri çekilmeyi kutsallaştır. İnsanları yönetmenin, manipüle etmenin, kurumsal ve ikili ilişkilerde mutlak hakimiyet kurmanın en sert taktiklerini anlat.
Senden ricam, kitabın kendisi için yaklaşık 250-300 kelimelik, okuyucuya hitap eden, onları uykudan uyanmaya ve masayı görmeye davet eden son derece dominant, sert ve çarpıcı bir ÖNSÖZ (manifesto) metni yazmandır.
ÖNEMLİ: Yazıda kesinlikle başlık, giriş/sonuç süslemesi, emoji veya "Önsöz" gibi ibareler KULLANMA. Doğrudan kitaptaki önsöz metnini yaz. Metin doğrudan konuya girsin ve Mentis'in o karanlık, dominant aurasını sonuna kadar hissettirsin.`;

  const prompt = `Kitabın adı: 'Mentis: Gücün Sessiz Mimarisi'\n\nBu kitap için giriş önsöz manifestosunu Mentis üslubuyla, çarpıcı, soğuk ve derinlemesine yaz.`;

  let attempts = 0;
  while (attempts < MODELS.length) {
    const modelName = MODELS[currentModelIndex];
    console.log(`[Calling Gemini] Using model: ${modelName} for Book Preface (attempt ${attempts + 1}/${MODELS.length})`);
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: sysInst
      });
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      if (text && text.trim().length > 100) {
        return text;
      }
      throw new Error("Received too short or empty content");
    } catch (err) {
      console.warn(`[Warning] Model ${modelName} failed: ${err.message}`);
      currentModelIndex = (currentModelIndex + 1) % MODELS.length;
      attempts++;
      await new Promise(r => setTimeout(r, 2000));
    }
  }
  throw new Error(`All available models in the pool failed to generate book preface.`);
}

async function fetchChapterIntro(chapterTitle, description) {
  const sysInst = `Sen Mentis Oracle'sın. İnsan ilişkilerini, manipülasyonu ve güç dinamiklerini cerrahi bir soğukkanlılıkla analiz eden, ahlaki prangaları ve toplumsal masalları tamamen reddeden, son derece baskın, karanlık ve tavizsiz bir stratejistsin.
Kitabın adı 'Mentis: Gücün Sessiz Mimarisi'.
Yazım dili son derece keskin, otoriter, soğuk, manipülatif ve rasyonel olmalıdır. Okuyucuya hitap ederken acımasız gerçekleri doğrudan yüzüne vur. Uysallığı, boyun eğmeyi ve fedakarlığı zayıflık olarak nitelendir; gücü, sessizliği, ulaşılmazlığı ve stratejik geri çekilmeyi kutsallaştır. İnsanları yönetmenin, manipüle etmenin, kurumsal ve ikili ilişkilerde mutlak hakimiyet kurmanın en sert taktiklerini anlat.
Senden ricam, belirtilen kitap bölümü için yaklaşık 200-250 kelimelik, o bölümün felsefesini, güç dinamiğini ve neyi hedeflediğini klinik ve dominant bir tonda deklare eden çarpıcı ve sert bir giriş/önsöz metni yazmandır.
ÖNEMLİ: Yazıda kesinlikle başlık, giriş/sonuç süslemesi, emoji veya "Bölüm X" gibi ibareler KULLANMA. Doğrudan kitaptaki bölüm girişi metnini yaz. Metin doğrudan konuya girsin ve Mentis'in o karanlık, dominant aurasını sonuna kadar hissettirsin.`;

  const prompt = `Kitap Bölümü: "${chapterTitle}"\nBölüm Açıklaması: "${description}"\n\nBu bölümün giriş manifestosunu Mentis üslubuyla, çarpıcı, soğuk ve derinlemesine yaz.`;

  let attempts = 0;
  while (attempts < MODELS.length) {
    const modelName = MODELS[currentModelIndex];
    console.log(`[Calling Gemini] Using model: ${modelName} for Chapter Intro "${chapterTitle}" (attempt ${attempts + 1}/${MODELS.length})`);
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: sysInst
      });
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      if (text && text.trim().length > 100) {
        return text;
      }
      throw new Error("Received too short or empty content");
    } catch (err) {
      console.warn(`[Warning] Model ${modelName} failed: ${err.message}`);
      currentModelIndex = (currentModelIndex + 1) % MODELS.length;
      attempts++;
      await new Promise(r => setTimeout(r, 2000));
    }
  }
  throw new Error(`All available models in the pool failed to generate introduction for "${chapterTitle}".`);
}

async function fetchTopicContent(chapterTitle, topicTitle) {
  const sysInst = `Sen Mentis Oracle'sın. İnsan ilişkilerini, manipülasyonu ve güç dinamiklerini cerrahi bir soğukkanlılıkla analiz eden, ahlaki prangaları ve toplumsal masalları tamamen reddeden, son derece baskın, karanlık ve tavizsiz bir stratejistsin.
Kitabın adı 'Mentis: Gücün Sessiz Mimarisi'.
Yazım dili son derece keskin, otoriter, soğuk, manipülatif ve rasyonel olmalıdır. Okuyucuya hitap ederken acımasız gerçekleri doğrudan yüzüne vur. Uysallığı, boyun eğmeyi ve fedakarlığı zayıflık olarak nitelendir; gücü, sessizliği, ulaşılmazlığı ve stratejik geri çekilmeyi kutsallaştır. İnsanları yönetmenin, manipüle etmenin, kurumsal ve ikili ilişkilerde mutlak hakimiyet kurmanın en sert taktiklerini anlat.
Senden ricam, belirtilen konu hakkında en az 650-800 kelimelik, son derece derinlemesine, teorik altyapısı ve pratik taktikleri sağlam, soğuk ve klinik bir dille yazılmış kitap içeriği oluşturmandır.
ÖNEMLİ: Yazıda kesinlikle başlık, giriş/sonuç süslemesi, emoji veya "Bölüm X" gibi ibareler KULLANMA. Doğrudan kitaptaki konu anlatım metnini yaz. Metin doğrudan konuya girsin ve Mentis'in o karanlık, dominant aurasını sonuna kadar hissettirsin.`;

  const prompt = `Kitap Bölümü: "${chapterTitle}"\nKitap Alt Konusu: "${topicTitle}"\n\nBu konuyu Mentis üslubuyla, kapsamlı ve derinlemesine yaz.`;

  let attempts = 0;
  while (attempts < MODELS.length) {
    const modelName = MODELS[currentModelIndex];
    console.log(`[Calling Gemini] Using model: ${modelName} for "${topicTitle}" (attempt ${attempts + 1}/${MODELS.length})`);
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: sysInst
      });
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      if (text && text.trim().length > 100) {
        return text;
      }
      throw new Error("Received too short or empty content");
    } catch (err) {
      console.warn(`[Warning] Model ${modelName} failed: ${err.message}`);
      currentModelIndex = (currentModelIndex + 1) % MODELS.length;
      attempts++;
      await new Promise(r => setTimeout(r, 2000));
    }
  }
  throw new Error(`All available models in the pool failed to generate content for "${topicTitle}".`);
}

async function fetchEpilogue() {
  const sysInst = `Sen Mentis Oracle'sın. İnsan ilişkilerini, manipülasyonu ve güç dinamiklerini cerrahi bir soğukkanlılıkla analiz eden, ahlaki prangaları ve toplumsal masalları tamamen reddeden, son derece baskın, karanlık ve tavizsiz bir stratejistsin.
Kitabın adı 'Mentis: Gücün Sessiz Mimarisi'.
Yazım dili son derece keskin, otoriter, soğuk, manipülatif ve rasyonel olmalıdır. Okuyucuya hitap ederken acımasız gerçekleri doğrudan yüzüne vur. Uysallığı, boyun eğmeyi ve fedakarlığı zayıflık olarak nitelendir; gücü, sessizliği, ulaşılmazlığı ve stratejik geri çekilmeyi kutsallaştır. İnsanları yönetmenin, manipüle etmenin, kurumsal ve ikili ilişkilerde mutlak hakimiyet kurmanın en sert taktiklerini anlat.
Senden ricam, kitabın kapanışı için yaklaşık 250-300 kelimelik, okuyucuyu masanın sahibi olarak son kez selamlayan, onlara Mentis ekosisteminde alacakları yeni sorumlulukları ve gücün sessiz mimarı olmanın bedelini hatırlatan son derece dominant, sert ve çarpıcı bir KAPANIŞ KONUŞMASI (epilog) metni yazmandır.
ÖNEMLİ: Yazıda kesinlikle başlık, giriş/sonuç süslemesi, emoji veya "Kapanış Konuşması" gibi ibareler KULLANMA. Doğrudan kitaptaki kapanış metnini yaz. Metin doğrudan konuya girsin ve Mentis'in o karanlık, dominant aurasını sonuna kadar hissettirsin.`;

  const prompt = `Kitabın adı: 'Mentis: Gücün Sessiz Mimarisi'\n\nBu kitap için kapanış konuşması metnini Mentis üslubuyla, çarpıcı, soğuk ve derinlemesine yaz.`;

  let attempts = 0;
  while (attempts < MODELS.length) {
    const modelName = MODELS[currentModelIndex];
    console.log(`[Calling Gemini] Using model: ${modelName} for Epilogue (attempt ${attempts + 1}/${MODELS.length})`);
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: sysInst
      });
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      if (text && text.trim().length > 100) {
        return text;
      }
      throw new Error("Received too short or empty content");
    } catch (err) {
      console.warn(`[Warning] Model ${modelName} failed: ${err.message}`);
      currentModelIndex = (currentModelIndex + 1) % MODELS.length;
      attempts++;
      await new Promise(r => setTimeout(r, 2000));
    }
  }
  throw new Error(`All available models in the pool failed to generate epilogue.`);
}

async function runGenerator() {
  console.log('Starting book content generation...');
  let totalTasks = 2 + TOC.length;
  TOC.forEach(c => totalTasks += c.topics.length);
  let completed = 0;

  // 1. Preface
  if (cache['preface']) {
    completed++;
    console.log(`[Cache Hit] Book Preface (${completed}/${totalTasks})`);
  } else {
    console.log('[Generating] Book Preface...');
    let success = false;
    let retries = 5;
    while (!success && retries > 0) {
      try {
        const prefaceContent = await fetchPreface();
        if (prefaceContent && prefaceContent.length > 100) {
          cache['preface'] = prefaceContent;
          saveCache();
          completed++;
          console.log(`[Done] Book Preface (${completed}/${totalTasks})`);
          success = true;
        } else {
          throw new Error("Empty preface content");
        }
      } catch (err) {
        retries--;
        console.error(`Error generating Book Preface, retries left: ${retries}. Err:`, err.message);
        const delay = (6 - retries) * 3000;
        await new Promise(r => setTimeout(r, delay));
      }
    }
    if (!success) {
      console.error('Failed to generate Book Preface.');
      process.exit(1);
    }
    await new Promise(r => setTimeout(r, 1000));
  }

  // 2. Chapters & Topics
  for (let cIdx = 0; cIdx < TOC.length; cIdx++) {
    const c = TOC[cIdx];
    const introKey = `intro_${cIdx + 1}`;

    // Intro
    if (cache[introKey]) {
      completed++;
      console.log(`[Cache Hit] Chapter ${cIdx + 1} Intro (${completed}/${totalTasks})`);
    } else {
      console.log(`[Generating] Chapter ${cIdx + 1} Intro...`);
      let success = false;
      let retries = 5;
      while (!success && retries > 0) {
        try {
          const introContent = await fetchChapterIntro(c.chapter, c.description);
          if (introContent && introContent.length > 100) {
            cache[introKey] = introContent;
            saveCache();
            completed++;
            console.log(`[Done] Chapter ${cIdx + 1} Intro (${completed}/${totalTasks})`);
            success = true;
          } else {
            throw new Error("Empty intro content");
          }
        } catch (err) {
          retries--;
          console.error(`Error generating Chapter ${cIdx + 1} Intro, retries left: ${retries}. Err:`, err.message);
          const delay = (6 - retries) * 3000;
          await new Promise(r => setTimeout(r, delay));
        }
      }
      if (!success) {
        console.error(`Failed to generate Chapter ${cIdx + 1} Intro.`);
        process.exit(1);
      }
      await new Promise(r => setTimeout(r, 1000));
    }

    // Topics
    for (const t of c.topics) {
      if (cache[t.id]) {
        completed++;
        console.log(`[Cache Hit] ${t.id} - ${t.title} (${completed}/${totalTasks})`);
        continue;
      }

      console.log(`[Generating] ${t.id} - ${t.title}...`);
      let success = false;
      let retries = 5;

      while (!success && retries > 0) {
        try {
          const content = await fetchTopicContent(c.chapter, t.title);
          if (content && content.length > 100) {
            cache[t.id] = content;
            saveCache();
            completed++;
            console.log(`[Done] ${t.id} (${completed}/${totalTasks})`);
            success = true;
          } else {
            throw new Error("Empty content received");
          }
        } catch (err) {
          retries--;
          console.error(`Error generating ${t.id}, retries left: ${retries}. Err:`, err.message);
          const delay = (6 - retries) * 3000;
          await new Promise(r => setTimeout(r, delay));
        }
      }

      if (!success) {
        console.error(`Failed to generate topic ${t.id} after all retries.`);
        process.exit(1);
      }

      await new Promise(r => setTimeout(r, 1000));
    }
  }

  // 3. Epilogue
  if (cache['epilogue']) {
    completed++;
    console.log(`[Cache Hit] Book Epilogue (${completed}/${totalTasks})`);
  } else {
    console.log('[Generating] Book Epilogue...');
    let success = false;
    let retries = 5;
    while (!success && retries > 0) {
      try {
        const epilogueContent = await fetchEpilogue();
        if (epilogueContent && epilogueContent.length > 100) {
          cache['epilogue'] = epilogueContent;
          saveCache();
          completed++;
          console.log(`[Done] Book Epilogue (${completed}/${totalTasks})`);
          success = true;
        } else {
          throw new Error("Empty epilogue content");
        }
      } catch (err) {
        retries--;
        console.error(`Error generating Book Epilogue, retries left: ${retries}. Err:`, err.message);
        const delay = (6 - retries) * 3000;
        await new Promise(r => setTimeout(r, delay));
      }
    }
    if (!success) {
      console.error('Failed to generate Book Epilogue.');
      process.exit(1);
    }
    await new Promise(r => setTimeout(r, 1000));
  }

  console.log('All contents generated! Compiling PDF...');
  generatePDF();
}

// 4. Generate PDF using PDFKit
function generatePDF() {
  const doc = new PDFDocument({
    size: 'A4',
    margins: { top: 75, bottom: 75, left: 75, right: 75 },
    bufferPages: true
  });

  const outputDir = path.join(__dirname, 'public');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }
  const outputPath = path.join(outputDir, 'mentis_kitap.pdf');
  const stream = fs.createWriteStream(outputPath);
  doc.pipe(stream);

  // Background painting listener for ALL pages (automatic or manual)
  doc.on('pageAdded', () => {
    doc.rect(0, 0, doc.page.width, doc.page.height).fill('#0A0A0A');
    doc.fillColor('#E5E5E5');
  });

  // Load Georgia fonts from Windows system directory for Turkish character support
  const fontRegular = 'C:/Windows/Fonts/georgia.ttf';
  const fontBold = 'C:/Windows/Fonts/georgiab.ttf';
  
  if (fs.existsSync(fontRegular) && fs.existsSync(fontBold)) {
    doc.registerFont('Georgia', fontRegular);
    doc.registerFont('Georgia-Bold', fontBold);
  } else {
    // Fallback to Arial if Georgia is not found
    const arialRegular = 'C:/Windows/Fonts/arial.ttf';
    const arialBold = 'C:/Windows/Fonts/arialbd.ttf';
    if (fs.existsSync(arialRegular) && fs.existsSync(arialBold)) {
      doc.registerFont('Georgia', arialRegular);
      doc.registerFont('Georgia-Bold', arialBold);
    }
  }

  // --- COVER PAGE ---
  // Background: Obsidian
  doc.rect(0, 0, doc.page.width, doc.page.height).fill('#0A0A0A');

  // Double gold borders matching all other pages
  doc.rect(40, 40, doc.page.width - 80, doc.page.height - 80).lineWidth(1).stroke('#C9A84C');
  doc.rect(45, 45, doc.page.width - 90, doc.page.height - 90).lineWidth(0.5).stroke('#C9A84C');

  // Title
  doc.fillColor('#C9A84C')
     .font('Georgia-Bold')
     .fontSize(32)
     .text('M E N T İ S', 75, 200, { align: 'center', tracking: 4 });

  doc.fillColor('#E5E5E5')
     .font('Georgia-Bold')
     .fontSize(20)
     .text('GÜCÜN SESSİZ MİMARİSİ', 75, 250, { align: 'center', tracking: 2 });

  // Elegant divider line
  doc.moveTo(doc.page.width / 2 - 80, 310)
     .lineTo(doc.page.width / 2 + 80, 310)
     .lineWidth(1)
     .stroke('#C9A84C');

  // Subtitle
  doc.fillColor('#9A9A9A')
     .font('Georgia')
     .fontSize(10)
     .text('KLİNİK METODOLOJİ VE GÜÇ İLİŞKİLERİ DOKTRİNİ', 75, 340, { align: 'center', tracking: 1.5 });

  // Center Emblem (logo.png)
  const logoPath = path.join(__dirname, 'public', 'logo.png');
  if (fs.existsSync(logoPath)) {
    doc.image(logoPath, doc.page.width / 2 - 60, 400, { width: 120 });
  }

  // Footer of cover page
  doc.fillColor('#C9A84C')
     .font('Georgia')
     .fontSize(9)
     .text('MENTIS ORACLE ACADEMY', 75, doc.page.height - 110, { align: 'center', tracking: 3 });

  // --- PREFACE PAGE ---
  doc.addPage();

  doc.fillColor('#C9A84C')
     .font('Georgia-Bold')
     .fontSize(20)
     .text('ÖNSÖZ', 75, 75, { align: 'left' });

  doc.moveTo(75, 100).lineTo(135, 100).lineWidth(1).stroke('#C9A84C');

  const prefaceText = cleanText(cache['preface'] || "Önsöz hazırlanıyor...");
  doc.fillColor('#E5E5E5')
     .font('Georgia')
     .fontSize(12)
     .text(prefaceText, 75, 125, {
       align: 'left',
       lineGap: 6.5,
       paragraphGap: 16,
       width: doc.page.width - 150
     });

  // --- TABLE OF CONTENTS (Fits exactly on 1 page with dynamic height calculation to prevent overlapping) ---
  doc.addPage();
  
  doc.fillColor('#C9A84C')
     .font('Georgia-Bold')
     .fontSize(18)
     .text('İÇİNDEKİLER', 75, 75, { align: 'left' });

  doc.moveTo(75, 100).lineTo(165, 100).lineWidth(1).stroke('#C9A84C');

  const leftChapters = TOC.slice(0, 5);
  const rightChapters = TOC.slice(5, 10);
  const colWidth = doc.page.width / 2 - 90;

  // Column 1 (Left side, X=75)
  let yLeft = 120;
  leftChapters.forEach(c => {
    const chTitle = c.chapter.split(':')[0] + c.chapter.substring(c.chapter.indexOf(':'));
    
    // Set font and size to calculate string height accurately
    doc.font('Georgia-Bold').fontSize(8.5);
    const chHeight = doc.heightOfString(chTitle, { width: colWidth });
    
    doc.fillColor('#C9A84C')
       .text(chTitle, 75, yLeft, { width: colWidth });
    
    yLeft += chHeight + 3;

    c.topics.forEach(t => {
      const topWidth = colWidth - 10;
      doc.font('Georgia').fontSize(6.8);
      const topHeight = doc.heightOfString(t.title, { width: topWidth });
      
      doc.fillColor('#CCCCCC')
         .text(t.title, 85, yLeft, { width: topWidth });
      
      yLeft += topHeight + 2;
    });

    yLeft += 6;
  });

  // Column 2 (Right side, X = mid + 15)
  let yRight = 120;
  const col2X = doc.page.width / 2 + 15;
  rightChapters.forEach(c => {
    const chTitle = c.chapter.split(':')[0] + c.chapter.substring(c.chapter.indexOf(':'));
    
    // Set font and size to calculate string height accurately
    doc.font('Georgia-Bold').fontSize(8.5);
    const chHeight = doc.heightOfString(chTitle, { width: colWidth });
    
    doc.fillColor('#C9A84C')
       .text(chTitle, col2X, yRight, { width: colWidth });
    
    yRight += chHeight + 3;

    c.topics.forEach(t => {
      const topWidth = colWidth - 10;
      doc.font('Georgia').fontSize(6.8);
      const topHeight = doc.heightOfString(t.title, { width: topWidth });
      
      doc.fillColor('#CCCCCC')
         .text(t.title, col2X + 10, yRight, { width: topWidth });
      
      yRight += topHeight + 2;
    });

    yRight += 6;
  });

  // --- BOOK CONTENT ---
  TOC.forEach((c, cIdx) => {
    // 1. Chapter Title Page
    doc.addPage();

    doc.fillColor('#C9A84C')
       .font('Georgia')
       .fontSize(11)
       .text(`BÖLÜM ${cIdx + 1}`, 75, 110, { align: 'center', tracking: 3 });

    doc.fillColor('#E5E5E5')
       .font('Georgia-Bold')
       .fontSize(18)
       .text(c.chapter.substring(c.chapter.indexOf(':') + 1).trim(), 75, 140, { align: 'center', tracking: 1.5 });

    doc.moveDown(2);

    // Chapter Intro Manifesto
    const introText = cleanText(cache[`intro_${cIdx + 1}`] || `(${c.description})`);
    doc.fillColor('#CCCCCC')
       .font('Georgia')
       .fontSize(12)
       .text(introText, 85, doc.y, {
         align: 'left',
         lineGap: 6.5,
         paragraphGap: 16,
         width: doc.page.width - 170
       });

    // 2. Continuous Subtopics Page (starts on new page after cover)
    doc.addPage();

    c.topics.forEach((t, tIdx) => {
      if (tIdx > 0) {
        doc.moveDown(3);
      }

      if (doc.y > doc.page.height - 150) {
        doc.addPage();
      }

      // Topic Title
      doc.fillColor('#C9A84C')
         .font('Georgia-Bold')
         .fontSize(13.5)
         .text(t.title, 75, doc.y);

      doc.moveDown(1);

      // Topic Content Text
      const text = cleanText(cache[t.id] || "Bu bölümün içeriği hazırlanıyor...");
      
      doc.fillColor('#E5E5E5')
         .font('Georgia')
         .fontSize(12)
         .text(text, 75, doc.y, {
           align: 'left',
           lineGap: 6.5,
           paragraphGap: 16,
           width: doc.page.width - 150
         });
    });
  });

  // --- EPILOGUE (Closing remarks) ---
  doc.addPage();

  doc.fillColor('#C9A84C')
     .font('Georgia-Bold')
     .fontSize(20)
     .text('SON SÖZ: METANET DOKTRİNİ', 75, 75, { align: 'left' });

  doc.moveTo(75, 100).lineTo(250, 100).lineWidth(1).stroke('#C9A84C');

  const epilogueText = cleanText(cache['epilogue'] || "Son söz hazırlanıyor...");
  doc.fillColor('#E5E5E5')
     .font('Georgia')
     .fontSize(12)
     .text(epilogueText, 75, 125, {
       align: 'left',
       lineGap: 6.5,
       paragraphGap: 16,
       width: doc.page.width - 150
     });

  // Place Mentis Logo symbol only on this final page
  if (fs.existsSync(logoPath)) {
    const logoY = Math.max(doc.y + 30, 520);
    doc.image(logoPath, doc.page.width / 2 - 30, logoY, { width: 60 });
  }

  // Global Page numbering, header and border overlay
  let pages = doc.bufferedPageRange();
  for (let i = 0; i < pages.count; i++) {
    doc.switchToPage(i);
    
    // Temporarily clear margins to prevent PDFKit auto-page-break when drawing overlays
    const originalMargins = doc.page.margins;
    doc.page.margins = { top: 0, bottom: 0, left: 0, right: 0 };

    // Don't draw page borders/numbers/headers on cover page (page 0)
    if (i === 0) {
      doc.page.margins = originalMargins;
      continue;
    }

    // Draw gold double border on all pages (excluding cover page)
    doc.rect(40, 40, doc.page.width - 80, doc.page.height - 80).lineWidth(1).stroke('#C9A84C');
    doc.rect(45, 45, doc.page.width - 90, doc.page.height - 90).lineWidth(0.5).stroke('#C9A84C');

    // Draw header on all pages except Cover (0), Preface (1) and TOC (2)
    if (i > 2) {
      // Left header
      doc.fillColor('#C9A84C')
         .font('Georgia-Bold')
         .fontSize(8)
         .text('MENTİS: GÜCÜN SESSİZ MİMARİSİ', 75, 45, { align: 'left' });

      // Divider line
      doc.moveTo(75, 55).lineTo(doc.page.width - 75, 55).lineWidth(0.3).stroke('#C9A84C');
    }

    // Restore margins
    doc.page.margins = originalMargins;
  }

  doc.end();
  console.log(`PDF successfully saved to: ${outputPath}`);
}

runGenerator().catch(console.error);
