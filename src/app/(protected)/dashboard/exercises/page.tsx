"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { 
  ArrowLeft, Brain, Shield, User, HelpCircle, AlertOctagon, Quote, Flame, Star, 
  Volume2, VolumeX, Sparkles, FileText, Cpu, Clock, Dumbbell, ArrowRight,
  Play, Pause, Copy, Check
} from "lucide-react";
import Link from "next/link";

interface ExerciseItem {
  title: string;
  duration: string;
  steps: string[];
}

interface TrainingCategory {
  id: string;
  title: string;
  icon: any;
  description: string;
  men: ExerciseItem[];
  women: ExerciseItem[];
  illustration: string;
}

interface TekerlemeItem {
  phrase: string;
  difficulty: string;
  target: string;
}

const TEKERLEMELER: TekerlemeItem[] = [
  {
    phrase: "Şu köşe yaz köşesi, şu köşe kış köşesi, ortada su şişesi.",
    difficulty: "Kolay",
    target: "Ş ve S Sesleri"
  },
  {
    phrase: "Bir berber bir berbere gel beraber bir berber dükkanı açalım demiş.",
    difficulty: "Kolay",
    target: "B ve R Sesleri"
  },
  {
    phrase: "Sizin damda var beş boz başlı beş boz ördek, bizim damda var beş boz başlı beş boz ördek. Sizin damdaki beş boz başlı beş boz ördek, bizim damdaki beş boz başlı beş boz ördeğe demiş ki: Bizim damdaki beş boz başlı beş boz ördek, sizin damdaki beş boz başlı beş boz ördeğe benzemiyor.",
    difficulty: "Zor",
    target: "B, Z ve Ö Sesleri"
  },
  {
    phrase: "Kartal kalkar dal sarkar, dal sarkar kartal kalkar.",
    difficulty: "Orta",
    target: "K, L, R Sesleri"
  },
  {
    phrase: "Şu duvarı malalamalı mı malalamamalı mı?",
    difficulty: "Kolay",
    target: "M ve L Sesleri"
  },
  {
    phrase: "Geçen gece Karaköy'den kalkan karpuz yüklü kayık, kalktı durdu, kalktı durdu, sonra battı.",
    difficulty: "Orta",
    target: "K ve R Sesleri"
  }
];

const TRAINING_CATEGORIES: TrainingCategory[] = [
  {
    id: "rhetoric",
    title: "Hitabet & Diksiyon",
    icon: Volume2,
    description: "Ses tınısı kontrolü, diyafram nefesi, es kullanımı ve konuşma hızını yöneterek dominant ses varlığı oluşturma.",
    illustration: "/exercises/rhetoric_exercise.png",
    men: [
      {
        title: "Diyafram ve Pes Ses Rezonansı",
        duration: "Günde 1 kez / 10 Dk",
        steps: [
          "Sırtüstü yatıp karnınıza 2 kg ağırlığında ağır bir kitap koyun ve göğsünüzü oynatmadan sadece diyaframdan nefes alarak kitabın inip kalkmasını izleyin.",
          "Nefesinizi yavaşça dışarı verirken ağzınız kapalı şekilde 'Mmmmmm' sesi çıkararak ses tellerinizin ve göğüs kafesinizin titreşmesini (pes tınısını) hissedin.",
          "Yavaş ve kalın (pes) tondan, her kelimenin son hecesini yutmadan ayna karşısında şu cümleyi okuyun: 'Güç, gürültüde değil; sessiz kararlılıktadır.'"
        ]
      },
      {
        title: "Monotonluğu Kırma ve Es Gücü",
        duration: "Günde 1 kez / 5 Dk",
        steps: [
          "Konuşurken her 4-5 kelimede bir kasıtlı olarak 1.5 saniyelik tam sessizlik (es) verme pratiği yapın.",
          "Önemli bir kelimeyi söylemeden hemen önce sesinizi hafifçe alçaltın, kelimeyi söyledikten sonra es vererek havada asılı kalmasını sağlayın.",
          "Konuşma hızınızı normal temponuzun %40 altına düşürerek tane tane konuşun. Acelecilik zayıflık sinyalidir."
        ]
      }
    ],
    women: [
      {
        title: "Melodik Akış ve Tane Tane Telaffuz",
        duration: "Günde 1 kez / 10 Dk",
        steps: [
          "Nefesinizi diyaframdan alarak sesinizin konuşma esnasında tizleşmesini (incelmesini) ve telaşlı durmasını kesin olarak engelleyin.",
          "Dudak ve çene kaslarınızı abartılı şekilde hareket ettirerek tekerleme okuyun. Her kelime kristal berraklığında ve tane tane çıkmalıdır.",
          "Ses tonunuza hafif iniş-çıkışlar (melodik akış) ekleyerek monotonluğu kırın ancak kurumsal ağırlığınızı ve mesafenizi koruyun."
        ]
      },
      {
        title: "Netlik ve Onay Arama Karşıtı Konuşma",
        duration: "Günde 1 kez / 5 Dk",
        steps: [
          "Cümlelerinizin sonuna 'değil mi?', 'anlatabildim mi?', 'yani', 'şey' gibi onay arayan ek kelimeler getirmeyi tamamen bırakın.",
          "Cümlelerinizi soru sorar gibi yükselen bir tonlamayla bitirmek yerine, düz ve net bir nokta koyarak kendinden emin şekilde sonlandırın.",
          "Birisi size soru sorduğunda, yanıt vermeden önce 1 saniye bekleyip yavaşça konuşmaya başlayarak heyecanınızı kontrol edin."
        ]
      }
    ]
  },
  {
    id: "body",
    title: "Beden Dili & Duruş",
    icon: User,
    description: "Baskın vücut dili duruşları, göz teması kontrolü, mekansal dominans ve otonom tepki yönetimi.",
    illustration: "/exercises/body_exercise.png",
    men: [
      {
        title: "Mekansal Dominans ve Güç Çadırı",
        duration: "Günde 2 kez / 5 Dk",
        steps: [
          "Sandalyede otururken omuzlarınızı rahat bırakarak geriye çekin, dirseklerinizi açarak kollarınızı masada geniş bir alana yayın.",
          "Ellerinizi karın veya göğüs hizasında birleştirip parmak uçlarınızı birbirine değdirerek 'Güç Çadırı' (Steepling) yapın. Bu, zihinsel dominans sinyalidir.",
          "Çene açınızı yatayla 10-15 derece yukarıda tutarak, ayna karşısında 3 dakika boyunca göz kırpma sıklığınızı düşürüp hareketsiz durun."
        ]
      },
      {
        title: "Poker Face ve Mikro İfade Blokajı",
        duration: "Günde 1 kez / 3 Dk",
        steps: [
          "Göz kırpma refleksinizi yavaşlatarak dakikada 5-6 seviyesine indirin. Delici ve sabit bir odaklanma sağlayın.",
          "Yüzünüzdeki tüm mimik kaslarını tamamen gevşetin. Hayali bir kriz anı düşünün ve yüzünüzde en ufak bir kasılma veya tepki vermeyin.",
          "Konuşurken başınızı sürekli sallamaktan kaçının. Başınızı dik ve sabit tutmak hiyerarşik üstünlüğü pekiştirir."
        ]
      }
    ],
    women: [
      {
        title: "Zarif Dominans ve Açık Duruş",
        duration: "Günde 2 kez / 5 Dk",
        steps: [
          "Sırtınızı dikleştirin, omuzlarınızı arkaya ve aşağıya doğru bastırarak boyun hattınızı ve çenenizi ön plana çıkarın.",
          "Konuşurken ellerinizi kenetlemek yerine, avuç içleriniz hafif yukarı bakacak şekilde kararlı ve açık jestler yapma pratiği yapın.",
          "Karşı tarafın alanınızı daraltmasına izin vermeyin; postürünüzü dik tutarak kendi kişisel alan sınırlarınızı koruyun."
        ]
      },
      {
        title: "Göz Teması ve Çekim Üçgeni",
        duration: "Günde 1 kez / 3 Dk",
        steps: [
          "Ayna karşısında kendi gözlerinize bakın. Bakışlarınızı göz bebeklerinizden alnınızın ortasına kaydıran 'Güç Üçgeni'ni çalışın.",
          "Göz teması kurarken gözlerinizi kısmayın veya telaşla kaçırmayın. Sakin, derin ve kararlı bir odaklanma süresi belirleyin.",
          "Sözlü bir shit-test veya iğneleyici eleştiri geldiğinde gözlerinizi 2 saniye boyunca kırpmadan karşınızdakine odaklayın."
        ]
      }
    ]
  },
  {
    id: "defense",
    title: "Zihinsel Savunma & Kalkan",
    icon: Shield,
    description: "Duygusal reaktiviteyi sıfırlama, zihinsel karantina, manipülasyon blokajı ve sınır ihlallerini savuşturma.",
    illustration: "/exercises/psychology_exercise.png",
    men: [
      {
        title: "Amigdala Duyarsızlaştırma (Kriz Provası)",
        duration: "Günde 1 kez / 5 Dk",
        steps: [
          "Zihninizde en çok çekindiğiniz sosyal veya kurumsal kriz senaryosunu (örn. başarısızlık, topluluk önünde eleştirilmek) hayal edin.",
          "Bu esnada derin diyafram nefesi alarak kalp ritminizi tamamen sakin tutun. Olayı bir film gibi dışarıdan izleyin.",
          "Krize karşı vereceğiniz ilk 3 soğukkanlı ve rasyonel adımı yazarak zihninizi korkuya karşı önceden aşılayın."
        ]
      },
      {
        title: "Tepkisizlik ve Güç Soğurma",
        duration: "Günde 1 kez / 3 Dk",
        steps: [
          "Size yöneltilen provokatif veya suçlayıcı bir lafı duyduğunuzda anında cevap vermeyi reddedin.",
          "Zihninizde yavaşça 3 saniye sayın, yüz ifadenizi ve duruşunuzu tamamen nötr tutarak karşınızdakine bakın.",
          "Savunma yapmadan, tamamen düz bir ses tonuyla: 'Bunu şu an bana söylemende nasıl bir rasyonel amaç var?' sorusunu çalışın."
        ]
      }
    ],
    women: [
      {
        title: "Duygusal Karantina ve Otopsi",
        duration: "Günde 1 kez / 5 Dk",
        steps: [
          "Gün içinde sizi üzen, öfkelendiren veya sınırlarınızı ihlal eden bir olayı akşam sakin kafayla kağıda dökün.",
          "Olayı yazarken 'üzüldüm', 'kırıldım' gibi duygusal ifadeler yerine tamamen klinik bir vaka raporu gibi mesafeli yazın.",
          "Karşı tarafın manipülasyon amacını mantıksal olarak teşhis edin ve duyguyu zihninizden tamamen serbest bırakın."
        ]
      },
      {
        title: "Sınır Çizme ve Hayır Deme Protokolü",
        duration: "Günde 1 kez / 3 Dk",
        steps: [
          "Açıklama yapmadan, bahane üretmeden veya kendinizi suçlu hissetmeden kibarca ama tavizsiz şekilde 'Hayır' deme pratiği yapın.",
          "Örn: 'Bu harika bir teklif ama benim şu anki önceliklerimle uyuşmuyor, katılamayacağım.' deyin ve susun. Bahane üretmek zayıflıktır.",
          "Sessizlik baskısını karşı tarafta bırakın, o boşluğu doldurmak için konuşmaya devam etmeyin."
        ]
      }
    ]
  },
  {
    id: "social",
    title: "Sosyal Hiyerarşi & Nüfuz",
    icon: Brain,
    description: "Ortamlardaki güç hiyerarşisini çözme, statü sinyal koruması, shit-test bozma ve taktiksel koalisyonlar.",
    illustration: "/exercises/social_exercise.png",
    men: [
      {
        title: "Sosyal Shit-Test Savuşturma",
        duration: "Haftada 3 kez / 5 Dk",
        steps: [
          "Ayna karşısında size atılan küçümseyici şakalara karşı 'Mizahi Büyütme' veya 'Klinik Teşhis' yanıtlarını çalışın.",
          "Suçlu veya savunmacı çerçeveye düşmeden, sakin bir tebessümle saldırganın oyununu ona geri yansıtın.",
          "Örn: 'Şu an beni küçük düşürmeye çalışarak grupta kendi statünü mü yükseltmeye çalışıyorsun? Varsa teknik argümanın onu dinleyelim.' deyin."
        ]
      },
      {
        title: "Grup İçi Hiyerarşi Analizi",
        duration: "Sosyal ortamlarda uygulanır",
        steps: [
          "Bir ortama girdiğinizde ilk 5 dakika konuşmadan sadece köşeden etkileşimleri ve beden dillerini izleyin.",
          "İnsanların espri yapılınca ilk kime baktığını (lider), kimin sürekli sözünün kesildiğini (zayıf halka) tespit edin.",
          "Kimin onay aradığını, kimin ise onay dağıttığını zihninizde haritalandırın ve doğrudan onay dağıtıcıya odaklanın."
        ]
      }
    ],
    women: [
      {
        title: "Sosyal Nüfuz ve Sessiz Otorite",
        duration: "Haftada 3 kez / 5 Dk",
        steps: [
          "Ortamda sesinizi yükselterek değil, tam tersine sesinizi alçaltıp kelimelerinizi yavaşlatarak tüm dikkatleri üzerinize çekin.",
          "Sözöz kesildiğinde konuşmayı hemen durdurun, kesen kişiye gözünüzü kırpmadan 2 saniye sessizce bakın ve kaldığınız yerden sakin tonda devam edin.",
          "Grup içinde konuşurken göz temasını üyeler arasında eşit dağıtarak sözsüz güven sinyali verin."
        ]
      },
      {
        title: "İttifak ve Koalisyon Kurma",
        duration: "Sosyal ortamlarda uygulanır",
        steps: [
          "İş veya arkadaşlık grubunda duygusal yandaşlık aramak yerine, ortak hedefleri olan güçlü profillerle rasyonel bağlar kurun.",
          "İttifakı 'yardım isteme' olarak değil, 'karşılıklı rasyonel fayda ve ortak kazanım' olarak sunma pratiği yapın.",
          "İttifak kurulan kişiyle duygusal bağ kurmadan, sadece rasyonel hedefler doğrultusunda hareket edin."
        ]
      }
    ]
  },
  {
    id: "negotiation",
    title: "Müzakere & İkna",
    icon: FileText,
    description: "Kırmızı çizgi yönetimi, kazan-kazan illüzyonu, bilgi asimetrisi ve narsisistik aynalama.",
    illustration: "/exercises/strategy_exercise.png",
    men: [
      {
        title: "Kırmızı Çizgi ve Masayı Terk Etme",
        duration: "Müzakere öncesi / 5 Dk",
        steps: [
          "Herhangi bir pazarlığa girmeden önce kabul edebileceğiniz en son noktayı (kırmızı çizgi) net olarak belirleyin.",
          "Bu nokta aşıldığında zerre tereddüt etmeden 'Anlaşamayacağız sanırım, vaktiniz için teşekkürler' deyip masadan kalkma provası yapın.",
          "Masadan kalkarken sesinizde hiçbir öfke veya pişmanlık belirtisi olmamasına çalışın. Soğukkanlılık caydırıcıdır."
        ]
      },
      {
        title: "Bilgi Asimetrisi ve Gizem Koruma",
        duration: "Günde 1 kez / 5 Dk",
        steps: [
          "Karşı tarafın ne bildiğinizi çözememesi için planlarınızı, bütçenizi veya gerçek düşüncelerinizi gizli tutun.",
          "Sorulara net bilgiler vermek yerine, ucu açık ve stratejik yanıtlar vererek karşı tarafı hamle yapmaya zorlayın.",
          "Sözsel paylaşımı durdurduğunuzda karşınızdakilerin merakının nasıl arttığını izleyin."
        ]
      }
    ],
    women: [
      {
        title: "Kazan-Kazan İllüzyonu Yönetimi",
        duration: "Müzakere öncesi / 5 Dk",
        steps: [
          "Müzakerelerde karşı tarafın kazanma tatmini (ego tatmini) yaşaması için feda edeceğiniz 2 önemsiz taviz hazırlayın.",
          "O bu tavizleri aldığında ne kadar çetin bir pazarlıkçı olduğunu dile getirin, o sırada asıl istediğiniz stratejik maddeyi onaylatın.",
          "Müşteri veya ortak küçük tavizleri aldığında onun zaferini kutlayıp asıl maddeyi itirazsız geçirin."
        ]
      },
      {
        title: "Narsisistik Aynalama Protokolü",
        duration: "Sosyal temas esnasında",
        steps: [
          "Karşı tarafın konuşma temposunu, ses tonunu ve sık kullandığı kelimeleri hafifçe kopyalayarak konuşma akışına dahil edin.",
          "Onun en çok değer verdiği konuyu onaylayarak bilinçaltında sarsılmaz bir güven bağı kurun.",
          "Onun değerlerini ve fikirlerini ona yansıtarak zihnindeki savunma kalkanlarını tamamen indirin."
        ]
      }
    ]
  }
];

export default function ExercisesPage() {
  const [activeCategory, setActiveCategory] = useState("rhetoric");
  const [exerciseGender, setExerciseGender] = useState<"men" | "women">("men");
  const [completedExercises, setCompletedExercises] = useState<Record<string, boolean>>({});
  const [isRecording, setIsRecording] = useState(false);
  const [recordings, setRecordings] = useState<any[]>([]);
  const [completionHistory, setCompletionHistory] = useState<Record<string, number>>({});
  const [isMounted, setIsMounted] = useState(false);

  // New Custom Audio Player & Visualizer States
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recordingIntervalRef = useRef<any>(null);

  useEffect(() => {
    setIsMounted(true);
    const saved = localStorage.getItem("mentis_completed_exercises");
    if (saved) {
      try {
        setCompletedExercises(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
    const savedHistory = localStorage.getItem("mentis_daily_completion_history");
    if (savedHistory) {
      try {
        setCompletionHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error(e);
      }
    }

    const request = indexedDB.open("MentisAudioDB", 1);
    request.onupgradeneeded = (e: any) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains("recordings")) {
        db.createObjectStore("recordings", { keyPath: "id" });
      }
    };
    request.onsuccess = (e: any) => {
      const db = e.target.result;
      loadAllRecordings(db);
    };

    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    };
  }, []);

  const loadAllRecordings = (db: IDBDatabase) => {
    const transaction = db.transaction("recordings", "readonly");
    const store = transaction.objectStore("recordings");
    const request = store.getAll();
    request.onsuccess = () => {
      const loaded = request.result.map((item: any) => ({
        ...item,
        url: URL.createObjectURL(item.blob)
      }));
      loaded.sort((a: any, b: any) => b.timestamp.localeCompare(a.timestamp));
      setRecordings(loaded);
    };
  };

  const saveRecordingToDB = (audioBlob: Blob) => {
    if (typeof window === "undefined") return;
    const id = "rec_" + Date.now();
    const timestamp = new Date().toLocaleString("tr-TR");
    const name = `Diksiyon Kaydı - ${new Date().toLocaleDateString("tr-TR")}`;
    
    const request = indexedDB.open("MentisAudioDB", 1);
    request.onsuccess = (e: any) => {
      const db = e.target.result;
      const transaction = db.transaction("recordings", "readwrite");
      const store = transaction.objectStore("recordings");
      
      const record = { id, timestamp, blob: audioBlob, name };
      const addRequest = store.add(record);
      
      addRequest.onsuccess = () => {
        loadAllRecordings(db);
      };
    };
  };

  const deleteRecordingFromDB = (id: string) => {
    if (typeof window === "undefined") return;
    
    // Stop playback if the deleted item is playing
    if (playingId === id) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setPlayingId(null);
      setIsPlaying(false);
    }

    const request = indexedDB.open("MentisAudioDB", 1);
    request.onsuccess = (e: any) => {
      const db = e.target.result;
      const transaction = db.transaction("recordings", "readwrite");
      const store = transaction.objectStore("recordings");
      
      const deleteRequest = store.delete(id);
      deleteRequest.onsuccess = () => {
        loadAllRecordings(db);
      };
    };
  };

  const renameRecording = (id: string, currentName: string) => {
    if (typeof window === "undefined") return;
    const newName = prompt("Kayıt adını düzenleyin:", currentName);
    if (!newName || newName.trim() === "") return;
    
    const request = indexedDB.open("MentisAudioDB", 1);
    request.onsuccess = (e: any) => {
      const db = e.target.result;
      const transaction = db.transaction("recordings", "readwrite");
      const store = transaction.objectStore("recordings");
      
      const getReq = store.get(id);
      getReq.onsuccess = () => {
        const record = getReq.result;
        record.name = newName;
        const putReq = store.put(record);
        putReq.onsuccess = () => {
          loadAllRecordings(db);
        };
      };
    };
  };

  const toggleExercise = (id: string) => {
    const updated = {
      ...completedExercises,
      [id]: !completedExercises[id]
    };
    setCompletedExercises(updated);
    localStorage.setItem("mentis_completed_exercises", JSON.stringify(updated));
  };

  const startRecording = async () => {
    if (typeof window === "undefined") return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        saveRecordingToDB(audioBlob);
        
        // Stop all tracks on the stream to release microphone
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setIsRecording(true);
      
      // Start recording timer
      setRecordingSeconds(0);
      if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
      recordingIntervalRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Mikrofon erişim hatası:", err);
      alert("Mikrofona erişilemedi. Lütfen izinlerinizi kontrol edin.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }
    }
  };

  const handlePlayPause = (rec: any) => {
    if (!audioRef.current) return;
    
    if (playingId === rec.id) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play().catch(e => console.error("Playback error:", e));
        setIsPlaying(true);
      }
    } else {
      audioRef.current.pause();
      audioRef.current.src = rec.url;
      audioRef.current.load();
      setPlayingId(rec.id);
      setIsPlaying(true);
      setCurrentTime(0);
      setDuration(0);
      audioRef.current.play().catch(e => console.error("Playback error:", e));
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return "0:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const handleCopyTekerleme = (phrase: string, idx: number) => {
    if (typeof window === "undefined") return;
    navigator.clipboard.writeText(phrase);
    setCopiedIndex(idx);
    setTimeout(() => {
      setCopiedIndex(null);
    }, 2000);
  };

  const getWeeklyData = () => {
    const days = [];
    const today = new Date();
    const dayNames = ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"];
    
    const currentDay = today.getDay();
    const mondayDiff = currentDay === 0 ? -6 : 1 - currentDay;
    const monday = new Date(today);
    monday.setDate(today.getDate() + mondayDiff);
    
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const dateStr = d.toISOString().split("T")[0];
      const name = dayNames[d.getDay()];
      days.push({ dateStr, name, isToday: dateStr === today.toISOString().split("T")[0] });
    }
    return days;
  };

  const getMonthlyData = () => {
    const days = [];
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const totalDays = new Date(year, month + 1, 0).getDate();
    
    for (let i = 1; i <= totalDays; i++) {
      const date = new Date(year, month, i);
      const dateStr = date.toISOString().split("T")[0];
      days.push({ dayNum: i, dateStr });
    }
    return days;
  };

  const totalExercises = 10;
  const completedCount = TRAINING_CATEGORIES.reduce((acc, cat) => {
    const exercises = exerciseGender === "men" ? cat.men : cat.women;
    exercises.forEach((_, idx) => {
      const id = `${cat.id}_${exerciseGender}_${idx}`;
      if (completedExercises[id]) {
        acc++;
      }
    });
    return acc;
  }, 0);
  const progressPercent = totalExercises > 0 ? Math.round((completedCount / totalExercises) * 100) : 0;

  // Save progress rate to history on change
  useEffect(() => {
    if (!isMounted) return;
    const todayStr = new Date().toISOString().split("T")[0];
    const updatedHistory = {
      ...completionHistory,
      [todayStr]: progressPercent
    };
    setCompletionHistory(updatedHistory);
    localStorage.setItem("mentis_daily_completion_history", JSON.stringify(updatedHistory));
  }, [progressPercent, isMounted]);

  const currentCategory = TRAINING_CATEGORIES.find(c => c.id === activeCategory) || TRAINING_CATEGORIES[0];
  const currentExercises = exerciseGender === "men" ? currentCategory.men : currentCategory.women;

  return (
    <div className="min-h-screen bg-void text-smoke flex flex-col font-sans pb-12">
      {/* Top Banner & Navigation Back */}
      <div className="w-full bg-void/50 border-b border-obsidian/75 py-4 px-4 md:px-12 flex justify-between items-center">
        <Link href="/dashboard" className="flex items-center gap-2 text-xs font-accent text-ash hover:text-gold transition-colors duration-300">
          <ArrowLeft className="w-4 h-4" /> KARARGAH'A DÖN
        </Link>
        <span className="text-[10px] text-gold font-accent tracking-widest uppercase flex items-center gap-1.5">
          <Dumbbell className="w-3.5 h-3.5" /> Gelişim Laboratuvarı
        </span>
      </div>

      <div className="max-w-7xl w-full mx-auto px-4 md:px-12 mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Personal Development Dashboard */}
        <div className="lg:col-span-4 space-y-6">
          {/* Daily Gelişim Skoru Card */}
          <div className="bg-void/45 border border-gold/15 p-5 rounded-sm space-y-4 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
            <div className="flex justify-between items-center border-b border-obsidian pb-2">
              <span className="text-[9px] text-gold font-accent tracking-widest uppercase">GÜNLÜK GELİŞİM SKORU</span>
            </div>
            
            <div className="flex items-center gap-5 pt-1">
              <div className="relative w-20 h-20 flex-shrink-0 flex items-center justify-center">
                <svg className="w-20 h-20 transform -rotate-90">
                  <circle cx="40" cy="40" r="34" stroke="rgba(201,168,76,0.08)" strokeWidth="4" fill="transparent" />
                  <circle cx="40" cy="40" r="34" stroke="#C9A84C" strokeWidth="4" fill="transparent"
                          strokeDasharray={213.6}
                          strokeDashoffset={213.6 - (213.6 * progressPercent) / 100}
                          className="transition-all duration-500 ease-out"
                          strokeLinecap="round" />
                </svg>
                <span className="absolute text-sm font-accent font-bold text-gold shadow-gold-glow animate-pulse-gold">{progressPercent}%</span>
              </div>
              <div className="space-y-1.5 flex-1">
                <span className="text-ash/70 text-[9px] uppercase font-accent block">Bugün Tamamlanan</span>
                <div className="text-base font-serif font-bold text-smoke">
                  {completedCount} <span className="text-[11px] text-ash/50 font-sans font-normal">/ {totalExercises} Egzersiz</span>
                </div>
                <div className="text-[9px] text-gold/80 font-accent uppercase tracking-wider">Maksimum Odak</div>
              </div>
            </div>
            
            <p className="text-[10px] text-ash/60 italic leading-relaxed pt-1 border-t border-obsidian/45">
              {progressPercent === 100 
                ? "Tebrikler! Bugünün tüm egzersizlerini tamamlayarak maksimum gelişim seviyesine ulaştınız." 
                : progressPercent > 0 
                  ? "Disiplinini koru, kalan egzersizleri tamamlayarak bugünün hedefini bitir." 
                  : "Bugün henüz hiçbir egzersiz yapmadınız. Antrenmana başlayın."}
            </p>
          </div>

          {/* Haftalık Gelişim Takip Card */}
          <div className="bg-void/45 border border-gold/15 p-5 rounded-sm space-y-4 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
            <div className="flex justify-between items-center border-b border-obsidian pb-2">
              <span className="text-[9px] text-gold font-accent tracking-widest uppercase">HAFTALIK GEÇMİŞ</span>
              <span className="text-[8px] text-ash/40 font-accent uppercase">7 Günlük Performans</span>
            </div>
            
            <div className="grid grid-cols-7 gap-2 pt-2">
              {isMounted && getWeeklyData().map((day, idx) => {
                const dayProgress = completionHistory[day.dateStr] || 0;
                return (
                  <div key={idx} className="flex flex-col items-center gap-2">
                    <span className={`text-[9px] font-accent uppercase ${day.isToday ? "text-gold font-bold" : "text-ash/60"}`}>
                      {day.name}
                    </span>
                    <div className="w-full h-24 bg-obsidian/20 border border-obsidian/60 rounded-full flex items-end p-[3px] relative group overflow-hidden">
                      {dayProgress > 0 ? (
                        <div 
                          className="w-full rounded-full transition-all duration-500 bg-gradient-to-t from-gold-dim via-gold to-gold shadow-[0_0_10px_rgba(201,168,76,0.35)]"
                          style={{ height: `${dayProgress}%` }}
                        />
                      ) : (
                        <div className="w-full h-[3px] bg-obsidian/50 rounded-full mb-1" />
                      )}
                      {/* Tooltip */}
                      <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1.5 bg-void border border-gold/20 text-[9px] text-smoke px-1.5 py-0.5 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 whitespace-nowrap font-accent">
                        {dayProgress}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Aylık Gelişim & Alışkanlık İzleyici Card */}
          <div className="bg-void/45 border border-gold/15 p-5 rounded-sm space-y-4 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
            <div className="flex justify-between items-center border-b border-obsidian pb-2">
              <span className="text-[9px] text-gold font-accent tracking-widest uppercase">AYLIK DEVAMLILIK MATRİSİ</span>
              <span className="text-[8px] text-ash/40 font-accent uppercase">
                {new Date().toLocaleString("tr-TR", { month: "long", year: "numeric" })}
              </span>
            </div>
            
            <div className="grid grid-cols-7 gap-1.5 pt-2">
              {isMounted && getMonthlyData().map((day, idx) => {
                const dayProgress = completionHistory[day.dateStr] || 0;
                let bgColor = "bg-obsidian/10 border-obsidian/60 text-ash/40 hover:border-gold/30";
                if (dayProgress >= 90) {
                  bgColor = "bg-gold border-gold/80 text-void font-bold shadow-[0_0_8px_rgba(201,168,76,0.3)] hover:scale-110";
                } else if (dayProgress >= 50) {
                  bgColor = "bg-gold/50 border-gold/40 text-void font-bold hover:scale-110";
                } else if (dayProgress > 0) {
                  bgColor = "bg-gold/15 border-gold/25 text-gold hover:scale-110";
                }
                
                return (
                  <div 
                    key={idx} 
                    className={`aspect-square border rounded-sm flex items-center justify-center text-[9px] font-accent transition-all duration-200 relative group cursor-pointer ${bgColor}`}
                  >
                    <span>{day.dayNum}</span>
                    {/* Tooltip */}
                    <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1.5 bg-void border border-gold/20 text-[9px] text-smoke px-2 py-0.5 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 whitespace-nowrap font-accent shadow-lg">
                      {day.dayNum} {new Date().toLocaleString("tr-TR", { month: "long" })}: {dayProgress}% Gelişim
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Ses Kayıt Arşivi Card */}
          <div className="bg-void/45 border border-gold/15 p-5 rounded-sm space-y-4 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
            <div className="flex justify-between items-center border-b border-obsidian pb-2">
              <span className="text-[9px] text-gold font-accent tracking-widest uppercase">SES KAYIT KÜTÜPHANESİ</span>
              <span className="text-[8px] text-ash/40 font-accent uppercase">{recordings.length} Kayıt</span>
            </div>
            
            <div className="space-y-3 pt-2 max-h-72 overflow-y-auto pr-1">
              {isMounted && recordings.length === 0 ? (
                <p className="text-[10px] text-ash/50 text-center italic py-4">
                  Henüz kaydedilmiş ses kaydı bulunmuyor.
                </p>
              ) : (
                isMounted && recordings.map((rec) => {
                  const isCurrentPlaying = playingId === rec.id;
                  return (
                    <div key={rec.id} className="bg-obsidian/10 border border-obsidian/60 p-3 rounded-sm space-y-2 relative group hover:border-gold/20 transition-all duration-300">
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-bold text-smoke truncate font-sans">{rec.name}</p>
                          <span className="text-[8px] text-ash/50 block font-accent">{rec.timestamp}</span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => renameRecording(rec.id, rec.name)}
                            className="text-ash/60 hover:text-gold text-[9px] font-accent uppercase px-1 transition-colors"
                          >
                            Düzenle
                          </button>
                          <button
                            onClick={() => deleteRecordingFromDB(rec.id)}
                            className="text-red-500/70 hover:text-red-500 text-[9px] font-accent uppercase px-1 transition-colors"
                          >
                            Sil
                          </button>
                        </div>
                      </div>
                      
                      {/* Custom Player Controls */}
                      <div className="flex items-center gap-3 bg-void/65 p-2 rounded-sm border border-obsidian/45">
                        <button
                          onClick={() => handlePlayPause(rec)}
                          className="w-7 h-7 rounded-full bg-gold/10 hover:bg-gold/20 border border-gold/30 flex items-center justify-center text-gold transition-all duration-200 cursor-pointer focus:outline-none flex-shrink-0"
                        >
                          {isCurrentPlaying && isPlaying ? (
                            <Pause className="w-3.5 h-3.5 fill-current" />
                          ) : (
                            <Play className="w-3.5 h-3.5 fill-current translate-x-[1px]" />
                          )}
                        </button>
                        
                        {/* Progress Seeker */}
                        <div className="flex-1 flex items-center gap-2 min-w-0">
                          <span className="text-[9px] font-accent text-ash/60 whitespace-nowrap">
                            {isCurrentPlaying ? formatTime(currentTime) : "0:00"}
                          </span>
                          <input
                            type="range"
                            min="0"
                            max={isCurrentPlaying ? (duration || 100) : 100}
                            value={isCurrentPlaying ? currentTime : 0}
                            onChange={(e) => {
                              if (isCurrentPlaying && audioRef.current) {
                                const val = parseFloat(e.target.value);
                                audioRef.current.currentTime = val;
                                setCurrentTime(val);
                              }
                            }}
                            className="flex-1 h-1 bg-obsidian rounded-lg appearance-none cursor-pointer accent-gold range-sm"
                          />
                          <span className="text-[9px] font-accent text-ash/60 whitespace-nowrap">
                            {isCurrentPlaying ? formatTime(duration) : "--:--"}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Training Categories & Selected Module */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Category Selector Grid */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {TRAINING_CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`p-3.5 border rounded-sm flex flex-col items-center gap-2 text-center transition-all duration-300 ${
                    isActive 
                      ? "bg-gold/5 border-gold/45 shadow-[0_0_15px_rgba(201,168,76,0.15)]" 
                      : "bg-void/40 border-obsidian/75 hover:border-gold/20 hover:bg-obsidian/10"
                  }`}
                >
                  <Icon className={`w-5 h-5 transition-colors duration-300 ${isActive ? "text-gold" : "text-ash/60"}`} />
                  <span className={`text-[10px] font-accent tracking-wider uppercase ${isActive ? "text-gold font-bold" : "text-ash/80"}`}>
                    {cat.title.split(" & ")[0]}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active Module Container */}
          <div className="bg-void/45 border border-gold/15 p-5 md:p-6 rounded-sm space-y-6 shadow-lg relative">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
            
            {/* Header and Gender Switcher */}
            <div className="flex flex-col md:flex-row justify-between gap-4 border-b border-obsidian pb-4">
              <div className="space-y-1">
                <span className="text-[9px] text-gold font-accent tracking-widest uppercase">EĞİTİM MODÜLÜ</span>
                <h2 className="font-serif text-xl text-smoke font-bold tracking-wide flex items-center gap-2">
                  {currentCategory.title}
                </h2>
                <p className="text-xs text-ash/80 max-w-lg leading-relaxed">
                  {currentCategory.description}
                </p>
              </div>

              {/* Gender switcher tab */}
              <div className="flex bg-void/80 border border-obsidian rounded-sm p-0.5 self-start md:self-center h-fit">
                <button
                  onClick={() => setExerciseGender("men")}
                  className={`px-3 py-1.5 text-[10px] sm:text-xs font-accent tracking-wider rounded-sm transition-all duration-300 ${
                    exerciseGender === "men"
                      ? "bg-gold text-void font-bold shadow-md shadow-gold/20"
                      : "text-ash/60 hover:text-smoke hover:bg-obsidian/30"
                  }`}
                >
                  ♂ ERKEKLER İÇİN
                </button>
                <button
                  onClick={() => setExerciseGender("women")}
                  className={`px-3 py-1.5 text-[10px] sm:text-xs font-accent tracking-wider rounded-sm transition-all duration-300 ${
                    exerciseGender === "women"
                      ? "bg-gold text-void font-bold shadow-md shadow-gold/20"
                      : "text-ash/60 hover:text-smoke hover:bg-obsidian/30"
                  }`}
                >
                  ♀ KADINLAR İÇİN
                </button>
              </div>
            </div>

            {/* Module Body Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Exercise steps */}
              <div className="lg:col-span-7 space-y-5">
                {currentExercises.map((ex, i) => {
                  const exerciseId = `${currentCategory.id}_${exerciseGender}_${i}`;
                  const isCompleted = !!completedExercises[exerciseId];
                  return (
                    <div 
                      key={i} 
                      className={`space-y-3 p-4 border rounded-sm transition-all duration-300 shadow-md ${
                        isCompleted 
                          ? "bg-gold/5 border-gold/30 shadow-[0_0_15px_rgba(201,168,76,0.05)]" 
                          : "bg-obsidian/20 border-obsidian/75 hover:border-gold/15"
                      }`}
                    >
                      <div className="flex justify-between items-start gap-3">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => toggleExercise(exerciseId)}
                            className={`w-5 h-5 rounded-sm border flex items-center justify-center transition-all duration-200 focus:outline-none ${
                              isCompleted 
                                ? "bg-gold border-gold text-void" 
                                : "border-ash/40 hover:border-gold bg-void/50 text-transparent"
                            }`}
                          >
                            <svg className="w-3.5 h-3.5 stroke-current stroke-[3px]" fill="none" viewBox="0 0 24 24">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          </button>
                          <h4 className={`text-sm sm:text-base font-serif font-bold tracking-wide transition-all duration-300 ${
                            isCompleted ? "text-gold line-through decoration-gold/40" : "text-smoke"
                          }`}>
                            {ex.title}
                          </h4>
                        </div>
                        <span className="text-[9px] sm:text-[10px] font-accent text-gold bg-gold/10 px-2 py-0.5 border border-gold/15 rounded-sm whitespace-nowrap">
                          ⏳ {ex.duration}
                        </span>
                      </div>
                      <ul className="space-y-2 pt-2 border-t border-obsidian/45">
                        {ex.steps.map((step, idx) => (
                          <li key={idx} className="text-xs sm:text-sm text-smoke/90 font-sans leading-relaxed flex items-start gap-2">
                            <span className={`mt-1.5 flex-shrink-0 w-1.5 h-1.5 rounded-full transition-colors duration-300 ${
                              isCompleted ? "bg-gold" : "bg-gold/60"
                            }`} />
                            <span className={isCompleted ? "text-ash/60" : ""}>{step}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>

              {/* Category Visual Guide Illustration */}
              <div className="lg:col-span-5 flex flex-col items-center justify-center space-y-4 lg:pt-2">
                <div className="relative border border-gold/15 p-1 bg-void/50 rounded-sm overflow-hidden group shadow-lg w-full max-w-[240px] aspect-square">
                  <div className="absolute inset-0 bg-gradient-to-t from-gold/10 to-transparent opacity-30 group-hover:opacity-50 transition-opacity duration-500 z-10" />
                  <Image
                    src={currentCategory.illustration}
                    alt="Egzersiz Şeması"
                    fill
                    sizes="(max-width: 768px) 240px, 240px"
                    className="object-cover grayscale contrast-[1.1] brightness-[0.9] hover:grayscale-0 hover:contrast-100 hover:brightness-100 transition-all duration-700 animate-scale-in"
                  />
                </div>
                <div className="text-center space-y-1">
                  <span className="text-[8px] text-ash/40 font-accent uppercase tracking-widest block">
                    VISUAL PRACTICAL GUIDE
                  </span>
                  <span className="text-[9px] text-gold font-accent uppercase tracking-wider block">
                    {currentCategory.title} Şeması
                  </span>
                </div>
              </div>
            </div>

            {/* Local Voice Recording Lab */}
            {activeCategory === "rhetoric" && (
              <div className="bg-void/45 border border-gold/15 p-5 rounded-sm space-y-4 shadow-lg relative mt-6">
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
                
                <div className="flex justify-between items-center border-b border-obsidian pb-3">
                  <div className="flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-gold animate-pulse" />
                    <span className="text-xs sm:text-sm font-serif text-smoke font-bold tracking-wide">
                      🎙️ Ses Kayıt Cihazı
                    </span>
                  </div>
                  <span className="text-[8px] text-ash/40 font-accent uppercase">
                    Metin Pratiği
                  </span>
                </div>

                <div className="flex flex-col md:flex-row items-center gap-6 py-2">
                  {/* Control Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    {!isRecording ? (
                      <button
                        onClick={startRecording}
                        className="flex items-center justify-center gap-2 px-5 py-3 bg-gold text-void font-bold text-xs font-accent uppercase tracking-wider rounded-sm transition-all duration-300 hover:bg-gold/80 hover:shadow-[0_0_15px_rgba(201,168,76,0.3)] w-full md:w-auto cursor-pointer"
                      >
                        <span className="w-2.5 h-2.5 rounded-full bg-void" />
                        Kaydı Başlat
                      </button>
                    ) : (
                      <button
                        onClick={stopRecording}
                        className="flex items-center justify-center gap-2 px-5 py-3 bg-red-600 text-white font-bold text-xs font-accent uppercase tracking-wider rounded-sm transition-all duration-300 hover:bg-red-700 animate-pulse hover:shadow-[0_0_15px_rgba(220,38,38,0.3)] w-full md:w-auto cursor-pointer"
                      >
                        <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
                        Kaydı Durdur
                      </button>
                    )}
                  </div>

                  {/* Dynamic Waveform Simulation or Status */}
                  <div className="flex-1 w-full bg-void/50 border border-obsidian/60 rounded-sm p-4 flex flex-col justify-center items-center h-20 relative overflow-hidden">
                    <style dangerouslySetInnerHTML={{__html: `
                      @keyframes bounceBar {
                        0%, 100% { transform: scaleY(0.25); }
                        50% { transform: scaleY(1.0); }
                      }
                      .animate-bar {
                        animation: bounceBar 0.8s ease-in-out infinite alternate;
                        transform-origin: bottom;
                      }
                    `}} />
                    {isRecording ? (
                      <div className="flex flex-col items-center gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-red-500 font-accent text-xs tracking-wider uppercase animate-pulse">
                            Ses Kaydediliyor
                          </span>
                          <span className="text-xs font-mono text-smoke/90 font-bold bg-red-950/40 border border-red-500/30 px-2 py-0.5 rounded-sm">
                            {formatTime(recordingSeconds)}
                          </span>
                        </div>
                        <div className="flex items-end gap-1 h-6 pt-1">
                          {[0.6, 0.4, 0.8, 0.3, 0.9, 0.5, 0.7, 0.3, 0.6, 0.4, 0.8, 0.5].map((delay, barIdx) => (
                            <div 
                              key={barIdx} 
                              className="w-1 bg-red-500 rounded-full animate-bar" 
                              style={{ 
                                height: "100%", 
                                animationDelay: `${delay}s`,
                                animationDuration: `${0.5 + delay * 0.4}s`
                              }} 
                            />
                          ))}
                        </div>
                      </div>
                    ) : (
                      <span className="text-[11px] text-ash/50 text-center leading-relaxed">
                        Metinleri yüksek sesle okurken sesinizi kaydedin. Durdurduğunuzda sol taraftaki Ses Kayıt Kütüphanesine eklenecektir.
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Advanced Diction / Tongue Twisters Panel */}
            {activeCategory === "rhetoric" && (
              <div className="bg-void/45 border border-gold/15 p-5 rounded-sm space-y-4 shadow-lg relative mt-6">
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
                <div className="flex items-center gap-2 border-b border-obsidian pb-3">
                  <Sparkles className="w-4 h-4 text-gold" />
                  <span className="text-xs sm:text-sm font-serif text-smoke font-bold tracking-wide">
                    İleri Seviye Diksiyon Egzersizleri (Tekerlemeler)
                  </span>
                </div>

                <div className="space-y-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {TEKERLEMELER.map((t, idx) => (
                    <div key={idx} className="bg-obsidian/10 p-3 border border-obsidian/60 rounded-sm hover:border-gold/20 transition-all duration-300 relative group">
                      <div className="flex justify-between items-center mb-1.5 border-b border-obsidian/45 pb-1">
                        <span className="text-[9px] text-gold font-accent uppercase tracking-wider">{t.difficulty} Seviye</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[8px] text-ash/50 font-accent">HEDEF: {t.target}</span>
                          <button
                            onClick={() => handleCopyTekerleme(t.phrase, idx)}
                            className="text-ash/60 hover:text-gold transition-colors p-0.5 cursor-pointer"
                            title="Kopyala"
                          >
                            {copiedIndex === idx ? (
                              <Check className="w-3 h-3 text-green-500 animate-scale-in" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-smoke/90 leading-relaxed font-serif italic bg-void/35 p-2.5 rounded-sm border border-obsidian/50">
                        "{t.phrase}"
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Hidden shared audio player */}
            <audio 
              ref={audioRef}
              onTimeUpdate={() => {
                if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
              }}
              onDurationChange={() => {
                if (audioRef.current) setDuration(audioRef.current.duration);
              }}
              onEnded={() => {
                setIsPlaying(false);
                setPlayingId(null);
                setCurrentTime(0);
              }}
              className="hidden"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
