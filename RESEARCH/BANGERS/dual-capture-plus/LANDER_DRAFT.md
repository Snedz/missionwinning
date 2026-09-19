# Dual Capture+ — lander draft

Founder hosts this. Replace **every** `PAYMENT_URL` with the real checkout. Do not commit the live link to this repo.

Tone: plain, specific, no fake counts, no “join 12,000 creators.” Visual: one column, one red/black CTA, no glow. This is not the Mission Winning site.

---

## HTML (paste into Carrd / a static page)

```html
<!doctype html>
<html lang="en">
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Dual Capture+ — two cameras, two files, A12 and later</title>
<meta name="description" content="Apple Dual Capture is free on iPhone 17, Air, and 17 Pro — one layout, one file. Dual Capture+ is Dual Capture on A12 and later: split, swap, and two files you can edit. Founder preorder $9." />
<body>
  <header>
    <p>Dual Capture+</p>
    <p>Preorder. Not affiliated with Apple.</p>
  </header>

  <h1>Apple taught the world Dual Capture. Then they locked it to new phones and one file.</h1>
  <p>
    Stock Dual Capture lives in the Camera app on
    <strong>iPhone 17, iPhone 17 Pro, iPhone 17 Pro Max, and iPhone Air</strong>.
    It records you and the world as a picture-in-picture and saves
    <strong>one</strong> movie.
  </p>
  <p>
    Dual Capture+ is the rest of that idea: two cameras at once on
    <strong>iPhone XS / XR and later</strong> (A12+), layouts Apple did not ship,
    and <strong>two files</strong> your editor can actually use.
  </p>

  <p>
    <a href="PAYMENT_URL">Preorder — $9</a>
    <span> Then $14.99 on the App Store if we ship. One-time. No subscription.</span>
  </p>

  <h2>What you get that stock Dual Capture does not</h2>
  <table>
    <thead>
      <tr>
        <th></th>
        <th>Apple Dual Capture (Camera app)</th>
        <th>Dual Capture+</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Phones</td>
        <td>17, 17 Pro, 17 Pro Max, Air</td>
        <td>A12 and later (XS / XR / SE 2 and every iPhone after), if the phone reports MultiCam</td>
      </tr>
      <tr>
        <td>Layout</td>
        <td>Fixed picture-in-picture, rear is the main shot</td>
        <td>Move PiP, swap feeds, 50/50 split, vertical stack for Reels</td>
      </tr>
      <tr>
        <td>Files</td>
        <td>One flattened video</td>
        <td>File A + File B by default, optional composite</td>
      </tr>
      <tr>
        <td>Rear lenses</td>
        <td>Pro can switch which rear lens is live</td>
        <td>Two cameras at once when the hardware set allows — including rear+rear</td>
      </tr>
      <tr>
        <td>Price</td>
        <td>Free</td>
        <td>$9 now to preorder</td>
      </tr>
    </tbody>
  </table>

  <h2>Who this is for</h2>
  <ul>
    <li>You watched the iPhone 17 keynote, opened Camera on a 14 / 15 / 16, and the Dual Capture control was not there.</li>
    <li>You tried Dual Capture on a 17 and wanted the front camera as the main frame — or the front file by itself for CapCut.</li>
    <li>You record interviews, recipes, gym form, concerts, or talking-head + B-roll on one phone.</li>
  </ul>

  <h2>Who this is not for</h2>
  <ul>
    <li>You only need a reaction PiP on a 17 and one file is fine — use the Camera app. It is good at that. It is free.</li>
    <li>You want Log, false color, or a wireless-mic console — those apps already exist.</li>
    <li>Your iPhone is older than XS / XR (A12). Two-camera recording is an Apple hardware gate, not a setting we can unlock.</li>
  </ul>

  <h2>The honest catch</h2>
  <p>
    The app is <strong>not built yet</strong>. $9 is a preorder. Apple’s own MultiCam API
    (<code>AVCaptureMultiCamSession</code>) has been on A12 phones since 2019; we will
    fork Apple’s AVMultiCamPiP sample and ship the smallest recorder that writes two files.
  </p>
  <p>
    We do <strong>not</strong> promise 4K Dolby Vision dual. That line is Apple’s
    <em>stock</em> Dual Capture spec on the 17. Third-party MultiCam is often 1080p-class
    on older chips. We will print the real resolution after a one-day device spike —
    only if enough people pay to justify the spike.
  </p>

  <h2>Kill bar</h2>
  <p>
    If fewer than <strong>five strangers</strong> pay in the <strong>14 days</strong> after
    this page can actually charge a card, we kill the track and
    <strong>refund every preorder</strong>.
    Friends we asked to “help us hit five” do not count as strangers.
  </p>

  <p>
    <a href="PAYMENT_URL">Pay $9 — Dual Capture+ founder preorder</a>
  </p>

  <h2>FAQ</h2>
  <h3>Is this the Apple Camera button?</h3>
  <p>No. Not affiliated with Apple. Dual Capture is Apple’s name for their 17-series mode. We sell the gaps.</p>

  <h3>I have an iPhone 16 Pro on the latest iOS. Does stock Dual Capture work?</h3>
  <p>
    Apple’s User Guide lists Dual Capture on iPhone 17, 17 Pro, 17 Pro Max, and iPhone Air.
    A 16 Pro is a Dual Capture+ device if MultiCam is supported — which A12 and later iPhones report.
  </p>

  <h3>RØDE Capture and DoubleTake are already free. Why pay?</h3>
  <p>
    If those apps already do your job, do not pay. This preorder is only for people who want
    a Dual Capture–named, two-files-default, vertical-first recorder without a cinema deck.
    If that is not worth $9, it should die. That is the point of this page.
  </p>

  <h3>When do I get the app?</h3>
  <p>
    If the 14-day bar passes, we run a one-day spike on Apple’s sample, then TestFlight.
    If we have not shipped within 90 days of that pass, you get a refund or a dated new refund-by.
    There is no fake launch calendar on this page.
  </p>

  <h3>Refunds</h3>
  <p>
    Kill = full refund. Change your mind before we ship = full refund. Email the address on the checkout receipt.
  </p>

  <h3>Android?</h3>
  <p>Not this product.</p>

  <footer>
    <p>Dual Capture+ is an independent preorder. Apple, iPhone, and Dual Capture are trademarks of Apple Inc.</p>
    <p><a href="PAYMENT_URL">$9 preorder</a></p>
  </footer>
</body>
</html>
```

---

## Social blurbs (founder posts — do not spray)

**Short**

> Apple Dual Capture: iPhone 17 / Air / Pro, one PiP, one file.  
> Dual Capture+: A12 and later, split/swap, two files.  
> $9 preorder. If 5 strangers don’t pay in 14 days, I refund everyone and kill it.  
> PAYMENT_URL

**Longer**

> I don’t need another cinema camera. I need Dual Capture on the phone I have, and the front camera as its own file.  
> Apple’s version is excellent at one job and exclusive to the new chassis.  
> Preordering Dual Capture+ for $9. Kill bar is public: &lt;5 cold pays / 14 days → refund.  
> PAYMENT_URL

Do not add star ratings. Do not say “we’re launching Friday.”

---

## Founder paste checklist

1. Replace all three `PAYMENT_URL` hrefs (hero, mid, footer) plus any social paste.
2. Add a real support email in the FAQ refund sentence if the processor does not provide one.
3. Do not add a testimonial block.
4. Do not add Mission Winning navigation.
5. Keep the vs-Apple table — that table *is* the ad.
