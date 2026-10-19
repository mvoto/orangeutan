# Orangeutan brand

Visual decisions live here once the owner approves them. The live app uses
the Treehouse light palette and the Soft type pairing. Evening is approved
and not applied yet.

## Approved

### Direction: Treehouse (round 1)

Evening indoors: lamp-warm wood, and a soft blanket. Deeper cream and cocoa,
with a slate monkey tile so it does not blend into the orange.

### Light palette

These eight colors are approved. Do not change them without asking.

| Role       | Hex       | Use                                                                 |
| ---------- | --------- | ------------------------------------------------------------------- |
| Background | `#EFE4D8` | Screen                                                              |
| Surface    | `#FBF6F0` | Cards, the board                                                    |
| Primary    | `#7A5340` | Buttons, emphasis. White text on this passes WCAG AA (6.69:1)       |
| Accent     | `#E0A15A` | Fills only. Text on it must be `#2A211C` (7.06:1). White text fails |
| Monkey     | `#4E6A78` | Monkey tile wash                                                    |
| Orange     | `#E07030` | Orange tile wash                                                    |
| Text       | `#2A211C` | Body text. 12.57:1 on the background, 14.66:1 on the surface        |
| Success    | `#5C8A62` | Soft fill and large marks. Too light for small text (3.18:1)        |

### How the two tiles stay distinct

Color is the wash. Shape is the meaning. Silhouette drawings, the first emoji faces, and the fur-mask faces were rejected. The Compact orange and the Grin monkey are approved.

The washes stay. A paper drawing on the slate monkey tile is 5.34:1. A cocoa drawing on the orange tile is 4.90:1. The orange wash against the cream board is only 2.57:1, so the drawing has to carry the contrast. The two washes are about 1.3:1 apart in a protanopia simulation, so the shapes have to differ on their own.

### Dark palette (Evening, round 2)

Approved. Do not change these without asking. Monkey and orange washes match the light theme so a tile means the same thing at night. Text on the dark background is 14.69:1. Cocoa drawings stay on the orange tile. Paper drawings stay on the monkey tile.

| Role       | Hex       |
| ---------- | --------- |
| Background | `#241C17` |
| Surface    | `#322820` |
| Primary    | `#E0B08A` |
| Accent     | `#E0A15A` |
| Monkey     | `#4E6A78` |
| Orange     | `#E07030` |
| Text       | `#F6EFE6` |
| Success    | `#8FBF96` |

### Type (Soft, round 3)

Approved. Do not change these without asking.

| Role    | Family        | Use                                    |
| ------- | ------------- | -------------------------------------- |
| Display | Nunito        | Titles, level numbers, the wordmark    |
| Body    | Source Sans 3 | Rules, buttons, and other reading text |

Both are free on Google Fonts. The app loads Nunito (600 and 700) and Source Sans 3 (400 and 600).

### Orange symbol (Compact)

Approved. A bright peel `#F6A15A` with a paper ring `#FBF6F0`, a paper highlight, and a green leaf `#3E6848`. No stalk. The leaf green is part of this drawing. It does not replace the success color. The SVG lives in `src/theme/symbols.ts`.

### Monkey symbol (Grin)

Approved. Do not change it without asking. A round head, smaller side ears, and no inner ear circle. An open smile. Fur `#E0BC88`, paper ring `#FBF6F0`, muzzle `#F8E6D0`, eyes and smile `#3A2A22`. Those drawing colors belong to this face. They do not replace palette tokens. The SVG lives in `src/theme/symbols.ts` as `grinMonkeySvg`. The board draws it on the monkey wash, and the Compact orange on the orange wash.

## Not approved

- `successText` `#3E6848` for small “solved” labels on the light background (5.11:1). This does not replace the approved success fill.
