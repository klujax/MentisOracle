"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import { 
  ArrowLeft, Search, X, Brain, Shield, 
  MessageSquare, User, HelpCircle, AlertOctagon, Quote, Flame, Star, ZoomIn,
  Video, Upload, Play, FileText, Cpu, Clock, Sparkles, Volume2, VolumeX, Maximize, Minimize, Pause
} from "lucide-react";

interface Lesson {
  id: string;
  title: string;
  category: "strategy" | "defense" | "rhetoric" | "body" | "psychology";
  categoryLabel: string;
  description: string;
  whatItIs: string;
  whatItIsNot: string;
  howToApply: string[];
  scenario: string;
  image?: string;
  images?: string[];
}

interface MimicDetail {
  id: string;
  name: string;
  anatomy: string;
  usage: string;
  analysis: string;
  image: string;
}

const MIMICS: MimicDetail[] = [
  {
    id: "anger",
    name: "Öfke Mimiği (Anger)",
    anatomy: "Kaşların iç uçlarının (corrugator supercilii kası) birbirine ve aşağıya doğru çekilmesiyle burun kökünde dikey çizgilerin oluşması. Göz kapaklarının (orbicularis oculi) gerilmesi ve üst göz kapağının (levator palpebrae) göz akını gösterecek şekilde hafifçe yukarı kalkması. Dudakların (orbicularis oris) preslenerek incelmesi. Burun kanatlarının genişlemesi (flaring nostrils). Dudak köşelerinin hafifçe aşağı çekilerek çene kaslarının (mentalis) kilitlenmesi.",
    usage: "Ulaşılabilirliği kırmak, sınır ihlallerinde sessiz ve dominant bir tehdit sinyali vermek, ses tonunu yükseltmeden mutlak sınır çizmek.",
    analysis: "Baskı Katsayısı: %85. Bu mimik ses yükseltmeden 2-3 saniye boyunca göz temasıyla birleştirildiğinde karşı tarafta anlık stres hormonu (kortizol) salınımı başlatır ve savunma moduna geçmesini sağlar.",
    image: "/mimic_anger.png"
  },
  {
    id: "smirk",
    name: "Küçümseyici Tebessüm (Smirk)",
    anatomy: "Zygomaticus major kasının tek taraflı (asimetrik) kasılması sonucu ağız kenarlarından sadece birinin yukarı çekilmesi. Gözlerin etrafındaki kasların (orbicularis oculi) kasılmaması (Duchenne çizgilerinin yokluğu), gözün soğuk ve mesafeli kalması. Başın hafifçe geriye yatırılarak gözlerin aşağıya odaklanması.",
    usage: "Karşı tarafın iddialarını, tehditlerini veya öfkesini ciddiyetsizleştirmek, onu önemsizleştirmek ve rasyonel çöküşünü izlemek.",
    analysis: "Baskı Katsayısı: %90. Karşı tarafın rasyonel argümanlarını saniyeler içinde geçersiz kılar, onu öfke nöbetine sokarak çerçevenizi korur.",
    image: "/mimic_smirk.png"
  },
  {
    id: "pokerface",
    name: "Poker Face (Duygusal Felç)",
    anatomy: "Tüm yüz kaslarının (mimik) bilinçli olarak de-aktive edilmesi, gevşetilerek yerçekimine bırakılması. Göz bebeklerinin hareketlerinin sabitlenmesi, göz kırpma refleksinin (dakikada normalde 15-20 olan) dakikada 5-6 seviyesine düşürülmesi. Yanakların gevşek, çenenin kapalı ama dişlerin sıkılmamış olması.",
    usage: "Beklenmedik durumlarda, saldırılarda veya sır ifşalarında karşı tarafa hiçbir duygusal geri besleme vermeyerek onun zihinsel boşlukta kaybolmasını sağlamak.",
    analysis: "Baskı Katsayısı: %75. Bilgi asimetrisini korumanın en güçlü yoludur. Karşı tarafın 'acaba ne düşünüyor' kaygısını tetikler.",
    image: "/mimic_pokerface.png"
  },
  {
    id: "gaze",
    name: "Güç Üçgeni Bakışı (Power Gaze)",
    anatomy: "Bakışların karşı tarafın göz bebeklerinden alnının ortasındaki glabella noktasına kaydırılması ve bu hayali üçgende (göz-göz-alın) odaklanma. Gözlerin kısılmaması veya büyütülmemesi; tamamen düz, delici ve hareketsiz tutulması. Sosyal bakıştan (göz-göz-ağız) kaçınma.",
    usage: "Karşı tarafı sorgulanıyor hissettirmek, onun hiyerarşik olarak daha alt kademede olduğunu bilinçaltına dikte etmek.",
    analysis: "Baskı Katsayısı: %80. Göz teması savaşlarında rakibi ilk kaçış hareketine zorlar. Sosyal samimiyeti sıfırlar.",
    image: "/mimic_gaze.png"
  },
  {
    id: "suspicion",
    name: "Kuşku & Şüphe Mimiği (Suspicion)",
    anatomy: "Tek kaşın hafifçe yukarı kalkması, diğer gözün ise orbicularis oculi yardımıyla hafifçe kısılması (squinting). Başın hafifçe yana eğilerek, çene hattının yukarı kaldırılması. Göz teması kesilmeden karşı tarafın dudak veya göz hareketlerinin izlenmesi.",
    usage: "Karşı tarafın anlattığı hikayenin tutarsız olduğunu ve yalan söylediğini hissettirmek, savunma psikolojisini tetiklemek.",
    analysis: "Baskı Katsayısı: %65. Doğrudan yalan ifşasında veya shit-test bozmasında kullanılır. Sözsüz bir 'buna inanacağımı mı sanıyorsun?' mesajıdır.",
    image: "/mimic_suspicion.png"
  },
  {
    id: "panic",
    name: "Yalan & Panik Mikro İfadeleri",
    anatomy: "Otonom sinir sistemi uyarılmasına bağlı olarak boğazda istemsiz yutkunma (laringeal hareketler), göz bebeklerinin anlık büyümesi, mikro terleme, dudak yalama ve gözlerin konuşurken sık sık sol-aşağı (kurgu) veya sağ-yukarı (hatırlama) kaçması. Omuzların hafifçe yukarı çekilerek boynun korunmaya çalışılması.",
    usage: "Karşı tarafın zafiyet ve yalan anlarını yakalayıp masada koz olarak biriktirmek için okuma kılavuzu.",
    analysis: "Gözlem Katsayısı: %95. Karşı tarafın zayıflık anını yakaladığınızda müzakere biter. Bu belirtileri kendinizde kontrol etmeli, karşı tarafta ise cezalandırmak yerine kaydetmelisiniz.",
    image: "/mimic_panic.png"
  },
  {
    id: "posture",
    name: "Baskın Duruş & Çene Açısı",
    anatomy: "Çene açısının yatayla 10-15 derece yukarıda tutulması, boyun kaslarının (sternocleidomastoid) gergin durması, başın öne eğilmek yerine dik tutulması. Omuzların geriye çekilerek göğüs kafesinin genişlemesi ve otururken kolların masada geniş yer kaplaması. Ellerin birleştirilerek 'güç çadırı' (steepling) yapılması.",
    usage: "Fiziksel statü ve otorite sinyalini en ilkel düzeyde iletmek. Karşı tarafa 'bu alan bana ait ve senden üstünüm' mesajı vermek.",
    analysis: "Baskı Katsayısı: %70. İlk izlenimde hiyerarşik üstünlüğü kurar. Karşı tarafın alanınızı daraltma çabalarını boşa çıkarır.",
    image: "/mimic_posture.png"
  }
];

const LESSONS: Lesson[] = [
  {
    id: "silence",
    title: "Sessizlik İlkesi",
    category: "strategy",
    categoryLabel: "Saldırı & Strateji",
    description: "Sessizliğin karşı tarafta yarattığı psikolojik boşluğu yönetme ve reaktifliği kırma sanatı. Zihinsel kontrol mekanizmaları.",
    whatItIs: "Sessizlik, pasif bir eylemsizlik veya köşeye çekilme durumu değildir; karşı tarafı kendi zihinsel yankıları ve kaygılarıyla baş başa bırakıp baskı altında tutan aktif bir psikolojik ambargodur. Karşı tarafın tepki bekleme zafiyetinden beslenir. İnsan zihni belirsizliğe tahammül edemez; sessiz kaldığınızda, karşı taraf sizin ne düşündüğünüzü, ne planladığınızı ve ne hissettiğinizi anlamak için kendi zihninde senaryolar üretmeye başlar ve bu da onu hata yapmaya, taviz vermeye veya zayıf pozisyonunu ifşa etmeye zorlar.\n\nSESSİZLİK SÜRELERİ VE PSİKOLOJİK ETKİLERİ:\n- 1-3 Saat (Sınır Çekme): Sıradan bir konuşmada mesajlara geç dönmek, 'ulaşılabilir' olmadığınızı ve hayatınızın merkezinde kendi önceliklerinizin olduğunu gösterir.\n- 12-24 Saat (Güç Dengesi): Karşı tarafın saygısızlığı veya kural ihlali durumunda uygulanan bu süre, onun suçluluk duygusunu ve kaygısını tetikler.\n- 3-5 Gün (Kriz Yönetimi): Ciddi krizlerde uygulanan sessizlik, masadaki tüm güç dengelerini sıfırlar. Karşı tarafın sizi kaybetme korkusuyla yüzleşmesini sağlar.\n- Süresiz Sessizlik (Köprüleri Yakma): Sınır ihlallerinin kronikleştiği durumlarda, rasyonel çerçeveyi tamamen geri çekerek karşı tarafın üzerinizdeki tüm nüfuzunu sıfırlarsınız.\n\nTAKTIKSEL TEPKISIZLIK VE DUYGUSAL SOĞURMA:\nKarşı taraftan gelen agresif veya manipülatif atakları anında yanıtlamak yerine, zihinsel bir 'soğurma' havuzu oluşturun. Bu havuzda, gelen sözlü saldırının duygusal yükünü filtreleyip sadece rasyonel veriyi analiz edin. Cevap vermediğiniz her saniye, karşı tarafın kendi saldırısının yankısı altında ezilmesini sağlar.\n\nMÜZAKERE MASASINDA SESSİZLİK:\nPazarlık veya anlaşma anlarında karşı tarafın sunduğu yetersiz teklife itiraz etmek yerine, gözlerinizi kısmadan 5-7 saniye boyunca sessizce yüzüne bakın. İnsanlar sosyal olarak sessizliği 'kabul edilmeme' veya 'hata' olarak yorumladıklarından, bu sessizlik baskısı altında kendi tekliflerini sizin lehinize iyileştirmeye çalışacaklardır.",
    whatItIsNot: "Sessizlik ilkesi çocuksu bir küsme, trip atma ya da pasif-agresif bir 'silent treatment' değildir. Amaç karşı tarafı cezalandırmak veya ondan çocukça ilgi dilenmek değil; duygusal reaktivitenizi sıfırlayarak karşınızdakinin onay arama şemasını tetiklemek ve masadaki rasyonel çerçeveyi korumaktır. Sessiz kalırken içten içe öfke biriktirmek veya karşı taraf yazar yazmaz hemen yumuşamak bu ilkeyi tamamen sabote eder.",
    howToApply: [
      "İletişim Kesintisi (Anında Reaksiyon): Karşı taraf sınır ihlali yaptığında veya saygısızca yaklaştığında kelimelerle kavga etmeyi derhal bırakın ve sessizliğe geçin.",
      "Gecikmeli Geri Dönüş Protokolü: Karşı taraf sizinle tekrar temas kurmaya çalıştığında reaksiyon süresini uzatın. Hiçbir telaş veya heyecan göstermeden soğukkanlılığınızı koruyun.",
      "Minimalist Nötr Yanıt: Sessizlikten sonra konuşmaya döndüğünüzde uzun açıklamalar yapmayın. Sadece tek kelimelik veya rasyonel, duygusal yük taşımayan net yanıtlar verin.",
      "Kayıt Dışı Kalma: Sosyal medya durumları, profil resimleri veya 'çevrimiçi' hareketleriyle karşı tarafa zayıflık sinyalleri (örn. üzüntülü müzikler, göndermeli durumlar) vermekten kaçının.",
      "Ritmik Geciktirme Katsayıları: Mesajlaşırken onun cevap yazma süresini baz alın ve bu süreyi sistematik olarak 1.5x ile çarpıp geciktirerek statü dengesini lehinize çevirin."
    ],
    scenario: "Eşiniz veya iş ortağınız size suçlayıcı ve değersizleştirici bir mesaj attı. Ona kendinizi açıklayan sayfalarca yanıt yazmak yerine 24 saat boyunca hiçbir dönüş yapmayın. Meraklanıp aradığında veya tekrar yazdığında ses tonunuzu yükseltmeden, tamamen düz ve klinik bir tonla: 'Meşguldüm, konuşacak rasyonel bir durum olduğunu düşünmedim.' diyerek çerçevenizi koruyun."
  },
  {
    id: "frame-control",
    title: "Çerçeve Kontrolü",
    category: "strategy",
    categoryLabel: "Saldırı & Strateji",
    description: "Sosyal etkileşimlerdeki kuralları belirleme, shit-test'leri bozma ve zihinsel sınır dominansı.",
    whatItIs: "Çerçeve (Frame), iki insan arasındaki konuşmanın alt metnindeki gerçeklik algısıdır. Güçlü olanın çerçevesi diğerini yutar. Çerçeve kontrolü, karşınızdakinin size biçtiği 'suçlu', 'savunmacı' veya 'yetersiz' rolünü oynamayı reddederek, konuşmanın gerçeklik sınırlarını kendi kurallarınızla çizmenizdir. Müzakerelerde, iş hayatında ve ilişkilerde kimin çerçevenin içinde kaldığı, o ilişkinin patronunu belirler.\n\nÇERÇEVE SAVAŞI KURALLARI:\n- Yargıç vs. Sanık: Karşı taraf sizi sorguya çektiğinde veya hesap sorduğunda doğrudan 'sanık' koltuğuna oturup savunma yaparsanız çerçeveyi kaybedersiniz. Suçu kabul etmeden veya reddetmeden odağı onun sorgulama yetkisine kaydırın.\n- Shit-Test (Sınır Testleri): Karşı tarafın sizin özgüveninizi, sabrınızı veya sınırlarınızı ölçmek için yaptığı tüm iğneleyici hamleleri (Shit-Test) soğukkanlılıkla savuşturmak zorundasınız. Asla açıklama yapmayın.\n\nÇERÇEVE KIRMA VE YENİ GERÇEKLİK İNŞASI:\nKarşı taraf size kendi ahlaki veya rasyonel kurallarını dayattığında, onun sunduğu gerçekliği doğrudan reddetmek yerine onun dayanak noktasını anlamsızlaştırın. Konuşmayı onun getirdiği konudan çekip kendi seçtiğiniz bir kavramsal temele oturtarak gerçekliği yeniden kurgulayın.",
    whatItIsNot: "Çerçeve kontrolü sürekli inatlaşmak, kavgacı olmak, her söze itiraz etmek veya bağırmak değildir. Sesini yükseltmek zayıflık çerçevesidir. En güçlü çerçeve kontrolü, karşınızdakinin size dayattığı yargılayıcı argümanları tamamen yok sayıp, kendi belirlediğiniz gündemi devam ettirmektir.",
    howToApply: [
      "Açıklamayı Reddetme: Size yöneltilen asılsız veya manipülatif suçlamalara 'Öyle değil çünkü...' diyerek savunma yapmayın. Savunma yapmak, onun yargıç rolünü kabul etmektir.",
      "Testi Teşhis Etme ve Etkisiz Kılma: Karşı tarafın sizi denemek veya küçük düşürmek için attığı lafları ciddiye almayın. Bunları mizahla, abartarak veya tamamen ilgisiz kalarak etkisiz kılın.",
      "Gündemi Dikte Etme: Konuşmanın yönünü onun getirdiği konudan çekip, kendi belirlediğiniz sınırlara ve hedeflere yönlendirin.",
      "Rolleri Değiştirme: Size soru sorulduğunda doğrudan cevap vermek yerine, sorunun altındaki niyeti sorgulayarak karşı tarafı savunma yapmaya zorlayın.",
      "Shit-Test Yanıt Kalıpları: İğneleyici laflara karşı: a) Mizahi Büyütme (örn: 'Evet, hatta en kötüsüyüm'), b) Yok Sayarak Konuşmaya Devam Etme, c) Klinik Teşhis (örn: 'Şu an beni provoke etmeye çalışmandaki amaç ne?')."
    ],
    scenario: "Yöneticinizin 'Bu projede çok yavaşsın' testine karşı 'Ama çok çalışıyorum, mesaiye kalıyorum' diye kendinizi acındırmak yerine, gözünün içine bakıp: 'Kalite zaman alır. Hangi detayları optimize etmemizi istersiniz?' diyerek profesyonel çerçevenizi ve statünüzü koruyun."
  },
  {
    id: "rational-distance",
    title: "Rasyonel Mesafe",
    category: "defense",
    categoryLabel: "Zihinsel Savunma",
    description: "Duygusal bağımlılık tuzaklarını kırmak, sınırları net bir şekilde çizmek ve zihinsel koruma.",
    whatItIs: "Duygusal reaktiviteyi tamamen sıfırlayarak, karşınızdaki insanı hayatınızın odağından çıkarmak ve onu sadece rasyonel bir 'veri noktası' olarak analiz etmektir. Kendi sınırlarınızı koruyarak zihinsel bağımsızlığınızı elde etmenizi sağlar. İnsanların sizin üzerinizdeki en büyük gücü, sizin onlara duyduğunuz duygusal bağımlılıktır. Rasyonel mesafe, bu bağımlılığı klinik bir soğukkanlılıkla kesip atmaktır.\n\nMESAFE ALANLARI:\n- Bilgi Sızıntısını Kesme: Hayatınızdaki gelişmeleri, planlarınızı ve duygularınızı karşı tarafla paylaşmayı durdurun. Gizem zırhını giyin.\n- Zaman Dilimi Yönetimi: İletişime harcadığınız süreyi günün belirli ve çok kısıtlı saatleriyle sınırlandırın.\n\nDUYGUSAL BAĞIMSIZLIK EŞİĞİ:\nKarşı tarafın sizi manipüle etmesine zemin hazırlayan tüm 'onaylanma', 'sevilme' ve 'takdir edilme' şemalarınızı devre dışı bırakın. Kendi değerinizi dışarıdan gelen geri beslemelere değil, kendi disiplininize ve hedeflerinize sabitleyin.",
    whatItIsNot: "Rasyonel mesafe insanlardan tamamen kaçmak, yalnızlaşmak, çocukça küsmek ya da kaba davranmak değildir. İletişim halindeyken bile zihinsel gardınızı korumak ve karşı tarafın manipülasyonlarının iç dünyanıza sızmasını engellemektir.",
    howToApply: [
      "Beklenti Sıfırlama: Karşı tarafın değişmesini, sizi sevmesini veya onaylamasını beklemeyi kesin olarak bırakın. Durumu olduğu gibi kabul edin.",
      "Gözlemci Modu (Klinik Otopsi): Olayların içinde boğulmak yerine, kendinizi ve karşı tarafı tiyatro sahnesindeki iki oyuncu gibi dışarıdan izleyin.",
      "Sınır Çekme Protokolü: Sınırlarınızı ihlal eden eylemler karşısında kavga etmeden, açıklama yapmadan fiziksel veya duygusal olarak geri çekilin.",
      "Kişisel Öncelik Devrimi: Zamanınızı ve enerjinizi tamamen kendi projelerinize, bedensel ve zihinsel gelişiminize kanalize edin."
    ],
    scenario: "İlişkide olduğunuz kişinin sürekli tutarsız ve ilgisiz tavırlarına karşı öfke nöbetleri geçirmek yerine, onun bu durumunu klinik bir zafiyet olarak not edin. Kendi işlerinize, hedeflerinize odaklanın ve onun aramalarına geç, kısa ve net yanıtlar vererek rasyonel mesafenizi koruyun."
  },
  {
    id: "anti-gaslighting",
    title: "Gaslighting Kalkanı",
    category: "defense",
    categoryLabel: "Zihinsel Savunma",
    description: "Algı manipülasyonlarını teşhis etme ve zihinsel gerçekliğinizi koruma.",
    whatItIs: "Gaslighting, karşınızdakinin sizin hafızanızı, akıl sağlığınızı veya algılarınızı sorgulatıp sizi kendine bağımlı kılma taktiğidir. Bu kalkan, manipülatörün sunduğu çarpıtılmış gerçekliği reddedip, kendi şüphe götürmez gerçekliğinize yaslanmanızı sağlar. Genellikle 'sen yanlış hatırlıyorsun', 'aşırı hassassın', 'ben öyle bir şey demedim' cümleleriyle başlar.\n\nGASLIGHTING SÜRECİN VERİLERİ:\n- İnkar: Manipülatör yaptığı eylemi veya söylediği sözü tamamen inkar eder.\n- Yansıtma: Kendi hatalarını sizin üzerinize yıkar (örn: kendisi yalan söylerken sizi yalancılıkla suçlar).\n- Aşındırma: Zamanla kendi hafızanızdan şüphe etmenizi sağlayarak sizi karar alamaz hale getirir.",
    whatItIsNot: "Gaslighting kalkanı manipülatörle 'Hayır öyle oldu, hayır böyle oldu' diye kanıt sunma veya ikna etme yarışına girmek değildir. Kendinizi ispatlamaya çalışmak, manipülatörün sizin üzerinizde kurduğu sorgulama yetkisini kabul etmektir.",
    howToApply: [
      "Algı Güvencesi: Yaşadığınız olayları, yazışmaları ve gerçekleri kendi içinizde netleştirin. Kanıtlarınızı kendiniz için saklayın.",
      "Tartışmayı Reddetme: Karşı taraf 'Sen delirdin, öyle bir şey olmadı' dediğinde konuyu uzatmayın: 'Ben ne yaşadığımı biliyorum, bu konuyu seninle tartışmayacağım' deyin.",
      "Manipülasyon İfşası: Onun sizi suçlu hissettirme çabasını sessizce gözlemleyin ve oyuna dahil olmayın.",
      "Zihinsel Teyit Günlüğü: Yaşadığınız kritik olayları anında tarih ve saat belirterek not edin (defterinize kaydedin) ve kendi gerçekliğinizi yazılı olarak sabitleyin."
    ],
    scenario: "İş arkadaşınızın borç aldığı parayı 'Ben sana onu ödedim, unutmuşsun' demesine karşı 'Hayır ödemedin, bak dekont nerede?' diye paniklemek yerine sakin kalın: 'Para hesabıma geçmedi. Ödediysen dekontunu at, yoksa ödemeyi bekliyorum.' diyerek konuyu kapatın."
  },
  {
    id: "rhetoric-verbal",
    title: "Retorik & Sözel Silahlar",
    category: "rhetoric",
    categoryLabel: "Retorik & Sözel",
    description: "Konuşmada duraklama sanatı, yönlendirici sorular ve sözel dominans.",
    whatItIs: "Karşınızdakini ikna etmek veya onun argümanlarını çürütmek için dilin ritmini, tonunu ve duraksamalarını stratejik olarak kullanmaktır. Kelimelerin arkasındaki duygusal yükleri manipüle ederek kontrolü elinizde tutmanızı sağlar. Konuşurken sergilenen sakinlik ve kelimelerin seçimi, karşınızdakinin savunma mekanizmalarını felç edebilir.\n\nSÖZEL SAVAŞ DOKTRİNLERİ:\n- Yavaş Konuşma (Statü Göstergesi): Hızlı konuşmak panik ve onaylanma ihtiyacı göstergesidir. Yavaş ve tane tane konuşmak ise güç ve özgüven sinyalidir.\n- Stratejik Duraklama: Karşı tarafın sorusuna anında cevap vermemek, onun üzerinde baskı yaratır.\n- Kelimeleri Silahlaştırma: Duygusal kelimeler (örn: 'kırıldım', 'üzüldüm') yerine teknik ve soğuk terimler (örn: 'bu yaklaşım verimsiz', 'çerçeveyi ihlal ediyorsun') kullanın.",
    whatItIsNot: "Retorik laf kalabalığı yapmak, hızlı konuşmak ya da karşınızdakinin sözünü sürekli kesmek değildir. Aksine, yavaş, tane tane ve duraksayarak konuşmak retorik olarak çok daha baskındır.",
    howToApply: [
      "Duraklama Sanatı: Kritik bir cümle kurmadan önce ve kurduktan sonra 2-3 saniye sessizce bekleyin. Bu, cümlenizin ağırlığını katlar.",
      "Soruyla Yönlendirme (Sokratik Yöntem): Savunma yapmak yerine ona açık uçlu sorular sorarak onu açıklama yapmaya zorlayın (Örn: 'Bunu tam olarak hangi veriye dayanarak söylüyorsun?').",
      "Ses Tonu Kontrolü: Sesinizi asla yükseltmeyin. Aksine, tartışma hararetlendiğinde ses tonunuzu daha da alçaltın ve sakinleştirin. Bu, karşı tarafı çocuksu gösterecektir.",
      "Önkoşul Belirleme: Konuşmaya başlamadan önce kuralları siz koyun: 'Eğer sesini yükseltmeye devam edersen bu görüşmeyi sonlandıracağım.'"
    ],
    scenario: "Bir tartışma esnasında aceleyle cevap vermek yerine karşınızdakinin sözü bittikten sonra 3 saniye sessizce gözlerine bakın, ardından yavaş bir ses tonuyla: 'Bu sonuca tam olarak hangi verilere dayanarak ulaştın?' sorusunu yönelterek onu savunmaya itin."
  },
  {
    id: "body-language",
    title: "Baskın Beden Dili & Mimikler",
    category: "body",
    categoryLabel: "Beden Dili",
    description: "Güç duruşları, mikro ifade yönetimi ve 7 farklı stratejik mimik (Öfke, Smirk, Poker Face vb.) analizi.",
    whatItIs: "Kelimelerinizin gücünü fiziksel varlığınızla mühürlemektir. Beden dili, beynin en ilkel kısımlarına doğrudan statü ve tehdit sinyalleri göndererek karşınızdakinde bilinçdışı bir saygı uyandırır. Mimikler ve göz teması, zihninizin sarsılmaz gücünü dışarıya yansıtan en önemli kaldıraçlardır. Yüzünüzdeki mikro kaslar, saniyenin onda biri kadar sürede gerçek niyetinizi ifşa edebilir. Bunları kontrol etmek ve rakibinizde okumak müzakerenin seyrini belirler.",
    whatItIsNot: "Baskın beden dili kabadayı gibi yürümek, kollarını kavuşturup defansa çekilmek ya da agresif hareketler yapmak değildir. Gerçek dominans, minimum hareketle maksimum alanı kaplayan soğukkanlı duruştur.",
    howToApply: [
      "Alan Kaplama: Omuzlarınızı dik tutarak, kollarınızı ve bacaklarınızı sıkıştırmadan rahat bir duruşla oturun. Bulunduğunuz alanı sahiplenin.",
      "Göz Teması Kilidi: Karşı tarafın konuşurken göz temasını ilk kesen siz olmayın. Bakışlarınızı telaşla sağa sola veya aşağıya kaçırmayın. Güç üçgenini kullanın.",
      "Yavaş Jestler: Ani ve telaşlı el-kol hareketlerinden kaçının. Başınızı ve ellerinizi yavaşça, kontrollü şekilde hareket ettirin.",
      "Mikro İfade Kontrolü: Şok edici bilgiler karşısında göz kapaklarınızı ve ağız köşelerinizi sabit tutmayı öğrenin."
    ],
    scenario: "Toplantı odasına girdiğinizde ellerinizi önünüzde birleştirip büzülmek yerine, omuzlerinizi geriye alıp masaya kollarınızı rahatça koyun. Karşınızdakilerin gözlerinin içine doğrudan, güç üçgeni metoduyla bakarak varlığınızı hissettirin."
  },
  {
    id: "mirroring",
    title: "Manipülasyon Otopsisi (Aynalama)",
    category: "defense",
    categoryLabel: "Zihinsel Savunma",
    description: "Kurban rollerini teşhis edip aynalama yöntemiyle çökertme.",
    whatItIs: "Karşı tarafın sizi manipüle etmek veya suçlu hissettirmek için kullandığı taktikleri (duygu sömürüsü, mağdur edebiyatı, yansıtmalı özdeşim vb.) doğrudan ona yansıtarak taktiği işlevsiz kılmaktır. Karşı tarafın bilinçaltı oyunlarını deşifre edip onun önüne sermektir. Toksik insanların en büyük korkusu, kurdukları manipülatif sahnenin dışarıdan izlenen soğuk bir laboratuvar deneyi gibi ifşa edilmesidir.\n\nAYNALAMA TAKTİKLERİ:\n- Yansıtmalı Özdeşim Bozumu: Karşı taraf kendi güvensizliklerini ve hatalarını size yüklemeye çalıştığında, bunu kabul etmeyin. 'Bu senin hissin, benim değil' duruşunu koruyun.\n- Taktiksel İtiraf Talebi: Onun kurban rolünü bozmak için doğrudan amacını yüzüne vurun.",
    whatItIsNot: "Aynalama karşı tarafın yaptıklarını çocukça taklit etmek, onunla dalga geçmek veya aynı seviyede kavga etmek değildir. Onun psikolojik oyununu ona soğuk bir analizle ifşa etmektir.",
    howToApply: [
      "Rolü İfşa Etme: Karşı taraf kurban rolü oynadığında bunu soğukkanlılıkla kelimelere dökün: 'Şu an kendini mağdur göstererek odağı asıl konudan uzaklaştırıyorsun.'",
      "Tepkisiz Kalma: Onun duygu sömürüsü ve ağlama krizlerine karşı duygusal reaksiyon vermeyin, klinik mesafenizi koruyun.",
      "Rasyonel Çerçeveye Dönüş: Duygusal dalgayı yok sayıp asıl konuya odaklanın.",
      "Soruyla Yansıtma: 'Şu an beni suçlu hissettirmeye çalışarak neyi elde etmeyi amaçlıyorsun?' sorusuyla onu köşeye sıkıştırın."
    ],
    scenario: "Partnerinizin 'Beni hiç sevmiyorsun, bencilce davranıyorsun' diye ağlamasına karşı 'Hayır seviyorum, bak şunu yaptım' diye yalvarmak yerine, sakin kalıp: 'Şu an beni suçlayarak yaptığın kural ihlalini gizlemeye çalışıyorsun. Gel asıl sorunu konuşalım.' deyin."
  },
  {
    id: "love-bombing",
    title: "Aşk Bombardımanı Kalkanı",
    category: "defense",
    categoryLabel: "Zihinsel Savunma",
    description: "Aşırı ilgi patlaması ve ardından gelen değersizleştirme döngüsünü kırma.",
    whatItIs: "Önce sizi yoğun bir ilgi ve sevgi seliyle (Love Bombing) kendilerine bağımlı hale getirip, ardından aniden ilgiyi keserek (Devaluation) sizi manipüle etmeye çalışan narsisistik ve toksik kişilerin döngüsünü kırma protokolüdür. Bu döngü, sizin duygusal dengenizi bozarak sizi itaatkar bir konuma getirmeyi amaçlar.\n\nDÖNGÜNÜN EVRELERİ:\n- İdealizasyon (Love Bombing): Aşırı iltifatlar, hızlı yakınlaşma çabaları, hediyeler.\n- Değersizleştirme (Devaluation): İlginin aniden kesilmesi, soğuk davranma, ufak tefek eleştirilerle özgüveninizi sarsma.\n- Reddedilme Korkusu: Sizi kaybetme korkusuyla manipülatörün etrafında pervane olmaya başlarsınız.",
    whatItIsNot: "Aşk bombardımanı kalkanı karşı tarafın her güzel sözünü veya samimi iltifatını düşmanca karşılamak değildir. İlginin dozajındaki ve sıklığındaki tutarsızlıkları fark edip duygusal dengenizi karşı tarafa teslim etmemektir.",
    howToApply: [
      "Tempoyu Kontrol Etme: Hızlı ilerleyen ilişki adımlarını yavaşlatın. Sınırlarınızı erkenden çizin ve hayır demeyi bilin.",
      "Duygusal Çapa: Karşı taraf ilgiyi kestiğinde (geri çekildiğinde) panik yapıp peşinden koşmayın. Aynı dozda geri çekilin.",
      "İlgi Bağımsızlığı: Kendi değerinizi karşı tarafın ilgisine endekslemeyin. Kendi hayat ritminizi değiştirmeyin.",
      "Sınır Testi: Karşı tarafın geri çekilmesini sessizce gözlemleyin ve 'Neden yazmıyorsun?' gibi zayıflık mesajları atmayın."
    ],
    scenario: "Yeni tanıştığınız birinin size aşırı ilgi gösterip 2 hafta sonra aniden soğuk davranmaya başlaması durumunda, ona 'Neden değiştin?' diye mesaj atmak yerine, onun soğukluğuna aynı rasyonel soğuklukla yanıt verip hayatınıza kaldığınız yerden devam edin."
  },
  {
    id: "zero-sum",
    title: "Sıfır Toplamlı Oyun",
    category: "strategy",
    categoryLabel: "Saldırı & Strateji",
    description: "Güç mücadelelerinde taviz vermenin psikolojik maliyetini yönetme.",
    whatItIs: "Masadaki güç dengesinin tek kazananı olduğunu kabul etmektir. Sizin verdiğiniz her taviz, karşı tarafın kazandığı bir mevzidir. İlişkilerdeki güç dengesi sıfır toplamlı bir oyundur. Masada taviz vermeye başladığınız an, sınırlarınızın aşınma süreci de başlamış demektir. Karşı taraf sınırlarınızı test ettikçe daha fazlasını isteyecektir.\n\nTAVİZSİZLİK İLKELERİ:\n- Sınır Aşınması: Küçük tavizler büyük ihlallerin öncüsüdür.\n- Müzakere Gücü: Müzakerelerde en güçlü taraf, masadan kalkıp gidebilen taraftır.",
    whatItIsNot: "Sürekli kavga etmek ya da her şeye hayır demek değildir. Güç sahibi olduğunuzu hissettirerek karşı tarafın sınırlarınızı test etmesini en baştan önlemektir.",
    howToApply: [
      "Tavizsiz Sınırlar: Temel ilkelerinizden, zamanınızdan ve haklarınızdan asla ödün vermeyin.",
      "Koz Biriktirme: Karşı tarafın hatalarını ve zafiyetlerini ileride masada kullanmak üzere rasyonel bir koz olarak not edin.",
      "Masadan Kalkma Gücü: Kaybetmeyi göze alamadığınız hiçbir masada müzakereye girişmeyin. Masadan kalkabilen taraf güçlü taraftır.",
      "İlk Teklif Baskısı: Tartışmalarda veya iş anlaşmalarında ilk teklifi veya kuralı siz koyarak referans noktasını belirleyin."
    ],
    scenario: "İş yerinde ek sorumluluklar yüklenirken 'Hayır' diyebilmeniz ve sınırlarınızı çizmeniz; karşı tarafın ısrarlarına rağmen geri adım atmayarak masadaki otoritenizi korumanız."
  },
  {
    id: "counter-attack",
    title: "Karşı Saldırı Protokolü",
    category: "strategy",
    categoryLabel: "Saldırı & Strateji",
    description: "Kriz anında savunmada kalmak yerine karşı taarruza geçme.",
    whatItIs: "Karşı tarafın size saldırdığı veya sizi zayıflatmaya çalıştığı anlarda savunma yapmayı bırakıp, onun zafiyet noktalarına (travmaları, korkuları, çelişkileri) doğrudan odaklanarak taarruza geçmektir. Savunmada kalan taraf zayıf görünür ve zamanla çöker. Karşı saldırı, odağı kendinizden çekip karşı tarafın üzerine yıkmaktır.\n\nTAARRUZ TEKNİKLERİ:\n- Zafiyet Odaklanması: Karşı tarafın en hassas olduğu konuları (örn. yetersizlik hissi, kontrol kaybı korkusu) hedef almak.\n- Suçlamayı Döndürme: Onun suçlamasını onun bir zafiyeti olarak analiz edip ona sunmak.",
    whatItIsNot: "Öfkeyle saldırmak, bağırmak ya da hakaret etmek değildir. Soğukkanlılıkla, onun argümanını kendi aleyhine çeviren ve onu savunmaya iten klinik hamleler yapmaktır.",
    howToApply: [
      "Savunmayı İptal Etme: Onun suçlamasını tamamen duymazdan gelin. 'Ben suçlu değilim' açıklaması yapmayın.",
      "Odak Noktasını Değiştirme: Onun suçlamasının altındaki asıl güvensizlik veya çelişkiyi masaya yatırın.",
      "Çerçevenin Dikte Edilmesi: Konuşmayı onun kendini aklamaya çalışacağı bir mecraya sürükleyin.",
      "Son Darbe (Klinik Teşhis): Onun davranışının altındaki psikolojik zayıflığı yüzüne vurun (Örn: 'Şu an kontrolü kaybettiğin için öfkeleniyorsun')."
    ],
    scenario: "Birinin sizi 'Beni yeterince önemsemiyorsun' diye suçlamasına karşı 'Ama seni seviyorum' diye açıklama yapmak yerine, sakinlikle gözlerinin içine bakıp: 'Bu cümleyi kurarak kendi içsel güvensizliklerini ve beni kontrol etme çabanı yansıtıyorsun. Neden bu kadar güvensiz hissediyorsun?' diyerek onu savunma pozisyonuna sokun."
  },
  {
    id: "pressure-points",
    title: "Tetikleyici & Baskı Noktaları",
    category: "strategy",
    categoryLabel: "Saldırı & Strateji",
    description: "Karşı tarafın ego, yalnızlık veya değersizlik korkusu gibi zafiyetlerini bulup buralara baskı yapma.",
    whatItIs: "Her insanın zihninde geçmiş travmalarından veya güvensizliklerinden kaynaklanan hassas baskı noktaları (Psychological Triggers) vardır. Klinik strateji, bu noktaları tespit edip müzakere veya kriz anında bir kaldıraç olarak kullanmaktır. Karşı tarafın en çok neyden korktuğunu (örn: dışlanmak, yetersiz görülmek, kontrolü kaybetmek) bulduğunuzda, onu yönetebilirsiniz.",
    whatItIsNot: "İnsanları durduk yere incitmek veya sadistçe davranmak değildir. Bu noktaları sadece masada sınırlarınızı korumak ve karşı tarafın saldırılarını etkisiz hale getirmek için bir caydırıcılık unsuru olarak kullanmalısınız.",
    howToApply: [
      "Zafiyet Haritalama: Karşı tarafın geçmişte neye aşırı tepki verdiğini, hangi konularda savunmaya geçtiğini sessizce analiz edip not edin.",
      "Taktiksel Tetikleme: Sıkıştığınız anlarda bu hassas konuyu soğukkanlı bir soruyla masaya getirin.",
      "Kaldıraç Oluşturma: Karşı tarafın korkusunu onun taviz vermesini sağlayacak bir koşula bağlayın.",
      "Sessiz Baskı: Tetikleyiciyi kullandıktan sonra konuşmayın, karşı tarafın bu baskı altında ezilmesini izleyin."
    ],
    scenario: "Sürekli 'Ben buranın en iyisiyim' diye ego yapan ve projelerinizi sabote eden bir iş arkadaşınıza karşı savunma yapmak yerine, herkesin içinde sakince: 'Bu projede gösterdiğin performans, senin gibi tecrübeli birinin standartlarının altında kalmış gibi duruyor. Yolunda gitmeyen bir şeyler mi var?' diyerek onun yetersizlik korkusunu tetikleyin."
  },
  {
    id: "cognitive-dissonance",
    title: "Bilişsel Çelişki Silahı",
    category: "defense",
    categoryLabel: "Zihinsel Savunma",
    description: "Karşı tarafın inançları veya geçmiş eylemleriyle çelişen durumlar yaratarak onu zihinsel felce uğratma.",
    whatItIs: "Bilişsel Çelişki (Cognitive Dissonance), bir insanın iki çelişkili inancı veya davranışı aynı anda barındırdığında yaşadığı yoğun zihinsel rahatsızlıktır. Bu silahı kullanarak karşı tarafın geçmişte savunduğu ilkelerle şimdiki bencilce eylemleri arasındaki çelişkiyi yüzüne vurabilir ve onu kendisiyle hesaplaşmaya, dolayısıyla savunmaya geçmeye zorlayabilirsiniz.",
    whatItIsNot: "Karşı tarafa hakaret etmek ya da 'sen yalancısın' demek değildir. Sadece onun kendi sözlerini ve eylemlerini yan yana koyarak rasyonel bir ayna tutmaktır.",
    howToApply: [
      "Arşivcilik: Karşı tarafın geçmişte savunduğu değerleri, verdiği sözleri ve ilkeleri net olarak hafızanızda tutun.",
      "Tutarsızlık İfşası: Hata yaptığında, geçmişteki sözüyle şimdiki eylemini yan yana koyun (Örn: 'Dürüstlüğe önem verdiğini söylemiştin, ama şu an bu bilgiyi benden saklıyorsun').",
      "Çözüm Sunmama: Bilişsel çelişkiyi sunduktan sonra onun açıklama yapmaya ve kendini aklamaya çalışmasını izleyin, yardım etmeyin.",
      "Zihinsel Baskı: Kendi çelişkisi içinde boğulmasını sağlayarak çerçevenizi koruyun."
    ],
    scenario: "Arkadaşınızın size 'Güven en önemli şeydir' dedikten sonra arkanızdan iş çevirdiğini öğrendiniz. Ona sinirlenmek yerine sakince: 'Güvenin senin için kutsal olduğunu söylemiştin. Bu son yaptığın eylemi dürüstlük tanımının neresine sığdırıyorsun?' sorusunu sorun ve cevabı sessizce bekleyin."
  },
  {
    id: "anchoring",
    title: "Algı Çapalama",
    category: "rhetoric",
    categoryLabel: "Retorik & Sözel",
    description: "Müzakerelerde ve tartışmalarda ilk referans noktasını (çapayı) yüksek kurarak beklentileri yönetme.",
    whatItIs: "İnsan beyni karar alırken ilk aldığı bilgiye (çapaya) aşırı bağımlıdır. Algı Çapalama, masadaki ilk teklifi, kuralı veya beklentiyi aşırı yüksek (veya lehinize olacak şekilde uçta) belirleyerek, karşı tarafın zihnini bu sınıra hapsetmektir. Böylece sonraki tüm müzakereler sizin belirlediğiniz bu başlangıç noktası etrafında döner.",
    whatItIsNot: "Tamamen gerçek dışı, komik ve masayı anında dağıtacak ciddiyetsiz talepler sunmak değildir. Talebiniz yüksek olmalı ama mantıklı bir kılıfa büründürülmelidir.",
    howToApply: [
      "İlk Hamle Önceliği: Masada teklifi ilk yapan siz olun. Karşı tarafın çapa atmasına izin vermeyin.",
      "Yüksek Sınır Belirleme: Beklentinizin en az %30-40 yukarısında bir çapa atın.",
      "Taviz İllüzyonu: Sizin için önemsiz olan noktalardan yavaşça taviz vererek karşı tarafa 'kazanmış' hissi yaratın, ancak asıl çapayı koruyun.",
      "Rasyonel Gerekçelendirme: Attığınız yüksek çapayı mantıklı argümanlarla destekleyin."
    ],
    scenario: "Yeni bir iş sözleşmesinde veya maaş pazarlığında, firmanın teklif yapmasını beklemek yerine masaya oturur oturmaz piyasa standartlarının oldukça üzerinde bir rakam telaffuz edin. Firma bu rakamı düşürmeye çalışsa bile, sonuçta anlaşacağınız rakam onların kafasındaki ilk rakamdan çok daha yüksek olacaktır."
  },
  {
    id: "ego-depletion",
    title: "Benlik Çökertme (Ego Depletion)",
    category: "strategy",
    categoryLabel: "Saldırı & Strateji",
    description: "Karşı tarafı uzun detaylarla veya karar süreçleriyle yorarak iradesini ve bilişsel savunmasını çökertme.",
    whatItIs: "Ego Depletion, bir insanın irade gücünün, karar alma enerjisinin ve duygusal kontrolünün sınırlı bir kaynak olduğu gerçeğine dayanır. Bu stratejide, karşı taraf kritik müzakereden önce yorucu detaylarla, anlamsız kurallarla, uzun bekletmelerle veya sürekli önemsiz konularda seçim yapmaya zorlanarak zihinsel olarak yıpratılır. Karşılıklı reaktivite ve karar yorgunluğu zirveye ulaştığında, asıl önemli talep masaya getirilir. Bilişsel enerjisi tükenen taraf, direnç gösteremez ve teslim olur.",
    whatItIsNot: "Fiziksel işkence veya kabalık yapmak değildir. Tamamen bürokratik, ayrıntılı ve kibar görünen, ancak zihinsel işlemciyi tüketen bir süreç yönetimidir.",
    howToApply: [
      "Ayrıntı Boğması: Karşı tarafa çok miktarda teknik veri, uzun raporlar veya detaylı kurallar sunarak analiz felci (analysis paralysis) yaratın.",
      "Bekletme ve Zaman Aşımı: Müzakere saatlerini uzatın, aralarda ufak bürokratik engeller çıkararak onun zihinsel bekleyiş gerilimini artırın.",
      "Önemsiz Seçimler: Asıl konudan önce onu birçok ufak, önemsiz detay hakkında karar vermeye zorlayın ('Oda sıcaklığı nasıl olsun, kahve seçimi' vb.).",
      "Bitirici Hamle: Karşı tarafın yorgun, aç veya uykusuz olduğu anları gözlemleyerek asıl kritik teklifi yapın."
    ],
    scenario: "Önemli bir sözleşme imzalanacağı gün, karşı tarafı sabah 9'da ofise çağırıp 3 saat boyunca 'evrak eksikliği' ve 'format düzenleme' gerekçeleriyle bekleme salonunda tutun. Öğlen yemeğini atlatıp saat 14:00'te toplantıya başladığınızda, ona 120 sayfalık teknik dokümanı incelemesini söyleyin. Saat 17:30'da zihnen tükenmiş olan karşı tarafa 'Bu maddeyi de bu şekilde geçiyoruz' diyerek lehinize olan maddeleri onaylatın."
  },
  {
    id: "double-bind",
    title: "Çifte Bağ Manipülasyonu",
    category: "strategy",
    categoryLabel: "Saldırı & Strateji",
    description: "Karşı tarafa öyle iki seçenek sunmak ki, hangisini seçerse seçsin sizin belirlediğiniz çerçeveye boyun eğsin.",
    whatItIs: "Çifte Bağ (Double Bind), karşı tarafın seçeneklerini kısıtlayarak ona sahte bir özgürlük hissi (illusion of choice) vermektir. Ona sunduğunuz iki farklı seçenek de aslında sizin nihai amacınıza hizmet eder. Karşı taraf hangi seçimi yaparsa yapsın, sizin çizdiğiniz gerçeklik alanının (çerçevenin) içine girmiş ve sizin otoritenizi kabul etmiş olur.",
    whatItIsNot: "'Benim dediğimi yapacaksın' diye kaba bir şekilde dayatmak değildir. Aksine, karşı tarafa seçim hakkı varmış gibi hissettirerek onun direncini kırmak ve kendi rızasıyla tuzağa girmesini sağlamaktır.",
    howToApply: [
      "Nihai Hedef Tespiti: Ulaşmak istediğiniz nihai sonucu kesin olarak belirleyin.",
      "Sahte İkilem Oluşturma: Bu sonuca götüren iki farklı eylem planı hazırlayın.",
      "Seçim İllüzyonu Sunumu: Karşı tarafa 'Yapacak mısın, yapmayacak mısın?' diye değil, 'A seçeneğiyle mi yoksa B seçeneğiyle mi yapmak istersin?' diye sorun.",
      "Boyun Eğme Onayı: Seçim yaptığı an, eylemin kendisini (ve sizin kurallarınızı) zaten kabul etmiş olduğunu ona hatırlatın."
    ],
    scenario: "Çalışanınızın hafta sonu mesaiye kalmasını istiyorsunuz. Ona 'Cumartesi günü çalışabilir misin?' derseniz 'Hayır' diyebilir. Bunun yerine: 'Cumartesi günü ofisten mi çalışmayı tercih edersin yoksa evden mi takip edeceksin?' sorusunu sorun. Seçeneklerden hangisini seçerse seçsin, hafta sonu çalışmayı kabul etmiş olacaktır."
  },
  {
    id: "door-in-the-face",
    title: "Kademeli Taviz Tuzağı",
    category: "rhetoric",
    categoryLabel: "Retorik & Sözel",
    description: "İlk önce kabul edilmesi imkansız büyük bir taleple gelip reddedilmesini sağlamak, ardından asıl hedefi taviz gibi sunmak.",
    whatItIs: "Kapıyı Yüzüne Çarpma (Door-in-the-face) tekniği, insan psikolojisindeki karşılıklılık ilkesine (norm of reciprocity) dayanır. Birine aşırı büyük ve kabul edilmeyecek bir talep sunduğunuzda reddedilirsiniz. Ancak hemen ardından talebinizi makul bir seviyeye (asıl istediğiniz şeye) indirdiğinizde, karşı taraf sizin 'taviz verdiğinizi' düşünür ve kendisini de taviz vermek zorunda hissederek ikinci talebi kabul eder.",
    whatItIsNot: "Saçma sapan ve masayı tamamen dağıtacak ciddiyetsiz taleplerle başlamak değildir. İlk talep yüksek olmalı ama mantıklı bir argümana yaslanmalıdır.",
    howToApply: [
      "Aşırı Başlangıç: Gerçek hedefinizin 3-4 katı büyüklükte, ama gerekçelendirilebilir bir talep hazırlayın.",
      "Reddi Karşılama: Karşı tarafın bu talebi şokla reddetmesini sakinlikle izleyin.",
      "Taktiksel Geri Çekilme: Hayal kırıklığı göstermeden, 'Anlıyorum, o zaman en azından...' diyerek gerçek hedefinizi masaya koyun.",
      "Suçluluk Kaldıracı: Sizin geri adım atmanızın yarattığı suçluluk/karşılık verme hissiyle onun onay vermesini sağlayın."
    ],
    scenario: "Müşteriden 100.000 TL bütçe almak istiyorsunuz. Masaya 300.000 TL'lik premium paketle oturun. Müşteri 'Bu bizi çok aşar' dediğinde, yüzünüzü asmadan: 'Haklısınız, bütçenizi zorlamak istemem. O halde bazı özellikleri çıkartıp projeyi 100.000 TL'ye optimize edebiliriz' deyin. Müşteri bu 'iyiliğinizi' kabul edecek ve 100.000 TL'lik anlaşmayı imzalayacaktır."
  },
  {
    id: "information-asymmetry",
    title: "Bilgi Asimetrisi & Bilişsel Karartma",
    category: "strategy",
    categoryLabel: "Saldırı & Strateji",
    description: "Bilgiyi kısmi veya gecikmeli verip karşı tarafın karar alma mekanizmasını felç etme.",
    whatItIs: "Bilgi Asimetrisi (Information Asymmetry), bir tarafın diğer taraftan daha fazla veya daha kaliteli bilgiye sahip olması durumudur. Bu taktikle, elinizdeki verileri, planları veya piyasa gerçeklerini karşı tarafla paylaşmayarak onun karar alma gücünü zayıflatırsınız. Karşı taraf ne yapacağını bilemez hale gelir ve adımlarını atarken tamamen sizin yönlendirmenize muhtaç kalır. Bilgi güçtür; onu saklamak veya kademeli olarak serbest bırakmak mutlak kontrol sağlar.",
    whatItIsNot: "Yalan söylemek veya evrakta sahtecilik yapmak değildir. Sadece stratejik bilgileri paylaşmayı durdurmak, veri sızıntılarını kesmek ve karşı tarafı karanlıkta bırakmaktır.",
    howToApply: [
      "Bilgi Filtreleme: Karşı tarafa sadece onun işini yapmasına yetecek kadar bilgi verin, arka plandaki büyük resmi asla anlatmayın.",
      "Zamanlama Manipülasyonu: Kritik gelişmeleri karşı tarafa iş işten geçtikten sonra veya karar anına dakikalar kala bildirin.",
      "Tek Kaynak Olma: Karşı tarafın başka kaynaklardan bilgi almasını engelleyecek kanalları kontrol edin.",
      "Belirsizlik Yönetimi: Durumu soran karşı tarafa gizemli ve belirsiz yanıtlar vererek onun kaygı seviyesini yüksek tutun."
    ],
    scenario: "İş ortağınız şirket hisselerini satmak istiyor. Piyasadaki büyük bir devin şirketinizle ilgilendiği bilgisini ondan gizleyin. Ortaklık hisselerini normal değerinden satın almak için teklif yapın. Bilgi eksikliği yaşayan ortağınız, gelecekteki büyük yükselişten habersiz şekilde hisselerini size devredecektir."
  },
  {
    id: "psychology-intro",
    title: "Psikoloji Nedir? (Zihinsel Mimari)",
    category: "psychology",
    categoryLabel: "Klinik Psikoloji",
    description: "İnsan davranışlarının, bilinçaltı dürtülerinin ve karar alma mekanizmalarının klinik temelleri.",
    whatItIs: "Psikoloji, en ilkel dürtülerimizden en karmaşık sosyal maskelerimize kadar insan zihninin işleyişini inceleyen bilim dalıdır. Mentis doktrininde psikoloji; bir akademik kuram değil, masadaki rakibin veya karşınızdaki kişinin savunma mekanizmalarını, travmalarını ve ego savunmalarını haritalandırarak onu yönlendirme bilimidir. İnsan davranışları tesadüfi değildir; her hareket, çocukluk şemalarından, onaylanma ihtiyaçlarından ve güç arzularından beslenir. Bu mimariyi çözdüğünüzde, insanların bir sonraki adımını %95 doğrulukla öngörebilirsiniz.",
    whatItIsNot: "Psikoloji insanları sadece 'anlamak' veya onlara empati duyup acımak değildir. Mentis çerçevesinde psikoloji, karşınızdakinin zihinsel şifrelerini çözüp onu kendi gerçeklik alanınıza çekmek için kullanılan bir haritalama enstrümanıdır.",
    howToApply: [
      "Bilinçaltı Şemalarını Tespit Etme: Karşı tarafın en büyük korkusunu (yalnızlık, değersizlik, yetersizlik) bulmak için konuşmalarını analiz edin.",
      "Ego Savunmalarını Okuma: Savunmaya geçtiğinde yansıtma mı yapıyor, inkar mı ediyor, yoksa entellektüelleştiriyor mu? Teşhis koyun.",
      "İlkel Beyin (Amigdala) Tetikleyicileri: Karşı tarafın rasyonel düşünmesini engellemek için anlık stres veya belirsizlik dalgaları yaratın."
    ],
    scenario: "Bir iş görüşmesinde karşınızdaki yöneticinin sürekli kendi başarılarından bahsederek onaylanma arayışında olduğunu (narsisistik beslenme şeması) fark ettiniz. Onun bu şemasını besleyerek gardını düşürmesini sağlayın, ardından asıl taleplerinizi masaya getirip onaylatın."
  },
  {
    id: "person-psychology",
    title: "Karakter Analizi & Profilleme",
    category: "psychology",
    categoryLabel: "Karakter Analizi",
    description: "Kurgusal ve gerçek karakterlerin zihinsel şemalarını, beden dillerini ve klinik profillerini analiz etme laboratuvarı.",
    whatItIs: "Karakter Analizi ve Klinik Profilleme, kurgusal veya gerçek figürlerin davranışsal şemalarını, kişilik bozukluklarını, savunma mekanizmalarını ve beden dili kodlarını deşifre etme disiplinidir. Bu doktrin, analiz edilen karakterlerin psikolojik maskelerini indirerek onların bilinçaltı dürtülerini, ego aşırı telafilerini ve stratejik zafiyetlerini gözler önüne serer.",
    whatItIsNot: "Bu analiz sadece popüler kültür seviyesinde 'film eleştirisi' yapmak değildir; karakterlerin psikiyatrik tanı ölçütlerine (DSM-5) ve klinik beden dili metodolojilerine göre derinlemesine taranması sürecidir.",
    howToApply: [
      "Şema Teşhisi: Karakterin çocukluk travmaları veya temel inançlarından kaynaklanan temel şemalarını (örn. terk edilme, yetersizlik, megalomani) belirleyin.",
      "Beden Dili ve Baz Çizgisi: Karakterin stres altındaki ve nötr anlardaki mikro ifadelerini, çene açılarını, mekansal dominansını (postür) karşılaştırın.",
      "Müzakere & Karşı Strateji: Çözümlenen profilin zayıf halkalarını (tetikleyicilerini) saptayarak, bu tipolojideki insanlara karşı kullanılabilecek rasyonel karşı koyma metotlarını belirleyin."
    ],
    scenario: "Tyler Durden profilindeki birinin kışkırtmalarına reaksiyon göstermeyip, rasyonel mesafeyi koruyarak onun narsisistik çerçevesini çökertin."
  },
  {
    id: "halo-effect",
    title: "Halo (Hale) Etkisi & Karizma Kalkanı",
    category: "rhetoric",
    categoryLabel: "Retorik",
    description: "İlk izlenimdeki tek bir olumlu özelliğin, tüm kişilik algısını domine etmesini sağlama sanatı.",
    whatItIs: "Halo Etkisi, insanların bir kişi hakkındaki genel yargılarını, o kişinin tek bir belirgin özelliğine (örneğin fiziksel çekicilik, diksiyon, statü simgesi) bakarak şekillendirmesi eğilimidir. Masaya son derece şık, dik duruşlu ve kendinden emin girdiğinizde, insanlar sizin yetkin, güvenilir ve zeki olduğunuzu varsayarlar. Bu zihinsel kısayol, diğer tüm zafiyetlerinizi örten görünmez bir kalkandır.",
    whatItIsNot: "Halo etkisi sadece 'gösteriş yapmak' değildir; sosyal hiyerarşide beynin otomatik olarak statü atadığı görsel ve sözel kodları bilinçli olarak manipüle etmektir.",
    howToApply: [
      "Giriş Protokolü: Bir ortama girdiğiniz ilk 7 saniyede mutlak dik duruş, sakin adımlar ve güç üçgeni bakışını uygulayın.",
      "Kusursuz Görsel Kimlik: Kıyafetleriniz, aksesuarlarınız ve genel hijyeniniz statü ve özen sinyali vermelidir.",
      "İlk Cümle Ağırlığı: Konuşmaya yavaş, tok bir ses tonuyla ve duraklayarak başlayın."
    ],
    scenario: "Bir iş toplantısına girmeden önce tüm hazırlıklarınızı yapıp, odaya girdiğiniz anda herkesle tek tek ve gözlerinin içine bakarak el sıkışıp tok bir sesle selam verin. Bu durum, projedeki ufak eksikliklerinizin bile 'detay' olarak görülüp önemsenmemesini sağlayacaktır."
  },
  {
    id: "projection-defense",
    title: "Projeksiyon (Yansıtma) Kalkanı",
    category: "defense",
    categoryLabel: "Zihinsel Savunma",
    description: "Karşı tarafın kendi suçluluk ve güvensizlik hislerini sizin üzerinize yansıtmasını engelleme ve tersine çevirme.",
    whatItIs: "Yansıtma (Projection), insanların kendi içlerindeki kabul edilemez duygu, dürtü veya hataları başkalarına aitmiş gibi gösterme savunma mekanizmasıdır. Toksik bir yönetici veya partner, kendi yetersizlik hissini sizi 'beceriksizlikle' suçlayarak yansıtır. Yansıtma kalkanı, bu psikolojik projeksiyonu havada yakalayıp sahibine iade etme sanatıdır.",
    whatItIsNot: "Yansıtma kalkanı karşı tarafla 'Ben öyle değilim, sen öylesin' diye çocuksu bir tartışmaya girmek değildir. Onun yansıtmasını klinik bir teşhisle yüzüne vurup onu kendi çelişkisiyle baş başa bırakmaktır.",
    howToApply: [
      "Duygusal Bariyer: Suçlamayı kişisel olarak kabul etmeyin; bunun onun içsel bir yansıması olduğunu bilin.",
      "Klinik Teşhis Cümlesi: Kendinizi savunmak yerine sakince: 'Kendi yetersizlik kaygını şu an bana yansıtarak kendini rahatlatmaya çalışıyorsun.' deyin.",
      "Odağı Döndürme: Konuşmayı onun bu suçlamayı yapmasının altındaki asıl güvensizlik noktasına kaydırın."
    ],
    scenario: "Hata yapan bir ortağınızın sizi 'Senin yüzünden bu haldeyiz, çok dikkatsizsin' diye suçlaması karşısında kendinizi savunmak yerine: 'Şu an kendi yaptığın hatanın sorumluluğunu alamadığın için beni suçlayarak vicdanını rahatlatmaya çalışıyorsun. Gel asıl sorunu çözelim.' diyerek çerçevenizi koruyun."
  },
  {
    id: "benjamin-franklin",
    title: "Benjamin Franklin Etkisi",
    category: "strategy",
    categoryLabel: "Saldırı & Strateji",
    description: "Sizden hoşlanmayan birine ufak bir iyilik yaptırarak onun bilişsel çelişki yaşamasını ve size ısınmasını sağlama taktiği.",
    whatItIs: "İnsanlar yardım ettikleri kişileri sevmeye eğilimlidirler. Birine iyilik yaptığınızda zihniniz bunu 'Ona yardım ettim, demek ki onu seviyorum' şeklinde rasyonalize eder. Benjamin Franklin etkisi, sizden hoşlanmayan veya rakibiniz olan birinden ufak, reddedemeyeceği bir iyilik (örneğin bir kitap ödünç istemek, kısa bir konuda tavsiye almak) talep ederek onun zihninde bilişsel çelişki yaratmak ve size karşı olan gardını kırmaktır.",
    whatItIsNot: "Karşı tarafa yaranmaya çalışmak, dalkavukluk yapmak veya sizden büyük tavizler vermesini istemek değildir. Talep son derece ufak ve onun egosunu okşayacak düzeyde olmalıdır.",
    howToApply: [
      "Ufak ve Kolay Talep: Karşı tarafın vermekte zorlanmayacağı, basit bir bilgi veya ufak bir nesne (kalem, kitap vb.) talep edin.",
      "Ego Okşama: İyilik isterken onun o konudaki uzmanlığına veya bilgisine saygı duyduğunuzu hissettirin.",
      "Samimi Teşekkür: İyilikten sonra abartısız ama samimi bir teşekkürle bilişsel çelişkiyi zihnine çapalayın."
    ],
    scenario: "Sizi rakip olarak gören ve her fırsatta sabote eden bir iş arkadaşınızın yanına gidip: 'Bu konuda senin çok deneyimli olduğunu biliyorum, şu raporu incelemek için bana 5 dakikalık bir tavsiye verebilir misin?' diye sorun. Bu ufak iyilik, onun size karşı olan düşmanlığını bilişsel düzeyde kıracaktır."
  },
  {
    id: "pygmalion-effect",
    title: "Pygmalion Etkisi & Beklenti Yönetimi",
    category: "strategy",
    categoryLabel: "Saldırı & Strateji",
    description: "Karşı tarafın davranışlarını, ona biçtiğiniz zihinsel rol ve beklentilerle bilinçaltı düzeyinde şekillendirme sanatı.",
    whatItIs: "Pygmalion Etkisi (Kendini Gerçekleştiren Kehanet), bir kişiye yönelik yüksek veya düşük beklentilerinizin, o kişinin performansını ve davranışlarını doğrudan etkilemesi durumudur. Klinik stratejide Pygmalion etkisi; karşınızdakine doğrudan komut vermek yerine, onun bilinçaltına 'zaten dürüst', 'zaten disiplinli' veya 'zaten sadık' olduğu rolünü çapalayarak, onun bu role uygun davranmasını sağlama manipülasyonudur. İnsanlar, kendilerine yakıştırılan saygın kimlikleri kaybetmemek için ahlaki olarak kendilerini kısıtlarlar.",
    whatItIsNot: "İnsanları naifçe övmek veya yapay dalkavukluk yapmak değildir. Amaç, karşı tarafın egosuna hitap eden bir kimlik inşa edip, onu bu kimliğin ahlaki hapishanesine kilitlemektir.",
    howToApply: [
      "Kimlik Çapalama: Hedefinize, onda görmek istediğiniz davranışı içeren bir kimlik atayın (Örn: 'Senin gibi detaylara önem veren profesyonellerle çalışmak harika').",
      "Güven Çapası: Kritik bir görev vermeden önce ona duyduğunuz mutlak güvensizliği gizleyip 'Sorumluluk bilincine güvendiğim için bu işi sana devrediyorum' deyin.",
      "Kimlik Bozulması Tehdidi: Hata yapmaya yeltendiğinde, ona biçtiğiniz kimliği kaybetme korkusunu tetikleyin.",
      "Olumlu Geribildirim Sarmalı: İstediğiniz yöndeki en ufak hareketini, biçtiğiniz rolü pekiştirecek şekilde övün."
    ],
    scenario: "Sürekli hata yapan ve teslim tarihlerini kaçıran bir çalışanınıza kızıp bağırmak yerine sakince: 'Senin gibi titiz ve zaman yönetimi yüksek bir uzmanın bu ufak detayı gözden kaçırması şaşırtıcı. Bir sonrakinde asıl kaliteni göstereceğini biliyorum.' deyin. Çalışanınız o 'titiz uzman' kimliğini kaybetmemek için bir sonraki işe aşırı özen gösterecektir."
  },
  {
    id: "reactance-shield",
    title: "Tepkisellik Zırhı & Ters Psikoloji",
    category: "defense",
    categoryLabel: "Zihinsel Savunma",
    description: "Karşı tarafın bağımsızlık ve kontrol dürtüsünü tetikleyerek onu sizin istediğiniz yönde hareket etmeye zorlama.",
    whatItIs: "Psikolojik Tepkisellik (Reactance), bir insanın özgürlüğünün veya seçeneklerinin kısıtlandığını hissettiğinde verdiği güçlü reaksiyondur. Karşı tarafın kontrol etme veya 'hayır' deme arzusunu bildiğiniz durumlarda, ona asıl istediğiniz seçeneği yasaklayarak ya da ulaşılmaz göstererek, onun tepki olarak tam da sizin istediğiniz eyleme yönelmesini sağlayabilirsiniz. İnsanlar yasak elmaya her zaman daha çok arzular.",
    whatItIsNot: "Çocukça 'bunu yapma' deyip yapmasını ummak değildir. Karşı tarafın zeka seviyesine uygun, rasyonel kılıflara bürünmüş ve onun bağımsızlık illüzyonunu koruyan karmaşık bir çerçeve yönetimidir.",
    howToApply: [
      "İçsel Direnç Analizi: Karşı tarafın otoriteye veya yönlendirmelere karşı ne kadar tepkisel olduğunu ölçün.",
      "Ulaşılamazlık İllüzyonu: Asıl istediğiniz seçeneği onun için 'zor', 'uygun değil' veya 'senin için fazla riskli' olarak sunun.",
      "Alternatif Dayatma: Onu istemediğiniz seçeneğe doğru hafifçe itin ki, tepkisel olarak sizin asıl istediğiniz yöne kaçsın.",
      "Özgürlük Onayı: Karar anında 'Tabii ki seçim senin' diyerek onun karar bağımsızlığı illüzyonunu pekiştirin."
    ],
    scenario: "İş ortağınızın yeni ve yenilikçi bir yatırım planını onaylamasını istiyorsunuz ama o sürekli her şeye muhalefet ediyor. Ona planı övmek yerine: 'Bu plan bizim için harika ama senin risk toleransını ve geleneksel yöntemlerini aşabilir, sanırım bunu pas geçmeliyiz' deyin. Ortağınız yetersiz ve korkak görünmemek için plana balıklama atlayacaktır."
  },
  {
    id: "trojan-horse",
    title: "Truva Atı & Seçici Dürüstlük",
    category: "rhetoric",
    categoryLabel: "Retorik & Sözel",
    description: "Karşı tarafın şüpheciliğini kırmak için küçük konularda aşırı dürüst davranıp, asıl büyük yönlendirmeyi gizleme.",
    whatItIs: "Seçici Dürüstlük (Selective Honesty), karşınızdaki insanın savunma duvarlarını indirmek için kullanılan stratejik bir Truva atıdır. İnsanlar kendilerine karşı dürüstçe yapılan bir itiraf veya hata kabulü karşısında duygusal olarak yumuşarlar ve karşılarındaki kişinin tamamen 'şeffaf ve zararsız' olduğunu varsayarlar. Bu taktikle, sizin için önemsiz olan bir konuda büyük bir dürüstlük veya zafiyet gösterisi yaparak karşı tarafın güvenini kazanır, ardından asıl büyük planınızı onun radarına yakalanmadan yürütürsünüz.",
    whatItIsNot: "Tüm sırlarınızı ifşa etmek veya kendinizi gerçekten tehlikeye atacak zafiyetler vermek değildir. Gösterilen dürüstlük tamamen kontrollü ve telafi edilebilir olmalıdır.",
    howToApply: [
      "Yapay Zafiyet Seçimi: Sizin için hiçbir stratejik kaybı olmayan, küçük bir hata veya kişisel kusur belirleyin.",
      "Samimi İtiraf Gösterisi: Müzakerenin başında bu hatayı kendiliğinden ve samimi bir tonla masaya getirin (Örn: 'Bu konuda geçmişte bir hata yaptım ve bunu sizinle paylaşmak istedim').",
      "Güven Köprüsü İnşası: Karşı tarafın bu itiraf karşısında gevşemesini ve size 'dürüst' etiketi yapıştırmasını bekleyin.",
      "Truva Atının Girişi: Güven tesis edildikten sonra, asıl önemli ve lehinize olan maddeleri pürüzsüzce geçirin."
    ],
    scenario: "Müşteriyle fiyat pazarlığı yaparken, projenin geçmişte ufak bir teslimat gecikmesi yaşadığını ve bu hatanın tamamen sizin yönetiminizden kaynaklandığını samimiyetle itiraf edin. Müşteri sizin bu 'dürüstlüğünüzden' o kadar etkilenecektir ki, sözleşmedeki fiyat ve ödeme koşullarını hiç sorgulamadan kabul edecektir."
  },
  {
    id: "scarcity-hook",
    title: "Kıtlık Kancası & Suni Aciliyet",
    category: "strategy",
    categoryLabel: "Saldırı & Strateji",
    description: "Zamanı, ilgiyi veya kaynakları kısıtlayarak karşı tarafı panik halinde mantıksız kararlar vermeye sürükleme.",
    whatItIs: "Kıtlık İlkesi (Scarcity Principle), insanların ulaşılamaz veya sınırlı olan kaynaklara (zaman, bilgi, fırsat) otomatik olarak daha yüksek değer biçmesi psikolojisidir. Suni aciliyet yarattığınızda karşı tarafın mantıklı düşünen bilişsel beyni (prefrontal korteks) devre dışı kalır ve kaybetme korkusuyla (FOMO) hareket eden ilkel beyni kontrolü ele alır. Bu durum onu aceleyle karar vermeye ve sizin şartlarınızı kabul etmeye zorlar.",
    whatItIsNot: "Basit ve inandırıcı olmayan 'son 5 dakika' yalanları söylemek değildir. Aciliyet rasyonel, dışsal faktörlere bağlı ve son derece inandırıcı bir hikayeyle sunulmalıdır.",
    howToApply: [
      "Kaynak Sınırlandırması: Fırsatın sadece çok kısıtlı bir süre veya sınırlı bir kontenjan için geçerli olduğunu belirtin.",
      "Dışsal Gerekçe İnşası: Sınırlandırmayı kendinizin değil, üçüncü tarafların veya piyasa koşullarının dayattığını söyleyin.",
      "Çekilme Blöfü: Karşı taraf kararsız kaldığında teklifi masadan çekmekle tehdit edin (Örn: 'Yarın başka bir portföyle görüşeceğim, bu fırsat kapanacaktır').",
      "Sessiz Zaman Sayacı: Süre sınırını koyduktan sonra sessiz kalın ve panik dalgasının onun zihnini ele geçirmesini izleyin."
    ],
    scenario: "Gayrimenkul satışı veya iş anlaşmasında, alıcıya kararsız kaldığı an: 'Bu teklif sadece bugün saat 18:00'e kadar geçerli. Yarın başka bir yatırımcı grubuyla masaya oturuyoruz ve prensipte anlaştık. Kararınızı o saate kadar iletmeniz gerekiyor.' deyin. Kaybetme korkusu yaşayan alıcı, pazarlık yapmayı bırakıp hemen imzayı atacaktır."
  },
  {
    id: "counter-gaslighting",
    title: "Karşı-Gaslighting Protokolü",
    category: "defense",
    categoryLabel: "Zihinsel Savunma",
    description: "Algı manipülasyonu yapan kişiyi kendi gerçeğiyle ve rasyonel çelişkisiyle vurup zihinsel savunmasını felç etme.",
    whatItIs: "Gaslighting manipülasyonuna uğradığınızda (örn: 'sen yanlış hatırlıyorsun', 'aşırı tepki veriyorsun'), manipülatörle gerçeğin ne olduğu konusunda tartışmaya girmek onun tuzağına düşmektir. Karşı-Gaslighting, onun iddialarını klinik bir soğukkanlılıkla yok sayıp, odağı manipülatörün bunu yapmaktaki amacına, hafıza tutarsızlığına ve kendi çelişkilerine kaydırmaktır. Onun oyununun kurallarını reddedip onu kendi zihinsel zafiyetiyle baş başa bırakırsınız.",
    whatItIsNot: "Karşı tarafa 'Sen yalan söylüyorsun, manipülatörsün' diye bağırmak değildir. Bu reaktiflik zayıflıktır. Karşı-gaslighting tamamen sakin, klinik bir gözlemci edasıyla manipülatörü analiz etmektir.",
    howToApply: [
      "Duygusal Blokaj: Onun 'sorunlu sensin' ithamlarını içselleştirmeyi reddedin.",
      "Gerçeklik Sabitleme: Kendi hafızanızı ve kanıtlarınızı net tutun ama bunları ona ispatlamaya çalışmayın.",
      "Teşhis Pygmalion: İthamına karşı: 'Ben ne yaşadığımı biliyorum. Şu an beni suçlu hissettirerek asıl konudan kaçmaya çalışmandaki motivasyon nedir?' sorusuyla odağı ona çevirin.",
      "Etkileşimi Sonlandırma: Savunmaya veya saldırıya geçtiğinde konuşmayı orada kesin: 'Bu konuyu rasyonel bir zeminde konuşamayacağımızı görüyorum. Konuşma bitmiştir.'"
    ],
    scenario: "Ortağınızın yaptığı bir hatayı dile getirdiğinizde size: 'Sen çok alıngansın, her şeyi büyütüyorsun' dediğinde kendinizi aklamaya çalışmak yerine gözlerinin içine bakın: 'Konuyu benim alınganlığıma getirerek kendi yaptığın kural ihlalini gölgelemeye çalışıyorsun. Alınganlığımı değil, bu hatayı nasıl telafi edeceğini konuşalım.' diyerek onu köşeye sıkıştırın."
  },
  {
    id: "emotional-leverage",
    title: "Duygusal Kaldıraç & Suçluluk Çapası",
    category: "psychology",
    categoryLabel: "Klinik Psikoloji",
    description: "Karşı tarafın empati, vicdan ve toplumsal onay reflekslerini tetikleyerek onu savunmasız bırakma ve uzlaşmaya zorlama.",
    whatItIs: "İnsanlar kendilerini 'kötü', 'bencil' veya 'vefasız' hissetmekten kaçınırlar. Duygusal Kaldıraç, karşı tarafın geçmişte size yaptığı bir haksızlığı, eksikliği veya sizin ona yaptığınız büyük bir fedakarlığı zihninde canlı tutarak onda yapısal bir suçluluk duygusu (Guilt Trip) yaratmaktır. Bu suçluluk duygusu, sonraki tüm müzakerelerde sizin lehinize çalışacak gizli bir borçluluk hissi (suçluluk çapası) oluşturur.",
    whatItIsNot: "Sürekli ağlamak, sızlanmak veya mağdur edebiyatı yapmak değildir. Suçluluk duygusu sessizce, ima edilerek ve asil bir duruşla çapa olarak zihne yerleştirilmelidir.",
    howToApply: [
      "Fedakarlık Arşivi: Karşı taraf için yaptığınız fedakarlıkları veya onun size yaptığı haksızlıkları asla unutmayın ve bunları koz olarak biriktirin.",
      "Asil Mağduriyet: Haksızlığa uğradığınızda kavga etmeyin. Tam tersine olgun, sakin ve incinmiş ama dik duran bir tavır sergileyin.",
      "İma Yöntemi: Kritik müzakere anında geçmişteki o olayı çok ufak bir olguyla hatırlatarak zihnindeki borçluluk hissini tetikleyin.",
      "Borç Tahsili: Karşı taraf bu suçluluk baskısı altındayken asıl taleplerinizi masaya getirip onaylatın."
    ],
    scenario: "İş ortağınız geçmişte sizin yoğun mesaileriniz sayesinde büyük bir krizden kurtuldu. Yeni kar dağıtım masasında ortağınız size zorluk çıkardığında ona kızmak yerine sakince: 'O zor günlerde şirketi kurtarmak için ailemden ve sağlığımdan verdiğim ödünleri ikimiz de biliyoruz. Şimdi bu masada hakkaniyetli bir paylaşım beklemem en doğal hakkım.' deyin. Ortağınız vefasız görünmemek için taleplerinizi kabul edecektir."
  },
  {
    id: "mental-quarantine",
    title: "Zihinsel Karantina & Bilgi Diyeti",
    category: "defense",
    categoryLabel: "Zihinsel Savunma",
    description: "Toksik ortamlarda ve manipülatif ilişkilerde zihinsel bütünlüğü korumak için dış uyarıcıları ve duygusal beslemeleri sıfırlama.",
    whatItIs: "Zihinsel Karantina, manipülatörlerin veya toksik sosyal çevrelerin zihninize sızmasını engellemek için uygulanan acil durum izolasyon protokolüdür. İnsan beyni maruz kaldığı bilgilerin ve duyguların ortalamasını alır. Eğer sürekli manipülatif girdilere maruz kalırsanız, rasyonel muhakemeniz aşınır. Bilgi diyeti ve karantina uygulayarak, dışarıdan gelen tüm duygusal ve sosyal uyarıcıları keser, zihninizi tamamen kendi hedeflerinize ve rasyonel gerçekliğinize odaklarsınız.",
    whatItIsNot: "Depresyona girip odalara kapanmak değildir. Aksine, dış dünya ile etkileşimi minimumda (sadece fonksiyonel düzeyde) tutup, içsel gücünüzü ve odaklanmanızı zirveye çıkarma eylemidir.",
    howToApply: [
      "Girdi Filtresi: Size değersizlik, kaygı veya yetersizlik hissettiren tüm insanlarla iletişimi (dijital ve fiziksel) en alt seviyeye indirin.",
      "Duygusal Nötrleşme: Onlarla konuşmak zorunda kaldığınızda sadece teknik veriler paylaşın, kişisel hayatınızdan veya hislerinizden asla bahsetmeyin.",
      "Zaman Sınırı: Toksik ortamlarda bulunma sürenizi milisaniyelerle sınırlandırın.",
      "Zihinsel Detoks: Boş kalan zamanınızı kitap okumak, bedensel gelişim ve stratejik planlama gibi zihni güçlendiren eylemlerle doldurun."
    ],
    scenario: "İş yerinde sürekli dedikodu yapan ve enerjinizi sömüren iş arkadaşlarınızın öğle yemeği davetlerini kibarca ama kesin bir dille reddedin. Masanızda kulaklığınızı takıp sadece işinize odaklanın ve size laf attıklarında kısa, nötr ve teknik yanıtlar vererek zihinsel karantinanızı koruyun."
  },
  {
    id: "rhythmic-dominance",
    title: "Ritmik Dominans & Kelimeler Arası Sessizlik",
    category: "rhetoric",
    categoryLabel: "Retorik & Sözel",
    description: "Cümlelerin içindeki duraklama sürelerini kontrol ederek kelimelerin ağırlığını artırma ve karşı tarafın araya girmesini engelleme.",
    whatItIs: "Sözel etkileşimlerde güç, kimin daha hızlı veya daha çok konuştuğuyla değil, kimin kelimelerin ritmini kontrol ettiğiyle belirlenir. Ritmik Dominans; yavaş, tane tane ve kelimelerin arasına bilinçli boşluklar (micro-pauses) yerleştirerek konuşma sanatıdı. Hızlı konuşmak onaylanma ihtiyacı ve kaygı sinyalidir. Yavaş ve duraklayarak konuşmak ise masadaki zamanı ve alanı kendi kontrolünüze aldığınızın, karşı taraftan korkmadığınızın sözsüz ilanıdır.",
    whatItIsNot: "Uykulu, enerjisiz veya karşınızdakini sıkacak kadar hımbıl konuşmak değildir. Konuşma net, kararlı, ses tonu tok ama tempo olarak kasıtlı şekilde yavaş ve ağırdır.",
    howToApply: [
      "Hız Regülasyonu: Konuşma temponuzu normal hızınızın en az yarısına indirin.",
      "Mikro-Duraklamalar: Her önemli cümleden önce ve sonra 1.5 - 2 saniye bekleyin. Bu, cümlenin muhatabın zihnindeki ağırlığını artırır.",
      "Bölünmezlik Çerçevesi: Konuşurken karşı taraf sözünüzü kesmeye çalışırsa sesinizi yükseltmeyin; temponuzu hiç bozmadan konuşmaya yavaşça devam edin. Sözünüzü kesen taraf reaktif ve kaba görünecektir.",
      "Nefes Kontrolü: Cümlelerinizi nefes nefese kurmayın. Göğüs nefesi yerine diyafram nefesi kullanarak sesinizin tınısını kalınlaştırın."
    ],
    scenario: "Önemli bir sunumda veya tartışmada, heyecanla hızlı hızlı anlatmak yerine, her slayt geçişinde veya önemli iddiadan sonra 2 saniye durup doğrudan dinleyicilerin gözlerinin içine bakın, ardından tok ve yavaş bir sesle: 'Bu strateji, bizim için tek seçenek.' diyerek sözel dominansınızı kurun."
  },
  {
    id: "pupil-autonomic",
    title: "Göz Bebekleri & Otonom Kaçaklar",
    category: "body",
    categoryLabel: "Beden Dili",
    description: "Göz bebeklerinin büyüme/küçülme hızını, göz kırpma refleksini ve otonom sinir sistemi sızıntılarını tarama.",
    whatItIs: "Otonom Sinir Sistemi (ANS), bir insan yalan söylerken, stres altındayken veya heyecanlandığında kontrol edemediği fiziksel tepkileri yönetir. Bu tepkilerin en önemlisi göz bebekleridir (pupil dilation). Beyin yalan söylediğinde veya tehlike hissettiğinde adrenalin salgılar ve göz bebekleri anlık olarak genişler (dilation). Aynı şekilde, göz kırpma sıklığı (normalde dakikada 15-20 iken) stres altında 40-50'ye kadar çıkabilir veya aşırı bilişsel odaklanma anında (Poker Face) 5-6'ya kadar düşebilir. Bu otonom kaçakları okumak, karşınızdakinin zihinsel durumunu doğrudan taramanızı sağlar.\n\nGÖZ ERİŞİM İPUÇLARI (NLP EYE ACCESSING CUES) REHBERİ:\nKarşı tarafın göz hareketlerini izlerken (gözlemcinin bakış açısına göre - ayna simetrisi):\n- Sol Üste Bakış (Up-Left): Kurgusal Görsel Tasarım. Zihin o anda daha önce görmediği bir görüntüyü tasarlıyor (örn: yalan kurgularken).\n- Sağ Üste Bakış (Up-Right): Görsel Hatırlama. Zihin geçmişteki gerçek bir anıyı/görüntüyü geri çağırıyor.\n- Sol Yana Bakış (Lateral-Left): Kurgusal Ses Tasarımı. Olmayan bir sesi veya yalan bir sözel ifadeyi kurguluyor.\n- Sağ Yana Bakış (Lateral-Right): İşitsel Hatırlama. Geçmişte duyulmuş gerçek bir sesi veya sözü hatırlıyor.\n- Sol Alta Bakış (Down-Left): Dokunsal/Duygusal Hisler. Fiziksel hisleri veya derin duyguları deneyimliyor.\n- Sağ Alta Bakış (Down-Right): İçsel Diyalog. Karşı tarafın kendi kendine konuşması, mantıksal hesap yapması ve iç sesiyle tartışması.",
    whatItIsNot: "Kuru bir göz kırpma sayımı veya sadece gözlere odaklanıp genel tabloyo kaçırmak değildir. Otonom kaçaklar, beden dili baz hattı (baseline) okumasıyla doğrulanmalıdır.",
    howToApply: [
      "Baz Hattı Saptama: Görüşmenin başında, havadan sudan konuşurken karşı tarafın normal göz kırpma sıklığını ve göz teması süresini kaydedin.",
      "Kritik Soru Anı: Asıl soruyu sorduğunuzda, göz kapaklarının titremesini (eyelid flutter), yutkunma sıklığının artmasını ve şah damarındaki (carotid artery) nabız atışının hızlanmasını izleyin.",
      "Pupil Genişlemesi Gözlemi: Işık seviyesi değişmediği halde, sorunuza yanıt verirken göz bebeklerinin aniden büyümesi zihinsel yükün (yalan veya heyecan) arttığının kanıtıdır.",
      "Mikro-Kaçış Analizi: Gözlerin sol-aşağı (kurgu) veya sağ-yukarı (hatırlama) yönüne hızlıca kaçışını otonom bir tepki olarak not edin."
    ],
    scenario: "İş ortağınıza bütçe harcamalarındaki açığı sordunuz. 'Her şey yolunda, evrakları hazırlıyorum' derken göz kırpma hızının saniyede 3-4 katına çıktığını, boğazının istemsizce yutkunduğunu ve göz bebeklerinin büyüdüğünü fark ettiniz. Yalan söylediğini teşhis edip, kanıtları isteyene kadar baskıyı sürdürün.",
    image: "/pupil_autonomic.png",
    images: ["/pupil_autonomic.png", "/eye_directions.png"]
  },
  {
    id: "spatial-dominance",
    title: "Mekansal Dominans & Bölge İstilası",
    category: "body",
    categoryLabel: "Beden Dili",
    description: "Sosyal ortamlarda kapladığınız fiziksel alanı büyüterek veya karşı tarafın alanına mikro müdahalelerle hiyerarşik üstünlük dikte etme.",
    whatItIs: "Hayvanlar aleminde olduğu gibi, insan hiyerarşisinde de dominans fiziksel alanla doğrudan ilişkilidir. Mekansal Dominans (Spatial Dominance), vücudunuzu sıkıştırmadan, kollarınızı ve bacaklarınızı genişleterek oturduğunuz odayı veya masayı psikolojik olarak 'sahiplenme' eylemidir. Karşı tarafın alanına (kişisel bölgesine) elinizi koyarak, eşyalarınızı onun masasına yayarak veya mikro düzeyde ona yaklaşarak yapacağınız 'Bölge İstilası' (Territorial Invasion), rakibin bilinçaltına onun alt kademede olduğunu dikte eder ve onda stres hormonu salgılatır.",
    whatItIsNot: "Kaba, hırçın davranmak veya fiziksel olarak birini rahatsız edecek düzeyde tacizkar olmak değildir. Tamamen şık, doğal ve kendinden emin görünen bir alan yönetimidir.",
    howToApply: [
      "Alan Genişletme: Toplantı masasında dirseklerinizi sandalyenizin dışına koyun, evraklarınızı veya telefonunuzu masada geniş bir alana yayın.",
      "Açık Duruş Protokolü: Kollarınızı göğsünüzde birleştirip defansif moda geçmeyin (kapanma). Göğüs kafesiniz açık, omuzlarınız dik olsun.",
      "Taktiksel Eşya Çapalama: Kendi bardağınızı veya kaleminizi, karşı tarafın kişisel alan sınırının (yaklaşık 45 cm) hemen üzerine yerleştirerek onun bölgesine sözsüz bir sınır çizgisi çekin.",
      "Yavaş Mekansal Hareketler: Sandalyenize yaslanırken veya doğrulurken ani hareketlerden kaçının. Hareketleriniz yavaş, kararlı ve asil olsun."
    ],
    scenario: "Bir pazarlık toplantısında rakip firmanın temsilcisi sizi köşeye sıkıştırmaya çalışıyor. Kollarınızı bağlayıp büzülmek yerine, arkanıza yaslanıp kollarınızı sandalyenin kollarına rahatça yerleştirin. Konuşurken kendi kaleminizi masanın tam ortasına, onun tarafına yakın olacak şekilde yerleştirerek mekansal olarak masayı yönettiğinizi sözsüz şekilde gösterin.",
    image: "/spatial_dominance.png"
  },
  {
    id: "micro-expression",
    title: "Mikro-İfade Deşifresi & Yüz Kas Taraması",
    category: "body",
    categoryLabel: "Beden Dili",
    description: "Saniyenin 25'te biri süren mikro ifadeleri (gizlenen korku, tiksinti, öfke) yüz kasları üzerinden teşhis etme kılavuzu.",
    whatItIs: "İnsanlar hissettikleri gerçek duyguları (korku, öfke, küçümseme, şüphe, tiksinti) sosyal maskeler ardına saklamaya çalışırlar. Ancak bilinçaltı, saniyenin 25'te biri kadar süren ve kontrol edilemeyen anlık yüz kasılmalarıyla (mikro ifadeler) gerçeği dışarıya sızdırır. Mikro-İfade Deşifresi, özellikle ağız kenarlarının asimetrik kasılmasını (küçümseme), üst göz kapaklarının anlık gerilmesini (korku) veya kaşların birbirine yaklaşmasını (öfke) yakalayarak, rakibin maskesinin arkasını görmenizi sağlar.",
    whatItIsNot: "Yüzdeki sıradan mimikleri uzun uzun izlemek değildir. Mikro ifadeler anlıktır ve saniyenin onda biri kadar bir sürede belirip kaybolur; yakalamak yüksek odaklanma gerektirir.",
    howToApply: [
      "Mikro-Küçümseme Yakalama: Karşı taraf sizin teklifinizi dinlerken dudak kenarlarından sadece birinin hafifçe yukarı çekilmesi (asimetrik smirk), size ve teklifinize saygı duymadığının veya sizi hafife aldığının anlık sızıntısıdır.",
      "Mikro-Korku Taraması: Söylediğiniz kritik bir kelime sonrası, üst göz kapaklarının anlık olarak yukarı kalkıp göz akının görünmesi, onda bir panik veya suçluluk tetiklendiğinin kanıtıdır.",
      "Mikro-Öfke Teşhisi: Dudakların preslenerek incelmesi ve burun deliklerinin hafifçe açılması, karşı tarafın kontrolünü kaybetmeye başladığının sözsüz sinyalidir.",
      "Klinik Yanıt: Mikro ifadeyi yakaladığınız an konuyu derinleştirin: 'Bu maddedeki detaylar seni biraz düşündürdü sanırım, ne dersin?' diyerek onu açılmaya zorlayın."
    ],
    scenario: "Şirketten ayrılmayı planlayan ortağınıza yeni bir ortaklık planı sundunuz. Ağzıyla 'Çok güzel bir plan, beğendim' derken, ağız köşesinin milisaniyelik bir hızla tek taraflı yukarı kalktığını (küçümseme) yakaladınız. Aslında planı ciddiye almadığını ve arkadan iş çevirmeye devam ettiğini anlayıp, planı revize etmek yerine savunma protokolüne geçin.",
    image: "/micro_expression.png"
  },
  {
    id: "tactile-anchoring",
    title: "Dokunsal Çapa & Fiziksel Temas Stratejisi",
    category: "body",
    categoryLabel: "Beden Dili",
    description: "Müzakerelerde veya ikna anlarında el sıkışma derecesini, omuza dokunma mesafesini ve beden ısısı değişimlerini bir manipülasyon kaldıracı olarak kullanma.",
    whatItIs: "Fiziksel temas, insan beyninde oksitosin salgılanmasını tetikleyen ve bilinçdışı bir güven bağı oluşturan en ilkel iletişim yöntemidir. Dokunsal Çapa (Tactile Anchoring), el sıkışırken elinizin üstte kalmasıyla kurulan güç üstünlüğünü, konuşma esnasında karşı tarafın omzuna veya dirseğine yapacağınız mikro temaslarla (0.5 saniyelik hafif dokunuş) kendi çerçevenizi onaylatmayı yönetir. Bu temaslar, karşınızdakinin savunma duvarlarını (gaslighting kalkanlarını) saniyeler içinde eriterek telkine açık hale gelmesini sağlar.",
    whatItIsNot: "Karşı tarafı rahatsız edecek sıklıkta veya kaba şekilde sürekli el şakaları yapmak, dokunmak değildir. Son derece profesyonel, nadir, zamanlaması kusursuz ve statü gösteren temaslardır.",
    howToApply: [
      "Dominant El Sıkışma: El sıkışırken avuç içinizin hafifçe yere bakacak şekilde üstte kalmasını sağlayarak hiyerarşik üstünlüğü ilk saniyede kurun.",
      "Dirsek/Omuz Dokunuşu: Müzakere masasında anlaşmaya varılacak kritik kelimeyi söylerken, onun dirseğinin hemen üstüne hafifçe dokunup çekin. Bu, sözünüzün ağırlığını zihnine fiziksel olarak mühürler.",
      "Beden Isısı ve Nem Kontrolü: Tokalaşırken elinin soğuk ve nemli olması, karşı tarafın o an yoğun bir stres (adrenalin/kaç-savaş modu) altında olduğunu gösterir.",
      "Güven Çapası (Oxytocin Release): Olumlu bir diyalog anında temas kullanarak, o temas anı ile olumlu duyguyu zihninde eşleştirin (çapalayın)."
    ],
    scenario: "Bir anlaşmayı bağlamak üzeresiniz ama müşteri kararsız duruyor. Tok sesle 'Bu ortaklık ikimiz için de büyük bir zafer olacak' derken, müşterinin sağ dirseğine hafifçe ve samimi bir saygıyla 0.5 saniye dokunup çekin. Bu dokunsal çapa, müşterinin karar vermesini kolaylaştırarak imzayı atmasını sağlayacaktır.",
    image: "/tactile_anchoring.png"
  },
  {
    id: "masking-protocol",
    title: "Maskeleme Protokolü & Duygusal Ekranlama",
    category: "body",
    categoryLabel: "Beden Dili",
    description: "Mikro ve makro beden dili sinyallerini bilinçli olarak perdeleyerek, yalan veya stres anında dış dünyaya tamamen yanıltıcı bir sakinlik ve meşruiyet yansıtma sanatı.",
    whatItIs: "Maskeleme Protokolü, otonom sinir sisteminin kontrol dışı stres ve kaygı tepkilerini (mikro ifadeler, yutkunma, göz kaçırma vb.) bilinçli olarak başka bir duygu mimiğiyle örtme veya tamamen nötrleme (ekranlama) sanatıdır. Masada köşeye sıkıştığınızda veya beklenmedik bir saldırıyla karşılaştığınızda, zihninizdeki şoku dışarıya 'bilinçli bir mikro-esneme', 'hafif, doğal bir gülümseme' veya 'soğukkanlı bir kafa eğme' ile yansıtarak, karşı tarafın zafer hissini elinden alırsınız.",
    whatItIsNot: "Maskeleme yapay bir yapmacıklık veya sürekli donuk kalmak değildir. Başarılı bir maskeleme, karşı tarafın beklentilerini bozacak derecede doğal ve sosyal ritme uygun olmalıdır.",
    howToApply: [
      "Nefes ve Nabız Regülasyonu: Stres anında diyafram nefesine geçerek ses tonunun çatallaşmasını veya incelmesini engelleyin.",
      "Karşıt Mimik Yerleştirme: Mikro-korku veya şüphe hissettiğiniz an, ağız kaslarınızı serbest bırakıp çok hafif ve simetrik bir memnuniyet ifadesi (gülümseme) takının.",
      "Zoraki Olmayan Göz Teması: Bakışları kaçırma refleksini bastırın; göz kırpma hızınızı bilinçli olarak yavaşlatıp doğrudan rakibin göz bebeklerine odaklanın.",
      "Mikro-Eylemsizlik: Ellerinizi veya ayaklarınızı sallama gibi ritmik stres boşaltma hareketlerini tamamen dondurun."
    ],
    scenario: "Müzakere esnasında en büyük zafiyetiniz veya gizli bir mali açığınız ortaya döküldü. Paniklemek veya savunmaya geçmek yerine, yavaşça geriye yaslanın, yüzünüze hafif ve kendinden emin bir tebessüm yerleştirip: 'Bu detayların masaya gelmesi güzel, her şeyi şeffafça konuşalım.' diyerek şoku maskeleyin.",
    image: "/masking_protocol.png"
  },
  {
    id: "mirror-neuron",
    title: "Ayna Nöron Manipülasyonu & Uyum Senkronizasyonu",
    category: "psychology",
    categoryLabel: "Klinik Psikoloji",
    description: "Karşı tarafın beyindeki ayna nöronlarını tetikleyerek, onun sizinle bilinç dışı bir uyum (rapport) ve benzerlik hissetmesini sağlama, jest ve mimiklerini sizin ritminize senkronize etme sanatı.",
    whatItIs: "Ayna Nöron Manipülasyonu, insanların kendilerine benzeyen ve kendi hareket ritimlerine uyum sağlayan kişilere karşı duydukları bilinç dışı güven refleksini sömürmektir. Karşı tarafın oturma duruşunu, konuşma hızını, nefes ritmini ve el hareketlerini (10-15 saniyelik bir gecikmeyle) çok ince bir şekilde taklit ederek (aynalayarak) onun beyninde 'benim gibi biri, ona güvenebilirim' sinyalini uyandırırsınız. Uyum sağlandıktan sonra, hareketlerinizi değiştirerek (ritmi siz belirleyerek) onu kendi ritminize çekersiniz.",
    whatItIsNot: "Bu taktik karşı tarafın her hareketini anında ve karikatürize bir şekilde birebir taklit etmek değildir. Bu durum fark edildiği an derin bir antipati ve güvensizlik yaratır.",
    howToApply: [
      "Gecikmeli Senkronizasyon: Karşı taraf elini çenesine götürdüğünde, hemen değil, 10-12 saniye sonra benzer ama kendinize özgü bir hareketle elinizi çene veya boyun bölgenize götürün.",
      "Vokal Aynalama: Konuşma temposunu, ses tonunun yüksekliğini ve kelime seçimlerini (örn. kullandığı teknik terimler veya metaforlar) onun ritmine uydurun.",
      "Nefes Senkronizasyonu: Karşınızdaki kişinin göğüs hareketlerini izleyerek nefes alış-veriş ritminizi onunkiyle eşitleyin; bu, bilinçdışı uyumu maksimuma çıkarır.",
      "Liderlik Testi: Yaklaşık 5-10 dakikalık aynalamadan sonra, duruşunuzu değiştirin (örn: arkanıza yaslanın veya bardağınızı alın). Eğer o da sizi taklit ediyorsa, uyum senkronizasyonu tamamlanmış ve liderlik size geçmiştir."
    ],
    scenario: "Sizi oldukça mesafeli karşılayan soğuk bir yatırımcı ile görüşüyorsunuz. Onun gergin ve dik oturma pozisyonunu ve yavaş konuşma ritmini gecikmeli olarak aynalayın. 10 dakika sonra sakince arkanıza yaslanıp rahat bir nefes alın. Yatırımcının da gevşeyip arkasına yaslandığını ve ses tonunun yumuşadığını fark edeceksiniz. Artık masayı siz yönetiyorsunuz.",
    image: "/mirror_neuron.png"
  },
  {
    id: "vertical-split",
    title: "Dikey Bölünme (Kutuplaştırma)",
    category: "strategy",
    categoryLabel: "Saldırı & Strateji",
    description: "Hedef kitleyi veya rakip grubu iki karşıt kutba bölerek güçlerini zayıflatma ve onları yönetme stratejisi.",
    whatItIs: "Dikey Bölünme (Vertical Split), karşınızdaki rakip koalisyonu veya karar vericiler grubunu ortak paydalarından koparıp birbirine düşman iki kutba ayırma sanatıdır. Güç birliği yapan taraflar tek başlarına zayıftır ancak birleştiklerinde sizin çerçevenizi tehdit ederler. Bu doktrin, onların arasına ideolojik, finansal veya kişisel şüphe tohumları ekerek, dikkatlerini sizin üzerinizden çekip birbirlerine yöneltmelerini sağlar. Bölünen gruplar kendi iç savaşlarıyla meşgulken, siz masanın mutlak hakimi haline gelirsiniz.",
    whatItIsNot: "Basit ve dedikodu seviyesinde çocukçe ara bozmak değildir. Stratejik ve yapısal olarak, grupların temel çıkar çatışmalarını veya güvensizliklerini tespit edip bunları sistematik olarak tetikleme eylemidir.",
    howToApply: [
      "Çıkar Çatışması Analizi: Hedef gruptaki aktörlerin birbirine güvenmeyen yönlerini ve gizli rekabet alanlarını saptayın.",
      "Kademeli Bilgi Sızdırma: Bir tarafa, diğer tarafın onun arkasından iş çevirdiğine dair kısmi ve teyit edilemeyen ancak şüphe uyandıran bilgiler ulaştırın.",
      "Asimetrik Ayrıcalık Sağlama: Masadaki taraflardan birine diğerinin haberi olmadan ufak ayrıcalıklar sunarak aralarında kıskançlık ve güvensizlik yaratın.",
      "Kutuplaştırıcı Retorik: Konuşmalarda tarafların ayrışan görüşlerini sürekli vurgulayın ve onları taraf seçmeye zorlayın."
    ],
    scenario: "Projenizde size karşı birleşen iki departman yöneticisinin ittifakını kırmak için, yöneticilerden birine özel bir e-posta atıp onun fikrine çok değer verdiğinizi belirterek projenin bütçe yönetim yetkisini sadece ona vermeyi teklif edin. Diğer yönetici bunu öğrendiğinde ittifak çökecek ve ikisi de birbirini suçlamaya başlayacaktır."
  },
  {
    id: "cross-siege",
    title: "Kademeli Çapraz Kuşatma",
    category: "strategy",
    categoryLabel: "Saldırı & Strateji",
    description: "Masada rakibi tek bir argümandan değil, eş zamanlı 3 farklı kaynaktan gelen baskıyla kıskaca alma stratejisi.",
    whatItIs: "Çapraz Kuşatma, rakibin bilişsel savunmasını felç etmek için onu tek bir cepheden değil, eş zamanlı olarak farklı açılardan (örn. finansal baskı, zaman kıtlığı ve itibar riski) baskı altında tutmaktır. İnsan zihni tek bir tehdide karşı güçlü savunma kalkanları kurabilir; ancak tehditler eş zamanlı olarak farklı katmanlardan geldiğinde bilişsel işlemci aşırı yüklenir (ego depletion) ve savunma sistemi çöker. Bu strateji rakibi hızlı taviz vermeye ve teslim olmaya zorlar.",
    whatItIsNot: "Bağırıp çağırarak veya agresif tehditler savurarak kaba bir baskı uygulamak değildir. Rakibin zayıf noktalarını farklı açılardan sakin ve sistematik olarak kuşatma eylemidir.",
    howToApply: [
      "Kuşatma Odaklarını Belirleme: Rakibin en duyarlı olduğu 3 alanı seçin (örn. bütçe limiti, teslim tarihi ve yönetim kurulundaki prestiji).",
      "Eş Zamanlı Tetikleme: Bu üç alandaki krizleri aynı gün veya aynı toplantıda masaya getirin.",
      "Çapraz Telkin: Bir sorunun çözümünü diğer sorun üzerinden tavize bağlayarak onu kıskaçta tutun.",
      "Çıkış İllüzyonu Sunumu: Ona tek bir çıkış yolu sunun; bu çıkış yolu sizin asıl nihai hedefinizi içeriyor olmalıdır."
    ],
    scenario: "Bir yazılım tedarikçisiyle pazarlık yaparken, aynı anda teslimat gecikmesi cezalarını hatırlatın, rakip firmanın daha ucuz fiyat verdiğini fısıldayın ve yönetim kurulunun bu projeyi iptal etme aşamasında olduğunu söyleyin. Üç taraftan kuşatılan tedarikçi fiyatı hemen indirecektir."
  },
  {
    id: "illusion-bridge",
    title: "Yanılsama Köprüsü (Rehavet Tuzağı)",
    category: "strategy",
    categoryLabel: "Saldırı & Strateji",
    description: "Rakibe zafer kazandığını hissettirerek onun rehavete kapılmasını sağlama ve asıl hamleyi hazırlama sanatı.",
    whatItIs: "Yanılsama Köprüsü, rakibin şüpheci savunma duvarlarını indirmek için ona masada küçük veya önemsiz zaferler hediye etmektir. İnsanlar kazandıklarını düşündüklerinde amigdalaları gevşer, dopamin seviyeleri yükselir ve dikkatleri dağılır. Rakibinize 'kazanıyorum' hissini verdiğiniz an, onun zihinsel gardı tamamen düşer. Bu rehavet anında, onun ruhu bile duymadan asıl büyük ve stratejik hamlenizi gerçekleştirirsiniz.",
    whatItIsNot: "Kendi temel çıkarlarınızdan veya kırmızı çizgilerinizden büyük tavizler vererek gerçekten masada kaybetmek değildir. Verilen zafer sadece kontrollü bir illüzyondur.",
    howToApply: [
      "Yapay Hedef Tanımlama: Rakibin çok önemser göründüğü ama sizin için stratejik değeri olmayan bir konuyu tespit edin.",
      "Zorlu Mücadele İllüzyonu: O konuyu hemen teslim etmeyin; sertçe mücadele ediyor gibi görünün ki rakibiniz kazandığında zaferin gerçek olduğuna inansın.",
      "Taktiksel Geri Çekilme: Mücadelenin sonunda teslim bayrağını çekip o önemsiz konuyu ona bırakın.",
      "Asıl Hamlenin İcrası: Rakip zafer sarhoşluğu içindeyken, sessizce asıl stratejik sözleşme maddesini veya kararı onaylatın."
    ],
    scenario: "Müşteriyle fiyat pazarlığında, projenin tasarım detayları üzerinde saatlerce tartışıp en sonunda 'Peki, sizin dediğiniz renk şeması olsun, büyük taviz verdik' diyerek pes edin. Müşteri bu 'zaferle' mutlu olmuşken, projenin bakım ücretlerini yıllık %30 artıran maddeyi sessizce imzalatın."
  },
  {
    id: "boundary-shifting",
    title: "Sınır Kaydırma (Mikro-Dayatma)",
    category: "strategy",
    categoryLabel: "Saldırı & Strateji",
    description: "Kabul edilen sınırları zaman içinde mikroskobik düzeyde esneterek, başlangıçta reddedilecek şartları kademeli olarak kabul ettirme.",
    whatItIs: "Sınır Kaydırma, karşınızdaki kişinin sınır bilincini aşındırmak için tasarlanmış sinsi bir ikna metodudur. Bir insana en başta büyük bir sınır ihlali veya ağır bir şart dayatırsanız, güçlü bir savunma reaksiyonu (reactance) ile karşılaşırsınız. Ancak sınırları milimetrik adımlarla, fark edilmeyecek kadar küçük ve tolere edilebilir taleplerle kaydırırsanız, karşı tarafın adaptasyon mekanizması devreye girer. Zamanla, başlangıçta 'kesinlikle hayır' diyeceği noktaya kendi rızasıyla gelmiş olur.",
    whatItIsNot: "Karşı tarafa açıkça saldırmak veya sınırları hoyratça çiğnemek değildir. Tamamen kademeli ve fark edilmeyen bir mikroskobik aşındırma sürecidir.",
    howToApply: [
      "İlk Kabul Edilebilir Adım: Karşı tarafın sınırını çok hafifçe aşan, itiraz edilmeyecek kadar küçük bir talepte bulunun.",
      "Normalleştirme Süreci: Bu yeni durumu bir süre sürdürerek karşı tarafın zihninde 'yeni normal' haline gelmesini sağlayın.",
      "Bir Sonraki Milimetre: Sınırı bir adım daha kaydırın ve yine sessizce normalleştirin.",
      "Kümülatif Sonuç: Süreç sonunda, ilk başta asla kabul etmeyeceği büyük sınırı tamamen ortadan kaldırmış olursunuz."
    ],
    scenario: "Çalışanınızın mesai saatleri dışında çalışmasını istiyorsunuz. İlk hafta akşam saat 19:00'da sadece 1 dakikalık acil bir soru sorun. İkinci hafta 19:30'da kısa bir e-posta atın. Üçüncü hafta 20:00'de ufak bir analiz isteyin. Birkaç ay sonra çalışanınız akşam saatlerinde çalışmayı kendi rutin görevi olarak kabul edecektir."
  },
  {
    id: "catalyst-sacrifice",
    title: "Katalizör Kurban (Taktiksel Feda)",
    category: "strategy",
    categoryLabel: "Saldırı & Strateji",
    description: "Büyük bir kazanım elde etmek amacıyla geçici ve kontrol edilebilir küçük bir kayıp veya kriz yaratma.",
    whatItIs: "Katalizör Kurban, satrançtaki vezir veya piyon fedası mantığına dayanan üst düzey bir stratejidir. Masadaki durgunluğu bozmak, karşı tarafın niyetini öğrenmek veya kendi üzerinizdeki şüpheleri dağıtmak için bilerek ve isteyerek kendinize ait küçük bir kaleyi veya projeyi feda edersiniz. Bu feda, karşı tarafta zafer illüzyonu veya suçluluk duygusu yaratırken, sizin arka planda daha büyük bir gücü ve alanı ele geçirmenizi sağlayan bir katalizör işlevi görür.",
    whatItIsNot: "Kontrolsüzce zarar etmek veya aptalca hatalarla kaybetmek değildir. Kayıp tamamen hesaplanmış, limitleri çizilmiş ve daha büyük bir kazanca hizmet eden bir yatırımdır.",
    howToApply: [
      "Feda Edilecek Değerin Seçimi: Kaybı size büyük zarar vermeyecek ama karşı tarafta büyük etki yaratacak bir varlığı seçin.",
      "Kurgusal Hata Sahneleme: Bu kaybı tamamen kendi kontrolünüzde bir 'hata' veya 'şanssızlık' gibi göstererek gerçekleştirin.",
      "Mağduriyet/Borçluluk Algısı Yaratma: Bu feda sonrası karşı tarafın üzerinde ahlaki veya duygusal bir borçluluk hissi (suçluluk çapası) kurun.",
      "Büyük Kazanım Talebi: Karşı taraf bu kaybınız nedeniyle gevşediğinde veya borçlu hissettiğinde asıl hedefiniz olan büyük talebi masaya sürün."
    ],
    scenario: "İş ortağınızla yollarınızı ayırmak ve şirketin ana markasını tek başınıza almak istiyorsunuz. Şirketin alt kollarından olan ve zarar eden bir şubeyi ortağınıza 'Senin bu konudaki dehanı biliyorum, bu şube senin olsun, hak geçmesin' diyerek tamamen feda edin. Bu fedakarlığınız karşısında minnettar kalan ortağınız, ana markanın tüm haklarını size devretmeye razı olacaktır."
  },
  {
    id: "gray-rock",
    title: "Gri Kaya Metodu (Duygusal Sönümleme)",
    category: "defense",
    categoryLabel: "Zihinsel Savunma",
    description: "Toksik manipülatörlerin ilgisini ve enerjisini kesmek için tamamen sıkıcı, tepkisiz ve sıradan bir taş gibi davranma.",
    whatItIs: "Gri Kaya Metodu, özellikle narsisistik, dramadan beslenen ve manipülatif profillere karşı kullanılan en etkili zihinsel savunma duvarıdır. Bu tip insanlar sizin duygusal reaksiyonlarınızdan (öfke, üzüntü, savunma) beslenirler. Gri Kaya Metodu, onlarla iletişim kurarken yeryüzündeki sıradan bir gri kaya kadar sıkıcı, tepkisiz, tek kelimelik ve duygusuz yanıtlar vererek onların sizden alacağı duygusal besini kesmektir. Beslenemeyen manipülatör zamanla sizden sıkılır ve başka hedeflere yönelir.",
    whatItIsNot: "Karşı tarafa kaba davranmak, onunla kavga etmek veya pasif-agresif şekilde duvar örmek değildir. Amaç onu cezalandırmak değil, onun gözünde tamamen 'ilgisiz ve renksiz' görünmektir.",
    howToApply: [
      "Tek Kelimelik Yanıtlar: Manipülatörün kışkırtıcı sorularına 'Evet', 'Hayır', 'Anladım', 'Fark etmez' gibi nötr ve kısa cevaplar verin.",
      "Sıfır Kişisel Bilgi Paylaşımı: Hayatınız, duygularınız, planlarınız veya düşünceleriniz hakkında kesinlikle hiçbir detay vermeyin.",
      "Göz Temasını Nötrleme: Gözlerinizi dikip meydan okumayın veya kaçırıp korktuğunuzu göstermeyin. Boş ve ilgisiz bakın.",
      "Dramadan Kaçış: Onun anlatmaya çalıştığı dedikodulara veya krizlere 'Öyle mi?', 'Bilmem' diyerek omuz silkip geçin."
    ],
    scenario: "Eski sevgiliniz veya iş yerindeki toksik bir arkadaşınız sizi kışkırtmak için 'Duyduğuma göre yeni projede başarısız olmuşsun, yazık' dediğinde ona öfkeyle açıklama yapmak yerine sakince: 'Olabilir. Herkes çalışıyor.' deyin ve telefonunuza nötr bir şekilde bakmaya devam edin."
  },
  {
    id: "anchor-cutting",
    title: "Bilişsel Çapa Kesimi",
    category: "defense",
    categoryLabel: "Zihinsel Savunma",
    description: "Karşı tarafın geçmişe veya suçluluk duygularına dayanarak attığı tüm zihinsel çapaları radikal bir kabul ile hükümsüz kılma.",
    whatItIs: "Bilişsel Çapa Kesimi, manipülatörlerin en çok kullandığı 'geçmiş hataları hatırlatarak suçluluk hissettirme' tuzağını çökertme yöntemidir. Karşı taraf, sizin geçmişte yaptığınız bir hatayı veya verdiğiniz bir sözü masaya getirerek üzerinizde ahlaki bir baskı (suçluluk çapası) kurmaya çalışır. Çapa Kesimi, o geçmiş olayı inkar etmek veya savunmak yerine, onu tamamen ve radikal bir şekilde kabul edip 'Evet, o geçmişte kaldı, şu anki kararımı etkilemiyor' duruşuyla çapayı kökünden kesmektir.",
    whatItIsNot: "Hatalarınızı umursamazca savunup narsisistik bir küstahlık yapmak değildir. Geçmişi kabul edip, onun bugünkü rasyonel kararlarınızı manipüle etmesine izin vermeme duruşudur.",
    howToApply: [
      "Radikal Kabul: Karşı taraf geçmiş hatanızı yüzünüze vurduğunda kendinizi aklamaya çalışmayın. Sakince 'Evet, öyle bir hata yaptım' deyin.",
      "Zaman Ayrımı Çekme: Geçmişteki siz ile şimdiki siz arasındaki rasyonel sınırları çizin.",
      "Çapayı Etkisizleştirme: 'O olay benim geçmiş deneyimimdi, şu anki durumu ve masadaki koşulları değiştirmez' diyerek odağı bugüne getirin.",
      "Savunma İptali: Karşı tarafın sizi suçlu hissettirme çabası karşısında zihnen tamamen özgürleşin."
    ],
    scenario: "İş ortağınız 'İki yıl önce yaptığın o yanlış yatırım yüzünden şirketi batırıyordun, şimdi bana bu konuda itiraz edemezsin' dediğinde savunmeye geçmek yerine sakince: 'Evet, iki yıl önce o hatalı yatırımı yaptım ve dersimi aldım. Ancak bugünkü projenin koşulları tamamen farklı, o yüzden bu itirazımı rasyonel olarak değerlendirmek zorundayız' deyin."
  },
  {
    id: "semantic-shield",
    title: "Semantik Kalkan (Tanım Bariyeri)",
    category: "defense",
    categoryLabel: "Zihinsel Savunma",
    description: "Manipülatif kelimelerin ve imaların duygusal tanımlarını reddedip, onları sadece nesnel sözlük anlamlarıyla sınırlama.",
    whatItIs: "Semantik Kalkan, sözel saldırıların duygusal yükünü filtrelemek için geliştirilmiş zihinsel bir kalkandır. Manipülatörler, sizi suçlu veya eksik hissettirmek için ucu açık, duygusal yükü ağır kelimeler (örn. 'vefasız', 'bencil', 'uyumsuz') kullanırlar. Semantik Kalkan, bu kelimelerin altındaki gizli imaları reddedip, kelimeyi en kuru, teknik ve sözlük tanımına indirgeyerek karşı tarafa iade etmektir. Böylece kelimenin zihninizde yaratacağı duygusal tahribat sıfırlanır.",
    whatItIsNot: "Kelimelerle laf salatası yapmak veya dil bilgisi tartışması başlatmak değildir. Kelimelerin arkasındaki manipülatif enerjiyi nötrleme tekniğidir.",
    howToApply: [
      "Duygusal Filtreleme: Karşı taraftan gelen sıfatı (örn: bencil) kişisel bir hakaret olarak değil, sadece bir ses dalgası olarak duyun.",
      "Kavramsal Çözümleme: O kelimenin nesnel tanımını zihninizde yapın.",
      "Sözlük Anlamına İndirgeme: Karşı tarafa kelimenin en basit tanımı üzerinden yanıt verin (Örn: 'Kendi önceliklerime değer vermemi bencil olarak tanımlıyorsan, evet öyleyim').",
      "Duygusal Tepkisizlik: Onun kelimeyle yüklediği suçluluk hissini tamamen geri çevirin."
    ],
    scenario: "Bir arkadaşınız size 'Çok vefasızsın, beni hiç aramıyorsun' dediğinde suçluluk hissetmek yerine sakince: 'Eğer vefasızlık kelimesini yoğun iş tempom nedeniyle seni haftada bir yerine ayda bir aramam olarak tanımlıyorsan, bu senin tanımındır. Benim için bu sadece bir zaman yönetimi meselesi.' deyin."
  },
  {
    id: "projection-arithmetic",
    title: "Yansıtma Aritmetiği",
    category: "defense",
    categoryLabel: "Zihinsel Savunma",
    description: "Size yöneltilen haksız suçlamaları analiz edip, suçlamanın arkasındaki asıl narsisistik projeksiyonu deşifre ederek soğurma.",
    whatItIs: "Yansıtma Aritmetiği, karşınızdaki kişinin size fırlattığı psikolojik çöpleri (kony suçlulukları, güvensizlikleri, kıskançlıkları) analiz ederek zırhınızdan geri sektirme tekniğidir. Karşı taraf size bir suçlama yönelttiğinde, bunu rasyonel bir denklem olarak ele alırsınız: 'Söylenen Söz = Karşı Tarafın İçsel Zafiyeti'. Bu denklem sayesinde suçlamanın sizinle hiçbir ilgisi olmadığını anlar, onu tamamen soğurur ve manipülatörün iç dünyasını bir mikroskop altında izliyor gibi analiz edersiniz.",
    whatItIsNot: "Karşı tarafa 'Sen yansıtma yapıyorsun' diye bağırıp onunla kavga etmek değildir. Kendi zihninizde o suçlamanın duygusal zehrini sıfırlama metodudur.",
    howToApply: [
      "Kişisel Ayrışma: Suçlamayı asla üzerinize almayın. 'Bu söz bana değil, onun iç dünyasına ait' deyin.",
      "Zafiyet Teşhisi: Suçlamanın altındaki asıl korkuyu bulun (Örn: 'Beni kontrolcü olmakla suçluyor, demek ki kendisi kontrolü kaybetmekten korkuyor').",
      "Klinik Analiz Yanıtı: Suçlamayı sakinlikle dinledikten sonra, onun bu davranışı altındaki zayıflığı hafifçe yüzüne vurun.",
      "Rasyonel Koruma: İçsel dengenizi bozmadan masadaki çerçevenizi koruyun."
    ],
    scenario: "Projenizde hata yapan yöneticiniz size 'Senin yüzünden bu proje gecikti, işini hiç takip etmiyorsun' dediğinde panik yapıp kendinizi savunmak yerine içsel aritmetiği kurun: 'Hata yaptı ve suçlanmaktan korkuyor'. Sakince: 'Gecikmenin sorumluluğunu benim üzerime yıkarak stresi azaltmaya çalışmanı anlıyorum. Şimdi gelin gecikme raporunu birlikte inceleyelim' deyin."
  },
  {
    id: "silent-shield",
    title: "Sessiz Kalkan (Sönümleme)",
    category: "defense",
    categoryLabel: "Zihinsel Savunma",
    description: "Kışkırtıcı saldırılara karşı sıfır mikro ifade ve kesintisiz göz teması ile tamamen hareketsiz kalarak karşı tarafın enerjisini sönümleme.",
    whatItIs: "Sessiz Kalkan, sözel saldırılara karşı kelimelerle değil, mutlak fiziksel ve mimiksel hareketsizlik ile kurulan aşılmaz bir savunma duvarıdır. Karşı taraf sizi kışkırtmak, öfkelendirmek veya savunmaya zorlamak için sesini yükselttiğinde veya iğneleyici konuştuğunda, ona hiçbir sözel yanıt vermez, gözlerinizi kısmadan doğrudan göz bebeklerine bakar ve yüzünüzdeki tüm kasları gevşetirsiniz (Poker Face). Bu reaksiyonsuzluk, saldıran kişinin kendi öfkesinin boşlukta sönümlenmesine ve onun derin bir yetersizlik hissetmesine yol açar.",
    whatItIsNot: "Korkudan donup kalmak veya küsmek değildir. Tamamen bilinçli, göz temasıyla desteklenen, dominant ve tehditkar bir tepkisizlik duruşudur.",
    howToApply: [
      "Mutlak Hareketsizlik: Vücudunuzdaki ani kasılmaları ve stres jestlerini (titreme, el sallama) tamamen durdurun.",
      "Sıfır Mimik (Poker Face): Yüzünüzdeki kasları yerçekimine bırakın, ne kaşlarınızı çatın ne de gülümseyin.",
      "Güç Üçgeni Göz Teması: Gözlerinizi karşı tarafın göz bebeklerine kilitleyin ve o konuşurken asla bakışlarınızı kaçırmayın.",
      "Sessizlik Süresi: Konuşması bittikten sonra da en az 3-4 saniye sessizce yüzüne bakmaya devam edin, ardından soğuk bir tonda konuyu değiştirin."
    ],
    scenario: "Toplantıda bir meslektaşınız size bağırarak 'Sen bu işten ne anlarsın, projeyi mahvettin!' dediğinde ona bağırarak cevap vermek yerine Sessiz Kalkan'ı devreye sokun. 4 saniye boyunca sıfır mimikle doğrudan gözlerine bakın. O kişi yarattığı gerilimden kendi rahatsız olup ses tonunu düşürecek ve geri adım atacaktır."
  },
  {
    id: "frame-shifting",
    title: "Kavramsal Çerçeve Kaydırma",
    category: "rhetoric",
    categoryLabel: "Retorik & Sözel",
    description: "Tartışmanın zeminini oluşturan anahtar kelimeleri kendi seçtiğiniz tanımlarla değiştirerek tartışmayı baştan kazanma.",
    whatItIs: "Kavramsal Çerçeve Kaydırma (Conceptual Frame Shifting), rakibin tartışmayı kendi kurallarıyla yönetmek için seçtiği kavramları geçersiz kılıp, konuyu kendi güçlü olduğunuz entellektüel zemine çekme retoriğidir. Rakibiniz sizi kendi kelimeleriyle yargılamaya çalışırsa çerçeveyi kaybedersiniz. Bu doktrin, onun kullandığı kavramları yapı sökümüne uğratarak tartışmanın ana tanımını ve yönünü sizin lehinize yeniden kurgular.",
    whatItIsNot: "Konuyu tamamen değiştirmek veya sorulardan kaçıp alakasız şeyler konuşmak değildir. Tartışılan konuyu daha derin veya farklı bir kavramsal çerçevede yeniden tanımlamaktır.",
    howToApply: [
      "Anahtar Kavramı Tespit Etme: Rakibin argümanını kurduğu temel kelimeyi bulun (örn. 'fedakarlık', 'kurallara uyum').",
      "Kavramsal İtiraz: O kelimenin onun yüklediği anlamda değil, başka bir anlamda kullanılması gerektiğini belirtin.",
      "Yeni Çerçevenin İnşası: Tartışmayı o yeni kavram üzerinden yürütmeye başlayın.",
      "Rakibi Çerçeveye Çekme: Onu sizin belirlediğiniz yeni tanımı savunmaya veya tartışmaya zorlayın."
    ],
    scenario: "Yöneticiniz sizi 'Şirket kurallarına uymuyorsun, mesaiye kalmıyorsun' diye suçladığında 'Uymuyorum çünkü...' diye savunma yapmayın. Çerçeveyi kaydırın: 'Sorun kurallara uyum değil, sorun verimlilik. Ben mesai saatlerinde işimi tamamlayarak şirkete zaman tasarrufu sağlıyorum. Şirketin önceliği masada oturulan saat mi, yoksa üretilen çıktı mı?' sorusuyla onu yeni çerçevede tartışmaya çekin."
  },
  {
    id: "counter-interrogation",
    title: "Sorudan Soruya Kaçış",
    category: "rhetoric",
    categoryLabel: "Retorik & Sözel",
    description: "Cevap verilmesi durumunda zayıflık yaratacak sorulara, sorunun altındaki ön kabulleri sorgulayan yeni sorularla yanıt verme retoriği.",
    whatItIs: "Sorudan Soruya Kaçış (Counter-Interrogation), sizi köşeye sıkıştırmak veya zafiyetinizi ifşa etmek amacıyla sorulan manipülatif sorulara karşı uygulanan sözel bir savunma ve taarruz taktiğidir. Cevap vermek, soruyu soran kişinin yargıçlık otoritesini kabul etmektir. Bu taktikle, sorunun altındaki gizli varsayımı veya art niyeti hedef alan yeni bir soru sorarak topu anında karşı tarafa atar ve onu savunma pozisyonuna sokarsınız.",
    whatItIsNot: "Basitçe 'sen de kimsin?' demek ya da soruyu duymazdan gelmek değildir. Sorunun mantıksal zafiyetini ifşa eden akıllıca yapılandırılmış bir karşı sorudur.",
    howToApply: [
      "Ön Kabulü Teşhis Etme: Sorunun altındaki gizli yargıyı bulun (Örn: 'Bu projeyi neden batırdın?' -> ön kabul: projenin batmış olduğu).",
      "Doğrudan Yanıt Vermeyi Reddetme: Ön kabulü doğrulayacak hiçbir kelime kullanmayın.",
      "Ön Kabulü Sorgulayan Karşı Soru: 'Projenin başarısız olduğuna hangi veriye dayanarak karar verdin?' sorusuyla odağı kaydırın.",
      "Sorgulayıcı Rolünü Ele Geçirme: Karşı taraf kendi sorusunu açıklamak zorunda kalırken siz denetleyen pozisyona geçin."
    ],
    scenario: "Rakibiniz size 'Bu yeni stratejinin başarısız olacağını bile bile neden ısrar ediyorsun?' diye sorduğunda 'Başarısız olmayacak çünkü...' diye açıklamaya girişmeyin. Gözünün içine bakıp: 'Bu stratejinin başarısız olacağı ön yargısına tam olarak hangi metrikleri inceleyerek ulaştın, bunu bizimle paylaşır mısın?' sorusunu yöneltin."
  },
  {
    id: "false-choice",
    title: "Sahte Seçenek Retoriği (İkilem Tuzağı)",
    category: "rhetoric",
    categoryLabel: "Retorik & Sözel",
    description: "İki uç seçeneği tek olasılıklar gibi sunarak muhatabın rasyonel alternatifleri görmesini engelleme sanatı.",
    whatItIs: "Sahte Seçenek Retoriği (False Dilemma), muhatabı zihinsel bir kıskaca almak için ona sadece iki seçenek sunup üçüncü ve daha makul olan alternatifleri gizleme taktiğidir. İnsan zihni baskı altındayken sunulan sınırlı seçeneklerden birini seçmeye meyillidir. Bu retorik silahla, karşı tarafı 'Ya benim şartlarımı kabul edersin ya da bu projeyi kaybederiz' gibi sahte bir ikileme sokarak kendi istediğiniz seçeneği tek mantıklı çıkış yolu gibi gösterirsiniz.",
    whatItIsNot: "Gerçekten sadece iki seçeneğin olduğu durumları ifade etmek değildir. Amaç alternatif seçenekleri kasıtlı olarak gizleyerek zihinsel kontrol kurmaktır.",
    howToApply: [
      "Sahte İkilemin Yapılandırılması: Hedefinize iki uç ve dramatik seçenek sunun (biri çok kötü, diğeri sizin istediğiniz seçenek).",
      "Alternatiflerin Karartılması: Diğer tüm olası çözümleri veya ara yolları yok sayın veya imkansız olarak nitelendiren.",
      "Baskı Altında Karar Talebi: Karşı tarafı bu iki seçenek arasında hızlıca seçim yapmaya zorlayın.",
      "Uzlaşma İllüzyonu: Sizin istediğiniz seçeneği seçtiğinde ona 'akıllıca bir karar verdiğini' hissettirin."
    ],
    scenario: "Müşterinize 'Ya bu paketi satın alır ve şirketi büyütürsünüz, ya da eski sistemle kalıp rakiplerinize elenirsiniz' diyerek onu sahte bir ikileme sokun. Müşteri elenme korkusuyla paketinizi satın almaya yönelecektir."
  },
  {
    id: "irony-absorber",
    title: "İroni Amortisörü",
    category: "rhetoric",
    categoryLabel: "Retorik & Sözel",
    description: "İğneleyici ve alaycı saldırıları ciddiyetle ve kelimesi kelimesine gerçekmiş gibi kabul ederek ironinin gücünü sıfırlama.",
    whatItIs: "İroni Amortisörü, pasif-agresif insanların sıklıkla kullandığı alaycı ve iğneleyici şakaları (shit-test'leri) çökertmek için geliştirilmiş zeki bir retorik kalkandır. Bu tip insanlar size doğrudan saldıramadıkları için ironi zırhının arkasına saklanırlar. İroni Amortisörü, onların iğneleyici laflarını tamamen ciddiye alıp, sözleri kelimesi kelimesine gerçekmiş gibi kabul ederek yanıt vermektir. İronisi havada kalan manipülatörün silahı elinden alınır ve kendisi sosyal olarak tuhaf bir duruma düşer.",
    whatItIsNot: "Karşı tarafın alayına alayla karşılık vermek veya sinirlenmek değildir. Tamamen düz, ciddi ve klinik bir tonla ironiyi yok sayma eylemidir.",
    howToApply: [
      "İğneleyici Şakayı Algılama: Karşı tarafın laf sokma niyetini fark edin ama duygusal olarak reaksiyon vermeyin.",
      "İroniyi Filtreleme: Söylenen lafı tamamen düz ve gerçek bir cümleymiş gibi ele alın.",
      "Ciddiyetle Yanıt Verme: Şakayı bozacak düzeyde resmi, ciddi ve açıklayıcı bir yanıt verin.",
      "Sosyal Felç Yaratma: Karşı tarafın şakasını açıklamak zorunda kalacağı veya susacağı o tuhaf sessizlik anını izleyin."
    ],
    scenario: "Bir iş arkadaşınız toplantıda herkesin içinde alaycı bir tonla: 'Vay, harika projenle dünyayı kurtaracaksın galiba!' dediğinde sinirlenmek yerine son derece ciddi bir yüz ifadesiyle: 'Dünyayı kurtarmak gibi bir iddiam yok ancak bu projenin şirkete %20 verimlilik artışı sağlayacağını öngörüyoruz. Raporu incelemek istersen mail atabilirim.' deyin."
  },
  {
    id: "delayed-validation",
    title: "Yavaşlatılmış Doğrulama",
    category: "rhetoric",
    categoryLabel: "Retorik & Sözel",
    description: "Karşı tarafın argümanlarını hemen reddetmek yerine, önce kısmen onaylayıp ardından kendi tezinizle çürüterek savunma direncini kırma.",
    whatItIs: "Yavaşlatılmış Doğrulama (Delayed Validation), karşınızdaki kişinin psikolojik savunma duvarlarını aşmak için kullanılan bir sözel Truva atıdır. Birinin fikrine doğrudan karşı çıkarsanız, onun beyninde savunma mekanizmaları tetiklenir ve sizi dinlemeyi bırakır. Bu taktikle, önce onun argümanındaki haklı olabilecek küçük bir detayı onaylayarak gardını düşürürsünüz ('Haklısın, bu nokta önemli'). Karşı taraf anlaşıldığını düşünüp rahatladığı an, kendi asıl tezinizi getirerek onun argümanını içeriden çürütürsünüz.",
    whatItIsNot: "Karşı tarafın fikrini tamamen kabul etmek veya masada boyun eğmek değildir. Sadece sözel bir giriş stratejisidir.",
    howToApply: [
      "Kısmi Onaylama: Rakibin cümlesindeki doğru veya mantıklı görünen bir unsuru seçip 'Bu yaklaşımın çok mantıklı bir temele dayanıyor' diyerek onaylayın.",
      "Gardın Düşmesini İzleme: Onun zihnen gevşemesini ve onaylanma şemasının tatmin olmasını bekleyin.",
      "Yön Değiştirme (Ancak Köprüsü): 'Ancak bu koşullar altında...' diyerek kendi argümanınızı masaya sürün.",
      "İçeriden Çökertme: Onun onayladığı mantık silsilesi üzerinden kendi tezinizi kabul ettirin."
    ],
    scenario: "Müşterinizin 'Bu fiyat bizim bütçemizi çok aşıyor, çalışamayız' itirazına karşı 'Ama çok kaliteli iş yapıyoruz' diye tartışmayın. Önce: 'Haklısınız, bütçe sınırlarınızı korumak istemenizi çok iyi anlıyorum. Ancak bu yatırımın 3 ay içinde size getireceği yeni müşteri dönüşüm oranını hesapladığımızda, aslında bu fiyatın bütçenizi aşmadığını, aksine amorti ettiğini göreceksiniz' deyin."
  },
  {
    id: "micro-withdrawal",
    title: "Mikro-Geri Çekilme Analizi",
    category: "body",
    categoryLabel: "Beden Dili",
    description: "Karşı tarafın stresli bir bilgi veya soru karşısında geriye doğru milimetrik hareket etmesini veya omuzlarını kasmasını yakalama kılavuzu.",
    whatItIs: "Mikro-Geri Çekilme (Micro-Withdrawal), beynin tehdit veya rahatsızlık hissettiğinde vücuda verdiği istemsiz 'kaçma' komutunun fiziksel sızıntısıdır. Bir insana yalanını ortaya çıkaracak veya onu zor duruma sokacak bir soru sorduğunuzda, prefrontal korteksi ne kadar sakin görünmeye çalışırsa çalışsın, bedeni milimetrik düzeyde geriye doğru meyleder, omuzları hafifçe kulaklarına doğru yükselir (boynu koruma refleksi) veya oturduğu sandalyede arkaya doğru milimetrik bir mesafe koyar. Bu mikro kaçış hareketini yakalamak, onun zayıf noktasını ve sakladığı gerçeği anında teşhis etmenizi sağlar.",
    whatItIsNot: "Kişinin sandalyede arkesine yaslanıp rahatlaması (gelişigüzel gevşeme) değildir. Mikro-geri çekilme anidir, soruyla eş zamanlıdır ve kaslarda gerginlikle birlikte gerçekleşir.",
    howToApply: [
      "Baz Hattı Analizi: Konuşmanın başında karşı tarafın masaya olan mesafesini ve vücut açısını kaydedin.",
      "Tetikleyici Soru: Şüphelendiğiniz konudaki kritik soruyu sorun.",
      "Mesafe Değişimi Gözlemi: Sorudan hemen sonraki 1 saniye içinde gövdesinin üst kısmının geriye gidip gitmediğini, başının hafifçe geri çekilip çekilmediğini izleyin.",
      "Baskıyı Artırma: Mikro-geri çekilmeyi yakaladığınız an, o konunun üzerine giderek detaylı sorular sormaya devam edin."
    ],
    scenario: "Ortağınıza 'Şirket kasasından yapılan son harcamanın detaylarını inceledin mi?' diye sordunuz. Sözlü olarak 'Yes, inceledim, sorun yok' derken, gövdesinin masadan 5 cm kadar geriye kaydığını ve omuzlarının hafifçe kasıldığını fark ettiniz. Yalan söylediğini veya konudan rahatsız olduğunu anlayıp evrakları hemen masaya getirmesini isteyin.",
    image: "/micro_withdrawal.png"
  },
  {
    id: "dominant-barrier",
    title: "Dominant Bariyer Duruşu",
    category: "body",
    categoryLabel: "Beden Dili",
    description: "Kolların ve bacakların büzülmesi yerine, alanı kapatan ama tehditkar olmayan dominant engeller oluşturarak sınır çizme.",
    whatItIs: "Dominant Bariyer Duruşu, sosyal etkileşimlerde kendi sınırlarınızı korurken aynı zamanda yüksek statü ve özgüven sinyali iletmek için kullanılan gelişmiş bir beden dili duruşudur. Geleneksel beden dilinde kolları kavuşturmak savunmacı (defansif) ve çekingen bir hareket olarak yorumlanır. Ancak kolları göğsün üst kısmında genişçe kilitleyip, omuzları geriye çekerek ve dirsekleri dışa doğru açarak yapılan Dominant Bariyer, karşı tarafa 'Bu alan bana ait, buraya sızamazsın' sınır mesajını dominant bir şekilde dikte eder.",
    whatItIsNot: "Korkudan veya üşümekten dolayı kolları birbirine kenetleyip büzülmek, omuzları düşürmek değildir. Göğsü açık tutan, dik duruşlu ve geniş yer kaplayan bir duruştur.",
    howToApply: [
      "Geniş Açı Kurulumu: Kollarınızı göğsünüzün üst hizasında, dirseklerinizi sandalyenizin genişliğine paralel olacak şekilde dışa doğru açarak kavuşturun.",
      "Dik Çene Açısı: Başınızı öne eğmeyin; çenenizi yatayla 10-15 derece yukarıda tutarak boyun kaslarınızı gösterin.",
      "Bacak Pozisyonu: Ayaklarınızı omuz genişliğinde açarak yere sağlam basın veya otururken bacak bacak üstüne atarken dizinizi dışa doğru genişçe konumlandırın.",
      "Göz İletişimi: Duruşu sergilerken karşınızdakinin gözlerine düz ve kesintisiz bakın."
    ],
    scenario: "Müzakere masasında karşı taraf sizin üzerinizde ses tonuyla baskı kurmaya çalışıyor. Masaya doğru eğilip kendinizi savunmak yerine, arkanıza yaslanın, Dominant Bariyer Duruşunu alın ve gözlerinizi kısmadan onu dinlemeye devam edin. Bu sözsüz duruş onun baskısını saniyeler içinde etkisiz kılacaktır.",
    image: "/dominant_barrier.png"
  },
  {
    id: "blink-blocking",
    title: "Göz Kırpma Bloku (Baskılama)",
    category: "body",
    categoryLabel: "Beden Dili",
    description: "Yoğun baskı ve müzakere anlarında göz kırpma refleksini bilinçli olarak durdurarak sarsılmaz bir kararlılık ve soğukkanlılık yansıtma.",
    whatItIs: "Göz Kırpma Bloku, amigdaladan gelen stres ve panik sinyallerini dış dünyadan tamamen gizlemek için kullanılan elit bir mikro ifade kontrol yöntemidir. İnsan beyni stres, yalan veya baskı altındayken otonom olarak göz kırpma sıklığını dakikada 40-50'ye kadar çıkarır. Bu durum karşı tarafa anında 'panik ve zafiyet' mesajı iletir. Göz Kırpma Bloku, kritik soru veya teklif anlarında göz kırpma refleksini bilinçli olarak baskılayıp (dakikada 5-6 kez veya daha az), karşı tarafa sarsılmaz bir çelik irade ve zihinsel sükunet yansıtmanızı sağlar.",
    whatItIsNot: "Karşı tarafa psikopatça ve göz bebeklerini büyüterek sürekli dik dik bakmak (staring) değildir. Bakışların doğal, sakin ama tamamen hareketsiz ve kırpılmadan kalması durumudur.",
    howToApply: [
      "Göz Kaslarını Gevşetme: Göz çevrenizdeki kasları (orbicularis oculi) kasmadan gevşek bırakın.",
      "Odak Noktası Sabitleme: Bakışlarınızı rakibin göz bebeklerinden birine veya alnındaki glabella noktasına kilitleyin.",
      "Bilinçli Nefes Kontrolü: Derin diyafram nefesi alarak gözlerin kurumasını ve kırpma refleksinin tetiklenmesini engelleyin.",
      "Kritik Saniye Yönetimi: Özellikle kendi teklifinizi sunduktan sonra veya size suçlayıcı bir soru sorulduğunda 15-20 saniye boyunca hiç göz kırpmadan muhatabınızın gözlerine bakın."
    ],
    scenario: "Masada son ve en yüksek teklifinizi sundunuz: 'Bu fiyat bizim son sınırımız, kabul ediyorsanız imzaları atalım.' Bu cümleyi kurduktan sonra arkanıza yaslanın, Göz Kırpma Bloku uygulayarak hiç gözünüzü kırpmadan müşterinin gözlerine bakın. Müşteri bu sarsılmaz duruş karşısında pazarlık alanının bittiğini anlayıp kabul edecektir.",
    image: "/blink_blocking.png"
  },
  {
    id: "pacifying-gestures",
    title: "Kravat-Yaka Manipülasyonu (Yatıştırma)",
    category: "body",
    categoryLabel: "Beden Dili",
    description: "Stres ve kaygı anlarında boyun, yaka veya takılara gitme eğilimini hem kendi bedeninizde yönetme hem de karşı tarafta yakalama.",
    whatItIs: "Yatıştırıcı Jestler (Pacifying Gestures), otonom sinir sisteminin stres hormonlarını (kortizol/adrenalin) azaltmak ve kalp atışını yavaşlatmak için vücuda yaptırdığı istemsiz dokunsal hareketlerdir. En sık görülen yatıştırıcı jest, boyun bölgesine dokunmaktır. Erkekler stres altındayken kravatlarını veya yakalarını gevşetmeye çalışır (suprasternal notch bölgesini rahatlatma), kadınlar ise kolyeleriyle oynar veya boyunlarını hafifçe ovalarlar. Bu hareketler karşı tarafa 'Şu an yoğun bir stres altındayım ve kendimi sakinleştirmeye çalışıyorum' zafiyet mesajını fısıldar.",
    whatItIsNot: "Kravatın veya kolyenin sadece fiziksel olarak rahatsız etmesi sebebiyle yapılan basit ve anlık düzeltmeler değildir. Yatıştırıcı jestler, stresli bir kelime veya soru ile doğrudan zaman uyumludur.",
    howToApply: [
      "Kendi Bedenini Kilitleme: Stresli anlarda ellerinizin boyun, yaka, yüz veya saç bölgenize gitmesini bilinçli olarak engelleyin; ellerinizi masada sabit tutun.",
      "Karşı Tarafı Gözleme: Rakibe zorlu bir soru sorduğunuzda elinin doğrudan boynuna, kravatına veya kol düğmelerine gidip gitmediğini izleyin.",
      "Yatıştırma Hızını Ölçme: Hareketin sıklığı ve süresi, onun zihnindeki krizin büyüklüğünü gösterir.",
      "Taktiksel Baskı: Karşı tarafın yatıştırıcı jeste başvurduğunu gördüğünüz an, onun o zafiyet noktası üzerine gitmeye devam edin."
    ],
    scenario: "Müzakere sırasında rakibinize projedeki yasal eksiklikleri sormaya başladınız. O 'Yasal olarak hiçbir açığımız yok' derken elinin istemsizce kravatını gevşetmeye gittiğini ve boynunu ovaladığını yakaladınız. Yalan söylediğini ve yasal konuda büyük bir panik yaşadığını anlayıp yasal evrakların detaylarını hemen masaya talep edin.",
    image: "/pacifying_gestures.png"
  },
  {
    id: "open-palm-hierarchy",
    title: "Açık Avuç Hiyerarşisi",
    category: "body",
    categoryLabel: "Beden Dili",
    description: "El ayalarının yukarı veya aşağı bakma açısını kullanarak, sözel telkinlerin otoriter mi yoksa uzlaşmacı mı olduğunu dikte etme sanatı.",
    whatItIs: "Açık Avuç Hiyerarşisi, jestlerinizin alt metnindeki güç ve itaat kodlarını yöneten kritik bir beden dili doktrinidir. El ayasının yukarı bakması (Palm-Up), evrimsel olarak 'silahsızım, sana muhtacım, uzlaşmacıyım' mesajı iletir ve karşı tarafta samimiyet ama aynı zamanda daha düşük statü algısı yaratır. El ayasının aşağı bakması (Palm-Down) ise 'baskılıyorum, otorite benim, dur sınırını bil' mesajını bilinçaltına dikte eder. Bu iki açıyı konuşmanın akışına göre stratejik olarak kullanmak, sözel telkinlerininizin gücünü fiziksel olarak mühürler.",
    whatItIsNot: "Elleri rastgele sallamak veya robotik el hareketleri yapmak değildir. Söylediğiniz cümlenin rasyonel ağırlığına göre avuç içinin açısını milimetrik olarak yönetmektir.",
    howToApply: [
      "Otorite Dikte Etme (Palm-Down): Karşı tarafa bir kural, talimat veya sınır koyarken avuç içiniz yere bakacak şekilde elinizi hafifçe aşağı doğru bastırarak jest yapın.",
      "Güven ve Uzlaşma (Palm-Up): Karşı taraftan bilgi almak, onu ikna etmek veya iş birliği yapmak istediğinizde avuç içinizi yukarı bakacak şekilde açın.",
      "Hibrit Geçiş: Konuşmaya palm-up ile başlayıp (güven tesis etme), karar anında palm-down (otorite) moduna geçerek hiyerarşik kontrolü elinizde tutun.",
      "Karşı Jest Analizi: Karşı tarafın konuşurken avuç içlerinin açısını izleyerek onun masadaki statü algısını analiz edin."
    ],
    scenario: "Çalışanınıza yeni bir görev devrediyorsunuz. Güven vermek için konuşmanın başında avuç içleriniz yukarı bakacak şekilde: 'Bu projeyi senin başarabileceğini biliyorum' deyin (Palm-Up). Cümlenin sonunda elinizi ters çevirip avucunuz yere bakacak şekilde: 'Ve bu cuma gününe kadar masamda olmasını bekliyorum' diyerek otoritenizi mühürleyin (Palm-Down).",
    image: "/open_palm.png"
  },
  {
    id: "cortisol-loop",
    title: "Kortizol Döngüsü Yönetimi",
    category: "psychology",
    categoryLabel: "Klinik Psikoloji",
    description: "Rakipte kontrollü belirsizlik yaratarak onun zihnini sürekli yüksek stres (kortizol) seviyesinde tutma ve karar yetisini aşındırma.",
    whatItIs: "Kortizol Döngüsü Yönetimi, insan biyolojisindeki stres hormonu olan kortizolün karar alma mekanizmaları üzerindeki yıkıcı etkisini kullanan klinik bir manipülasyon stratejisidir. Beyin uzun süre belirsizliğe maruz kaldığında amigdala sürekli kortizol salgılatır. Yüksek kortizol seviyesi, mantıklı düşünen prefrontal korteksi felç eder; insanı kaygılı, uykusuz ve hata yapmaya açık hale verir. Bu doktrin, rakibinize veya hedefinize kademeli belirsizlik dalgaları vererek onu sürekli bu stres döngüsünde tutmayı ve sonunda onun rasyonel savunmasını çökertmeyi amaçlar.",
    whatItIsNot: "İnsanları bağırarak korkutmak veya kaba tehditlerle panik yaratmak değildir. Tamamen sessiz, gizemli ve ucu açık durumlar yaratarak kendi zihninde felaket senaryoları kurmasını sağlama sanatıdır.",
    howToApply: [
      "Ucu Açık İfadeler: Görüşmelerin sonunda 'Seninle konuşmamız gereken çok kritik bir konu var ama bunu haftaya konuşalım' gibi ucu açık gerilim hatları bırakın.",
      "İletişim Ritmini Bozma: Mesajlara veya aramalara bazen anında, bazen 24 saat sonra dönerek onun zihnindeki iletişim ritmini ve güvenliğini sabote edin.",
      "Gizemli Sessizlikler: Toplantı ortasında hiçbir şey demeden 10-15 saniye yüzüne bakın, ardından not defterinize bir şeyler yazıp konuyu değiştirin.",
      "Karar Yorgunluğu Yaratma: Stres altındayken onu hızlı kararlar vermeye zorlayarak hata katsayısını artırın."
    ],
    scenario: "İş ortağınızın sözleşme yenileme aşamasında aceleyle imza atmasını istiyorsunuz. Ona: 'Sözleşmede çok radikal değişiklikler yapmamız gerekecek, avukatım üzerinde çalışıyor, salı günü masaya yatırırız' deyip pazar ve pazartesi günleri telefonlarını açmayın. Zihnen kortizol döngüsüne giren ortağınız, salı günü masaya oturduğunda belirsizlikten kurtulmak için önüne koyduğunuz her sözleşmeyi sorgulamadan imzalayacaktır."
  },
  {
    id: "schema-conflict",
    title: "Şema Çatışması Manipülasyonu",
    category: "psychology",
    categoryLabel: "Klinik Psikoloji",
    description: "Karşı tarafın çocukluk şemalarını (örn. terk edilme vs. yetersizlik) birbiriyle çelişkiye sokarak zihinsel felce uğratma.",
    whatItIs: "Şema Çatışması Manipülasyonu, klinik psikolojideki temel inançlar ve şemalar (Schema Therapy) teorisine dayanan en derin zihinsel manipülasyon silahıdır. Her insanın çocukluk yaşantılarından getirdiği temel zafiyet şemaları vardır (örn. terk edilme korkusu, yetersizlik hissi, kusurluluk inancı). Bu strateji, hedefin zihnindeki iki farklı şemayı (örn. 'sevilme ve onaylanma arzusu' ile 'başarılı ve güçlü görünme ihtiyacı') aynı anda tetikleyerek onu içsel bir çıkmaza (bilişsel çelişki) sokmaktır. İki şema arasında sıkışan hedef rasyonel düşünme yetisini tamamen kaybeder.",
    whatItIsNot: "İnsanlara rastgele hakaret etmek veya kaba analizler yapmak değildir. Karşı tarafın çocukluktan getirdiği şematik kodları çözüp onları bir satranç ustası gibi birbirine kırdırma eylemidir.",
    howToApply: [
      "Şema Haritalama: Hedefin konuşmalarından ve zafiyet anlarından onun temel iki şemasını saptayın (örn: kusurluluk ve terk edilme).",
      "Çift Yönlü Tetikleme: Ona öyle bir durum sunun ki, bir şemasını kurtarmaya çalışırken diğer şeması tetiklensin.",
      "Duygusal Kıskaç Kurulumu: 'Bunu yaparsan başarılı olursun ama herkes seni terk eder' veya 'Burada kalırsan sevilirsin ama yetersiz bir ezik olarak kalırsın' alt metnini bilinçaltına çapalayın.",
      "Zihinsel Dağılma Analizi: Şema çatışması yaşayan hedefin savunma mekanizmalarının çökmesini izleyip masadaki çerçevenizi kabul ettirin."
    ],
    scenario: "Narsisistik yetersizlik şemasına sahip partnerinizin sizden ayrılmasını engellemek istiyorsunuz. Ona: 'Senin gibi büyük kariyer hedefleri olan birinin bu ufak ilişki dramalarıyla vakit kaybetmesi çok üzücü. Bence bu ilişkiyi yürütmek senin gibi biri için çok fazla yük' deyin. Partneriniz hem 'yetersiz' görünmemek hem de sizi 'kaybetmemek' şemaları arasında sıkışıp kalacak ve size itaat etmeye devam edecektir."
  },
  {
    id: "subliminal-anchor",
    title: "Bilinçaltı Telkin Çapası",
    category: "psychology",
    categoryLabel: "Klinik Psikoloji",
    description: "Sosyal diyaloglarda kritik kelimeleri, tonlamaları ve duygusal sembolleri tekrarlayarak hedefin bilinçaltına fikir ekme sanatı.",
    whatItIs: "Bilinçaltı Telkin Çapası (Subliminal Suggestion), karşınızdaki kişinin rasyonel bilincinin (kritik filtresinin) radarına takılmadan, onun karar alma mekanizmasını yöneten bilinçaltı katmanına fikir yerleştirme sanatıdır. Konuşma akışı içinde, asıl hedefinize hizmet eden anahtar kelimeleri veya duygusal durumları (örn: 'güven', 'risk', 'kayıp') normal cümlelerin arasına gizleyerek, ses tonunuzu hafifçe kalınlaştırarak veya mikro temaslar (dokunsal çapa) kullanarak çapalarsınız. Zamanla bu kelimeler hedefin bilinçaltında birikerek, onun sizin istediğiniz kararı 'kendi fikriymiş gibi' vermesini sağlar.",
    whatItIsNot: "Yapay hipnoz gösterileri yapmak ya da saçma sapan fısıltılarla konuşmak değildir. Tamamen doğal sosyal diyalog akışı içine kelimeleri matematiksel bir sıklıkla serpiştirme eylemidir.",
    howToApply: [
      "Hedef Fikir Belirleme: Onun zihninde uyandırmak istediğiniz duyguyu veya fikri seçin (Örn: 'anlaşma imzalamak güvenlidir').",
      "Çapa Kelime Seçimi: Konuşma boyunca sık sık ama doğal bir şekilde kullanacağınız çapaları belirleyin (örn: 'huzur', 'gelecek', 'emniyet').",
      "Tonal Vurgu ve Fiziksel Çapalama: Çapa kelimeleri söylerken ses tonunuzu hafifçe düşürün ve gözlerinin içine doğrudan bakın.",
      "Fikir Enjeksiyonu: Müzakere sonuna gelindiğinde, bu bilinçaltı çapalarını birleştirerek nihai kararı onaylatın."
    ],
    scenario: "Müşterinize bir danışmanlık paketi satmak istiyorsunuz. Sohbet boyunca iş hayatındaki 'güvenli limanlardan', 'geleceğe yatırım yapmanın huzurundan' ve 'doğru ortaklarla çalışmanın emniyetinden' bahsedip bu kelimeleri söylerken hafifçe gülümseyin. Toplantı sonunda paket teklifinizi sunduğunuzda, müşteri zihnindeki bu 'huzur ve emniyet' çapalarıyla sözleşmeyi imzalamaya çok daha istekli olacaktır."
  },
  {
    id: "narcissistic-embargo",
    title: "Narsisistik Beslenme Ambargosu",
    category: "psychology",
    categoryLabel: "Klinik Psikoloji",
    description: "Ego merkezli ve narsisistik profillerin en çok ihtiyaç duyduğu onay, övgü ve ilgiyi aniden keserek onları kontrol altına alma.",
    whatItIs: "Narsisistik Beslenme Ambargosu, egosu yüksek ve narsisistik kişilik yapısına sahip bireylere karşı uygulanan mutlak bir kontrol ve statü eşitleme doktrinidir. Bu profiller hayati bir şekilde dışarıdan gelen hayranlık, övgü, onay ve ilgiyle beslenirler. Onlara bu besini vermediğinizde veya verdikten sonra aniden kestiğinizde (ambargo), narsisistik bir yoksunluk ve yoğun bir değersizlik kaygısı yaşarlar. Bu kaygıyı dindirmek ve sizden tekrar onay alabilmek için sizin kurallarınıza boyun eğmeye ve sizin çerçevenize girmeye başlarlar.",
    whatItIsNot: "Karşı tarafa hakaret etmek, onunla kavga etmek veya onu düşmanca dışlamak değildir. Sadece onun egosunu besleyen tüm ilgi ve takdiri klinik bir soğuklukla tamamen kesmektir.",
    howToApply: [
      "Yapay Besleme (Başlangıç): Görüşmelerin başında onun başarılarını ve egosunu hafifçe överek kendinize bağlayın.",
      "Aniden Geri Çekilme (Ambargo): Kritik bir karar veya masada güç savaşı başladığında övgüyü ve ilgiyi tamamen kesin.",
      "Klinik Mesafe ve İlgisizlik: Onun kendini kanıtlama çabalarını boş bakışlarla ve kısa, nötr cümlelerle geçiştirin.",
      "İtaat Karşılığı Ödül: Sizin şartlarınızı kabul ettiği an, ona küçük bir övgü vererek davranışı bilinçaltında pekiştirin."
    ],
    scenario: "Sürekli kendini öven ve işlerinizi sabote eden bir proje ortağınız var. Onun başarı hikayelerini dinlerken saatinize bakın, esneyin ve sakince: 'Güzel, şimdi projenin geciken teslim tarihini konuşalım' deyin. Egoları bloke olan ortağınız, sizden onay alabilmek için bir sonraki toplantıya işleri tamamlamış olarak gelecektir."
  },
  {
    id: "emotional-resonance",
    title: "Duygusal Rezonans Kuramı",
    category: "psychology",
    categoryLabel: "Klinik Psikoloji",
    description: "Karşı tarafın bastırılmış çocukluk travmalarının duygusal frekansına uyum sağlayarak onunla sarsılmaz bir bağ ve bağımlılık kurma sanatı.",
    whatItIs: "Duygusal Rezonans, karşınızdaki kişinin maskelerinin arkasındaki en derin duygusal boşluğu tespit edip, onunla aynı duygusal frekansta titreşerek ruhsal bir bütünleşme illüzyonu yaratmaktır. Her insan çocukluğundaki o doldurulamamış boşluğun peşinden koşar. Bu boşluğu fark edip ona bu duygusal yankıyı (rezonansı) verdiğinizde, hedef size karşı sarsılmaz bir güven duyar ve hayatındaki en önemli zihinsel referans noktası haline gelirsiniz. Bu bağ, onun üzerinizdeki bağımlılığını maksimuma çıkarır.",
    whatItIsNot: "Ucuz ve yüzeysel bir empati gösterisi yapmak değildir. Karşı tarafın en derin psikolojik yaralarını klinik bir hassasiyetle analiz edip o yaraya merhem olan yegane kişi rolünü oynamaktır.",
    howToApply: [
      "Derin Dinleme ve Analiz: Konuşmalarında hangi konulardan kaçındığını, neye öfkelendiğini ve geçmişte nasıl yaralar aldığını sessizce haritalandırın.",
      "Duygusal Rezonans Oluşturma: Onun hissettiği o derin acıyı veya yalnızlığı anladığınızı gösteren derin psikolojik metaforlar kullanın.",
      "Güvenli Sığınak Rolü: Onun dünyada sadece sizin yanınızda maskelerini indirip 'kendi olabileceği' algısını yaratın.",
      "Stratejik Bağımlılık Yönetimi: Bu sarsılmaz bağı kullanarak müzakerelerde veya ilişkide mutlak liderliği elinizde tutun."
    ],
    scenario: "Çocukluğunda otoriter ve sevgisiz bir baba figürü tarafından sürekli yetersiz bulunarak büyütülmüş bir iş insanıyla çalışıyorsunuz. Onun projelerindeki ufak hataları cezalandırmak yerine, asil bir babacan tavırla: 'Bu hatan senin genel kaliteni gölgelemez, ben senin arkandayım' deyin. Bu duygusal rezonans onu size ömür boyu sadık bir iş ortağı yapacaktır."
  }
];


export default function AcademyPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<"all" | "strategy" | "defense" | "rhetoric" | "body" | "psychology">("all");
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [activeMimicIndex, setActiveMimicIndex] = useState(0);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const [selectedVideoId, setSelectedVideoId] = useState("tyler_durden");
  const [isPlaying, setIsPlaying] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<HTMLDivElement>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [volume, setVolume] = useState(0.8);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    setIsPlaying(false);
  }, [selectedVideoId]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
      videoRef.current.volume = volume;
    }
  }, [isMuted, volume, isPlaying, selectedVideoId]);

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFsChange);
    };
  }, []);

  const handleFullscreen = () => {
    if (playerRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        playerRef.current.requestFullscreen().catch((err) => {
          console.error("Error enabling fullscreen", err);
        });
      }
    }
  };

  const [videos, setVideos] = useState([
    {
      id: "tyler_durden",
      title: "Tyler Durden (Dövüş Kulübü) - Sosyopatik Liderlik Analizi",
      description: "Mutlak mekansal dominans, amigdala duyarsızlaşması ve kışkırtıcı beden dili incelemesi.",
      url: "Film: Fight Club (1999)",
      status: "completed",
      personality: "Dissosiyatif Kimlik Bozukluğu & Sosyopati (Antisosyal)",
      stressIndex: 35,
      credibilityIndex: 10,
      thumbnail: "/mentis_book_cover.png",
      videoUrl: "/tyler_durden.mp4",
      detailedAnalysis: `KLİNİK TEŞHİS: Dissosiyatif Kimlik Bozukluğu (DID), Antisosyal Kişilik Bozukluğu (Sosyopati) ve Megalomanik Narsisizm Kombinasyonu.

Tyler Durden, modern endüstriyel toplumun uysallaştırdığı figürün bastırılmış öfke, şiddet, mutlak özgürlük ve ilkel maskülenlik arzularının aşırı kompanse edilmiş (narcissistic overcompensation) alter egodur. Klinik anlamda Tyler, anlatıcının hissettiği değersizlik, pasiflik ve kimliksizlik şemalarını telafi etmek amacıyla ürettiği patolojik bir savunma kalkanıdır. Ahlaki bariyerleri, toplumsal normları ve yasal sınırları tamamen reddeder.

BEDEN DİLİ VE DOMİNANS:
Tyler, girdiği her ortamda mutlak mekansal dominans kurar. Omuzları geriye çekik, bacakları açık ve kollarını genişçe yayarak çevresindeki fiziksel alanı sahiplenir. Göz teması delici, kesintisiz ve kışkırtıcıdır; karşısındakinin bakışlarını kaçırmasını sağlayarak mikro düzeyde bir hiyerarşik üstünlük dikte eder. Konuşurken sergilediği rahatlık, omuz seğirmeleri ve alaycı sırıtmalar (smirk), amigdalasının stres uyarım eşiğinin ne kadar yüksek olduğunu (amigdala duyarsızlaşması) gösterir. Acıya ve fiziksel hasara karşı hissettiği duyarsızlık, onun kendisini ölümlü bir beden yerine ölümsüz bir fikir olarak konumlandırmasından kaynaklanır.

RETORİK VE MANİPÜLASYON:
Tyler, hipnotik bir sözel retorik kullanır. 'Tüketim toplumu karşıtı' argümanları rasyonel birer doktrin gibi sunarak zayıf ve anlam arayışındaki genç zihinleri manipüle eder. Onlara yapay bir aidiyet ve 'özgürlük' illüzyonu vererek kendi kurduğu klan yapısının (Project Mayhem) itaatkar piyonları haline getirir. Çerçeve kontrolü (frame control) o kadar güçlüdür ki, onunla etkileşime girenler kendi ahlaki ve rasyonel muhakemelerini askıya alarak onun gerçeklik alanına çekilirler.`,
      advice: "Tyler Durden tarzı sosyopatik ve narsisistik profillerle asla duygusal çatışma masasına oturmayın. Çerçevesini kırmak için 'Rasyonel Mesafe'yi koruyun, kışkırtmalarına reaksiyon vermeyin ve onu kendi tutarsızlığına mahkum edin."
    },
    {
      id: "sherlock_holmes",
      title: "Sherlock Holmes (Zihin Sarayı) - Analitik Profilleme",
      description: "Duyguları tamamen filtreleme, hızlı çıkarım mekanizmaları ve yüksek statü beden dili.",
      url: "Dizi: Sherlock (BBC)",
      status: "completed",
      personality: "Yüksek İşlevli Asperger & Üstün Analitik Narsisizm",
      stressIndex: 15,
      credibilityIndex: 95,
      thumbnail: "/mentis_book_open.jpg",
      videoUrl: "/sherlock_holmes.mp4",
      detailedAnalysis: `KLİNİK TEŞHİS: Üstün Zekalı Bilişsel Narsisizm, Obsesif-Kompulsif Kişilik Yapısı ve Yüksek İşlevli Asperger Sendromu Belirtileri (Kendi Tabiriyle: 'Yüksek İşlevli Sosyopat').

Sherlock Holmes, duygusal veri akışını bilişsel düzeyde tamamen filtreleyerek rasyonel analize ve saf gözleme odaklanan soğuk bir zihinsel mimaridir. Klinik açıdan profili, aşırı gelişmiş bir analitik narsisizm ve detay takıntısı içerir. Sherlock, sosyal yakınlığı ve empatiyi 'çalışma mekanizmasını yavaşlatan, rasyonel kararları gölgeleyen duygusal bir kirlilik' olarak tanımlayarak bilinçli bir 'Rasyonel Mesafe' (rational distance) protokolü geliştirmiştir. Karşısındaki insanları insani özneler olarak değil, çözülmesi ve deşifre edilmesi gereken birer veri yığını ve bulmaca olarak görür.

BEDEN DİLİ VE SÖZSÜZ ANALİZ:
Sherlock'un beden dili, minimum enerjiyle maksimum bilişsel odaklanmayı hedefler. Parmak uçlarını birleştirerek oluşturduğu 'güç çadırı' (steepling) hareketi, zihinsel konsantrasyonunu sabitlerken çevresine 'her şeye hakimim ve sizden üstünüm' sinyali verir. Göz hareketleri son derece hızlıdır; karşısındaki kişinin giysisindeki bir toz zerresinden, ayakkabısındaki çamur lekesine kadar her detayı milisaniyeler içinde tarar (mikro-tarama). Konuşma hızı, beynindeki bilişsel işlemci hızının dışavurumudur. Bu hızlı bilgi bombardımanı, muhataplarında ani bir bilişsel tükenmişliğe (ego depletion) yol açarak onların yalan veya savunma kalkanlarını anında çökertir.

SOSYAL DIŞLAMA VE ÇERÇEVE:
Nezaket kurallarını ve sosyal protokolleri bilinçli olarak reddetmesi, yapısal bir iletişim bozukluğundan ziyade, kendi zihinsel üstünlüğünü ve bağımsız çerçevesini koruma amaçlı bir güç strategisidir. Kendini sosyal normların üzerinde konumlandırarak, etkileşime girdiği herkesi kendi kurallarının geçerli olduğu rasyonel bir alana çekmeye zorlar.`,
      advice: "Bu karakterle iletişim kurarken duygusal manipülasyonlar (Gaslighting, Love Bombing vb.) tamamen etkisiz kalacaktır. Tek geçerli dil rasyonel veriler, tutarlı argümanlar ve bilgi asimetrisidir. Bilgiyi filtreleyerek onun çıkarım zincirini sabote edin."
    },
    {
      id: "walter_white",
      title: "Walter White (Breaking Bad) - Megalomanik Heisenberg Dönüşümü",
      description: "Ezilmişlik şemasının narsisistik aşırı telafisi ve otonom stres kaçakları.",
      url: "Dizi: Breaking Bad (AMC)",
      status: "completed",
      personality: "Narsisistik Kompanzasyon & Makyavelist Otorite Eğilimi",
      stressIndex: 60,
      credibilityIndex: 25,
      thumbnail: "/mentis_secret_files_vol1.jpg",
      videoUrl: "/walter_white.mp4",
      detailedAnalysis: `KLİNİK TEŞHİS: Malign (Kötücül) Narsisizm, Makyavelizm ve Bastırılmış Ezilmişlik Şemasının Megalomanik Patolojik Aşırı Telafisi (Narcissistic Overcompensation).

Walter White'ın Heisenberg kimliğine dönüşümü, ömrü boyunca maruz kaldığı akademik, sosyal ve ekonomik değersizleştirilme şemalarının kanser teşhisiyle tetiklenerek patlak vermesidir. Klinik açıdan Walter, başlangıçta ailesinin geleceğini güvence altına alma 'maskesini' (rasyonalizasyon savunma mekanizması) kullansa da, asıl ve tek motivasyonu hiçbir zaman para olmamıştır. Temel dürtüsü; yitirdiği gençlik dehasını, çalınan statüsünü ve hadım edilmiş otoritesini mutlak kontrol, korku ve saygı uyandırarak geri kazanmaktır.

BEDEN DİLİ VE OTONOM REAKSİYONLAR:
Walter, Heisenberg kimliğine büründüğünde beden dilinde radikal bir değişim yaşanır. Walter White olarak omuzları çökük, çene açısı aşağıda ve göz temasından kaçınan bir profil çizerken; Heisenberg olduğunda çene hattını yatayla yukarı kaldırarak dikleştirir, göz temasını delici ve tehditkar bir şekilde sabitler. Ancak, çift kimlikli yaşantısının yarattığı yoğun zihinsel bölünme, yutkunma sıklığının artması, ses tellerindeki anlık gerilmeye bağlı ses çatallanmaları ve mikro terlemeler gibi otonom sinir sistemi uyarılmalarıyla dışa vurulan şiddetli mikro-stres kaçaklarına sebep olur.

MANİPÜLASYON VE TAARRUZ:
Walter, çevresindekileri yönetmek için suçluluk duygusunu kullanır ve kurban rolünü (mağduriyet maskesi) mükemmel şekilde oynar. Kendi ahlaki çöküşünü haklı çıkarmak için bilişsel çelişki (cognitive dissonance) yöntemine sığınır. Masada köşeye sıkıştığında savunma yapmak yerine karşı saldırı protokolüne (counter-attack) geçerek muhataplarının zayıf noktalarına ve korkularına (örn: Jesse Pinkman'in onaylanma ihtiyacı) oynar. Güç sahibi oldukça empati yeteneğini tamamen yitirerek, kendi kurduğu uyuşturucu imparatorluğunda mutlak ve acımasız bir otorite haline gelir.`,
      advice: "Walter White, geçmişteki değersizlik şemasını Heisenberg kimliğiyle aşırı telafi etmektedir. Otorite arzusu onun en zayıf halkasıdır. Bu profili köşeye sıkıştırmak için onun dehasını ve konumunu yok sayın. Çerçevesini bozmak için 'Küçümseyici Tebessüm' (Smirk) kullanın; ego yaralanması yaşayarak hata yapacaktır."
    },
    {
      id: "anakin_skywalker",
      title: "Anakin Skywalker (Star Wars) - Borderline ve Bağlanma Patolojisi",
      description: "Sınırda kişilik bozukluğu, terk edilme korkusu ve öfke patlamalarının karanlık tarafa dönüşümü.",
      url: "Film: Star Wars Serisi",
      status: "completed",
      personality: "Sınırda (Borderline) Kişilik Bozukluğu & Travmatik Bağlanma",
      stressIndex: 85,
      credibilityIndex: 30,
      thumbnail: "/mentis_book_cover.png",
      videoUrl: "/anakin_skywalker.mp4",
      detailedAnalysis: `KLİNİK TEŞHİS: Sınırda (Borderline) Kişilik Bozukluğu ve Travmatik Güvensiz Bağlanma Şemaları.

Anakin Skywalker, klinik psikoloji literatüründe Borderline (Sınırda) Kişilik Bozukluğu kriterlerini neredeyse eksiksiz karşılayan bir vaka çalışmasıdır. Erken çocukluk dönemindeki kölelik geçmişi ve annesinden zorla ayrılması, onda derin bir terk edilme şeması ve güvensiz-kaçınan bağlanma patolojisi yaratmıştır. Jedi Doktrini'nin katı duygusal bastırma kuralları, Anakin'in içsel öfkesini dindirmek yerine onu entelektüelleştirerek daha da derinleştirmiştir.

DAVRANIŞSAL VE BEDEN DİLİ ANALİZİ:
Duygu durumundaki aşırı dalgalanmalar, kimlik karmaşası (Jedi Şövalyeliğinden Sith Lordluğuna geçiş) ve impulsif (dürtüsel) eylemleri Borderline yapısının çekirdeğini oluşturur. Padmé'yi kaybetme korkusu, onun rasyonel düşünme yetisini felç ederek bilişsel çelişkiyi zirveye taşımış ve Palpatine'in manipülasyonlarına karşı onu tamamen savunmasız bırakmıştır. Darth Vader maskesini taktıktan sonra beden dilinde mutlak bir fiziksel kapatma (duygusal poker face) ve heybetli, yavaş, tehditkar hareketlerle mekansal dominans kurulmuştur. Amigdalası artık stres hissetmek yerine saf öfke ve yıkım üretmektedir.`,
      advice: "Anakin Skywalker tipolojisindeki sınırda ve travmatik profillerle iletişim kurarken terk edilme veya değersizleştirilme korkularını asla tetiklemeyin. Onların yoğun duygusal dalgalanmalarına (splitting) aynı reaktiflikle yanıt vermek felaketle sonuçlanır. İletişimi tamamen nötr, rasyonel ve sınırları son derece belirli kurallar çerçevesinde tutmalısınız."
    },
    {
      id: "hannibal_lecter",
      title: "Hannibal Lecter (Kuzuların Sessizliği) - Kusursuz Psikopatoloji ve Manipülasyon",
      description: "Sıfır amigdala reaktivitesi, yüksek entelektüel narsisizm ve hipnotik rasyonel üstünlük.",
      url: "Film: The Silence of the Lambs (1991)",
      status: "completed",
      personality: "Antisosyal Kişilik Bozukluğu (Psikopati) & Üstün Bilişsel Narsisizm",
      stressIndex: 5,
      credibilityIndex: 15,
      thumbnail: "/mentis_book_open.jpg",
      videoUrl: "/hannibal_lecter.mp4",
      detailedAnalysis: `KLİNİK TEŞHİS: Saf Psikopati (Antisosyal Kişilik Bozukluğu) ve Entelektüel / Bilişsel Megalomanik Narsisizm.

Dr. Hannibal Lecter, klinik psikopatoloji alanında 'saf' ve 'yüksek işlevli' psikopatinin en uç örneğidir. Amigdalası biyolojik olarak neredeyse sıfır reaktiviteye sahiptir; nitekim nabzı, en ekstrem şiddet eylemlerini gerçekleştirirken dahi normal sınırların (dakikada 85 atım) üzerine çıkmamıştır. Bu durum, onda korku, panik veya suçluluk gibi duyguların nörolojik düzeyde üretilemediğini gösterir. Son derece gelişmiş zihinsel mimarisi (zihin sarayı) sayesinde duygusal verileri tamamen filtreler.

BEDEN DİLİ VE HİPNOTİK RETORİK:
Beden dili hipnotik düzeyde sabittir. Göz kırpma refleksi neredeyse yok denecek kadar azdır; bu da muhatabında av-avcı ilişkisindeki av konumuna düşme hissi uyandırır. Duruşu asil, sakin ve hareketleri son derece kontrollüdür. Karşı tarafı manipüle etmek için onların bastırılmış travmalarını ve bilinçaltı zafiyetlerini bir cerrah titizliğiyle analiz eder ve konuşurken yavaş, melodik ve ritmik bir ses tonu kullanarak bilişsel savunma hatlarını (ego depletion) felç eder.`,
      advice: "Hannibal Lecter tarzı yüksek işlevli psikopatlarla karşı karşıya kaldığınızda en ufak bir duygusal açık veya yalan ipucu vermeyin. Sizi profilleyebileceği kişisel verileri tamamen filtreleyin (Gaslighting kalkanı). Onun entelektüel egosunu besliyormuş gibi görünp (Benjamin Franklin etkisi), rasyonel mesafenizi koruyarak masadan güvenli bir şekilde kalkmayı hedefleyin."
    },
    {
      id: "patrick_jane",
      title: "Patrick Jane (The Mentalist) - Mikro İfade ve İllüzyonist Profilleme",
      description: "Gözlem baz hattı okuma, shit-test bozma ve manipülatif sempati maskesi.",
      url: "Dizi: The Mentalist (CBS)",
      status: "completed",
      personality: "Yüksek Sezgisel Makyavelizm & Aşırı Telafi Edilmiş Suçluluk Şeması",
      stressIndex: 40,
      credibilityIndex: 70,
      thumbnail: "/mentis_secret_files_vol1.jpg",
      videoUrl: "/patrick_jane.mp4",
      detailedAnalysis: `KLİNİK TEŞHİS: Yüksek Sezgisel Makyavelizm ve Travmatik Yas Sonrası Aşırı Telafi Edilmiş (Overcompensated) Suçluluk Şemaları.

Patrick Jane, insan zihninin zaaflarını ve sözsüz iletişim kodlarını illüzyonist ve mentalist tekniklerle okuyan, yüksek düzeyde sezgisel bir manipülatördür. Temel motivasyonu, ailesinin kaybından ötürü hissettiği yıkıcı suçluluk şemasını intikam dürtüsüyle aşırı kompanse etmektir. Karşısındaki insanlarda 'baz hattı' (baseline) okumayı o kadar otomatikleştirmiştir ki, en ufak bir göz hareketinden veya ses çatallanmasından yalanı teşhis eder.

BEDEN DİLİ VE MASKELER:
Davranışsal olarak, sürekli sergilediği sıcak, sempatik, hatta çocuksu maske (hale etkisi) muhataplarının gardını tamamen düşürmek için tasarlanmıştır. Çerçeve kontrolü (frame control) son derece esnektir; doğrudan çatışmak yerine karşı tarafın shit-test'lerini mizahla ve absürtlükle bozar. Gözleri sürekli aktiftir; ortamdaki ve kişilerdeki mikro ipuçlarını toplar. Elleriyle yaptığı rahatlatıcı ve yönlendirici jestler, muhataplarının bilinçaltına telkinler göndermesini sağlar.`,
      advice: "Patrick Jane profilleriyle etkileşime girerken beden dilinizi ve mikro ifadelerinizi kontrol etmek için 'Poker Face' metodunu uygulayın. Sizi duygusal olarak manipüle etmesine izin vermemek için onun sempatik çerçevenin arkasına gizlediği gerçek niyete odaklanın ve bilgiyi kısıtlayarak (bilgi asimetrisi) onun çıkarım yapmasını zorlaştırın."
    },
    {
      id: "joe_goldberg",
      title: "Joe Goldberg (You) - Erotomanik Obsesyon ve Rasyonalizasyon",
      description: "Narsistik aşk bombardımanı, aşırı rasyonalize edilmiş takipçilik ve takıntı şemaları.",
      url: "Dizi: You (Netflix)",
      status: "completed",
      personality: "Obsesif-Kompulsif Narsisizm & Erotomanik Sanrılı Psikopati",
      stressIndex: 50,
      credibilityIndex: 20,
      thumbnail: "/mentis_book_cover.png",
      videoUrl: "/joe_goldberg.mp4",
      detailedAnalysis: `KLİNİK TEŞHİS: Erotomanik Sanrılar, Obsesif-Kompulsif Narsisistik Kişilik Bozukluğu ve İstifçi/Takipçi Şemaları.

Joe Goldberg, narsisistik ve obsesif-kompulsif dinamiklerle beslenen erotomanik bir takipçi (stalker) profilidir. En belirgin savunma mekanizması rasyonalizasyondur (rationalization); işlediği tüm cinayetleri, takip eylemlerini ve sınır ihlallerini 'karşı tarafı korumak ve sevmek' kılıfına uydurur. Kendi zihninde yarattığı idealize edilmiş aşk masalı, onun gerçeklik algısını tamamen karartır.

BEDEN DİLİ VE OTONOM REAKSİYONLAR:
Beden dili dışarıdan bakıldığında son derece uysal, içe dönük ve zararsız bir entelektüel izlenimi verir (Hale Etkisi). Omuzları hafifçe çökük, ses tonu yumuşak ve konuşması ölçülüdür. Ancak iç dünyasında sürekli akan paranoid iç konuşmalar, hedefiyle göz teması kurduğu anlarda göz bebeklerinin büyümesi ve mikro yutkunmalarla dışa vurulan otonom stres kaçaklarına yol açar. Love Bombing (aşk bombardımanı) evresinde hedefine aşırı korumacı ve ilgi dolu yaklaşarak onun duygusal bağımsızlığını yok eder ve kendine bağımlı kılar.`,
      advice: "Joe Goldberg tipolojisi, sınır ihlallerini sevgi gösterisi gibi sunar. Bu profile karşı sınırlarınızı (siber ve fiziksel) en baştan aşırı sert bir şekilde çizin. Love Bombing belirtilerini fark ettiğiniz an duygusal mesafenizi (rasyonel mesafe) kurun ve kendiniz hakkında hassas bilgi paylaşımını derhal durdurun."
    },
    {
      id: "thomas_shelby",
      title: "Thomas Shelby (Peaky Blinders) - Stoik Travma ve Makyavelist İrade",
      description: "Savaş sonrası duygusal küntleşme, mutlak poker face ve sessizlik ilkesiyle yönetim.",
      url: "Dizi: Peaky Blinders (BBC)",
      status: "completed",
      personality: "Post-Travmatik Duygusal Küntleşme & Makyavelist Liderlik",
      stressIndex: 20,
      credibilityIndex: 85,
      thumbnail: "/mentis_book_open.jpg",
      videoUrl: "/thomas_shelby.mp4",
      detailedAnalysis: `KLİNİK TEŞHİS: Ağır Post-Travmatik Stres Bozukluğu (PTSD), Duygusal Küntleşme (Emotional Numbing) ve Makyavelist Güç Arzusu.

Thomas Shelby, I. Dünya Savaşı'nın siperlerinde yaşadığı ağır travmaların sonucunda duygusal olarak tamamen küntleşmiş, stoik ve son derece tehlikeli bir Makyavelist liderdir. Ölümle burun buruna yaşamak, onun amigdalasını korku uyarımına karşı tamamen duyarsızlaştırmıştır. Thomas için hayat, duygulardan arındırılmış soğuk bir satranç tahtası ve sıfır toplamlı bir oyundur (zero-sum game).

BEDEN DİLİ VE SESSİZLİK İLKESİ:
Beden dili mutlak bir hareketsizlik ve kontrol üzerine kuruludur. En büyük kriz anlarında bile yüz kasları oynamaz (mükemmel poker face). Gözleri buz gibi soğuk, delici ve odaklıdır. Konuşurken sergilediği yavaşlık ve kurduğu uzun, stratejik duraklamalar (sessizlik ilkesi), masadaki muhatapları üzerinde muazzam bir psikolojik baskı yaratır ve onları panik halinde hata yapmaya zorlar. Sigarasını yakarken veya içkisini yudumlarken yaptığı yavaş ve kontrollü hareketler, zamanı ve ortamı kendi kontrolünde tuttuğunun sözsüz birer ilanıdır.`,
      advice: "Thomas Shelby profilleriyle pazarlık masasında çatışmaya girmeyin. Onun sessizlik silahına karşı sessizlikle yanıt verin and reaktifliğinizi sıfırlayın. Masadaki tek geçerli kozunuz, onun rasyonel iş hedeflerine sunacağınız somut, ölçülebilir faydalar ve masadan kalkıp gidebilme gücünüzdür."
    },
    {
      id: "dexter_morgan",
      title: "Dexter Morgan (Dexter) - Maskelenmiş Sosyopati ve Ritüelistik Kontrol",
      description: "Sosyal maske takınma, kontrollü antisosyal bozukluk ve otonom sinir sistemi baskılama.",
      url: "Dizi: Dexter (Showtime)",
      status: "completed",
      personality: "Yüksek İşlevli Antisosyal Kişilik Bozukluğu (Sosyopati) & Ritüelistik Obsesyon",
      stressIndex: 10,
      credibilityIndex: 40,
      thumbnail: "/mentis_secret_files_vol1.jpg",
      videoUrl: "/dexter_morgan.mp4",
      detailedAnalysis: `KLİNİK TEŞHİS: Yüksek İşlevli Antisosyal Kişilik Bozukluğu (Sosyopati) ve Harry'nin Koduna Dayalı Obsesif Ritüelistik Savunma Yapıları.

Dexter Morgan, babası Harry tarafından 'koda' göre hareket etmesi için eğitilmiş, dürtülerini toplumsal olarak yararlı bir kanala kanalize eden kontrollü bir sosyopattır. İçindeki 'Karanlık Yolcu' (Dark Passenger), onun empati ve ahlaki sorumluluk hissetmeyen antisosyal yönüdür. Ancak Dexter, topluma uyum sağlamak ve deşifre olmamak için muazzam bir 'Sosyal Maske' geliştirmiştir.

BEDEN DİLİ VE İKİNCİL KİMLİK:
Normal insan taklidi yaparken beden dili bilinçli olarak 'fazla' sosyal ve cana yakındır; sık sık yapay gülümsemeler sergiler (Duchenne olmayan, göz kaslarının dahil olmadığı sahte gülüşler). Kan lekelerini analiz ederken veya avının peşindeyken ise yüzü tamamen soğur, kasları gevşer ve bakışları keskinleşir (avcı modu). Otonom sinir sistemi uyarılmalarını bilinçli olarak baskılamayı öğrenmiştir; bu yüzden yalan dedektörlerini bile kolaylıkla atlatabilir.`,
      advice: "Dexter gibi sosyal maskesini kusursuz kullanan profilleri teşhis etmek için sözlü beyanları ile mikro ifadeleri arasındaki anlık tutarsızlıkları (yutkunma, anlık göz kaçırma) yakalayın. Bu profille karşı karşıya geldiğinizde ahlaki veya duygusal argümanlar yerine sadece katı mantık ve kurallar üzerinden iletişim kurun."
    },
    {
      id: "michael_scofield",
      title: "Michael Scofield (Prison Break) - Düşük Latent İnhibisyon ve Üstün Algı",
      description: "Çevresel detayları filtreleyememe zekası, stoik beden dili ve fedakarlık kompleksi.",
      url: "Dizi: Prison Break (Fox)",
      status: "completed",
      personality: "Düşük Latent İnhibisyon (LLI) & Yüksek Sezgisel Empati/Narsisizm",
      stressIndex: 30,
      credibilityIndex: 90,
      thumbnail: "/mentis_book_cover.png",
      videoUrl: "/michael_scofield.mp4",
      detailedAnalysis: `KLİNİK TEŞHİS: Düşük Latent İnhibisyon (LLI) ve Aşırı Empatiye Bağlı Kendini Feda Etme (Self-Sacrifice) Şeması.

Michael Scofield, klinik düzeyde Düşük Latent İnhibisyon (Low Latent Inhibition) teşhisine sahiptir. Bu durum, beyninin çevredeki tüm detayları, sesleri ve görsel uyarıcıları filtrelemeden işlemesine yol açar; normal insanlarda deliliğe sebep olabilecek bu durum Michael'ın üstün zekasıyla birleşerek onu dahi bir stratejist yapmıştır. Michael, empati yeteneği aşırı gelişmiş bir karakterdir ve sevdiklerini korumak için kendini feda etme şemasına sahiptir.

BEDEN DİLİ VE BİLİŞSEL ODAK:
Beden dili son derece koruyucu, stoik ve içe dönüktür. Gözleri sürekli etrafı tarar ve nesnelerin fiziksel özelliklerini, geometrik yapısını analiz eder (LLI işleyişi). Konuşurken ses tonunu her zaman alçak, sakin ve güven verici bir frekansta tutar. Stresli anlarda parmaklarını birleştirip düşünme pozu alması, bilişsel işlemcisinin yoğun çalıştığını gösterir. Vücuduna kazıttığı dövmeler, onun karmaşık planlarını sabitleme obsesyonunun fiziksel dışavurumudur.`,
      advice: "Michael Scofield gibi her detayı kaydeden ve analiz eden zihinlere karşı yalan söylemek veya eksik bilgi vermek imkansızdır. Onunla ilişkilerinizde mutlak dürüstlük ve güven inşa edin. Onun korumacı şemasını tetikleyecek mağduriyet rolleri (aynalama) masada lehinize çalışabilir."
    },
    {
      id: "kira_light",
      title: "Light Yagami (Death Note) - Tanrı Kompleksi ve Megalomanik Çöküş",
      description: "Mutlak adalet illüzyonu, narsisistik öfke ve zihinsel çerçeve parçalanması.",
      url: "Anime: Death Note",
      status: "completed",
      personality: "Megalomanik Tanrı Kompleksi (Narsisizm) & Makyavelist Psikopati",
      stressIndex: 45,
      credibilityIndex: 35,
      thumbnail: "/mentis_book_open.jpg",
      videoUrl: "",
      detailedAnalysis: `KLİNİK TEŞHİS: Tanrı Kompleksi (Megalomanik Narsisizm) ve Antisosyal / Makyavelist Kişilik Yapılanmaları.

Light Yagami (Kira), eline geçen doğaüstü gücün etkisiyle narsisistik kişilik yapısı hızla megalomanik bir 'Tanrı Kompleksi'ne (God Complex) dönüşen, parlak bir zekadır. Kendi adalet algısını mutlak ve kutsal kabul ederek, dünyayı temizleme 'kutsal görevini' (rasyonalizasyon) üstlenir. Karşısına çıkan her engeli veya dedektifi kendi narsisistik bütünlüğüne yapılmış bir saldırı olarak görür ve yoğun bir narsisistik öfke (narcissistic rage) ile yanıt verir.

BEDEN DİLİ VE PARÇALANMA:
Light, başlangıçta kusursuz bir örnek öğrenci maskesi taşır. Beden dili son derece nazik, kibar ve simetriktir. Ancak köşeye sıkıştığında ve L veya Near tarafından zihinsel çerçevesi zorlandığında, otonom sinir sistemi çökmeye başlar; göz bebekleri çılgınca büyür, ses tonu tizleşir ve histerik kahkahalar atar (çerçeve parçalanması). Yalan söylerken gözlerini hafifçe kısarak rasyonel kurgu moduna geçtiğini ifşa eden mikro ifadeler sergiler.`,
      advice: "Light Yagami gibi megalomanik profillerin en zayıf noktası aşırı gelişmiş egolarıdır. Onları alt etmek için dehalarını ve güçlerini küçümseyen 'Küçümseyici Tebessüm' (Smirk) kullanın. Egosu yaralanan megaloman, rasyonel kontrolünü kaybederek kendini ifşa edecek büyük hatalar yapacaktır."
    },
    {
      id: "harvey_specter",
      title: "Harvey Specter (Suits) - Karizma Alfalığı ve Duygusal Zırh",
      description: "Mutlak kazanma şeması, statü beden dili ve duygusal sızıntıları engelleme.",
      url: "Dizi: Suits (USA Network)",
      status: "completed",
      personality: "Makyavelist Otoriter Narsisizm & Aşırı Telafi Edilmiş Terk Edilme Şeması",
      stressIndex: 25,
      credibilityIndex: 80,
      thumbnail: "/mentis_secret_files_vol1.jpg",
      videoUrl: "/harvey_specter.mp4",
      detailedAnalysis: `KLİNİK TEŞHİS: Makyavelist Narsisizm ve Erken Çocukluk Güvensizliklerine Bağlı Gelişen Duygusal Savunma Zırhı.

Harvey Specter, 'Kazanmak her şeydir' doktriniyle yaşayan, yüksek statülü, narsisistik ve Makyavelist bir dava avukatıdır. Çocukluğunda annesinin sadakatsizliğine şahit olması, onda derin bir güven eksikliği ve terk edilme şeması yaratmıştır. Harvey, bu zafiyeti tamamen yenilmez görünerek ve hiç kimseye duygusal olarak bağlanmayarak (duygusal zırh) aşırı kompanse (overcompensate) eder.

BEDEN DİLİ VE STATÜ:
Beden dili alfa statü sinyalleriyle doludur. Kusursuz takım elbiseleri, dik omuzları ve çene hattının yukarıda olması (postür dominansı) masaya oturduğu an üstünlüğü kurmasını sağlar. Göz teması delici, kararlı ve meydan okuyucudur. Müzakerelerde algı çapalama (anchoring) ve blöf yapma tekniklerini ustalıkla kullanır. Stres altındayken bile göz kırpma hızı değişmez, ses tonu sabit kalır; bu da onun duygusal çelişkilerini dışarıya sızdırmasını engeller.`,
      advice: "Harvey Specter profillerine karşı asla zayıflık veya duygusal çaresizlik göstermeyin. Onun gücünü ve karizmasını kabul ettiğinizi hissettirin ancak kendi çerçevenizi (frame) ve sınırlarınızı koruyun. Onunla konuşurken profesyonel jargon ve rasyonel kazan-kazan argümanları dışında bir dil kullanmayın."
    },
    {
      id: "frank_underwood",
      title: "Frank Underwood (House of Cards) - Makyavelist Güç ve Siyasi Satranç",
      description: "Dördüncü duvarı yıkan manipülasyonlar, mutlak duygusal oto-kontrol ve stratejik sabır.",
      url: "Dizi: House of Cards (Netflix)",
      status: "completed",
      personality: "Makyavelist Sosyopati & Otoriter Narsisizm",
      stressIndex: 10,
      credibilityIndex: 20,
      thumbnail: "/mentis_secret_files_vol1.jpg",
      videoUrl: "/frank_underwood.mp4",
      detailedAnalysis: `KLİNİK TEŞHİS: Yüksek İşlevli Makyavelizm, Antisosyal Kişilik Yapılanması (Sosyopati) ve Otoriter Narsisizm.

Frank Underwood, gücü bir araç olarak değil, kendi başına nihai bir amaç (absolute end) olarak gören saf bir Makyavelist figürdür. Klinik açıdan, empati yoksunluğu, pişmanlık hissetmeme ve çıkarları doğrultusunda insanları acımasızca kullanma eğilimi sosyopatik yapısının çekirdeğidir. Duygularını tamamen rasyonel hedeflere hizmet edecek şekilde rasyonalize ve enstrümantalize eder.

BEDEN DİLİ VE SÖZSÜZ İLETİŞİM:
Underwood'un beden dili, gücün ve statünün sessiz sergilenişidir. Duruşu dik, omuzları gergin ve hareketleri son derece kontrollüdür. 'Dördüncü duvarı' yıkarak seyirciye döndüğü anlardaki bakışları, onun kendini durumların ve insanların üstünde konumlandıran gözlemci egosunun bir yansımasıdır. Konuşurken kullandığı tok, sakin ve güneyli aksanının getirdiği yavaş ritim, muhatapları üzerinde hiyerarşik bir ağırlık kurar. Ellerini sıklıkla masaya veya sandalye kollarına sabitlemesi, mekansal dominansını (territorial dominance) pekiştirir.

STRATEJİK MANİPÜLASYON:
Frank, rakiplerini zayıflatmak için bilgi asimetrisini (information asymmetry) ve çifte bağ (double bind) yöntemlerini ustalıkla kullanır. Karşı tarafın hırslarını ve zaaflarını tespit edip buralara kademeli baskı (pressure points) uygular. Masada asla reaktif davranmaz; kışkırtmalara stoik bir sakinlikle karşılık vererek rakibinin bilişsel enerjisini tüketir (ego depletion).`,
      advice: "Frank Underwood tipolojisiyle müzakere ederken duygusal bağ kurmaya çalışmayın. Masadaki tek geçerli kozunuz, onun güç veya itibar kaybetme riskidir. Onunla konuşurken sadece rasyonel çıkar dengeleri, ortak tehditler ve masadan kalkıp gidebilme gücünüz üzerinden iletişim kurun."
    },
    {
      id: "homelander",
      title: "Homelander (The Boys) - Malign Narsisizm ve Güç İllüzyonu",
      description: "Megalomani arkasına gizlenmiş derin yetersizlik şeması, narsisistik öfke ve öngörülemez otonom tepkiler.",
      url: "Dizi: The Boys (Amazon Prime)",
      status: "completed",
      personality: "Malign (Kötücül) Narsisizm & Erotomanik Onaylanma Bağımlılığı",
      stressIndex: 75,
      credibilityIndex: 15,
      thumbnail: "/mentis_book_cover.png",
      videoUrl: "/homelander.mp4",
      detailedAnalysis: `KLİNİK TEŞHİS: Malign Narsisizm, Antisosyal Kişilik Bozukluğu ve Derin Çocukluk İhmaline Bağlı Gelişen Erotomanik Onay Arayışı Şeması.

Homelander, sınırsız fiziksel güce sahip olmasına rağmen, klinik açıdan aşırı derecede kırılgan bir narsisistik egoya sahiptir. Laboratuvar ortamında sevgisiz büyümesi, onda derin bir yetersizlik, terk edilme ve sevilmeme travması yaratmıştır. Bu zafiyeti, tüm insanlığı küçümseyerek ve kendini bir tanrı gibi konumlandırarak aşırı kompanse (narcissistic overcompensation) eder. Çevresindeki herkesin ona hayran olmasını ve onu koşulsuz sevmesini talep eder; en ufak bir eleştiri veya onay eksikliği onda yıkıcı bir narsisistik öfkeye (narcissistic rage) yol açar.

BEDEN DİLİ VE OTONOM KAÇAKLAR:
Duruşu dışarıdan kahraman aurası taşır: Göğsü şişik, elleri belinde ve yüzünde yapay bir Amerikan gülümsemesi. Ancak stres altındayken otonom sinir sistemi kontrolünü kaybeder. Göz seğirmeleri, çene kaslarının kilitlenmesi, sahte gülümsemesinin aniden buz gibi bir soğukluğa dönüşmesi ve bakışlarındaki vahşi odaklanma onun kontrol dışı agresyonunu ifşa eden mikro ifadelerdir.

MANİPÜLASYON VE TEHDİT:
Homelander, çevresindekileri yönetmek için saf fiziksel terör ve gaslighting yöntemlerini kullanır. Muhataplarını sürekli çifte bağ (double bind) durumunda bırakarak (örn: 'Beni seviyor musun yoksa benden korkuyor musun?') onları zihinsel felce uğratır.`,
      advice: "Homelander tipolojisindeki öngörülemez patolojik narsistlerle doğrudan çatışmaya girmeyin. Onun egosunu ve onaylanma ihtiyacını taktiksel olarak besleyin (Benjamin Franklin etkisi). Kendi sınırlarınızı korurken, onun narsisistik yaralanma (ego injury) yaşamamasına azami özen gösterin; aksi takdirde rasyonel kontrolünü tamamen kaybedip yıkıcı davranacaktır."
    },
    {
      id: "aemond_targaryen",
      title: "Aemond Targaryen (House of the Dragon) - İkinci Oğul Sendromu ve Soğuk Öfke",
      description: "Göz kaybı travması, fiziksel telafi takıntısı ve stoik askeri disiplinin altındaki kışkırtılabilirlik.",
      url: "Dizi: House of the Dragon (HBO)",
      status: "completed",
      personality: "Aşırı Kompanse Edilmiş Değersizlik Şeması & Stoik Agresyon",
      stressIndex: 45,
      credibilityIndex: 80,
      thumbnail: "/mentis_book_open.jpg",
      videoUrl: "/aemond_targaryen.mp4",
      detailedAnalysis: `KLİNİK TEŞHİS: Travma Sonrası Aşırı Telafi (Overcompensation), İkinci Oğul Sendromu (Değersizlik/Yetersizlik Şemaları) ve Antisosyal Eğilimler.

Aemond Targaryen, çocukluğunda maruz kaldığı fiziksel zorbalıklar ve gözünü kaybetmesiyle sonuçlanan travmanın ardından, kendini askeri, entelektüel ve fiziksel olarak en üst düzeye ulaştırmaya adamış bir karakterdir. Klinik açıdan, yaşadığı derin yetersizlik ve değersizlik hissini, en büyük ejderhaya (Vhagar) hükmederek ve kusursuz bir stoik savaşçı profili çizerek aşırı kompanse eder.

BEDEN DİLİ VE SÖZSÜZ ANALİZ:
Aemond'un beden dili son derece soğuk, hareketsiz ve disiplinlidir. Tek gözünü kaybetmesi nedeniyle bakış yönünü sabitlemek için başını hafifçe yana eğer ve bu duruş ona delici, yırtıcı bir çene açısı kazandırır. Hareketleri yavaş ve ölçülüdür; telaşlı hiçbir jest sergilemez. Ancak, abisi Aegon veya düşmanları tarafından çocukluk travmaları tetiklendiğinde (örn: domuz iması), çene kaslarının kasılması ve duruşunun aniden gerilmesi gibi sessiz ama yüksek baskılı mikro-stres sinyalleri verir.

ÇERÇEVE VE SAVAŞ:
Müzakerelerde ve sosyal etkileşimlerde sessizlik ilkesini (silence) ve alan kaplamayı (spatial dominance) kullanarak muhataplarını küçümser. Kendi çerçevesini sarsılmaz bir stoik zırh gibi taşır.`,
      advice: "Aemond Targaryen profilindeki kişilere karşı çocukluk travmalarını veya yetersizlik noktalarını asla alaycı bir dille tetiklemeyin (narsisistik öfke patlamasına sebep olur). Onun disiplinine ve yetkinliğine saygı göstererek rasyonel çerçevede kalın. Müzakerelerde onun 'kabul görme' ve 'hak ettiği statüyü elde etme' arzularını bir kaldıraç olarak kullanın."
    },
    {
      id: "rust_cohle",
      title: "Rust Cohle (True Detective) - Nihilist Depresyon ve Obsesif Algı",
      description: "Kızının kaybı sonrası gelişen varoluşsal nihilizm, yüksek odaklanma ve manipülasyonlara karşı mutlak direnç.",
      url: "Dizi: True Detective (HBO)",
      status: "completed",
      personality: "Şizoid Eğilimler & Ağır Yas Sonrası Depresif Nihilizm",
      stressIndex: 20,
      credibilityIndex: 90,
      thumbnail: "/mentis_secret_files_vol1.jpg",
      videoUrl: "/rust_cohle.mp4",
      detailedAnalysis: `KLİNİK TEŞHİS: Ağır Yas Sonrası Gelişen Kronik Depresyon, Nihilist/Şizoid Kişilik Eğilimleri ve Obsesif-Kompulsif Sorgulama Odaklanması.

Rust Cohle, kızının ölümü ve ardından gelen evlilik çöküşüyle birlikte dünyayı 'insan bilincinin bir hata olduğu' rasyonel temeline oturtan derin bir nihilisttir. Klinik açıdan, sosyal ilişkilerden bilinçli olarak geri çekilmesi (şizoid yapı) ve duygu durumunu tamamen asgariye indirmesi, yaşadığı yıkıcı travmaya karşı geliştirdiği nihai bir savunma mekanizmasıdır. İnsanların sosyal maskelerini ve ahlaki illüzyonlarını saniyeler içinde deşifre eder.

BEDEN DİLİ VE KLİNİK GÖZLEM:
Beden dili son derece asgari düzeydedir. Omuzları hafifçe içe dönük, duruşu çökük ama gözleri delici bir dikkatle muhatabına sabitlenmiştir. Konuşurken ses tonunu monoton, alçak ve pürüzlü tutar; bu durum sosyal onay aramadığının en net kanıtıdır. Sorgulama odasında zanlıların zihinsel gardını düşürmek için onların suçluluk duygularını aynalar (mirroring) ve onlara sahte bir ahlaki sığınak sunarak itiraf almayı başarır.

MANİPÜLASYONA DİRENÇ:
Rust, klasik narsisistik manipülasyonlara (Love Bombing, Gaslighting vb.) karşı tamamen bağışıktır, çünkü dünyevi hiçbir beklentisi, ego arzusu veya onaylanma ihtiyacı kalmamıştır.`,
      advice: "Rust Cohle gibi nihilist ve stoik karakterleri manipüle etmeye veya onlara yalan söylemeye çalışmayın; bilişsel detektörleri yalanı anında teşhis eder. Onunla iletişim kurmanın tek yolu, konuyu varoluşsal süslemelerden arındırıp tamamen ham gerçekler ve rasyonel analizler üzerinden masaya getirmektir."
    },
    {
      id: "jordan_belfort",
      title: "Jordan Belfort (The Wolf of Wall Street) - Hipnotik Satış ve Sosyopatik Karizma",
      description: "Doyumsuz dopamin açlığı, yüksek ikna kabiliyeti ve narsisistik manipülasyon döngüleri.",
      url: "Film: The Wolf of Wall Street (2013)",
      status: "completed",
      personality: "Makyavelist Antisosyal Kişilik & Megalomanik Dopamin Bağımlılığı",
      stressIndex: 40,
      credibilityIndex: 15,
      thumbnail: "/mentis_book_cover.png",
      videoUrl: "/jordan_belfort.mp4",
      detailedAnalysis: `KLİNİK TEŞHİS: Antisosyal Kişilik Bozukluğu (Sosyopati), Megalomanik Narsisizm ve Ağır Madde/Dopamin Bağımlılığı.

Jordan Belfort, doymak bilmeyen bir para, statü ve dopamin açlığıyla hareket eden yüksek işlevli bir sosyopattır. Klinik anlamda, empati yoksunluğu, yasal sınırları tamamen yok sayma ve insanları sadece finansal kazanç sağlayan nesneler olarak görme (enstrümantal manipülasyon) sosyopatik yapısını oluşturur. Olağanüstü karizmasını ve sözel retoriğini kitleleri manipüle etmek için bir silah olarak kullanır.

BEDEN DİLİ VE HİPNOTİK RETORİK:
Jordan'ın beden dili yüksek enerjili, mekansal olarak aşırı yayılmacı (spatial dominance) ve dışa dönüktür. Konuşurken ellerini, kollarını ve tüm vücudunu ikna sürecine dahil eder. Göz teması heyecan verici, coşkulu ve muhataplarında 'seçilmişlik' hissi uyandıran türdendir (Hale Etkisi). Sözel retoriğinde algı çapalamayı (anchoring) ve kapıyı yüzüne çarpma (door-in-the-face) tekniklerini kusursuz kullanarak müşterilerin rasyonel savunma mekanizmalarını devre dışı bırakır.

BİLİŞSEL KANDIRMA:
İnsanların 'zengin olma' ve 'statü kazanma' şemalarını tetikleyerek onları kendi kurduğu finansal manipülasyon ağının içine çeker.`,
      advice: "Jordan Belfort tipolojisindeki karizmatik sosyopatlarla iş yaparken onların sunduğu coşkulu hayallere ve vaatlere kapılmayın. Duygusal heyecanınızı sıfırlayarak (rasyonel mesafe) sadece yazılı sözleşmeler, katı hukuki sınırlar ve finansal veriler üzerinden konuşun. Onun 'Love Bombing' tarzı retoriksel satış ataklarına karşı bilişsel kalkanlarınızı koruyun."
    },
    {
      id: "patrick_bateman",
      title: "Patrick Bateman (American Psycho) - Narsisistik Boşluk ve Psikopatik Maske",
      description: "Kusursuz sosyal maske arkasına gizlenmiş empati yoksunluğu, statü takıntısı ve kontrolsüz sadizm.",
      url: "Film: American Psycho (2000)",
      status: "completed",
      personality: "Antisosyal Kişilik Bozukluğu (Psikopati) & Ağır Narsisistik Boşluk",
      stressIndex: 30,
      credibilityIndex: 10,
      thumbnail: "/mentis_secret_files_vol1.jpg",
      videoUrl: "/patrick_bateman.mp4",
      detailedAnalysis: `KLİNİK TEŞHİS: Saf Psikopati (Antisosyal Kişilik Bozukluğu) ve Ağır Obsesif Narsisistik Yapılanma.

Patrick Bateman, yuppie kültürünün zirvesinde yaşayan, ancak iç dünyasında derin bir varoluşsal boşluk ve kimliksizlik yaşayan klinik bir psikopattır. Kendi ifadesiyle 'insani duygulara benzer hisler taklit eden bir maske' taşır. En ufak bir statü rekabeti (örn: daha iyi bir kartvizit, restoranda rezervasyon yaptıramama), onda derin narsisistik yaralanmalara ve ardından gelen kontrolsüz sadistçe şiddet patlamalarına yol açar.

BEDEN DİLİ VE YAPAY MASKE:
Bateman'ın beden dili kusursuz bir şekilde simetrik, steril ve estetiktir. Cilt bakım rutinlerinden giyimine kadar her şey bir kontrol illüzyonudur. Gülümsemeleri ve sosyal jestleri tamamen taklittir ve gözlerindeki donuk, boş bakışlarla tezat oluşturur (Duchenne çizgilerinin yokluğu). Akranlarıyla girdiği statü savaşlarında beden dilindeki gerilmeler, kartvizitini gösterirken ellerinin hafifçe titremesi gibi otonom mikro-stres sinyalleri onun kırılgan egonun kontrol çabasını ifşa eder.

STATÜ OBSESYONU:
Bateman için sosyal statü ve onaylanma hayatta kalma meselesidir. Kendisini başkalarıyla kıyaslamadan var olamaz.`,
      advice: "Patrick Bateman tarzı psikopatik ve narsisistik profillerle etkileşimdeyken asla onlarla statü, zenginlik veya başarı yarışı içine girmeyin. Onun üstünlük illüzyonuna meydan okumak (ego yaralanması) tehlikeli reaksiyonlar doğurabilir. Onunla aranıza klinik bir rasyonel mesafe koyarak tamamen sıradan, tehdit oluşturmayan nötr bir profil sergileyin."
    }
  ]);

  // Load saved notes once when selected lesson changes
  useEffect(() => {
    if (selectedLesson) {
      const savedNotes = localStorage.getItem("mentis_academy_notes");
      if (savedNotes) {
        try {
          setNotes(JSON.parse(savedNotes));
        } catch (e) {
          // ignore
        }
      }
    }
  }, [selectedLesson]);

  // Scroll to top of the page when a doctrine is selected or closed
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [selectedLesson]);

  const handleSaveNote = (lessonId: string, text: string) => {
    const updatedNotes = { ...notes, [lessonId]: text };
    setNotes(updatedNotes);
    localStorage.setItem("mentis_academy_notes", JSON.stringify(updatedNotes));
  };

  const filteredLessons = useMemo(() => {
    return LESSONS.filter(lesson => {
      const matchesCategory = selectedCategory === "all" || lesson.category === selectedCategory;
      const matchesSearch = lesson.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            lesson.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            lesson.categoryLabel.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [searchTerm, selectedCategory]);

  return (
    <>
      <div className="flex flex-col items-center w-full max-w-5xl mx-auto space-y-8 pb-20 animate-fade-in relative px-4 md:px-0 overflow-x-hidden">
      
      {/* Custom Styles Injection */}
      <style>{`
        @keyframes scaleIn {
          from { transform: scale(0.96); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(15px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-scale-in {
          animation: scaleIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-fade-in-fast {
          animation: fadeIn 0.25s ease-out forwards;
        }
        .animate-slide-up-custom {
          animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .custom-glow-hover {
          transition: all 0.4s ease;
        }
        .custom-glow-hover:hover {
          box-shadow: 0 0 25px rgba(212,175,55,0.08);
          border-color: rgba(212,175,55,0.25);
        }
      `}</style>

      {selectedLesson ? (
        /* ================= DETAIL VIEW (INLINE PAGE FLOW) ================= */
        <div className="w-full space-y-8 animate-slide-up-custom">
          
          {/* Back Button */}
          <div className="w-full flex justify-start">
            <button
              onClick={() => {
                setSelectedLesson(null);
                setActiveMimicIndex(0);
                setActiveImageIndex(0);
              }}
              className="flex items-center gap-2 text-ash hover:text-gold transition-colors text-xs font-accent uppercase tracking-widest"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Kütüphaneye Dön
            </button>
          </div>

          {/* Header */}
          <div className="text-left border-b border-obsidian/50 pb-6 space-y-2">
            <span className="text-[9px] text-gold font-accent tracking-[0.2em] uppercase">
              {selectedLesson.categoryLabel} DOKTRİNİ
            </span>
            <h3 className="text-xl sm:text-3xl font-medium text-smoke font-serif tracking-wider uppercase">
              {selectedLesson.title}
            </h3>
          </div>

          {/* Content & Action Split Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left pb-16 overflow-x-hidden">
            
            {/* Left Column - 7/12 width */}
            <div className="lg:col-span-7 space-y-6 overflow-x-hidden">
              
              {selectedLesson.id === "person-psychology" ? (
                /* Karakter Analizi & Video Analizleri Interactive Panel */
                <div className="space-y-6 overflow-x-hidden">
                  <div className="space-y-2 bg-void/40 p-4 border border-obsidian/50 rounded-sm">
                    <h4 className="text-xs font-serif text-gold uppercase tracking-wider flex items-center gap-2">
                      <Video className="w-4 h-4 text-gold" /> Video Analiz Laboratuvarı
                    </h4>
                    <p className="text-xs text-ash/90 leading-relaxed font-sans">
                      Analiz etmek istediğiniz karakterin videosunu sisteme yükleyebilir ya da mevcut analiz kütüphanesinden inceleme yapabilirsiniz. Sistemimiz milisaniyelik mikro ifadeleri ve ses tonu değişimlerini klinik olarak tarar.
                    </p>
                  </div>

                  {/* Video Player Display */}
                  {(() => {
                    const currentVideo = videos.find(v => v.id === selectedVideoId) || videos[0];
                    return (
                      <div className="space-y-4">
                        {/* Mock Video Player */}
                        <div 
                          ref={playerRef}
                          onClick={() => {
                            if (currentVideo.videoUrl) {
                              setIsPlaying(!isPlaying);
                            }
                          }}
                          className={`relative aspect-video w-full bg-void border border-obsidian/80 rounded-sm overflow-hidden group shadow-2xl ${
                            currentVideo.videoUrl ? "cursor-pointer" : ""
                          }`}
                        >
                          {/* Radar/Scanning Animation Grid */}
                          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(201,168,76,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(201,168,76,0.02)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none z-10" />
                          
                          {currentVideo.status === "processing" ? (
                            <div className="absolute inset-0 bg-void/90 flex flex-col items-center justify-center p-6 space-y-4 z-20">
                              <div className="relative w-16 h-16">
                                <div className="absolute inset-0 rounded-full border-2 border-gold/10" />
                                <div className="absolute inset-0 rounded-full border-2 border-t-gold animate-spin" />
                              </div>
                              <div className="text-center space-y-1.5">
                                <span className="text-[10px] text-gold font-accent tracking-[0.25em] uppercase font-bold flex items-center justify-center gap-1.5 animate-pulse">
                                  <Cpu className="w-3.5 h-3.5" /> KLİNİK TARAMA AKTİF
                                </span>
                                <p className="text-xs text-smoke font-medium">Saniyede 24 kare taranıyor...</p>
                                <p className="text-[10px] text-ash/60 italic font-accent max-w-xs">Yüz kasları (orbicularis oculi, zygomaticus major) ve ses frekansları deşifre ediliyor.</p>
                              </div>
                            </div>
                          ) : (
                            <>
                              {/* Scanning Line overlay */}
                              <div className="absolute left-0 w-full h-[2px] bg-gold/30 top-0 pointer-events-none shadow-[0_0_10px_rgba(201,168,76,0.5)] z-20" style={{
                                animation: "scan 4s linear infinite"
                              }} />
                              
                              
                              {/* Video Details Overlays */}
                              <div className="absolute top-3 right-3 bg-void/80 border border-obsidian px-2.5 py-1 rounded-sm text-[8px] font-accent tracking-widest text-green-400 flex items-center gap-1.5 z-20">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> DEŞİFRE TAMAMLANDI
                              </div>

                              {/* Live Video Tag or Thumbnail */}
                              {isPlaying && currentVideo.videoUrl ? (
                                <video
                                  ref={videoRef}
                                  src={currentVideo.videoUrl}
                                  className="absolute inset-0 w-full h-full object-contain bg-void z-0"
                                  autoPlay
                                  loop
                                  muted={isMuted}
                                  playsInline
                                />
                              ) : (
                                <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center border-b border-obsidian z-0">
                                  {/* Increased opacity of the cover thumbnail image */}
                                  <img 
                                    src={currentVideo.thumbnail} 
                                    className="absolute inset-0 w-full h-full object-cover grayscale opacity-45 transition-opacity duration-300 group-hover:opacity-60" 
                                  />
                                  
                                  {/* Premium play card overlay to clearly signal it is an interactive video */}
                                  <div className="relative z-10 flex flex-col items-center gap-3 bg-void/80 backdrop-blur-md px-6 py-5 border border-gold/25 rounded-sm shadow-2xl group-hover:scale-105 transition-all duration-300 border-dashed">
                                    <div className="w-12 h-12 rounded-full border-2 border-gold flex items-center justify-center bg-gold/15 group-hover:bg-gold/30 transition-colors">
                                      <Play className="w-5 h-5 text-gold fill-gold/25 ml-0.5" />
                                    </div>
                                    <span className="text-[9px] text-gold font-accent tracking-[0.25em] uppercase font-bold">ANALİZİ BAŞLAT (VİDEO)</span>
                                  </div>
                                </div>
                              )}

                              {/* Control Bar */}
                              <div 
                                className="absolute bottom-0 left-0 w-full bg-abyss/95 border-t border-obsidian p-3 flex justify-between items-center text-[10px] font-accent tracking-wider text-ash z-20"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <span className="truncate max-w-[120px] md:max-w-[200px]">{currentVideo.title}</span>
                                
                                <div className="flex items-center gap-3">
                                  {/* Play / Pause toggle */}
                                  {currentVideo.videoUrl && (
                                    <button
                                      onClick={() => setIsPlaying(!isPlaying)}
                                      className="text-ash hover:text-gold transition-colors p-1"
                                      title={isPlaying ? "Durdur" : "Oynat"}
                                    >
                                      {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                                    </button>
                                  )}

                                  {/* Volume controls */}
                                  {currentVideo.videoUrl && (
                                    <div className="flex items-center gap-1.5">
                                      <button
                                        onClick={() => setIsMuted(!isMuted)}
                                        className="text-ash hover:text-gold transition-colors p-1"
                                        title={isMuted ? "Sesi Aç" : "Sesi Kapat"}
                                      >
                                        {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                                      </button>
                                      {!isMuted && (
                                        <input
                                          type="range"
                                          min="0"
                                          max="1"
                                          step="0.05"
                                          value={volume}
                                          onChange={(e) => setVolume(parseFloat(e.target.value))}
                                          className="w-12 md:w-16 h-1 bg-void rounded-lg appearance-none cursor-pointer accent-gold border border-obsidian"
                                        />
                                      )}
                                    </div>
                                  )}

                                  {/* Fullscreen control */}
                                  {currentVideo.videoUrl && (
                                    <button
                                      onClick={handleFullscreen}
                                      className="text-ash hover:text-gold transition-colors p-1"
                                      title={isFullscreen ? "Tam Ekrandan Çık" : "Tam Ekran"}
                                    >
                                      {isFullscreen ? <Minimize className="w-3.5 h-3.5" /> : <Maximize className="w-3.5 h-3.5" />}
                                    </button>
                                  )}

                                  <span className="text-gold font-bold ml-1">
                                    {isPlaying ? "CANLI" : "02:18"}
                                  </span>
                                </div>
                              </div>
                            </>
                          )}
                        </div>

                        {/* CSS Styles for Video Scan */}
                        <style>{`
                          @keyframes scan {
                            0% { top: 0%; }
                            50% { top: 100%; }
                            100% { top: 0%; }
                          }
                        `}</style>

                        {/* Video List */}
                        <div className="space-y-2.5">
                          {/* Desktop Grid Selector */}
                          <div className="hidden md:block space-y-2.5">
                            <h5 className="text-[10px] text-gold font-accent tracking-widest uppercase border-b border-obsidian/40 pb-2">
                              📁 ANALİZ EDİLEN VİDEOLAR
                            </h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {videos.map(v => (
                                <div
                                  key={v.id}
                                  onClick={() => v.status === "completed" && setSelectedVideoId(v.id)}
                                  className={`p-3 border rounded-sm transition-all duration-300 text-left flex flex-col justify-between space-y-2 cursor-pointer ${
                                    selectedVideoId === v.id
                                      ? "border-gold bg-gold/5"
                                      : "border-obsidian bg-void/20 hover:border-obsidian-80"
                                  } ${v.status === "processing" ? "opacity-75 cursor-not-allowed" : ""}`}
                                >
                                  <div>
                                    <h6 className="text-xs font-serif text-smoke tracking-wide font-medium line-clamp-1">
                                      {v.title}
                                    </h6>
                                    <p className="text-[10px] text-ash/70 line-clamp-1 mt-0.5">
                                      {v.description || "Kullanıcı yüklemesi video dosyası."}
                                    </p>
                                  </div>
                                  <div className="flex justify-between items-center text-[8px] font-accent tracking-widest">
                                    <span className="text-ash/50 truncate max-w-[120px]">{v.url}</span>
                                    {v.status === "completed" ? (
                                      <span className="text-gold font-bold">ANALİZ EDİLDİ</span>
                                    ) : (
                                      <span className="text-amber-500 font-bold animate-pulse">ANALİZ EDİLİYOR...</span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Mobile Dropdown Selector */}
                          <div className="block md:hidden space-y-2.5">
                            <h5 className="text-[10px] text-gold font-accent tracking-widest uppercase border-b border-obsidian/40 pb-2">
                              👤 ANALİZ EDİLECEK KARAKTERİ SEÇİN
                            </h5>
                            <div className="relative">
                              <select
                                value={selectedVideoId}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  const targetVideo = videos.find(v => v.id === val);
                                  if (targetVideo && targetVideo.status === "completed") {
                                    setSelectedVideoId(val);
                                  }
                                }}
                                className="w-full bg-[#0d0d0d] border border-gold/30 text-smoke py-3 px-4 rounded-sm text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold font-serif appearance-none cursor-pointer"
                                style={{
                                  backgroundImage: `url("data:image/svg+xml;utf8,<svg fill='%23C9A84C' height='24' viewBox='0 0 24 24' width='24' xmlns='http://www.w3.org/2000/svg'><path d='M7 10l5 5 5-5z'/><path d='M0 0h24v24H0z' fill='none'/></svg>")`,
                                  backgroundPosition: 'right 12px center',
                                  backgroundRepeat: 'no-repeat',
                                  backgroundSize: '18px',
                                  paddingRight: '40px'
                                }}
                              >
                                {videos.map(v => (
                                  <option key={v.id} value={v.id} disabled={v.status !== "completed"} className="bg-[#0c0c0c] text-smoke">
                                    {v.title.split(" - ")[0]} {v.status !== "completed" ? "(Analiz Ediliyor)" : ""}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>

                        {/* Upload New Video Form - Locked Notice */}
                        <div className="bg-abyss/20 border border-obsidian p-5 rounded-sm space-y-3 text-center">
                          <Cpu className="w-6 h-6 text-gold mx-auto mb-1 animate-pulse" />
                          <h5 className="text-[10px] text-gold font-accent tracking-widest uppercase font-bold">
                            VİDEO ANALİZ LABORATUVARI KİLİTLİ
                          </h5>
                          <p className="text-xs text-ash/80 max-w-md mx-auto leading-relaxed">
                            Sistem güvenliği ve klinik analiz standartları gereğince yeni karakter analiz videoları sadece <strong>Mentis Oracle Editörleri</strong> tarafından eklenmektedir. Analiz edilmesini istediğiniz film/dizi karakterini Karargah üzerinden bildirebilirsiniz.
                          </p>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              ) : selectedLesson.id === "body-language" ? (
                /* Beden Dili & Mimikler Interactive Selector */
                <div className="space-y-6 overflow-x-hidden">
                  <div className="space-y-2 bg-void/40 p-4 border border-obsidian/50 rounded-sm">
                    <h4 className="text-xs font-serif text-gold uppercase tracking-wider">
                      📖 Mimik Seçimi ve Sözsüz Analiz
                    </h4>
                    <p className="text-xs text-ash/90 leading-relaxed font-sans">
                      Aşağıdaki butonları kullanarak analiz etmek istediğiniz spesifik mimiği seçin. Her ifade, klinik anatomisi ve stratejik baskı katsayısı ile detaylandırılmıştır.
                    </p>
                  </div>
                  
                  {/* Mimics Tabs */}
                  <div className="flex flex-wrap gap-2 border-b border-obsidian pb-4 w-full">
                    {MIMICS.map((mimic, index) => (
                      <button
                        key={mimic.id}
                        onClick={() => setActiveMimicIndex(index)}
                        className={`px-3 py-2 border rounded-sm text-[10px] font-accent tracking-wider uppercase transition-all duration-300 ${
                          activeMimicIndex === index
                            ? "bg-gold text-void border-gold font-bold shadow-md shadow-gold/5"
                            : "border-obsidian bg-void/25 text-ash hover:text-smoke"
                        }`}
                      >
                        {mimic.name.split(" (")[0]}
                      </button>
                    ))}
                  </div>

                  {/* Selected Mimic Content */}
                  <div className="space-y-4 animate-scale-in overflow-x-hidden" key={MIMICS[activeMimicIndex].id}>
                    <div className="space-y-2 bg-void/40 p-4 border border-obsidian/50 rounded-sm">
                      <h5 className="text-xs font-serif text-gold uppercase tracking-wider">
                        🧠 {MIMICS[activeMimicIndex].name} - Klinik Anatomi
                      </h5>
                      <p className="text-xs md:text-sm text-smoke/90 leading-relaxed font-sans">
                        {MIMICS[activeMimicIndex].anatomy}
                      </p>
                    </div>

                    <div className="space-y-2 bg-void/40 p-4 border border-obsidian/50 rounded-sm">
                      <h5 className="text-xs font-serif text-gold/85 uppercase tracking-wider">
                        ⚡ Stratejik Kullanım Protokolü
                      </h5>
                      <p className="text-xs md:text-sm text-smoke/90 leading-relaxed font-sans">
                        {MIMICS[activeMimicIndex].usage}
                      </p>
                    </div>

                    <div className="space-y-2 bg-gold/5 p-4 border border-gold/15 rounded-sm">
                      <h5 className="text-xs font-serif text-gold uppercase tracking-wider">
                        📊 Klinik Analiz & Değerlendirme
                      </h5>
                      <p className="text-xs md:text-sm text-smoke/95 italic leading-relaxed font-accent">
                        {MIMICS[activeMimicIndex].analysis}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                /* Standard Lesson Content */
                <div className="space-y-6 overflow-x-hidden">
                  <div className="space-y-2 bg-void/40 p-4 border border-obsidian/50 rounded-sm">
                    <h4 className="text-xs font-serif text-gold uppercase tracking-wider flex items-center gap-2">
                      📖 Doktrin Nedir?
                    </h4>
                    <p className="text-xs md:text-sm text-smoke/90 leading-relaxed whitespace-pre-wrap font-sans">
                      {selectedLesson.whatItIs}
                    </p>
                  </div>

                  <div className="space-y-2 bg-void/40 p-4 border border-obsidian/50 rounded-sm">
                    <h4 className="text-xs font-serif text-red-500/90 uppercase tracking-wider flex items-center gap-2">
                      ❌ Ne Değildir? / Sık Yapılan Hatalar
                    </h4>
                    <p className="text-xs md:text-sm text-smoke/90 leading-relaxed whitespace-pre-wrap font-sans">
                      {selectedLesson.whatItIsNot}
                    </p>
                  </div>

                  <div className="space-y-3 bg-void/40 p-4 border border-obsidian/50 rounded-sm">
                    <h4 className="text-xs font-serif text-gold uppercase tracking-wider flex items-center gap-2">
                      ⚡ Nasıl Uygulanır? (Protokol)
                    </h4>
                    <ul className="space-y-2.5">
                      {selectedLesson.howToApply.map((step, i) => (
                        <li key={i} className="text-xs md:text-sm text-smoke/90 font-sans leading-relaxed flex items-start gap-2">
                          <span className="mt-1.5 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-gold" />
                          <span>{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-2 bg-gold/5 p-4 border border-gold/15 rounded-sm">
                    <h4 className="text-xs font-serif text-gold uppercase tracking-wider flex items-center gap-2">
                      💬 Klinik Örnek Senaryo
                    </h4>
                    <p className="text-xs md:text-sm text-smoke/95 italic leading-relaxed font-accent">
                      &quot;{selectedLesson.scenario}&quot;
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column */}
            {selectedLesson.id === "person-psychology" ? (
              /* Clinical Profiling Report Layout */
              (() => {
                const currentVideo = videos.find(v => v.id === selectedVideoId) || videos[0];
                return (
                  <div className="lg:col-span-5 space-y-6 w-full overflow-x-hidden">
                    
                    <div className="bg-void/45 border border-gold/15 p-4 sm:p-6 rounded-sm space-y-5 text-left w-full shadow-lg relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
                      
                      <div className="flex flex-col sm:flex-row gap-2 justify-between sm:items-center border-b border-obsidian pb-3">
                        <span className="text-[10px] text-gold font-accent tracking-widest uppercase flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-gold" /> KLİNİK PROFİLLEME RAPORU
                        </span>
                        <span className="text-[8px] text-ash/40 font-accent uppercase">
                          AI DEĞERLENDİRMESİ
                        </span>
                      </div>

                      <div className="space-y-5 animate-scale-in">
                        
                        {/* Personality Type */}
                        <div className="space-y-1 bg-void/50 p-3.5 border border-obsidian/60 rounded-sm">
                          <span className="text-[9px] text-ash font-accent uppercase tracking-wider">Karakter Tipolojisi</span>
                          <p className="text-sm font-serif text-smoke font-bold tracking-wide">
                            {currentVideo.personality}
                          </p>
                        </div>

                        {/* Metrics Bars */}
                        <div className="space-y-3.5">
                          <div className="space-y-1">
                            <div className="flex justify-between text-[10px] font-accent uppercase tracking-wider">
                              <span className="text-ash">MİKRO-STRES ENDEKSİ</span>
                              <span className="text-red-400 font-bold">{currentVideo.stressIndex}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-void border border-obsidian rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full transition-all duration-1000" 
                                style={{ width: `${currentVideo.stressIndex}%` }}
                              />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <div className="flex justify-between text-[10px] font-accent uppercase tracking-wider">
                              <span className="text-ash">GÜVENİLİRLİK ENDEKSİ</span>
                              <span className="text-blue-400 font-bold">{currentVideo.credibilityIndex}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-void border border-obsidian rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full transition-all duration-1000" 
                                style={{ width: `${currentVideo.credibilityIndex}%` }}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Detailed Personality Analysis */}
                        <div className="space-y-2">
                          <span className="text-[9px] text-ash font-accent uppercase tracking-wider block">KLİNİK KİŞİLİK VE BEDEN DİLİ ANALİZİ</span>
                          <div className="text-xs text-smoke/90 leading-relaxed font-sans bg-void/35 p-4 border border-obsidian/50 rounded-sm whitespace-pre-wrap max-h-[240px] overflow-y-auto pr-1 scrollbar-custom animate-fade-in-fast">
                            {currentVideo.detailedAnalysis}
                          </div>
                        </div>

                        {/* Advice */}
                        <div className="bg-gold/5 p-4 border border-gold/15 rounded-sm space-y-1.5">
                          <span className="text-[9px] text-gold font-accent uppercase tracking-wider block font-bold">KLİNİK MÜZAKERE TAVSİYESİ</span>
                          <p className="text-xs text-smoke/90 leading-relaxed italic font-accent">
                            {currentVideo.advice}
                          </p>
                        </div>

                      </div>

                    </div>

                    {/* Strategy Notes Panel */}
                    <div className="bg-void/45 border border-obsidian p-4 rounded-sm space-y-3 text-left w-full shadow-md">
                      <div className="flex flex-col sm:flex-row gap-2 justify-between sm:items-center">
                        <span className="text-[10px] text-gold font-accent tracking-widest uppercase">
                          STRATEJİ NOTLARIM
                        </span>
                        <span className="text-[8px] text-ash/40 font-accent uppercase">
                          Lokal Kayıt
                        </span>
                      </div>
                      <textarea
                        value={notes[selectedLesson.id] || ""}
                        onChange={(e) => handleSaveNote(selectedLesson.id, e.target.value)}
                        placeholder="Bu karakterin analizine dayanarak bir sonraki adımınızı veya konuşma planınızı buraya not edin..."
                        className="w-full h-32 bg-void/80 border border-obsidian text-smoke placeholder:text-ash/30 p-3 rounded-sm text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold/60 transition-all font-sans resize-none scrollbar-custom"
                      />
                    </div>

                  </div>
                );
              })()
            ) : selectedLesson.id === "body-language" ? (
              /* Visuals & Notes Layout */
              <div className="lg:col-span-5 space-y-6 w-full overflow-x-hidden">
                
                {/* Visual Panel - Click to Zoom Lightbox */}
                <div 
                  onClick={() => setZoomedImage(MIMICS[activeMimicIndex].image)}
                  className="bg-void/65 border border-obsidian/60 p-6 rounded-sm flex flex-col items-center justify-center min-h-[300px] relative overflow-hidden group cursor-zoom-in hover:border-gold/30 transition-all duration-300 shadow-md"
                >
                  <div className="absolute top-3 left-3 text-[8px] font-accent text-gold/50 tracking-widest uppercase">
                    GÖRSEL İLLÜSTRASYON VE ANALİZ
                  </div>
                  
                  {/* Magnifying Glass Indicator */}
                  <div className="absolute inset-0 bg-void/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10">
                    <div className="flex items-center gap-2 bg-abyss border border-gold/20 px-3 py-1.5 rounded-sm text-xs text-gold font-accent tracking-widest uppercase">
                      <ZoomIn className="w-3.5 h-3.5" /> Görseli Büyüt
                    </div>
                  </div>

                  <div className="w-full flex flex-col items-center space-y-4">
                    <div className="w-full aspect-square max-w-[220px] border border-obsidian relative rounded-sm overflow-hidden bg-void">
                      <img 
                        src={MIMICS[activeMimicIndex].image} 
                        alt={MIMICS[activeMimicIndex].name}
                        className="w-full h-full object-cover grayscale opacity-90 transition-all duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-void via-transparent to-transparent opacity-60" />
                    </div>
                    <span className="text-[10px] text-ash font-accent uppercase tracking-wider text-center">
                      {MIMICS[activeMimicIndex].name} Şeması
                    </span>
                  </div>
                </div>

                {/* Strategy Notes Panel */}
                <div className="bg-void/45 border border-obsidian p-4 rounded-sm space-y-3 text-left w-full shadow-md">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-gold font-accent tracking-widest uppercase">
                      STRATEJİ NOTLARIM
                    </span>
                    <span className="text-[8px] text-ash/40 font-accent uppercase">
                      Lokal Kayıt
                    </span>
                  </div>
                  <textarea
                    value={notes[selectedLesson.id] || ""}
                    onChange={(e) => handleSaveNote(selectedLesson.id, e.target.value)}
                    placeholder="Bu mimiği veya duruşu kendi görüşmelerinizde nasıl konumlandıracaksınız? Planınızı buraya yazın..."
                    className="w-full h-36 bg-void/80 border border-obsidian text-smoke placeholder:text-ash/30 p-3 rounded-sm text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold/60 transition-all font-sans resize-none scrollbar-custom"
                  />
                </div>

              </div>
            ) : selectedLesson.image || (selectedLesson.images && selectedLesson.images.length > 0) ? (
              /* Visuals & Notes Layout for Standard Lessons with Images */
              (() => {
                const lessonImages = selectedLesson.images || [selectedLesson.image || ""];
                const currentImg = lessonImages[activeImageIndex] || lessonImages[0];
                return (
                  <div className="lg:col-span-5 space-y-6 w-full overflow-x-hidden">
                    
                    {/* Visual Panel - Click to Zoom Lightbox & Swipeable Carousel */}
                    <div 
                      className="bg-void/65 border border-obsidian/60 p-6 rounded-sm flex flex-col items-center justify-center min-h-[300px] relative overflow-hidden group hover:border-gold/30 transition-all duration-300 shadow-md"
                    >
                      <div className="absolute top-3 left-3 text-[8px] font-accent text-gold/50 tracking-widest uppercase z-20">
                        GÖRSEL DOKTRİN VE ANALİZ {lessonImages.length > 1 ? `(${activeImageIndex + 1}/${lessonImages.length})` : ""}
                      </div>
                      
                      {/* Prev / Next Buttons */}
                      {lessonImages.length > 1 && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveImageIndex((prev) => (prev === 0 ? lessonImages.length - 1 : prev - 1));
                            }}
                            className="absolute left-3 top-1/2 -translate-y-1/2 bg-void/90 border border-obsidian hover:text-gold hover:border-gold/50 rounded-full p-1.5 text-ash z-25 transition-all cursor-pointer"
                            title="Önceki Görsel"
                          >
                            <ArrowLeft className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveImageIndex((prev) => (prev === lessonImages.length - 1 ? 0 : prev + 1));
                            }}
                            className="absolute right-3 top-1/2 -translate-y-1/2 bg-void/90 border border-obsidian hover:text-gold hover:border-gold/50 rounded-full p-1.5 text-ash z-25 transition-all cursor-pointer"
                            title="Sonraki Görsel"
                          >
                            <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
                          </button>
                        </>
                      )}

                      {/* Magnifying Glass Indicator */}
                      <div 
                        onClick={() => setZoomedImage(currentImg)}
                        className="absolute inset-0 bg-void/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10 cursor-zoom-in"
                      >
                        <div className="flex items-center gap-2 bg-abyss border border-gold/20 px-3 py-1.5 rounded-sm text-xs text-gold font-accent tracking-widest uppercase">
                          <ZoomIn className="w-3.5 h-3.5" /> Görseli Büyüt
                        </div>
                      </div>

                      <div className="w-full flex flex-col items-center space-y-4">
                        <div className="w-full aspect-square max-w-[220px] border border-obsidian relative rounded-sm overflow-hidden bg-void">
                          <img 
                            src={currentImg} 
                            alt={selectedLesson.title}
                            className="w-full h-full object-cover grayscale opacity-90 transition-all duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-void via-transparent to-transparent opacity-60" />
                        </div>
                        <span className="text-[10px] text-ash font-accent uppercase tracking-wider text-center">
                          {selectedLesson.title} Şeması {lessonImages.length > 1 ? `(${activeImageIndex + 1})` : ""}
                        </span>
                        
                        {/* Dots Indicators */}
                        {lessonImages.length > 1 && (
                          <div className="flex gap-1.5 z-20 pt-1">
                            {lessonImages.map((_, idx) => (
                              <button
                                key={idx}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveImageIndex(idx);
                                }}
                                className={`w-1.5 h-1.5 rounded-full transition-all ${
                                  activeImageIndex === idx ? "bg-gold scale-125" : "bg-ash/30"
                                }`}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Strategy Notes Panel */}
                    <div className="bg-void/45 border border-obsidian p-4 rounded-sm space-y-3 text-left w-full shadow-md">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] text-gold font-accent tracking-widest uppercase">
                          STRATEJİ NOTLARIM
                        </span>
                        <span className="text-[8px] text-ash/40 font-accent uppercase">
                          Lokal Kayıt
                        </span>
                      </div>
                      <textarea
                        value={notes[selectedLesson.id] || ""}
                        onChange={(e) => handleSaveNote(selectedLesson.id, e.target.value)}
                        placeholder="Bu doktrini kendi hayatınızda ve stratejinizde nasıl uygulayacaksınız? Planınızı buraya yazın..."
                        className="w-full h-36 bg-void/80 border border-obsidian text-smoke placeholder:text-ash/30 p-3 rounded-sm text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold/60 transition-all font-sans resize-none scrollbar-custom"
                      />
                    </div>

                  </div>
                );
              })()
            ) : (
              /* Strategy Journal Box Only */
              <div className="lg:col-span-5 space-y-6 w-full overflow-x-hidden">
                <div className="bg-void/45 border border-gold/15 p-4 sm:p-6 rounded-sm space-y-4 text-left w-full shadow-lg">
                  <div className="flex flex-col sm:flex-row gap-2 justify-between sm:items-center border-b border-obsidian pb-3">
                    <span className="text-[10px] text-gold font-accent tracking-widest uppercase">
                      STRATEJİK UYGULAMA NOTLARI
                    </span>
                    <span className="text-[8px] text-ash/40 font-accent uppercase">
                      LOKAL DOKTRİN KAYDI
                    </span>
                  </div>
                  <p className="text-xs text-ash/85 leading-relaxed font-sans">
                    Bu klinik yöntemi kendi iş veya ilişki çerçevenizde nasıl konumlandıracaksınız? Planınızı aşağıya kaydedin.
                  </p>
                  <textarea
                    value={notes[selectedLesson.id] || ""}
                    onChange={(e) => handleSaveNote(selectedLesson.id, e.target.value)}
                    placeholder="Kişisel uygulama stratejinizi, diyalog hazırlıklarınızı ve çapa noktalarınızı buraya yazın..."
                    className="w-full h-80 bg-void/80 border border-obsidian text-smoke placeholder:text-ash/30 p-3 rounded-sm text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold/60 transition-all font-sans resize-none scrollbar-custom"
                  />
                </div>
              </div>
            )}

          </div>

          {/* Footer Actions */}
          <div className="flex justify-end pt-6 border-t border-obsidian/50">
            <button
              onClick={() => {
                setSelectedLesson(null);
                setActiveMimicIndex(0);
                setActiveImageIndex(0);
              }}
              className="bg-gold text-void px-8 py-3 rounded-sm text-xs font-accent tracking-widest uppercase font-bold hover:bg-gold-dim transition-colors shadow-md shadow-gold/5"
            >
              Anlaşıldı, Kütüphaneye Dön
            </button>
          </div>

        </div>
      ) : (
        /* ================= GRID VIEW (DEFAULT CARD LIST FLOW) ================= */
        <div className="w-full space-y-8 animate-fade-in">
          
          {/* Back Button */}
          <div className="w-full flex justify-start">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-ash hover:text-gold transition-colors text-xs font-accent uppercase tracking-widest"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Karargaha Dön
            </Link>
          </div>

          {/* Header */}
          <div className="text-center space-y-2 w-full px-4">
            <div className="text-xs md:text-sm tracking-[0.35em] text-gold font-bold uppercase font-accent">
              KLİNİK METODOLOJİ VE STRATEJİK DOKTRİNLER REHBERReHBERİ
            </div>
            <h2 className="font-serif text-3xl md:text-5xl text-smoke tracking-wider uppercase font-medium">
              MENTIS <span className="text-gold font-normal">AKADEMİ</span>
            </h2>
            <p className="font-accent text-ash italic md:text-lg max-w-lg mx-auto">
              Güç mücadeleleri ve zihin savaşlarında masayı yöneten klinik kurallar.
            </p>
          </div>

          {/* Search and Filters */}
          <div className="w-full flex flex-col md:flex-row gap-4 justify-between items-center bg-abyss/45 border border-obsidian/60 p-4 rounded-sm">
            
            {/* Search Bar */}
            <div className="relative w-full md:max-w-xs">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ash/40" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Doktrin veya mimik ara..."
                className="w-full bg-void border border-obsidian text-smoke placeholder:text-ash/30 pl-10 pr-4 py-2 rounded-sm text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold transition-all"
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm("")} 
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ash/40 hover:text-smoke"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Category Tabs */}
            <div className="flex flex-wrap gap-2 justify-center">
              {[
                { id: "all", label: "Tüm Doktrinler" },
                { id: "strategy", label: "Saldırı & Strateji" },
                { id: "defense", label: "Zihinsel Savunma" },
                { id: "rhetoric", label: "Retorik" },
                { id: "body", label: "Beden Dili" },
                { id: "psychology", label: "Klinik Psikoloji" }
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id as any)}
                  className={`px-3 py-1.5 border rounded-sm text-[10px] font-accent tracking-widest uppercase transition-all duration-300 ${
                    selectedCategory === cat.id
                      ? "bg-gold text-void border-gold font-bold shadow-md"
                      : "border-obsidian bg-void/30 text-ash hover:text-smoke hover:border-obsidian/80"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

          </div>

          {/* Grid of Lessons */}
          {filteredLessons.length === 0 ? (
            <div className="w-full py-20 border border-dashed border-obsidian/30 bg-abyss/10 text-center rounded-sm space-y-2">
              <p className="text-sm text-ash font-accent italic">Aradığınız kriterlere uygun bir doktrin veya taktik bulunamadı.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
              {filteredLessons.map((lesson) => {
                return (
                  <div
                    key={lesson.id}
                    onClick={() => {
                      setSelectedLesson(lesson);
                      setActiveMimicIndex(0);
                      setActiveImageIndex(0);
                    }}
                    className="group border border-obsidian/50 bg-abyss/30 hover:border-gold/30 hover:bg-abyss/50 p-6 rounded-sm flex flex-col justify-between space-y-6 transition-all duration-500 cursor-pointer relative overflow-hidden custom-glow-hover"
                  >
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-gold/15 to-transparent transition-all duration-500 group-hover:via-gold/45" />
                    
                    <div className="space-y-3">
                      <span className={`inline-block text-[8px] font-accent tracking-widest uppercase px-2 py-0.5 border rounded-sm ${
                        lesson.category === "strategy" ? "text-red-400 bg-red-950/10 border-red-900/30" :
                        lesson.category === "defense" ? "text-blue-400 bg-blue-950/10 border-blue-900/30" :
                        lesson.category === "rhetoric" ? "text-purple-400 bg-purple-950/10 border-purple-900/30" :
                        lesson.category === "psychology" ? "text-emerald-400 bg-emerald-950/10 border-emerald-900/30" :
                        "text-amber-400 bg-amber-950/10 border-amber-900/30"
                      }`}>
                        {lesson.categoryLabel}
                      </span>
                      
                      <h3 className="font-serif text-lg text-smoke group-hover:text-gold transition-colors tracking-wide font-medium">
                        {lesson.title}
                      </h3>
                      
                      <p className="text-xs text-ash/80 leading-relaxed font-sans line-clamp-3">
                        {lesson.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-obsidian/30 flex items-center justify-between text-[10px] font-accent tracking-widest text-gold uppercase group-hover:text-white transition-colors">
                      <span>Doktrini İncele</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

    </div>

    {/* LIGHTBOX ZOOM MODAL */}
    {zoomedImage && (
      <div 
        onClick={() => setZoomedImage(null)}
        className="fixed inset-0 bg-void/96 backdrop-blur-md z-[100] flex items-center justify-center p-4 cursor-zoom-out animate-fade-in-fast"
      >
        <div className="relative max-w-4xl max-h-[90vh] w-full h-full flex items-center justify-center animate-scale-in">
          <img 
            src={zoomedImage} 
            alt="Zoomed Mimic Diagram" 
            className="max-w-full max-h-full object-contain border border-gold/20 rounded-sm shadow-2xl bg-void"
          />
          <button 
            onClick={() => setZoomedImage(null)}
            className="absolute top-4 right-4 text-smoke hover:text-gold transition-colors bg-abyss/85 border border-obsidian p-2 rounded-full shadow-lg"
            title="Kapat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    )}
  </>
);
}
