"use client";

// Echte Brawl-Stars-SFX (als m4a/AAC → iOS-kompatibel) statt synthetischer Töne.
// Funktionsnamen bleiben gleich (unlockAudio/playArrived/playCorrect/playWrong),
// damit die Spiel-Seite unverändert weiterläuft.
//
// Mobile-Browser blockieren Audio bis zur ersten User-Geste → unlockAudio()
// einmal aus einem Tap heraus aufrufen (z.B. „LOS GEHT'S"-Button).

const FILES = {
  correct: "/sounds/correct.m4a",
  wrong: "/sounds/wrong.m4a",
  da: "/sounds/da.m4a",
} as const;

type Key = keyof typeof FILES;

const cache: Partial<Record<Key, HTMLAudioElement>> = {};
let unlocked = false;

function el(key: Key): HTMLAudioElement | null {
  if (typeof window === "undefined") return null;
  if (!cache[key]) {
    const a = new Audio(FILES[key]);
    a.preload = "auto";
    cache[key] = a;
  }
  return cache[key]!;
}

/** Audio aus einer User-Geste heraus freischalten (iOS). */
export function unlockAudio() {
  if (unlocked || typeof window === "undefined") return;
  unlocked = true;
  (Object.keys(FILES) as Key[]).forEach((key) => {
    const a = el(key);
    if (!a) return;
    a.muted = true;
    a.play()
      .then(() => {
        a.pause();
        a.currentTime = 0;
        a.muted = false;
      })
      .catch(() => {
        a.muted = false;
      });
  });
}

function play(key: Key) {
  const a = el(key);
  if (!a) return;
  try {
    a.currentTime = 0;
    void a.play();
  } catch {
    /* ignore */
  }
}

/** Pin/Ziel erreicht ("DA"). */
export function playArrived() {
  play("da");
}

/** Richtige Antwort. */
export function playCorrect() {
  play("correct");
}

/** Falsche Antwort. */
export function playWrong() {
  play("wrong");
}
