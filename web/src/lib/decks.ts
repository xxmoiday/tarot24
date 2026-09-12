export const DEFAULT_CARD_DECK = "classic";
export const VIETNAMESE_CULTURE_DECK = "vietnamese-culture";

export type CardDeck = typeof DEFAULT_CARD_DECK | typeof VIETNAMESE_CULTURE_DECK;

const AVAILABLE_ALTERNATE_CARDS: Record<Exclude<CardDeck, "classic">, Set<string>> = {
  [VIETNAMESE_CULTURE_DECK]: new Set([
    "major_00",
    "major_01",
    "major_02",
    "major_03",
    "major_04",
    "major_05",
    "major_06",
    "major_07",
    "major_08",
    "major_09",
    "major_10",
    "major_11",
    "major_12",
    "major_13",
    "major_14",
    "major_15",
    "major_16",
    "major_17",
    "major_18",
    "major_19",
    "major_20",
    "major_21",
    "wand_01",
    "wand_02",
    "wand_03",
    "wand_04",
  ]),
};

export function activeCardDeck(): CardDeck {
  return process.env.NEXT_PUBLIC_TAROT_CARD_DECK === VIETNAMESE_CULTURE_DECK
    ? VIETNAMESE_CULTURE_DECK
    : DEFAULT_CARD_DECK;
}

export function cardImagePath(id: string, deck: CardDeck = activeCardDeck()) {
  if (deck === VIETNAMESE_CULTURE_DECK && AVAILABLE_ALTERNATE_CARDS[deck].has(id)) {
    return `/cards-vietnamese-culture/${id}.webp`;
  }

  return `/cards/${id}.webp`;
}
