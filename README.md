# Kalas Size Wizard

JavaScript/TypeScript library that recommends the correct [Kalas Sportswear](https://www.kalas.cz) cycling apparel size based on body measurements. The sizing logic is transcribed directly from the official Kalas size chart PDF (19. 10. 2022).

---

## Sizing Logic

### Source

All tables and rules come from the Kalas PDF included in this repository:
`Velikostni_tabulka_Kalas - 19. 10. 2022 - 16-57.pdf`

The PDF contains separate tables for men, women, children, gloves, and shoe covers / socks, plus a "Důležité informace" (important notes) section that defines which measurement is the primary key for each clothing category.

---

### Clothing categories

| Category | Input value | Library `type` |
|---|---|---|
| Jersey / jacket / vest | `top` | `"top"` |
| Shorts / bib shorts | `bottom` | `"bottom"` |
| Gloves | `gloves` | `"gloves"` |
| Shoe covers / socks | `shoe_covers` | `"shoe_covers"` |

---

### Men – standard sizes (1–8)

All measurements in cm. Ranges are **inclusive** on both ends.

| Size | Height | Chest | Waist | Hips |
|------|--------|-------|-------|------|
| 0 | 0-160 | 80-84 | 0-72 | 81-85 |
| 1 | 160–165 | 84–88 | 72–76 | 85–89 |
| 2 | 165–170 | 88–92 | 76–80 | 89–93 |
| 3 | 170–175 | 92–96 | 80–84 | 93–97 |
| 4 | 175–180 | 96–100 | 84–88 | 97–101 |
| 5 | 180–185 | 100–104 | 88–92 | 101–105 |
| 6 | 185–195 | 104–112 | 92–100 | 105–113 |
| 7 | 195–200 | 112–120 | 100–108 | 113–121 |
| 8 | 195–200 | 120–128 | 108–116 | 121–129 |

**Top (jersey/jacket):** primary key is **chest**.
**Bottom (shorts/bibs):** primary key is **hips**.

For men, extended/prodloužené sizes are selected **automatically**:

- If the primary size is 1–4 and the secondary measurement indicates a longer/taller build, the recommendation switches to `+` size (`1+` to `4+`).
- Men top: secondary measurement is **height**.
- Men bottom: secondary measurement is **height**.
- If secondary measurement is missing, the result stays standard (`1`-`8`).

---

### Men – extended / prodloužené sizes (1+–4+)

For men with a taller build. Same chest/waist/hips ranges as standard sizes 1–4, but shifted to a taller height band.

| Size | Height | Chest | Waist | Hips |
|------|--------|-------|-------|------|
| 1+ | 175–180 | 84–88 | 72–76 | 85–89 |
| 2+ | 180–185 | 88–92 | 76–80 | 89–93 |
| 3+ | 185–190 | 92–96 | 80–84 | 93–97 |
| 4+ | 190–195 | 96–100 | 84–88 | 97–101 |

The extended series is derived automatically from the standard size number (1–4) plus secondary measurement:

- Top example: chest 92 cm (size 3) + height 187 cm → `3+`.
- Bottom example: hips 95 cm (size 3) + height 186 cm → `3+`.

### Size name mapping

| Numeric size | Name |
|---|---|
| 0 | XXS |
| 1 | XS |
| 2 | S |
| 3 | M |
| 4 | L |
| 5 | XL |
| 6 | XXL |
| 7 | 3XL |
| 8 | 4XL |

| Extended size | Name |
|---|---|
| 1+ | XS+ |
| 2+ | S+ |
| 3+ | M+ |
| 4+ | L+ |

---

### Women – sizes 1–6

| Size | Height | Chest | Waist | Hips |
|------|--------|-------|-------|------|
| 0 | 0-156 | 78–82 | 0-64 | 82-86 |
| 1 | 156–160 | 82–86 | 64–68 | 86–90 |
| 2 | 160–164 | 86–90 | 68–72 | 90–94 |
| 3 | 164–168 | 90–94 | 72–76 | 94–98 |
| 4 | 168–172 | 94–98 | 76–80 | 98–102 |
| 5 | 172–180 | 98–106 | 80–88 | 102–110 |
| 6 | 180–184 | 106–114 | 88–96 | 110–118 |

Same primary-key rules as men: chest for tops, hips for bottoms.

---

### Children – sizes 110–158

Sizes are named after the target height in cm.

| Size | Height | Chest | Waist |
|------|--------|-------|-------|
| 110 | 104–116 | 56–60 | 53–55 |
| 122 | 116–128 | 60–64 | 55–57 |
| 134 | 128–140 | 64–68 | 57–61 |
| 146 | 140–152 | 68–72 | 61–65 |
| 158 | 152–161 | 72–78 | 65–69 |

**Top (jersey/jacket):** primary key is **height**. However, if the chest circumference places the child in a *larger* size than height does, the chest-based size wins. This handles children who are slim for their height.
**Bottom (shorts/bibs):** primary key is **waist**.

---

### Gloves

Sized by **hand circumference** (A = obvod ruky) in cm. The matching logic uses a **half-open interval** `[handMin, handMax)` — the upper bound is exclusive, except for the last row (size 10) which is open-ended.

| Size | Hand circumference (cm) |
|------|------------------------|
| 4 | < 12.0 |
| 5 | 12.0 – < 14.5 |
| 6 | 13.5 – < 16.2 |
| 7 | 16.2 – < 18.9 |
| 8 | 18.9 – < 21.6 |
| 9 | 21.6 – < 24.3 |
| 10 | ≥ 24.3 |

> Note: sizes 5 and 6 have a slight overlap (13.5–14.5 cm) in the source PDF. The library resolves this by picking the **larger** size when a value matches multiple rows.

---

### Shoe covers & socks

Sized by **EU shoe size**. Ranges are fully inclusive.

| Size | EU shoe size |
|------|-------------|
| 35-36 | 35–36 |
| 37-39 | 37–39 |
| 40-42 | 40–42 |
| 43-45 | 43–45 |
| 46-48 | 46–48 |

---

### Decision rules (all categories)

#### 1. Normal match
The measurement falls within exactly one size's range → that size is returned.

#### 2. Border between two sizes
The measurement falls on a shared boundary (e.g. chest = 92 cm, which is both the upper limit of size 2 and the lower limit of size 3) → **the larger size is always chosen**, per the PDF recommendation.

#### 3. Secondary measurement for men's extended sizing
For men only, if primary size is 1-4 and the secondary measurement is in (or above) the extended range, recommendation switches to `+` size:

- Top: chest decides base size, **height** can switch to `+`.
- Bottom: hips decide base size, **height** can switch to `+`.

If the secondary measurement is missing, standard size is returned.

#### 4. Out of range — too small
The measurement is below the smallest size's range → the **smallest available size** is returned with a note.

#### 5. Out of range — too large
The measurement is above the largest size's range → the **largest available size** is returned with a note.

---

## API

```ts
import { getSize } from 'kalas-size-wizard';

getSize(input: SizeInput): SizeResult
```

### SizeInput

```ts
{
  gender:             'men' | 'women' | 'children';
  type:               'top' | 'bottom' | 'gloves' | 'shoe_covers';
  chest?:             number;  // cm
  waist?:             number;  // cm
  hips?:              number;  // cm
  height?:            number;  // cm
  handCircumference?: number;  // cm
  shoeSize?:          number;  // EU
}
```

### SizeResult

```ts
{
  size:     string;   // e.g. '3', '2+', '134', '40-42'
  onBorder: boolean;  // true when measurement sat exactly on a size boundary
  note:     string;   // human-readable explanation of how the size was chosen
}
```

### Examples

```ts
// Men's jersey, chest 96 cm, height 177 cm → size 4
getSize({ gender: 'men', type: 'top', chest: 96, height: 177 });
// { size: '4', onBorder: false, note: 'Recommended top size based on chest.' }

// Men's bib shorts, hips 101 cm → on the border between sizes 4 and 5
getSize({ gender: 'men', type: 'bottom', hips: 101 });
// { size: '5', onBorder: true, note: '...falls exactly on the border...' }

// Men's jersey, chest 92 cm + height 187 cm → auto-extended size 3+
getSize({ gender: 'men', type: 'top', chest: 92, height: 187 });
// { size: '3+', onBorder: false, note: 'Recommended top size based on chest.' }

// Women's jersey, chest 90 cm → size 3
getSize({ gender: 'women', type: 'top', chest: 90 });
// { size: '3', onBorder: false, note: 'Recommended top size based on chest.' }

// Children's jersey, height 130 cm → size 134
getSize({ gender: 'children', type: 'top', height: 130 });
// { size: '134', onBorder: false, note: 'Recommended top size based on height.' }

// Gloves, hand circumference 21 cm → size 8
getSize({ gender: 'men', type: 'gloves', handCircumference: 21 });
// { size: '8', onBorder: false, note: 'Recommended glove size based on hand circumference 21 cm.' }

// Shoe covers, EU 42 → size 40-42
getSize({ gender: 'men', type: 'shoe_covers', shoeSize: 42 });
// { size: '40-42', onBorder: false, note: 'Recommended shoe cover / sock size for EU shoe size 42.' }
```

---

## Development

### Run locally (interactive demo)

```bash
# 1) Install dependencies (first time)
npm ci

# 2) Build dist/ from TypeScript sources
npm run build

# 3) Start local static server
npm run serve
```

Then open:

- `http://localhost:3000/demo.html`

Notes:

- After changes in `src/`, run `npm run build` again and refresh the browser.
- If port 3000 is in use, use the different URL printed by the server.
- Use `Ctrl+C` to stop the local server.

Quick terminal-only check:

```bash
npm run demo
```

```bash
npm run build   # compile TypeScript → dist/
npm test        # run Jest test suite
npm run serve   # serve demo.html locally
```

The interactive browser demo is in `demo.html` and imports directly from `./dist/index.js`.
