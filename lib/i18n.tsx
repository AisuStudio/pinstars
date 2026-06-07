"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type Lang = "de" | "en" | "tr";
export const LANGS: Lang[] = ["de", "en", "tr"];
export const LANG_LABEL: Record<Lang, string> = {
  de: "DE",
  en: "EN",
  tr: "TR",
};

type Dict = Record<string, string>;

// Default language is German; users can switch (persisted in localStorage).
const de: Dict = {
  "common.back": "← zurück",
  "nav.newGame": "Neues Spiel",
  "nav.guide": "Anleitung",
  "nav.about": "Über dieses Spiel",
  "nav.startNewGame": "⭐ Neues Spiel starten",

  // heat stages (also used in play screen)
  "heat.weit": "weit",
  "heat.nah": "nah",
  "heat.ganzNah": "ganz nah",
  "heat.da": "DA",

  // about
  "about.title": "ÜBER DIESES SPIEL",
  "about.q.head": "Wofür ist Pinstars?",
  "about.q.p1":
    "Pinstars ist eine kleine Geocaching-Schnitzeljagd – gemacht für Kindergeburtstage und Ausflüge.",
  "about.q.p2":
    "Versteckt Pins in eurer Umgebung, denkt euch Quizfragen aus, und lasst die Teams losziehen. Ganz ohne Anmeldung, einfach per Link.",
  "about.q.p3":
    "Pinstars ist kein Brawlstars / SuperCell Produkt und auch nicht kommerziell! Wir sind einfach Fans.",
  "about.sec.head": "Datensicherheit",
  "about.sec.p1":
    "Es werden <strong>keine personenbezogenen Daten erhoben</strong>. Kein Login, kein Tracking, keine Werbung. Spielernamen und Pins, die ihr eingebt, dienen nur dem Spiel und sind über den geheimen Spiel-Link erreichbar – teilt ihn also nur mit euren Teams.",
  "about.sec.p2":
    "Euer GPS-Standort wird ausschließlich im Browser verwendet, um die Entfernung zum nächsten Pin anzuzeigen. Er wird nicht gespeichert und nicht weitergegeben.",
  "about.contact.head": "Kontakt",
  "about.github": "⭐ Projekt auf GitHub",
  "about.footer": "Anton’s 10 · Pinstars — mit ♥ gebaut",

  // anleitung
  "guide.title": "ANLEITUNG",
  "guide.s1.head": "Worum geht’s?",
  "guide.s1.p":
    "Pinstars ist eine Schnitzeljagd fürs Smartphone. Ein oder zwei Teams suchen nacheinander versteckte „Pins“ auf einer Karte – echte Orte in eurer Umgebung. Jedes Team sucht so viele Pins, wie es Mitspielerinnen und Mitspieler hat.",
  "guide.s2.head": "Vorbereiten",
  "guide.s2.p":
    "Eine erwachsene Person legt vorab ein Spiel an: Name, geheimer Code, Teams und Spielernamen. Danach geht sie zu jedem Versteck, tippt „Pin hier setzen“ und gibt eine Quiz-Frage mit drei Antworten dazu ein. Optional bekommt jedes Team eine kleine Mission und es gibt ein gemeinsames Ziel als großes Finale.",
  "guide.s3.head": "Spielen",
  "guide.s3.p":
    "Jedes Team öffnet den Spiele-Link und gibt den Code ein. Die App wählt aus, wer anfängt. Eine Anzeige zeigt mit „weit – nah – ganz nah – DA“, wie nah ihr dem Pin seid. Bei „DA“ ist der Pin gefunden!",
  "guide.s4.head": "Aufgaben lösen",
  "guide.s4.p":
    "An jedem gefundenen Pin löst die Person, die gerade dran ist, eine Quiz-Frage. Ist die Antwort richtig, wird der nächste Pin freigeschaltet und die nächste Person ist dran. Wer alle Pins gefunden hat, läuft zum gemeinsamen Ziel – und gewinnt!",
  "guide.tip":
    "Tipp: Lasst die Standort-Erlaubnis im Browser zu, sonst kann die App den Pin nicht anpeilen.",
};

const en: Dict = {
  "common.back": "← back",
  "nav.newGame": "New Game",
  "nav.guide": "How to Play",
  "nav.about": "About this game",
  "nav.startNewGame": "⭐ Start a new game",

  "heat.weit": "far",
  "heat.nah": "close",
  "heat.ganzNah": "very close",
  "heat.da": "HERE",

  "about.title": "ABOUT THIS GAME",
  "about.q.head": "What is Pinstars for?",
  "about.q.p1":
    "Pinstars is a little geocaching scavenger hunt – made for kids' birthdays and outings.",
  "about.q.p2":
    "Hide pins around your area, think up quiz questions, and send the teams off. No sign-up, just a link.",
  "about.q.p3":
    "Pinstars is not a Brawl Stars / Supercell product and is not commercial! We're just fans.",
  "about.sec.head": "Data privacy",
  "about.sec.p1":
    "<strong>No personal data is collected</strong>. No login, no tracking, no ads. Player names and pins you enter are only used for the game and are reachable via the secret game link – so only share it with your teams.",
  "about.sec.p2":
    "Your GPS location is used only in the browser to show the distance to the next pin. It is not stored or shared.",
  "about.contact.head": "Contact",
  "about.github": "⭐ Project on GitHub",
  "about.footer": "Anton’s 10 · Pinstars — built with ♥",

  "guide.title": "HOW TO PLAY",
  "guide.s1.head": "What's it about?",
  "guide.s1.p":
    "Pinstars is a smartphone scavenger hunt. One or two teams take turns finding hidden “pins” on a map – real places around you. Each team looks for as many pins as it has players.",
  "guide.s2.head": "Prepare",
  "guide.s2.p":
    "An adult sets up a game beforehand: name, secret code, teams and player names. Then they walk to each hiding spot, tap “Set pin here” and add a quiz question with three answers. Optionally each team gets a little mission and there's a shared goal as the grand finale.",
  "guide.s3.head": "Playing",
  "guide.s3.p":
    "Each team opens the game link and enters the code. The app picks who starts. An indicator shows “far – close – very close – HERE” how near you are to the pin. At “HERE” the pin is found!",
  "guide.s4.head": "Solving tasks",
  "guide.s4.p":
    "At each found pin, the person whose turn it is answers a quiz question. If the answer is right, the next pin unlocks and the next person is up. Whoever has found all pins heads to the shared goal – and wins!",
  "guide.tip":
    "Tip: Allow location access in the browser, otherwise the app can't locate the pin.",
};

const tr: Dict = {
  "common.back": "← geri",
  "nav.newGame": "Yeni Oyun",
  "nav.guide": "Nasıl Oynanır",
  "nav.about": "Bu oyun hakkında",
  "nav.startNewGame": "⭐ Yeni oyun başlat",

  "heat.weit": "uzak",
  "heat.nah": "yakın",
  "heat.ganzNah": "çok yakın",
  "heat.da": "BURADA",

  "about.title": "BU OYUN HAKKINDA",
  "about.q.head": "Pinstars ne için?",
  "about.q.p1":
    "Pinstars, küçük bir geocaching hazine avıdır – çocuk doğum günleri ve geziler için yapıldı.",
  "about.q.p2":
    "Çevrenize pinler saklayın, quiz soruları düşünün ve takımları yola çıkarın. Kayıt yok, sadece bir bağlantı.",
  "about.q.p3":
    "Pinstars bir Brawl Stars / Supercell ürünü değildir ve ticari değildir! Biz sadece hayranız.",
  "about.sec.head": "Veri güvenliği",
  "about.sec.p1":
    "<strong>Hiçbir kişisel veri toplanmaz</strong>. Giriş yok, takip yok, reklam yok. Girdiğiniz oyuncu adları ve pinler yalnızca oyun için kullanılır ve gizli oyun bağlantısı üzerinden erişilebilir – bu yüzden onu yalnızca takımlarınızla paylaşın.",
  "about.sec.p2":
    "GPS konumunuz yalnızca bir sonraki pine olan mesafeyi göstermek için tarayıcıda kullanılır. Saklanmaz ve paylaşılmaz.",
  "about.contact.head": "İletişim",
  "about.github": "⭐ GitHub'da proje",
  "about.footer": "Anton’s 10 · Pinstars — ♥ ile yapıldı",

  "guide.title": "NASIL OYNANIR",
  "guide.s1.head": "Konu ne?",
  "guide.s1.p":
    "Pinstars bir akıllı telefon hazine avıdır. Bir veya iki takım sırayla haritada gizli “pinleri” arar – çevrenizdeki gerçek yerler. Her takım, oyuncu sayısı kadar pin arar.",
  "guide.s2.head": "Hazırlık",
  "guide.s2.p":
    "Bir yetişkin önceden bir oyun oluşturur: isim, gizli kod, takımlar ve oyuncu adları. Sonra her saklanma yerine gider, “Pini buraya koy”a dokunur ve üç cevaplı bir quiz sorusu ekler. İsteğe bağlı olarak her takım küçük bir görev alır ve büyük final olarak ortak bir hedef vardır.",
  "guide.s3.head": "Oynamak",
  "guide.s3.p":
    "Her takım oyun bağlantısını açar ve kodu girer. Uygulama kimin başlayacağını seçer. Bir gösterge “uzak – yakın – çok yakın – BURADA” ile pine ne kadar yakın olduğunuzu gösterir. “BURADA” olduğunda pin bulundu!",
  "guide.s4.head": "Görevleri çözmek",
  "guide.s4.p":
    "Bulunan her pinde, sırası gelen kişi bir quiz sorusunu cevaplar. Cevap doğruysa bir sonraki pin açılır ve sıra bir sonraki kişiye geçer. Tüm pinleri bulan ortak hedefe gider – ve kazanır!",
  "guide.tip":
    "İpucu: Tarayıcıda konum iznini verin, yoksa uygulama pini bulamaz.",
};

const DICTS: Record<Lang, Dict> = { de, en, tr };

type Ctx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
};

const I18nContext = createContext<Ctx | null>(null);
const LS_KEY = "pinstars:lang";

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("de");

  useEffect(() => {
    const stored = localStorage.getItem(LS_KEY) as Lang | null;
    if (stored && LANGS.includes(stored)) setLangState(stored);
  }, []);

  function setLang(l: Lang) {
    setLangState(l);
    try {
      localStorage.setItem(LS_KEY, l);
    } catch {
      /* ignore */
    }
  }

  function t(key: string, vars?: Record<string, string | number>) {
    let s = DICTS[lang][key] ?? DICTS.de[key] ?? key;
    if (vars) {
      for (const [k, v] of Object.entries(vars)) {
        s = s.replaceAll(`{${k}}`, String(v));
      }
    }
    return s;
  }

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n(): Ctx {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within LanguageProvider");
  return ctx;
}

/** Convenience: just the t() function. */
export function useT() {
  return useI18n().t;
}

export function LanguageSwitcher({ className = "" }: { className?: string }) {
  const { lang, setLang } = useI18n();
  return (
    <div className={`flex gap-1 ${className}`}>
      {LANGS.map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          aria-label={LANG_LABEL[l]}
          className={`w-10 h-9 rounded-lg border-2 border-black font-display text-sm ${
            lang === l
              ? "bg-[color:var(--color-gold)] text-black"
              : "bg-white/10 text-white"
          }`}
        >
          {LANG_LABEL[l]}
        </button>
      ))}
    </div>
  );
}
