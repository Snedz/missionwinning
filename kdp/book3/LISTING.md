# book3 — upload sheet (KDP paperback)

Files: `interior.pdf` (98 pages, 8.5 x 11 in, **no bleed**), `cover.pdf` (17.4707 x 11.25 in full wrap, spine 0.2207 in). Previews: `contact_sheet.png` (all 47 designs), `cover_preview-1.png`. Art: `art300/` (potrace-vectorized, re-rendered at exactly 300 dpi, 1-bit; source bitmaps in `art/`), raw AI sheets: `raw/`. Build: `../proc.py`, `../buildkid.py`, `../c3.json`.

## Print options (must match the files)
- Ink & paper: Black & white interior, **white** paper. Trim 8.5 x 11 in. Bleed: **No bleed**. Cover: Matte.
- Page count 98 -> spine 98 x 0.002252 = 0.2207 in. No spine text (spine under 0.25 in; KDP needs 0.0625 in clearance each side).
- ISBN: free KDP ISBN. Low-content box: unchecked.

## Metadata
- Title: Trucks & Things That Go Coloring Book for Toddlers
- Subtitle: 47 Big, Bold & Easy Pictures of Diggers, Dump Trucks, Fire Trucks, Monster Trucks, Tractors, Trains & Planes for Kids Ages 2-5
- Author (pen name): Mission Winning · Language: English · Reading age: 2-5 · Adult content: No

### Description
Vroom vroom! 47 friendly vehicles for little drivers to color.

Every picture has big, simple shapes and extra-thick lines, made for toddlers and preschoolers who are just starting to color.

- Diggers, dump trucks, bulldozers, cement mixers, fire trucks, police cars, ambulances, monster trucks, tractors, trains, planes, helicopters, boats, rockets and more
- One picture per page with blank backs, so markers never bleed onto the next picture
- Large 8.5 x 11 inch pages
- Every picture labeled with its name in big bubble letters kids can color too
- A "This book belongs to" page
- Great for crayons, dot markers and washable markers

A fun, screen-free gift for boys and girls ages 2-5 who love things that go.

### 7 keywords
1. truck coloring book for toddlers 2-4
2. things that go coloring book kids
3. construction vehicles digger coloring
4. monster truck fire truck coloring pages
5. big easy coloring book boys ages 2-5
6. cars trains planes coloring preschool
7. toddler activity book vehicles gift

### Categories (pick 3 in KDP's picker; confirm exact names there)
- Children's Books > Activities, Crafts & Games > Coloring Books
- Children's Books > Cars, Trains & Things That Go > Trucks
- Children's Books > Cars, Trains & Things That Go > Construction Vehicles

## Timing
Evergreen. Also sells as a Christmas gift, so publishing in early November is fine.

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
- Rejected at QC: pickup truck and semi truck (two faces each), combine harvester (two faces), roller/digger hybrid (malformed), off-road car (7-slot grille is Jeep trade dress) — 47 kept.
- Cover art: AI illustration upscaled 4x with Real-ESRGAN (realesrgan-x4plus-anime, BSD-3) to 3072x4096 (~356 dpi on the front panel). Still order a proof.
- Interior: every design traced with potrace and placed at exactly 300 dpi (max 7 x 8.4 in); stroke widths measured 3.4-6+ pt.
