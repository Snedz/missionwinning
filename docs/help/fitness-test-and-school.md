# Fitness test and school classes

Mission Winning includes a **Presidential Fitness Test (PFT)** flow and **PE class** tools for teachers and students.

## Presidential Fitness Test

**Route:** `/fitness-test`

Students complete curl-ups, push-ups, sit-and-reach, and mile run (or alternatives). The app scores tiers (Participant, National, Presidential) and can sync results when signed in.

### Sharing results

Use the share button to copy text for parents or coaches — no account required to take the test; sign-in enables cloud sync and class leaderboards.

Hard sessions (including the mile run) show a **stop-is-allowed** warning first. See [pt-safety.md](pt-safety.md). The app is not medical care.

## Joining a class (students)

1. Your teacher gives you a **class code** (format like `MWA3K9`).
2. On the fitness test page or join link (`/join/class/CODE`), enter the code.
3. Complete tests while **signed in** so scores count toward class standings.
4. View standings from the leaderboard link your teacher shares.

You only see **aggregate standings** — not other students' private workout data.

Hard sessions (including the mile run) show a **stop-is-allowed** warning first. See [pt-safety.md](pt-safety.md). The app is not medical care.

## Creating a class (teachers)

1. Open **Fitness Test** → **School & PE class** panel.
2. Create a class — you receive a **class code** and **teacher PIN**.
3. **Save the PIN** — it unlocks the teacher dashboard and exports.
4. Share the join link or code with students.
5. Open **Teacher dashboard** (`/school/class/CODE`) to view standings and export CSV.

### Teacher PIN security

- The PIN is required to view class stats, leaderboards, and exports.
- Do not post the PIN publicly — share it only with co-teachers.
- PIN is verified server-side; too many wrong attempts are rate-limited.

## Leaderboard privacy

- Class leaderboards show **athlete labels** (e.g. "Athlete 3"), not student emails.
- Full exports (CSV, printable report) require teacher PIN or creator account.
- Students cannot browse other classes' data with only a guessable code.

## Youth and consent

Athletes under the age threshold may need **parent email consent** before certain features. See [privacy-and-data.md](privacy-and-data.md).

## America track (optional)

Some builds include national fitness goal presets — opt-in via settings. Not required for standard PE class use.

Questions: [faq.md](faq.md).
