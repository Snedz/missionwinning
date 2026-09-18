# Open Plate — color interior export notes

These notes describe how to turn the files in `interiors/` into a KDP color paperback interior. They are not a certificate that a file has been uploaded. Cover and spine are **out of scope** this pack.

KDP’s on-screen help wins if a number here disagrees with the form you see on upload day. Recheck bleed, max file size, and color vs premium color there.

---

## 1. What we ship vs what KDP wants

| We ship | KDP wants at upload |
|---------|---------------------|
| 12 unique SVG plates | One print-ready interior PDF |
| `book.html` (24 CSS pages) | Flattened pages, fonts outlined or system-safe |
| This note | A cover PDF (separate upload — not in this pack) |

Do not upload `book.html` itself. Print or rasterize it to PDF first.

## 2. Trim, bleed, safe

Intended paperback:

- Trim: **8.5 in × 11 in**
- Bleed: **0.125 in** on all sides → full media **8.75 in × 11.25 in**
- Safe type/art: stay **0.25 in** inside the trim (0.375 in from the bleed edge)
- Plate strokes in the SVGs sit inside a safe frame. Do not scale a plate to the bleed edge and clip a border.

`book.html` is sized to **trim** (8.5 × 11) for screen proof. For a bleed PDF, print with a 0.125 in extra margin of white (or extend background only — not the line art) on each edge. If your print dialog cannot add bleed, export trim-size and let KDP warn you; fix before publish. A first proof with no art in the bleed zone is honest and usually accepted if “bleed” is set correctly and backgrounds do not stop short of the edge.

## 3. Color ink

This is a **color interior** because buyers will lay color on the page and because KDP prices color paperbacks differently from black-and-white.

- Standard color vs premium color: pick in the KDP form after you see print cost. This pack does not choose for you.
- Working RGB: **sRGB**. Do not convert plates to CMYK in a tool you cannot proof.
- Line art is black (`#111`) on white. Color comes from the person holding the book.
- Do not add gray fills that look like “already colored” screenshots on the listing.

## 4. Page count (honest 24)

KDP paperbacks need at least 24 pages. This pack reaches 24 without cloning plates:

| Pages | Content |
|-------|---------|
| 1–3 | Title, copyright, how-to |
| 4–15 | Twelve unique plates (`plate-01` … `plate-12`) |
| 16–21 | Notes / palette-test pages (useful, not fake art) |
| 22–24 | About the plates, a blank notes leaf, closing |

If you add plates later, keep unique art unique. Repeating a plate to hit 24 is the defect this assembly avoids.

## 5. Suggested print path (local)

1. Open `interiors/book.html` in Chromium or Chrome.
2. Print → Save as PDF.
3. Paper: US Letter (8.5 × 11). Margins: none. Background graphics: on.
4. Confirm 24 pages in the PDF page count. Not 23. Not 12.
5. Open the PDF at 100%. Check that no stroke sits in the 0.25 in safe gutter. Check that page 4 is `plate-01` and page 15 is `plate-12`.
6. File size: color interiors can be large. If the PDF exceeds the KDP interior cap shown in the form, print again with “reduce” off and without downsampling — then, only if needed, Distill with image quality high, never “smallest file.” These plates are vectors; a clean print path should stay modest.

```bash
# optional headless proof (needs Chromium)
# chromium --headless --disable-gpu --print-to-pdf=open-plate-interior.pdf interiors/book.html
```

That command is a local proof, not an upload.

## 6. Upload checklist (founder)

- [ ] Interior PDF is 24 pages, 8.5 × 11, color
- [ ] Bleed setting matches whether art reaches the edge
- [ ] No ASIN/ISBN invented in git — assigned in KDP
- [ ] Cover PDF exists (not this pack)
- [ ] Listing text taken from `listing.md` after a founder read
- [ ] Print-cost preview looked at **before** a list price is typed
- [ ] `paymentUrl` in `config.js` is still `""` — KDP is the store, not a second checkout

## 7. Rejection patterns this pack tries to avoid

| Rejection | Why it happens | What this pack does |
|-----------|----------------|---------------------|
| Too few pages | Interior under 24 | Assembly is 24 with unique plates + real matter |
| Low-res images | 72 dpi screenshots | SVG line art; print from HTML, do not screenshot |
| Artwork in the gutter | Full-bleed collage | Safe frame on every plate |
| Copyright complaint | Licensed characters | Original geometry only |
| Wrong interior type | BW file marked color or the reverse | Notes say color; founder ticks the form |

## 8. Out of scope

- Cover, spine, barcode placement
- Hardcover
- eBook / Kindle reflow
- A second checkout URL
- Sending outreach
- Claiming the file is already live
