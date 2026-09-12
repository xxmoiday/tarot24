# Vietnamese Culture Day Alternate Deck

Alternate tarot artwork prepared for the Vietnamese Culture Day 24/11 campaign.
This folder is intentionally separate from `public/cards`, so the current deck
can stay live until the alternate deck is explicitly enabled.

To preview or switch the web app to this deck, set:

```bash
NEXT_PUBLIC_TAROT_CARD_DECK=vietnamese-culture
```

Also set `TAROT_CARD_DECK=vietnamese-culture` for the API. The full switching
checklist is in `IMPORTANT_CARD_DECKS.md` at the repository root.

Before generating more cards, read `ART_DIRECTION.md` in this folder. It is the
main memory for this deck's symbolism, palette, suit replacements, and safety
rules.

Also read `GENERATION_PROGRESS.md` before continuing the deck in a new
conversation. It tracks completed cards, suggested next cards, and the update
checklist for future artwork.

Only generated cards are served from this folder. Missing cards fall back to the
classic `/cards/<id>.webp` asset so the app remains usable while the alternate
deck is still incomplete.

## Current Cards

- `major_00.webp` — The Fool, beginning the path prototype.
- `major_01.webp` — The Magician, Vietnamese craft prototype.
- `major_02.webp` — The High Priestess, cultural memory prototype.
- `major_03.webp` — The Empress, abundance and care prototype.
- `major_04.webp` — The Emperor, structure and stewardship prototype.
- `major_05.webp` — The Hierophant, transmission prototype.
- `major_06.webp` — The Lovers, choice and voluntary bond prototype.
- `major_07.webp` — The Chariot, will and self-command prototype.
- `major_08.webp` — Strength, gentle endurance prototype.
- `major_09.webp` — The Hermit, guiding light prototype.
- `major_10.webp` — Wheel of Fortune, seasonal cycle prototype.
- `major_11.webp` — Justice, balance and written tradition prototype.
- `major_12.webp` — The Hanged Man, voluntary pause and changed perspective prototype.
- `major_13.webp` — Death, post-harvest transformation prototype.
- `major_14.webp` — Temperance, ceramics and moderation prototype.
- `major_15.webp` — The Devil, loose binding and habit prototype.
- `major_16.webp` — The Tower, false structure collapse prototype.
- `major_17.webp` — The Star, Vietnamese Culture Day color prototype.
- `major_18.webp` — The Moon, mist and uncertainty prototype.
- `major_19.webp` — The Sun, Vietnamese Culture Day color prototype.
- `major_20.webp` — Judgement, awakening and self-review prototype.
- `major_21.webp` — The World, completion and integration prototype.
- `wand_01.webp` — Ace of Bamboo, first spark prototype.
- `wand_02.webp` — Two of Bamboo, planning and far-view prototype.
- `wand_03.webp` — Three of Bamboo, waiting for return from afar prototype.
- `wand_04.webp` — Four of Bamboo, first stable milestone prototype.

## Style Direction

- Build around the 24/11-specific axes: guiding light, Dong Son bronze drum sun,
  Hanoi Opera House, and cultural transmission.
- Let the full 78-card deck cover Vietnamese cultural details; do not put every
  motif into one card.
- Replace the suits with bamboo, ceramics, brush-and-ink, and rice/old coins.
- Prefer earth brown, son red, turmeric yellow, ceramic blue, indigo, muted
  bamboo green, and paper-do ivory.
- Use Dong Ho / Kim Hoang woodblock energy, paper-do fiber, soft ink bleed,
  ceramic glaze, bamboo, bronze, carved wood, and restrained folk ornament.

## Progress

The Major Arcana set is complete for this alternate deck. The Bamboo suit is in
progress. Continue minor suits using the Vietnamese suit replacements in
`ART_DIRECTION.md`.
