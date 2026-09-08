import type { DrawnCard } from "./draw";
import type { TopicKey } from "./spreads";

export interface ReadingState {
  spread: string;
  question: string;
  topic: TopicKey;
  cards: DrawnCard[];
  at: number;
}

type Packed = [string, string, TopicKey, string, number];

function toB64Url(s: string) {
  const bytes = new TextEncoder().encode(s);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromB64Url(s: string) {
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(b64 + "=".repeat((4 - (b64.length % 4)) % 4));
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

/** Nén cả bài đọc vào chính đường dẫn, không cần lưu ở đâu cả. */
export function encodeReading(state: ReadingState): string {
  const packed: Packed = [
    state.spread,
    state.question,
    state.topic,
    state.cards.map((c) => `${c.slug}${c.reversed ? "!" : ""}`).join(","),
    state.at,
  ];
  return toB64Url(JSON.stringify(packed));
}

export function decodeReading(id: string): ReadingState | null {
  try {
    const packed = JSON.parse(fromB64Url(id)) as Packed;
    if (!Array.isArray(packed) || packed.length < 5) return null;
    const [spread, question, topic, cards, at] = packed;
    if (typeof spread !== "string" || typeof cards !== "string") return null;
    return {
      spread,
      question: String(question ?? ""),
      topic,
      cards: cards
        .split(",")
        .filter(Boolean)
        .map((c) => ({ slug: c.replace(/!$/, ""), reversed: c.endsWith("!") })),
      at: Number(at) || 0,
    };
  } catch {
    return null;
  }
}
