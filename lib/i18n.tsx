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

  // setup wizard
  "setup.title": "NEUES SPIEL",
  "setup.gameName": "Spielname",
  "setup.gameName.ph": "z.B. Lottas Geburtstag",
  "setup.code": "Geheimer Code",
  "setup.teamCount": "Anzahl Teams",
  "setup.team.one": "{n} Team",
  "setup.team.many": "{n} Teams",
  "setup.player.ph": "Spieler {n}",
  "setup.addPlayer": "+ Spieler",
  "setup.randomNames": "🎲 Namen",
  "setup.playersPins": "{n} Spieler = {n} Pins zu suchen",
  "setup.saving": "Speichern…",
  "setup.create": "Spiel anlegen →",
  "setup.err.save": "Fehler beim Speichern",
  "setup.err.unknown": "Unbekannter Fehler",
  "setup.success.title": "SPIEL ANGELEGT!",
  "setup.success.share": "Teile den Link mit den Teams. Geheimer Code zum Starten:",
  "setup.copy": "Kopieren",
  "setup.toPins": "📍 Weiter: Pins setzen",
  "setup.toPins.hint":
    "Das machst du vor Ort: zu jedem Versteck gehen → „Pin hier setzen“ → Aufgabe + Hinweis eingeben.",
  "setup.toHome": "← Zur Startseite",

  // play
  "play.notFound": "Spiel nicht gefunden",
  "play.loading": "Lädt…",
  "play.noGps": "Kein GPS verfügbar",
  "play.geoPerm": "Standort-Erlaubnis nötig",
  "play.geoWeak": "GPS-Signal schwach…",
  "play.searchGps": "Suche GPS…",
  "play.wrongCode": "Falscher Code",
  "play.whichTeam": "Welches Team seid ihr?",
  "play.join": "Beitreten →",
  "play.lobby.meta": "{pins} Pins · {players} Spieler",
  "play.lobby.mission": "🎯 Eure Mission",
  "play.lobby.goalNote": "🏁 Am Ende wartet ein gemeinsames Ziel für alle Teams!",
  "play.lobby.starts": "⭐ {name} fängt an!",
  "play.lobby.go": "LOS GEHT’S!",
  "play.done.title": "GESCHAFFT!",
  "play.done.text":
    "{team} hat alle {n} Pins gefunden und alle Aufgaben gelöst!",
  "play.turn": "Dran",
  "play.allTogether": "Alle zusammen",
  "play.goal": "Ziel",
  "play.pin": "Pin",
  "play.finale": "Finale!",
  "play.distance": "noch ~{d} m",
  "play.gpsAcc": " · GPS ±{a} m",
  "play.daGoal": "ZIEL! 🏁",
  "play.da": "DA! 🎉",
  "play.solveLast": "Letzte Aufgabe lösen →",
  "play.solve": "Aufgabe lösen →",
  "play.turnOf": "{name} ist dran:",
  "play.tryAgain": "Ups, nochmal versuchen! 🔍",
  "play.check": "Antwort prüfen",
  "play.replay": "🔁 Nochmal spielen",
  "play.replayWait": "Setze zurück…",
  "play.weAreHere": "✓ Wir sind da",
  "play.offline": "Offline – Spiel läuft lokal weiter",
  "play.testMode": "🧪 Testmodus",
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

  "setup.title": "NEW GAME",
  "setup.gameName": "Game name",
  "setup.gameName.ph": "e.g. Lotta's birthday",
  "setup.code": "Secret code",
  "setup.teamCount": "Number of teams",
  "setup.team.one": "{n} Team",
  "setup.team.many": "{n} Teams",
  "setup.player.ph": "Player {n}",
  "setup.addPlayer": "+ Player",
  "setup.randomNames": "🎲 Names",
  "setup.playersPins": "{n} players = {n} pins to find",
  "setup.saving": "Saving…",
  "setup.create": "Create game →",
  "setup.err.save": "Error while saving",
  "setup.err.unknown": "Unknown error",
  "setup.success.title": "GAME CREATED!",
  "setup.success.share": "Share the link with the teams. Secret code to start:",
  "setup.copy": "Copy",
  "setup.toPins": "📍 Next: place pins",
  "setup.toPins.hint":
    "Do this on location: walk to each hiding spot → “Set pin here” → enter task + hint.",
  "setup.toHome": "← To home",

  "play.notFound": "Game not found",
  "play.loading": "Loading…",
  "play.noGps": "No GPS available",
  "play.geoPerm": "Location permission needed",
  "play.geoWeak": "Weak GPS signal…",
  "play.searchGps": "Searching GPS…",
  "play.wrongCode": "Wrong code",
  "play.whichTeam": "Which team are you?",
  "play.join": "Join →",
  "play.lobby.meta": "{pins} pins · {players} players",
  "play.lobby.mission": "🎯 Your mission",
  "play.lobby.goalNote": "🏁 A shared goal awaits all teams at the end!",
  "play.lobby.starts": "⭐ {name} starts!",
  "play.lobby.go": "LET’S GO!",
  "play.done.title": "DONE!",
  "play.done.text": "{team} found all {n} pins and solved every task!",
  "play.turn": "Turn",
  "play.allTogether": "All together",
  "play.goal": "Goal",
  "play.pin": "Pin",
  "play.finale": "Finale!",
  "play.distance": "~{d} m to go",
  "play.gpsAcc": " · GPS ±{a} m",
  "play.daGoal": "GOAL! 🏁",
  "play.da": "HERE! 🎉",
  "play.solveLast": "Solve the last task →",
  "play.solve": "Solve task →",
  "play.turnOf": "{name}'s turn:",
  "play.tryAgain": "Oops, try again! 🔍",
  "play.check": "Check answer",
  "play.replay": "🔁 Play again",
  "play.replayWait": "Resetting…",
  "play.weAreHere": "✓ We're here",
  "play.offline": "Offline – game continues locally",
  "play.testMode": "🧪 Test mode",
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

  "setup.title": "YENİ OYUN",
  "setup.gameName": "Oyun adı",
  "setup.gameName.ph": "örn. Lotta'nın doğum günü",
  "setup.code": "Gizli kod",
  "setup.teamCount": "Takım sayısı",
  "setup.team.one": "{n} Takım",
  "setup.team.many": "{n} Takım",
  "setup.player.ph": "Oyuncu {n}",
  "setup.addPlayer": "+ Oyuncu",
  "setup.randomNames": "🎲 İsimler",
  "setup.playersPins": "{n} oyuncu = aranacak {n} pin",
  "setup.saving": "Kaydediliyor…",
  "setup.create": "Oyun oluştur →",
  "setup.err.save": "Kaydetme hatası",
  "setup.err.unknown": "Bilinmeyen hata",
  "setup.success.title": "OYUN OLUŞTURULDU!",
  "setup.success.share": "Bağlantıyı takımlarla paylaş. Başlamak için gizli kod:",
  "setup.copy": "Kopyala",
  "setup.toPins": "📍 Devam: pinleri koy",
  "setup.toPins.hint":
    "Bunu yerinde yap: her saklanma yerine git → “Pini buraya koy” → görev + ipucu gir.",
  "setup.toHome": "← Ana sayfaya",

  "play.notFound": "Oyun bulunamadı",
  "play.loading": "Yükleniyor…",
  "play.noGps": "GPS yok",
  "play.geoPerm": "Konum izni gerekli",
  "play.geoWeak": "Zayıf GPS sinyali…",
  "play.searchGps": "GPS aranıyor…",
  "play.wrongCode": "Yanlış kod",
  "play.whichTeam": "Hangi takımsınız?",
  "play.join": "Katıl →",
  "play.lobby.meta": "{pins} pin · {players} oyuncu",
  "play.lobby.mission": "🎯 Göreviniz",
  "play.lobby.goalNote": "🏁 Sonunda tüm takımları ortak bir hedef bekliyor!",
  "play.lobby.starts": "⭐ {name} başlıyor!",
  "play.lobby.go": "BAŞLAYALIM!",
  "play.done.title": "BAŞARDIK!",
  "play.done.text": "{team} tüm {n} pini buldu ve tüm görevleri çözdü!",
  "play.turn": "Sıra",
  "play.allTogether": "Hep birlikte",
  "play.goal": "Hedef",
  "play.pin": "Pin",
  "play.finale": "Final!",
  "play.distance": "~{d} m kaldı",
  "play.gpsAcc": " · GPS ±{a} m",
  "play.daGoal": "HEDEF! 🏁",
  "play.da": "BURADA! 🎉",
  "play.solveLast": "Son görevi çöz →",
  "play.solve": "Görevi çöz →",
  "play.turnOf": "Sıra {name}:",
  "play.tryAgain": "Hata, tekrar dene! 🔍",
  "play.check": "Cevabı kontrol et",
  "play.replay": "🔁 Tekrar oyna",
  "play.replayWait": "Sıfırlanıyor…",
  "play.weAreHere": "✓ Buradayız",
  "play.offline": "Çevrimdışı – oyun yerel olarak devam ediyor",
  "play.testMode": "🧪 Test modu",
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
