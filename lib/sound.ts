"use client";

// Brawl-Stars-ish Audio: synthetisierte Effekt-Sounds (Web Audio API) plus
// gesprochene Voice-Lines (Web Speech API). Keine Asset-Dateien nötig.
//
// Mobile-Browser blockieren Audio, bis es einmal aus einer User-Geste heraus
// "freigeschaltet" wurde — darum unlockAudio() beim ersten Tap aufrufen
// (z.B. im „LOS GEHT'S"-Button).

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  return ctx;
}

/** Audio-Kontext + Sprachausgabe aus einer User-Geste heraus aufwecken. */
export function unlockAudio() {
  const c = getCtx();
  if (c && c.state === "suspended") void c.resume();
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    try {
      window.speechSynthesis.getVoices();
    } catch {
      /* ignore */
    }
  }
}

type Note = {
  f: number; // Frequenz (Hz)
  t: number; // Start-Offset (s)
  d: number; // Dauer (s)
  type?: OscillatorType;
  g?: number; // Peak-Gain
};

function playNotes(notes: Note[]) {
  const c = getCtx();
  if (!c) return;
  if (c.state === "suspended") void c.resume();
  const now = c.currentTime;
  for (const n of notes) {
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = n.type ?? "triangle";
    osc.frequency.value = n.f;
    const start = now + n.t;
    const peak = n.g ?? 0.18;
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(peak, start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + n.d);
    osc.connect(gain).connect(c.destination);
    osc.start(start);
    osc.stop(start + n.d + 0.05);
  }
}

function speak(text: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  try {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "en-US";
    u.rate = 1.05;
    u.pitch = 1;
    u.volume = 1;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  } catch {
    /* ignore */
  }
}

/** Pin/Ziel erreicht ("DA"). */
export function playArrived() {
  playNotes([
    { f: 660, t: 0, d: 0.12 },
    { f: 880, t: 0.1, d: 0.2 },
  ]);
  speak("You are here, bro");
}

/** Richtige Antwort. */
export function playCorrect() {
  playNotes([
    { f: 523, t: 0, d: 0.12 },
    { f: 659, t: 0.1, d: 0.12 },
    { f: 784, t: 0.2, d: 0.14 },
    { f: 1047, t: 0.32, d: 0.26 },
  ]);
  speak("You got it, right there!");
}

/** Falsche Antwort — ein trauriges kleines „meh". */
export function playWrong() {
  playNotes([
    { f: 220, t: 0, d: 0.18, type: "sawtooth", g: 0.14 },
    { f: 160, t: 0.16, d: 0.3, type: "sawtooth", g: 0.14 },
  ]);
}
