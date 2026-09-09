# Tarot24 Card Art Direction

Chốt style cho các lá bài generate mới: **indie occult hand-drawn tarot**.

## Core Look

- Warm cream / aged ivory card stock background.
- Thin uneven black double-line border, slightly hand-drawn and imperfect.
- Raw black ink illustration with rough pen pressure, scratchy hatching,
  cross-hatching, ink speckles, and handmade print texture.
- Flat symbolic composition, closer to indie oracle/tarot deck art than
  cinematic fantasy or polished digital painting.
- Use negative space; avoid dense realistic scenes.

## Color

- At least 80% black ink and cream paper.
- Sparse spot colors only:
  - muted blue for water, night, distant mountains
  - pale yellow for sun, moon, stars, glow
  - small red/orange accents for fire, fruit, roof, blood-like symbolism
  - small green accents for leaves or growth
- Avoid glossy gradients, neon, saturated fantasy palettes, and luxury gold
  borders.

## Composition

- Final card assets are `600x900` WebP.
- Generate as vertical `2:3` full card faces.
- Keep a small top area for the Roman numeral / rank.
- Keep a bottom title area for the English card name.
- Prefer symbolic objects and silhouettes over detailed portraits.
- Major Arcana can have stronger central symbols. Minor Arcana should be
  readable and countable, especially suit objects.

## Text

- Prefer generating the artwork **without text**, then overlay text with
  ImageMagick for correct spelling and consistency.
- Top: Roman numeral or rank, e.g. `XVII`, `X`, `PAGE`.
- Bottom: English title in uppercase, e.g. `THE STAR`, `TEN OF CUPS`.
- Text should feel handwritten/indie but remain readable at mobile size.
- Current overlay font: `/System/Library/Fonts/Supplemental/Bradley Hand Bold.ttf`.

## Avoid

- Photorealism, cinematic fantasy, glossy 3D, anime, chibi.
- Repeating the same robe/costume/tone on every card.
- Dark navy/gold luxury occult poster style as the deck default.
- Vietnamese lacquer / East Asian styling as the deck default.
- Tabletop scenes with candles, crystals, leaves, or real cards.
- Exact copies of Rider-Waite-Smith or any reference card.
- Pseudo text, misspelled titles, or generated gibberish.

## Prompt Skeleton

```text
Use case: stylized-concept
Asset type: final tarot card artwork for web app, vertical 2:3 card face
Input images: style reference for cream card stock, uneven black border, rough
black ink drawing, scratchy hatching, sparse spot colors, naive occult symbols,
handmade indie tarot deck feeling.
Primary request: Create one complete tarot card face for <card>, in this indie
hand-drawn occult tarot style.
Source meaning to express: <from web/data/cards.source.json>
Subject and symbols: <card-specific symbols, count exact suit objects when any>
Style/medium: raw hand-drawn black ink on aged cream paper, uneven pen pressure,
scratchy cross-hatching, lino-cut zine-like occult tarot, handmade print texture,
slightly imperfect symmetry, visible ink speckles. Sparse watercolor spot color only.
Composition/framing: vertical tarot card face, off-white margin, thin black uneven
double-line border, blank top numeral area and blank bottom title area for later
overlay text. Readable at small mobile size, flat and symbolic.
Color palette: cream paper, black ink, sparse muted spot colors only.
Text: no text, no title, no numbers, no letters.
Constraints: 2:3 aspect ratio, full card face, handmade tarot deck style, no
readable text, no watermark, no logo.
Avoid: photorealism, cinematic lighting, glossy polish, anime, chibi, ornate gold
border, tabletop scene, exact Rider-Waite copy, pseudo text.
```
