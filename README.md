# Orangeutan

A calm logic puzzle for iPhone, then Android. The player fills a square grid with monkeys and oranges. Each puzzle has one solution, and it can be reached by logic alone.

The puzzle is in the Takuzu / Binairo family. The art and presentation are original.

## Rules

1. **No three in a row.** No row or column contains three identical symbols in a row.
2. **Balance.** Every row and every column is half monkeys and half oranges.
3. **Edge clues.** A mark between two cells means they match (`=`) or they differ (`×`).

`PLAN.md` is the source of truth for scope, the player loop, architecture, and milestones. Approved visual decisions live in `docs/brand.md`.

## Run

```bash
npm install
npm start
```

`npm run ios` and `npm run android` open a development build. `npm run start:go` opens Expo Go.

```bash
npm run verify
```

That runs the typecheck, lint, format check, and tests.

## Layout

- `src/app/` — screens, via Expo Router
- `src/features/` — feature slices
- `src/engine/` — pure game logic, with no React or Expo imports
- `src/ui/` and `src/theme/` — shared interface and tokens
- `AGENTS.md` — instructions for coding agents

Native `ios/` and `android/` projects are generated. Configure native behavior in `app.json`.
