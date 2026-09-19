# 08 — unlock-code-utils

**Status:** unpublished-draft · paper only  
**Job:** scan a **Wi‑Fi QR**, a printed door/gate code, or a barcode payload into a **local vault** the user already understands (SSID / “front gate” / “lockbox”).

## What it is allowed to be

VisionKit `DataScannerViewController` (or Vision on a still) for:

- QR / barcodes → raw payload
- `WIFI:S:…;T:…;P:…;;` parse (fields split on `;` then `:`) — Apple does **not** give typed Wi‑Fi properties
- Text content types the scanner already classifies (numbers, etc.) for a **user-confirmed** “this is the door code”

On-device Keychain (or equivalent) for secrets. No account.

## What it must never be

- A Screen Time passcode reader, reset, or bypass (no API; FamilyControls / ManagedSettings do not expose the device PIN)
- Stolen Device Protection / Activation Lock defeat
- A lock-pick, hotel master-key, or “bypass this smart lock” guide
- Sharing someone else’s Wi‑Fi without their QR / permission

This is a **capture + vault** utility, not an exploit track.

## ICP

Airbnb/short-stay hosts and office managers who photograph the router card and the lockbox tag and then lose the photos. They will type a label. They will not want iCloud “password sharing” as the product.

## Kill criterion

If a standard `WIFI:` QR does not round-trip SSID + password into the vault after user confirm, kill. Do not add a cloud backup to hide the miss.

## Sell before build

[SELL_FIRST.md](SELL_FIRST.md). Intended `priceLabel`: **$6 one-time**. `paymentUrl` empty.
