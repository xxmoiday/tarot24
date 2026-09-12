# Vietnamese Culture Deck Generation Progress

This file is the handoff note for future AI conversations. Read it before
generating more cards for the `vietnamese-culture` deck.

## Current Status

- Deck id: `vietnamese-culture`
- Asset folder: `web/public/cards-vietnamese-culture`
- Target deck size: 78 tarot cards
- Generated so far: 26 / 78
- Current phase: Major Arcana complete; Bamboo suit in progress
- Last generated cards: `wand_03.webp` and `wand_04.webp`

## Must Read First

Before generating any new artwork, read these files in this order:

1. `AGENTS.md`
2. `web/public/cards/ART_DIRECTION.md`
3. `web/public/cards-vietnamese-culture/ART_DIRECTION.md`
4. `web/public/cards-vietnamese-culture/GENERATION_PROGRESS.md`
5. `IMPORTANT_CARD_DECKS.md`

## Generated Cards

| Card id | Tarot card | Notes |
| --- | --- | --- |
| `major_00` | The Fool | Beginning the path prototype |
| `major_01` | The Magician | Vietnamese craft prototype |
| `major_02` | The High Priestess | Cultural memory prototype |
| `major_03` | The Empress | Abundance and care prototype |
| `major_04` | The Emperor | Structure and stewardship prototype |
| `major_05` | The Hierophant | Transmission prototype |
| `major_06` | The Lovers | Choice and voluntary bond prototype |
| `major_07` | The Chariot | Will and self-command prototype |
| `major_08` | Strength | Gentle endurance prototype |
| `major_09` | The Hermit | Guiding light prototype |
| `major_10` | Wheel of Fortune | Seasonal cycle prototype |
| `major_11` | Justice | Balance and written tradition prototype |
| `major_12` | The Hanged Man | Voluntary pause and changed perspective prototype |
| `major_13` | Death | Post-harvest transformation prototype |
| `major_14` | Temperance | Ceramics and moderation prototype |
| `major_15` | The Devil | Loose binding and habit prototype |
| `major_16` | The Tower | False structure collapse prototype |
| `major_17` | The Star | Vietnamese Culture Day color prototype |
| `major_18` | The Moon | Mist and uncertainty prototype |
| `major_19` | The Sun | Vietnamese Culture Day color prototype |
| `major_20` | Judgement | Awakening and self-review prototype |
| `major_21` | The World | Completion and integration prototype |
| `wand_01` | Ace of Bamboo | First spark prototype |
| `wand_02` | Two of Bamboo | Planning and far-view prototype |
| `wand_03` | Three of Bamboo | Waiting for return from afar prototype |
| `wand_04` | Four of Bamboo | First stable milestone prototype |

## Suggested Next Cards

The Major Arcana is complete. Continue into the minor suits using the
Vietnamese replacements:

- Wands = Bamboo
- Cups = Ceramics
- Swords = Brush and Ink
- Pentacles = Rice and Old Coins

Recommended next batch:

1. `wand_05` - Five of Wands / Five of Bamboo
2. `wand_06` - Six of Wands / Six of Bamboo
3. `wand_07` - Seven of Wands / Seven of Bamboo
4. `wand_08` - Eight of Wands / Eight of Bamboo
5. `wand_09` - Nine of Wands / Nine of Bamboo
6. `wand_10` - Ten of Wands / Ten of Bamboo

## Non-Negotiable Visual Rules

- The deck is for Vietnamese Culture Day 24/11, not generic Vietnamese decor.
- Do not put every cultural motif into one image. The whole 78-card deck should
  cover the cultural field over time.
- Use the four day-specific axes:
  - guiding light
  - Dong Son bronze drum sun
  - Hanoi Opera House, sparingly
  - cultural transmission across generations
- From `major_04` onward, include four circular corner medallions with a yellow
  star or Dong Son sun-rosette on son-red ground.
- Treat the corner star as an ornamental tarot medallion, not as a flag.
- Do not use national leaders, national flags, national emblems, or political
  propaganda composition.
- Avoid making lotus the default symbol. Use it only when it truly belongs.
- Do not assign sacred Vietnamese religious or performance traditions to dark
  cards in a stigmatizing way.
- For `major_15` The Devil, use neutral metaphors such as bamboo bindings,
  constraint, habit, bargain, and dependency.
- For `major_13` Death, keep the neutral post-harvest field metaphor.

## Asset Requirements

- Final asset size: `600x900`
- Format: `.webp`
- Aspect ratio: vertical 2:3
- No readable title, number, letters, pseudo-writing, logo, or watermark in the
  image itself.
- Leave a blank top band for Roman numeral/rank overlay.
- Leave a blank bottom band for title overlay.

## When Adding New Cards

After saving each new generated card, update all of these:

1. Save the image:
   - `web/public/cards-vietnamese-culture/<card_id>.webp`
2. Register availability in:
   - `web/src/lib/decks.ts`
   - `api/src/kb/kb.service.ts`
3. Update tests if the available-card set is asserted:
   - `api/src/kb/kb.spec.ts`
4. Update docs:
   - `web/public/cards-vietnamese-culture/README.md`
   - `web/public/cards-vietnamese-culture/GENERATION_PROGRESS.md`
   - `IMPORTANT_CARD_DECKS.md`

## Verification

Run these checks after changing code or availability lists:

```bash
cd web && npm run lint
cd api && npm run lint
cd api && PATH=/Users/huydd/.nvm/versions/node/v22.21.1/bin:$PATH npm test -- kb.spec.ts
```

Use Node 22 for the API test command.
