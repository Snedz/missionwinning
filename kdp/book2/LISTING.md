# book2 — upload sheet (KDP paperback)

Files: `interior.pdf` (108 pages, 8.5 x 11 in, **no bleed**), `cover.pdf` (17.4932 x 11.25 in full wrap, spine 0.2432 in). Previews: `contact_sheet.png` (all 52 designs), `cover_preview-1.png`. Art: `art300/` (potrace-vectorized, re-rendered at exactly 300 dpi, 1-bit; source bitmaps in `art/`), raw AI sheets: `raw/`. Build: `../proc.py`, `../buildkid.py`, `../c2.json`.

## Print options (must match the files)
- Ink & paper: Black & white interior, **white** paper. Trim 8.5 x 11 in. Bleed: **No bleed**. Cover: Matte.
- Page count 108 -> spine 108 x 0.002252 = 0.2432 in. No spine text (spine under 0.25 in; KDP needs 0.0625 in clearance each side).
- ISBN: free KDP ISBN. Low-content box: unchecked.

## Metadata
- Title: Christmas Coloring Book for Toddlers & Kids
- Subtitle: 52 Big, Bold & Easy Christmas Pictures for Ages 2-5: Santa, Snowmen, Reindeer, Gingerbread & More | Cute Stocking Stuffer
- Author (pen name): Mission Winning · Language: English · Reading age: 2-5 · Adult content: No

### Description
Ho ho ho! A merry first coloring book for little hands.

52 cute Christmas pictures with big, simple shapes and thick, bold lines that are easy for toddlers and preschoolers to color.

- Santa, snowmen, reindeer, elves, gingerbread friends, penguins, polar bears, presents, stockings, ornaments, trees and more
- One picture per page with blank backs, so markers never ruin the next picture
- Large 8.5 x 11 inch pages
- Every picture labeled with its name in big bubble letters kids can color too
- A "This book belongs to" page
- Great for crayons, colored pencils and washable markers

A screen-free stocking stuffer for boys and girls ages 2-5.

### 7 keywords
1. christmas coloring book for toddlers
2. stocking stuffers for kids ages 2-5
3. easy christmas coloring pages preschool
4. santa snowman reindeer coloring
5. big simple holiday activity book kids
6. toddler christmas gift crayons
7. winter coloring book boys girls

### Categories (pick 3 in KDP's picker; confirm exact names there)
- Children's Books > Activities, Crafts & Games > Coloring Books
- Children's Books > Holidays & Celebrations > Christmas
- Children's Books > Early Learning (or Activity Books)

## Timing
Seasonal: list by early November. KDP review can take up to 72 hours, and Amazon delivery needs about a week, so the last useful publish date for Christmas is around Dec 5-10.

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
- Rejected at QC: none rejected (52 kept).
- Cover art: AI illustration upscaled 4x with Real-ESRGAN (realesrgan-x4plus-anime, BSD-3) to 3072x4096 (~356 dpi on the front panel). Still order a proof.
- Interior: every design traced with potrace and placed at exactly 300 dpi (max 7 x 8.4 in); stroke widths measured 3.4-6+ pt.
