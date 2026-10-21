# Orangeutan — Project Plan

A cute, calm logic puzzle for iPhone first, then Android. Fill the grid with
monkeys and oranges, follow three simple rules, and unlock a pixel-art picture
for every level you solve.

This document is the source of truth for scope, architecture, and conventions.
Update it whenever a decision changes.

---

## 1. Game rules

Orangeutan is a binary-determination puzzle (the Takuzu / Binairo family). The
art, names, and presentation are original.

### Board

- A square grid of even size **N**. The sequence starts with one **4×4**,
  then **6×6**, then **8×8**. At least 200 Levels. See `docs/adr/0001-one-way-levels.md`.
- Each cell is either empty, a **monkey**, or an **orange**.
- Some cells start pre-filled ("givens") and cannot be changed by the player.

### Rules

1. **No three in a row.** No row or column may contain three adjacent cells
   with the same symbol.
2. **Balance.** Every row and every column contains exactly N/2 monkeys and
   N/2 oranges.
3. **Edge clues.** Some pairs of orthogonally adjacent cells have a clue
   on the border between them:
   - `=` the two cells hold the **same** symbol.
   - `×` the two cells hold **opposite** symbols.

### Puzzle guarantees

- Every shipped puzzle has **exactly one** solution, and it can be reached
  by logic alone (no guessing), verified by the solver.
- Solving a Level opens a Celebration, then the next Level. The Level's
  **pixel-art picture** is a later reward, not the Celebration.

### Player interaction

Confirmed. Terms are in `GLOSSARY.md`. The sequence decision is in
`docs/adr/0001-one-way-levels.md`.

- PLAY opens Level 1, then the current unsolved Level. A solved Level is retired.
- Tap a cell to cycle: empty → monkey → orange → empty. Givens do not change.
- Level 1 is 4×4, has no Edge clues, and starts with at least one monkey and one orange Given.
- Edge clues begin on the first 6×6. Within a size, more Givens come first.
- Rule cards for the rules that Puzzle uses sit on every Level.
- Broken rules outline the involved cells while the player plays.
- A quiet back control leaves an unfinished Level as it is.
- The Celebration uses the current orangutan-and-orange drawing. Next continues. Home, after the last Level, shows the Score and Share.
- Play time is the whole seconds spent on each Level while it is open and the app is in the foreground. Home shows the total throughout the sequence. The Score stays the count of solved Levels, shown only when every Level is solved, and is still the only shared number.
- No undo and no reset. Hint can be added later.

---

## 2. Product principles

- **Simple and cute.** One screen does one thing. No clutter.
- **Intuitive.** A new player should understand the rules from three tiny
  illustrated rule cards, without reading a tutorial.
- **"One more level."** Short sessions, instant feedback, a satisfying reveal.
- **Respectful.** Works offline, no dark patterns, no forced ads in the core
  loop. (Monetization is out of scope until explicitly planned.)
- **Original.** We take broad inspiration from calm puzzle apps (warm
  off-white background, soft pastel tiles, big centered grid with rounded
  cards, small rule cards above the grid, round helper buttons below, simple
  header). We **do not** copy any other app's art, mascots, exact layout, or
  ad placement. The orangutan and orange are drawn from scratch.

### Design approval gate (mandatory)

Visual identity is decided **with the owner, step by step**. Until it is
approved, the app uses a neutral placeholder theme (greys, system font, a
plain logo placeholder).

Anything touching identity requires a **preview first and explicit approval
before it is committed**:

- App name styling, logo, and app icon
- Color palette (light and, later, dark)
- Typography (font families, sizes, weights)
- Mascot, symbol art (monkey / orange), clue glyphs, and pixel-art style
- Layout of the game screen, animations, sounds, and haptics character

Previews are delivered as static mockups or a preview screen in the app, with
two or three options where useful. No design token changes without approval.

---

## 3. Tech stack

| Concern       | Choice                                               |
| ------------- | ---------------------------------------------------- |
| Framework     | Expo SDK 58 (React Native 0.88, React 19, Hermes)    |
| Language      | TypeScript 6, `strict` plus extra strictness flags   |
| Navigation    | Expo Router (file-based, native stack)               |
| Tests         | Jest 30 + `jest-expo`, React Native Testing Library  |
| Lint / format | ESLint (flat config, `eslint-config-expo`), Prettier |
| State         | React state, `useReducer`, and Context (no library)  |
| Persistence   | `expo-sqlite/kv-store` (versioned JSON session)      |
| Builds        | Local `expo run:*` for development, EAS for release  |

### Dependency policy

Every dependency is a liability for size, startup time, crash surface, and
upgrades. Before adding one:

1. Can we write it in under ~100 lines with tests? Then write it.
2. Is there an Expo-maintained module? Prefer it.
3. Install via `npx expo install` so versions match the SDK.
4. Record why in the commit message.

The game engine has **zero** runtime dependencies.

---

## 4. Architecture

Layered, with dependencies pointing inward only:

```
 routes (src/app)  ──►  features  ──►  ui / theme
        │                  │
        │                  ├──►  services (interfaces + adapters)
        │                  │
        └──────────────────┴──►  engine  (pure TypeScript, no UI)
```

### Engine (`src/engine`)

Pure, deterministic, synchronous TypeScript. **No imports from React, React
Native, or Expo** (enforced by ESLint). It runs identically in Jest, Node
scripts, and the app.

Planned modules:

- `types.ts`: `Cell`, `Symbol`, `Grid`, `EdgeClue`, `Puzzle`, `Solution`.
- `grid.ts`: compact board representation (flat `Uint8Array`, index
  `row * size + col`) plus read/write helpers. Cheap to copy, cache friendly.
- `rules/`: one module per rule (`no-three`, `balance`, `edge-clues`), each
  implementing a shared `Rule` interface (`check(grid) → Violation[]`).
  New rules are added without editing existing ones (Open/Closed).
- `validator.ts`: composes rules; returns violations for UI highlighting and
  an `isSolved` verdict.
- `solver.ts`: constraint propagation (forced moves) plus backtracking that
  **counts solutions up to 2**, which is how uniqueness is proven. It also
  reports which deductions were needed (used for difficulty rating and hints).
- `generator.ts`: from a seeded RNG, build a random valid full grid, then
  remove givens and add `=` / `×` clues while the solver still finds exactly
  one solution, until the target difficulty is reached.
- `rng.ts`: small seeded PRNG so every puzzle is reproducible from its seed.
- `hint.ts` (later): next logical deduction plus a human-readable reason.

Expected failures (invalid input, no solution) are returned as typed
`Result` values, not thrown. Thrown errors mean programmer bugs.

### Levels

Levels are **pre-generated offline** by a Node script that uses the same
engine, verified for uniqueness, rated for difficulty, and shipped as compact
JSON. Benefits: zero generation cost on the phone, curated difficulty curve,
reproducible bugs, and a test that re-verifies every shipped level. On-device
generation can be added later for an endless mode.

### Features (`src/features`)

Vertical slices that combine engine, UI, and services, for example `game`
(board screen, reducer, input), `levels` (progression), `rewards` (pixel art
reveal and gallery), `settings`, and `bootstrap` (startup tasks).

Game state lives in a reducer (`(state, action) => state`) that is pure and
unit-tested independently of React.

### UI and theme (`src/ui`, `src/theme`)

- `theme/`: design tokens (colors, typography, spacing, radii) and a
  `ThemeProvider` / `useTheme()` hook. Components never hard-code colors or
  font sizes; they read tokens. Swapping the placeholder theme for the
  approved one is a single-file change.
- `ui/`: small presentational primitives (`Screen`, `AppText`, buttons,
  cards). No business logic.

### Services (`src/services`)

Side effects behind interfaces (storage, haptics, sound, clock), injected via
Context. Features depend on the interface, not the implementation
(Dependency Inversion), which keeps them testable with in-memory fakes.

---

## 5. Folder structure

```
orangeutan/
├── PLAN.md                  # this file
├── AGENTS.md                # instructions for AI assistants
├── app.json                 # Expo config (native config lives here, not in ios/ android/)
├── assets/                  # images, fonts (placeholders until approved)
├── scripts/                 # Node scripts (level generation, later)
└── src/
    ├── app/                 # Expo Router routes ONLY; thin screens
    │   ├── _layout.tsx      # root providers, error boundary, navigator
    │   ├── index.tsx        # loading screen (bootstrap, then go home)
    │   └── home.tsx         # first screen after loading
    ├── engine/              # pure game logic (M2+)
    ├── features/
    │   └── bootstrap/       # startup tasks + loading screen
    ├── services/            # side-effect interfaces + adapters
    ├── theme/               # tokens + ThemeProvider
    ├── ui/                  # presentational primitives
    └── test/                # shared test utilities
```

Tests sit next to the code in `__tests__/` folders, named `*.test.ts(x)`.
Native `ios/` and `android/` folders are generated (Continuous Native
Generation) and are git-ignored; never edit them by hand.

---

## 6. Milestones

Each milestone is small, ends green (lint, typecheck, tests), and is started
**only when the owner asks**.

| #   | Milestone                  | Outcome                                                                                                                        |
| --- | -------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| 0   | Plan                       | This document.                                                                                                                 |
| 1   | Foundation                 | Expo + TS strict, lint, format, tests, routing, placeholder theme, loading screen. Runs on iOS simulator and Android emulator. |
| 2   | Engine: model + validator  | Types, grid, rules, validator; full unit tests.                                                                                |
| 3   | Engine: solver             | Propagation + solution counting; uniqueness proofs; property-based tests.                                                      |
| 4   | Engine: generator + levels | Seeded generator, difficulty rating, level-pack script, at least 200 Levels verified in tests.                                 |
| 5   | Identity exploration       | Mood board, palette, fonts, mascot, symbols, logo options. **Preview + approval.**                                             |
| 6   | Game screen                | Grid, tap input, clues, violation highlights, win detection. Layout **previewed first**.                                       |
| 7   | Progression + persistence  | Current unsolved Level only, saved progress, versioned save schema with safe migrations. No replay.                            |
| 8   | Pixel-art rewards          | Reveal animation and gallery. Art style **approved first**.                                                                    |
| 9   | Helpers                    | Hint (logical next step with explanation). Undo and reset are not planned.                                                     |
| 10  | Polish                     | Haptics, sound, accessibility, reduced motion.                                                                                 |
| 11  | Release                    | Final icon and splash, EAS builds, TestFlight / internal testing, store listing.                                               |

---

## 7. Coding conventions

### TypeScript

- `strict` plus `noUncheckedIndexedAccess`, `noImplicitOverride`,
  `noImplicitReturns`, `noFallthroughCasesInSwitch`,
  `noPropertyAccessFromIndexSignature`.
- No `any`. Use `unknown` and narrow. No non-null `!` assertions except in
  tests.
- Prefer `type` aliases and discriminated unions; use `readonly` for data
  that must not change. Exhaustive `switch` with a `never` check.
- Named exports everywhere, except route files (Expo Router needs default
  exports).
- Explicit return types on exported functions.
- Imports use the `@/` alias for `src/`.

### Design (SOLID in practice)

- **Single responsibility:** one module, one reason to change. Screens
  compose; they do not compute.
- **Open/closed:** rules, bootstrap tasks, and services are added by
  registering new implementations, not by editing switch statements.
- **Liskov:** every implementation of an interface (for example an in-memory
  storage and the real one) is interchangeable in tests and production.
- **Interface segregation:** small, focused interfaces (`KeyValueStore`,
  not `Everything`).
- **Dependency inversion:** features depend on interfaces in `services/`;
  concrete adapters are wired at the root.

### React Native performance and reliability

- `StyleSheet.create` for static styles; theme-derived styles memoized.
- Grid cells are memoized components keyed by stable ids, and only the
  changed cell re-renders. No anonymous objects in hot render paths.
- No long synchronous work on the JS thread at runtime (levels are
  pre-generated). Any work over ~16 ms must be justified and measured.
- Animations prefer native-driven / UI-thread APIs; respect "reduce motion".
- A root **error boundary** shows a friendly recovery screen instead of a
  crash. Persisted data is validated on read; corrupt saves fall back to
  defaults instead of crashing.
- Release builds strip `console.*` noise; errors are logged through one
  small logger module.
- Asset sizes stay small (pixel art stored as palette + indices, not PNGs).

### Testing

- Engine: target **≥ 95%** line and branch coverage, including property-based
  tests (for example, "every generated puzzle has exactly one solution").
- Reducers and pure helpers: unit tests.
- Components: behavior tests with React Native Testing Library (what the user
  sees and taps), not snapshots.
- Every bug fix comes with a test that reproduces it.

### Files and naming

- Files: `kebab-case.ts`; React components: `PascalCase` exports inside
  `kebab-case.tsx` files.
- Hooks start with `use`. Constants in `SCREAMING_SNAKE_CASE` only when they
  are true module-level constants.
- Comments explain **why**, not what.

### Workflow

- Small steps; each one ends with `npm run verify` (typecheck + lint +
  format check + tests) passing.
- Conventional Commits (`feat:`, `fix:`, `chore:`, `test:`, `docs:`).
- Run on both the iOS simulator and the Android emulator before closing a
  milestone that touches UI.

---

## 8. Open decisions (owner to decide later)

- Final bundle identifier / package name (placeholder: `com.orangeutan.app`).
- Visual identity (M5): Treehouse direction, light palette, Evening dark palette, the Soft type pairing (Nunito and Source Sans 3), the Compact orange, and the Grin monkey are approved (see `docs/brand.md`). Logo and pixel-art style are still open. The live app uses the light palette and Soft pairing. Evening is not applied yet.
- Monetization (none planned yet; no ads in the core loop).
- License for the project (the template's Expo MIT license was removed).
