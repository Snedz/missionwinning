# Scout exercise pilots (examples)

**Status:** craft pilot — **not** Form Index teaching media.  
Clinical Train form stays photoreal/clinical packs under `/form/{id}/` (see [docs/MEDIA_SYSTEM.md](../../../../docs/MEDIA_SYSTEM.md), [docs/MASCOT.md](../../../../docs/MASCOT.md)).

Scout is the mission companion (invite / celebrate / empty state). These loops explore **mascot-led exercise demos** for social, Victory flourishes, or Learn fun — not mid-set standards.

## Assets (v1 pilots · 2026-08-05)

| Exercise | Still | Loop (6s) |
|----------|-------|-----------|
| Air squat | `air-squat-still.webp` | `air-squat.mp4` |
| Push-ups | `push-ups-still.webp` | `push-ups.mp4` |
| Overhead press | `overhead-press-still.webp` | `overhead-press.mp4` |

**Source:** Scout idle identity → pose stills → I2V.  
**Style target:** flat geometric falcon, paper/ink/one red eye. Pose fidelity varies by model (squat is hardest).

## Do not

- Wire these into `FORM_PACK_SIDE_IDS` / `FORM_PACK_VIDEO_IDS`
- Replace clinical form posters mid-set
- Ship multi-MB raws outside this folder without compress

## Next if founders like them

1. Eyes-on QA each loop for morph / wrong motion  
2. Compress with handbrake/ffmpeg if >500KB  
3. Optional social cutdowns (9:16)  
4. Manifest rows under `kind: mascot-exercise`  
5. Keep form teaching separate forever  

Raw frames/video also under `media/inbox/mascot-exercise-*`.
