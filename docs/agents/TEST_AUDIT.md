# Test audit

Every new test in this repo answers the four questions below before it is added. A missing answer means do not add the test yet.

Adapted from the OpenClaw test-audit skill. The questions and the bug-fix rule are kept from that skill. OpenClaw-only commands (Vitest, `$crabbox`, campaign mode, `$autoreview`) are not part of this repo. The runner here is `npm test` (`tsx --test` on `src/**/*.test.ts` and `packages/mw-core/src/**/*.test.ts`).

Source: [openclaw/openclaw `.agents/skills/test-audit/SKILL.md`](https://github.com/openclaw/openclaw/blob/main/.agents/skills/test-audit/SKILL.md) (MIT). Copyright (c) 2026 OpenClaw Foundation. License: <https://github.com/openclaw/openclaw/blob/main/LICENSE>.

## Four questions

Before adding any test, answer four questions; a missing answer means do not add it yet:

1. What observable behavior, invariant, or independent contract does it protect?
2. What credible regression makes it fail?
3. Why does existing coverage not already catch that failure? Each contract has one primary test owner at the strongest boundary; another layer needs its own distinct risk, such as a transport or lifecycle failure the owner cannot reach. Prefer extending a table-driven case or shared fixture over a near-duplicate test; consolidate duplicated setup in the same change.
4. Does it need a production seam (export, flag, wrapper, injection hook) that no production caller needs? If yes, move the test to the real boundary instead.

## Bug fixes

Bug regression tests must fail on the pre-fix code for the intended reason and pass after the owner-boundary repair. A regression test that never demonstrably failed proves the mock, not the fix. One regression at the owner boundary covers the bug; do not replay the same scenario at every layer it crosses.

Run that failure on the old code, then the fix, then `npm test` (or `npm run verify` before a PR). A test that only passed after the fix, and was never shown red, does not count.

## Permission

The four questions and the bug-fix paragraph are adapted from OpenClaw under the MIT license. The copyright and permission notice follow.

```
MIT License

Copyright (c) 2026 OpenClaw Foundation

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
