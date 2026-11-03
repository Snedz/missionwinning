# book4 — upload sheet (KDP paperback)

Files: `interior.pdf` (104 pages, 8.5 x 11 in, **no bleed**), `cover.pdf` (17.4842 x 11.25 in full wrap, spine 0.2342 in). Previews: `contact_sheet.png` (all 50 designs), `cover_preview-1.png`. Art: `art300/` (potrace-vectorized, re-rendered at exactly 300 dpi, 1-bit; source bitmaps in `art/`), raw AI sheets: `raw/`. Build: `../proc.py`, `../buildkid.py`, `../c4.json`.

## Print options (must match the files)
- Ink & paper: Black & white interior, **white** paper. Trim 8.5 x 11 in. Bleed: **No bleed**. Cover: Matte.
- Page count 104 -> spine 104 x 0.002252 = 0.2342 in. No spine text (spine under 0.25 in; KDP needs 0.0625 in clearance each side).
- ISBN: free KDP ISBN. Low-content box: unchecked.

## Metadata
- Title: Cute Animals Coloring Book for Kids Ages 4-8
- Subtitle: 50 Fun & Easy Pictures of Farm, Jungle, Ocean, Woodland & Pet Animals for Boys and Girls
- Author (pen name): Mission Winning · Language: English · Reading age: 4-8 · Adult content: No

### Description
Meet 50 adorable animal friends!

Lions, elephants, giraffes, puppies, kittens, bunnies, pandas, koalas, owls, penguins, dolphins, sea turtles, foxes, frogs, butterflies and many more, each drawn with clean, bold lines that are easy to stay inside.

- 50 original cute animal pictures from the farm, jungle, ocean, woods and arctic
- One picture per page with blank backs, so markers never bleed onto the next picture
- Large 8.5 x 11 inch pages
- Every picture labeled with its name
- A "This book belongs to" page
- Great for crayons, colored pencils, gel pens and markers

A perfect screen-free gift for kids ages 4-8.

### 7 keywords
1. animal coloring book for kids ages 4-8
2. cute animals coloring pages girls boys
3. farm jungle ocean animals coloring
4. easy coloring book kids 4-8 gift
5. woodland animals coloring book children
6. zoo animals activity book kids
7. fun coloring book for kids animals

### Categories (pick 3 in KDP's picker; confirm exact names there)
- Children's Books > Activities, Crafts & Games > Coloring Books
- Children's Books > Animals > (Mammals or Zoo)
- Children's Books > Arts, Music & Photography

## Timing
Evergreen; the biggest demand of the three (top indie result BSR 6,654) but also the most competition.

## Prices & royalty (60% band; 8.5x11 = large trim; B&W 24-110 pages = fixed print cost; AU fixed for 24-108)
Sources: https://kdp.amazon.com/en_US/help/topic/G201834340 (printing cost), https://kdp.amazon.com/en_US/help/topic/G201834330 (royalty)
| Marketplace | List | Print cost | Royalty/copy |
|---|---|---|---|
| Amazon.com | $9.99 | $2.84 | **$3.15** (0.6 x 9.99 - 2.84) |
| Amazon.co.uk | £7.99 | £2.15 | £2.64 |
| Amazon.ca | C$13.99 | C$3.53 | C$4.86 |
| Amazon.com.au | A$13.99 | A$5.28 | A$3.11 |
| Amazon.co.jp | ¥1,500 | ¥530 | ¥370 |
Do not go below $9.99 on .com: at $8.99 the rate drops to 50% and royalty falls to $1.66.
Expanded Distribution: OFF ($1.16/copy at 40%). EU: Territories -> "Individual territories", untick EU member states; do not set EUR/PLN/SEK prices.

## AI-content disclosure (KDP asks Text / Images / Translations; private to Amazon)
- Images: **AI-generated: Yes** (interior line art and cover illustration made with an AI image generator, then cleaned/thickened by code). Tool name: "AI image generator".
- Text: **AI-generated: Yes** (title, description, page text drafted with AI).
- Translations: None.

## QC done
- Every design checked on the contact sheet: pure black/white (1-bit), thick lines, no text, no logos, no licensed characters, no watermarks, borders/neighbor fragments removed.
- Rejected at QC: clownfish (too close to a famous movie character) and fawn (too close to a famous movie character) — 50 kept.
- Cover art: AI illustration upscaled 4x with Real-ESRGAN (realesrgan-x4plus-anime, BSD-3) to 3072x4096 (~356 dpi on the front panel). Still order a proof.
- Interior: every design traced with potrace and placed at exactly 300 dpi (max 7 x 8.4 in); stroke widths measured 3.4-6+ pt.
