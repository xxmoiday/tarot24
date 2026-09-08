import { CARDS } from "./cards";
import type { Spread } from "./spreads";

/** PRNG nhỏ, cùng seed thì cùng kết quả — để chia sẻ lại bài đọc là ra đúng lá cũ. */
export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function makeSeed() {
  return Math.floor(Math.random() * 2 ** 31);
}

export interface DrawnCard {
  slug: string;
  reversed: boolean;
}

/** Xào cả bộ 78 lá theo seed, trả về thứ tự lá đã xào. */
export function shuffleDeck(seed: number): DrawnCard[] {
  const rand = mulberry32(seed);
  const deck = CARDS.map((c) => ({ slug: c.slug, reversed: rand() < 0.32 }));
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

/** Lá hôm nay: cố định theo ngày để cả ngày ai vào cũng thấy một lá. */
export function cardOfTheDay(date = new Date()) {
  const key =
    date.getUTCFullYear() * 10000 + (date.getUTCMonth() + 1) * 100 + date.getUTCDate();
  const rand = mulberry32(key * 2654435761);
  const card = CARDS[Math.floor(rand() * CARDS.length)];
  return card;
}

/**
 * Áp luật "luôn đọc xuôi" của kiểu trải. Lá nằm ngang trong Thập tự Celtic
 * không có chiều nên dù rút ra ngược vẫn đọc như lá xuôi.
 */
export function applyUprightOnly(spread: Spread, cards: DrawnCard[]): DrawnCard[] {
  const forced = spread.uprightOnly;
  if (!forced?.length) return cards;
  return cards.map((c, i) =>
    forced.includes(i) && c.reversed ? { ...c, reversed: false } : c,
  );
}
