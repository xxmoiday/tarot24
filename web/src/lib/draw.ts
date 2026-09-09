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

/**
 * Trộn thêm entropy vào seed. Mọi cú vuốt của người rút — dài bao nhiêu, nhanh
 * chậm ra sao, rơi vào lúc nào — đều đi qua đây, nên thứ tự cỗ bài cuối cùng do
 * chính tay họ quyết chứ không phải Math.random gieo hộ.
 */
export function mixSeed(seed: number, ...values: number[]): number {
  let h = seed >>> 0;
  for (const v of values) {
    h = Math.imul(h ^ (Math.round(v * 1000) >>> 0), 0x27220a95);
    /* Xoay 13 bit để những bit vừa trộn vào lan lên cả đầu trên của seed. */
    h = ((h << 13) | (h >>> 19)) >>> 0;
  }
  return h >>> 0;
}

/**
 * Chẻ bài: tách cỗ làm hai rồi thả xen kẽ từng tệp mỏng cho hai nửa đan vào
 * nhau. Chỗ tách lệch khỏi giữa một quãng, vì tay người có bao giờ chia đôi
 * đúng 39 lá.
 *
 * `flip` là lúc người xào để nửa dưới quay đầu trước khi đan — đây chính là chỗ
 * lá ngược sinh ra ngoài đời, cỗ bài không tự dưng có lá ngược.
 */
export function riffle(
  deck: DrawnCard[],
  rand: () => number,
  flip = false,
): DrawnCard[] {
  const mid = Math.round(
    deck.length / 2 + (rand() - 0.5) * deck.length * 0.14,
  );
  const left = deck.slice(0, mid);
  const right = deck.slice(mid);
  if (flip) {
    right.reverse();
    for (let i = 0; i < right.length; i++) {
      right[i] = { ...right[i], reversed: !right[i].reversed };
    }
  }

  const out: DrawnCard[] = [];
  let i = 0;
  let j = 0;
  while (i < left.length || j < right.length) {
    /* Ngón cái thả rơi một tệp một hai ba lá chứ không đan đều từng lá một. */
    const take = 1 + Math.floor(rand() * 3);
    if (i < left.length && (j >= right.length || rand() < 0.5)) {
      for (let k = 0; k < take && i < left.length; k++) out.push(left[i++]);
    } else {
      for (let k = 0; k < take && j < right.length; k++) out.push(right[j++]);
    }
  }
  return out;
}

/**
 * Tráo dồn: bốc từng tệp từ nóc cỗ rồi chồng lên chỗ bài đã sang tay kia. Tệp
 * bốc sau nằm trên tệp bốc trước, nên thứ tự các tệp bị lộn ngược lại.
 */
export function overhand(deck: DrawnCard[], rand: () => number): DrawnCard[] {
  let out: DrawnCard[] = [];
  let rest = deck;
  while (rest.length) {
    const take = Math.min(rest.length, 3 + Math.floor(rand() * 9));
    out = [...rest.slice(0, take), ...out];
    rest = rest.slice(take);
  }
  return out;
}

/** Cắt cỗ ở lá thứ `at`: nhấc phần trên ra, đặt phần dưới lên trên. */
export function cutDeck(deck: DrawnCard[], at: number): DrawnCard[] {
  if (deck.length < 2) return deck;
  const k = Math.max(1, Math.min(deck.length - 1, Math.round(at)));
  return [...deck.slice(k), ...deck.slice(0, k)];
}

/**
 * Người rút nhờ xào hộ. Làm đúng những gì người đọc làm khi khách không muốn
 * động tay: vài lượt chẻ, một lượt tráo dồn, rồi cắt cỗ.
 */
export function autoShuffle(deck: DrawnCard[], seed: number): DrawnCard[] {
  const rand = mulberry32(seed);
  let out = riffle(deck, rand, true);
  out = overhand(out, rand);
  out = riffle(out, rand, rand() < 0.5);
  return cutDeck(out, Math.floor(rand() * out.length));
}
