# IMPORTANT: Card Deck Switching

Tarot24 supports multiple visual decks. The default deck is still the classic
deck in `web/public/cards`. Alternate decks live in their own public folders and
are only used when explicitly enabled.

This is important: when switching decks, update **both** the web env and the API
env. The web renders card faces directly, while the API returns card image URLs
through the `anh` field.

## Current Decks

| Deck id | Folder | Status |
| --- | --- | --- |
| `classic` | `web/public/cards` | Default live deck |
| `vietnamese-culture` | `web/public/cards-vietnamese-culture` | 24/11 Vietnamese Culture Day alternate deck, 78/78 generated, complete |

Before generating cards for `vietnamese-culture`, read:

```text
web/public/cards-vietnamese-culture/ART_DIRECTION.md
web/public/cards-vietnamese-culture/GENERATION_PROGRESS.md
```

## Enable A Deck

To keep the classic deck:

```bash
NEXT_PUBLIC_TAROT_CARD_DECK=
TAROT_CARD_DECK=
```

To switch to the Vietnamese Culture Day deck:

```bash
NEXT_PUBLIC_TAROT_CARD_DECK=vietnamese-culture
TAROT_CARD_DECK=vietnamese-culture
```

Use `NEXT_PUBLIC_TAROT_CARD_DECK` for the web app and `TAROT_CARD_DECK` for the
API. If only one side is changed, the UI and API clients can show different card
art.

## Fallback Rule

Alternate decks can be incomplete. A card only uses an alternate image when its
id is registered as available for that deck. Missing cards automatically fall
back to the classic `/cards/<id>.webp` asset.

For example, `vietnamese-culture` currently has:

```text
major_00.webp
major_01.webp
major_02.webp
major_03.webp
major_04.webp
major_05.webp
major_06.webp
major_07.webp
major_08.webp
major_09.webp
major_10.webp
major_11.webp
major_12.webp
major_13.webp
major_14.webp
major_15.webp
major_16.webp
major_17.webp
major_18.webp
major_19.webp
major_20.webp
major_21.webp
wand_01.webp
wand_02.webp
wand_03.webp
wand_04.webp
wand_05.webp
wand_06.webp
wand_07.webp
wand_08.webp
wand_09.webp
wand_10.webp
wand_page.webp
wand_knight.webp
wand_queen.webp
wand_king.webp
cup_01.webp
cup_02.webp
cup_03.webp
cup_04.webp
cup_05.webp
cup_06.webp
cup_07.webp
cup_08.webp
cup_09.webp
cup_10.webp
cup_page.webp
cup_knight.webp
cup_queen.webp
cup_king.webp
sword_01.webp
sword_02.webp
sword_03.webp
sword_04.webp
sword_05.webp
sword_06.webp
sword_07.webp
sword_08.webp
sword_09.webp
sword_10.webp
sword_page.webp
sword_knight.webp
sword_queen.webp
sword_king.webp
coin_01.webp
coin_02.webp
coin_03.webp
coin_04.webp
coin_05.webp
coin_06.webp
coin_07.webp
coin_08.webp
coin_09.webp
coin_10.webp
coin_page.webp
coin_knight.webp
coin_queen.webp
coin_king.webp
```

So with the deck enabled:

- all 78 tarot cards render from `/cards-vietnamese-culture/<id>.webp`
- fallback to `/cards/<id>.webp` remains the general safety rule for future
  incomplete alternate decks

## When Adding A New Deck

1. Create a folder under `web/public`, for example:

```text
web/public/cards-my-new-deck
```

2. Add generated card assets using the same card ids as the classic deck:

```text
major_00.webp
cup_03.webp
sword_queen.webp
```

3. Register the deck id and available card ids in:

```text
web/src/lib/decks.ts
api/src/kb/kb.service.ts
```

4. Add the env value to:

```text
web/.env.example
api/.env.example
```

5. Update this file with the new deck id, folder, and status.

6. Add or update the deck's own `ART_DIRECTION.md` so future cards follow the
   right visual and symbolic rules.

## Verification

After changing deck code or env names, run:

```bash
cd web && npm run lint
cd web && npx next build --webpack
cd api && npm run lint
cd api && PATH=/Users/huydd/.nvm/versions/node/v22.21.1/bin:$PATH npm test -- kb.spec.ts
```

The API test currently needs Node 22 because Vitest/Rolldown imports
`node:util.styleText`.
