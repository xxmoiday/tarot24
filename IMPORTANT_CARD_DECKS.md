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
| `vietnamese-culture` | `web/public/cards-vietnamese-culture` | 24/11 Vietnamese Culture Day alternate deck, in progress |

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
```

So with the deck enabled:

- `major_00` through `major_21`, `wand_01`, `wand_02`, `wand_03`, and `wand_04` render from `/cards-vietnamese-culture/<id>.webp`
- every other card still renders from `/cards/<id>.webp`

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
