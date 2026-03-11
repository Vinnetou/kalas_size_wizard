import type { SizeInput, SizeResult, ClothingType } from "./types.js";
import {
  MEN_STANDARD,
  MEN_EXTENDED,
  WOMEN,
  CHILDREN,
  GLOVES,
  SHOE_COVERS,
  type SizeRow,
} from "./tables.js";

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Returns true when `value` is within [min, max] inclusive.
 */
function inRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}

/**
 * Find the best matching row from a SizeRow[] table given a primary measurement
 * and an optional secondary measurement used only as a tiebreaker.
 *
 * Rules (per Kalas PDF):
 *  - When the measurement falls inside exactly one range → that size.
 *  - When it falls on the shared boundary of two consecutive sizes → larger size.
 *  - When fully out of range → clamp to smallest or largest size, with a note.
 */
function matchRow(
  rows: SizeRow[],
  primaryKey: keyof Pick<SizeRow, "chest" | "waist" | "hips" | "height">,
  primaryValue: number,
  secondaryKey?: keyof Pick<SizeRow, "chest" | "waist" | "hips" | "height">,
  secondaryValue?: number
): { row: SizeRow; onBorder: boolean; outOfRange: "below" | "above" | false } {
  // Collect all rows where primary measurement is within range.
  const matching = rows.filter((r) => {
    const range = r[primaryKey];
    return range !== undefined && inRange(primaryValue, range[0], range[1]);
  });

  if (matching.length > 0) {
    // Multiple matches → measurement is on a shared border; pick the larger (last) size.
    const row = matching[matching.length - 1];
    const onBorder = matching.length > 1;
    return { row, onBorder, outOfRange: false };
  }

  // No primary match — clamp first if out of range.
  // The secondary key must never override an out-of-range primary measurement.
  const firstRange = rows[0][primaryKey];
  const lastRange = rows[rows.length - 1][primaryKey];

  if (firstRange && primaryValue < firstRange[0]) {
    return { row: rows[0], onBorder: false, outOfRange: "below" };
  }
  if (lastRange && primaryValue > lastRange[1]) {
    return { row: rows[rows.length - 1], onBorder: false, outOfRange: "above" };
  }

  // Primary is within the overall range but fell between two rows (gap in table).
  // Try secondary key as tiebreaker.
  if (secondaryKey !== undefined && secondaryValue !== undefined) {
    const secondaryMatching = rows.filter((r) => {
      const range = r[secondaryKey];
      return range !== undefined && inRange(secondaryValue, range[0], range[1]);
    });
    if (secondaryMatching.length > 0) {
      const row = secondaryMatching[secondaryMatching.length - 1];
      return { row, onBorder: false, outOfRange: false };
    }
  }

  // Fallback: find the row with the closest range midpoint.
  let closest = rows[0];
  let closestDist = Infinity;
  for (const r of rows) {
    const range = r[primaryKey];
    if (!range) continue;
    const mid = (range[0] + range[1]) / 2;
    const dist = Math.abs(primaryValue - mid);
    if (dist < closestDist) {
      closestDist = dist;
      closest = r;
    }
  }
  return { row: closest, onBorder: false, outOfRange: false };
}

// ---------------------------------------------------------------------------
// Category-specific handlers
// ---------------------------------------------------------------------------

function toExtendedMenSize(
  standardRow: SizeRow,
  type: ClothingType,
  input: SizeInput
): string {
  const standardSize = standardRow.size;

  // Only sizes 1-4 have extended (+) variants.
  if (!["1", "2", "3", "4"].includes(standardSize)) {
    return standardSize;
  }

  const extRow = MEN_EXTENDED.find((r) => r.size === `${standardSize}+`);
  if (!extRow) return standardSize;

  const round1 = (v: number) => Math.round(v * 10) / 10;

  const shouldUseExtendedFromSecondary = (
    secondaryValue: number | undefined,
    standardRange: [number, number] | undefined,
    extendedRange: [number, number] | undefined
  ): boolean => {
    if (secondaryValue === undefined || !standardRange || !extendedRange) {
      return false;
    }

    // Secondary measurements are evaluated with one-decimal precision.
    const secondary = round1(secondaryValue);
    const standardMax = standardRange[1];
    const extendedMin = extendedRange[0];

    // If there is a gap between standard max and extended min, split it:
    // first third stays standard, anything above that goes extended.
    if (extendedMin > standardMax) {
      const gap = extendedMin - standardMax;
      const cutoff = round1(standardMax + gap / 3);
      return secondary > cutoff;
    }

    // If there is overlap/no gap, standard PDF border rule applies.
    return secondary >= extendedMin;
  };

  if (type === "top") {
    if (shouldUseExtendedFromSecondary(input.height, standardRow.height, extRow.height)) {
      return extRow.size;
    }
    return standardSize;
  }

  // Bottom: primary is hips; height decides if + applies.
  if (shouldUseExtendedFromSecondary(input.height, standardRow.height, extRow.height)) {
    return extRow.size;
  }
  return standardSize;
}

function getMenSize(type: ClothingType, input: SizeInput): SizeResult {
  const isTop = type === "top";

  if (isTop) {
    if (input.chest === undefined) {
      throw new Error(
        "chest measurement is required for men top sizing (jerseys, jackets, vests)"
      );
    }
    const { row, onBorder, outOfRange } = matchRow(
      MEN_STANDARD,
      "chest",
      input.chest
    );
    const finalSize = toExtendedMenSize(row, type, input);
    return buildResult(finalSize, onBorder, outOfRange, "chest", isTop);
  }

  if (input.hips === undefined) {
    throw new Error(
      "hips measurement is required for men bottom sizing (shorts, bibs)"
    );
  }
  const { row, onBorder, outOfRange } = matchRow(
    MEN_STANDARD,
    "hips",
    input.hips
  );
  const finalSize = toExtendedMenSize(row, type, input);
  return buildResult(finalSize, onBorder, outOfRange, "hips", isTop);
}

function getWomenSize(type: ClothingType, input: SizeInput): SizeResult {
  const isTop = type === "top";

  if (isTop) {
    if (input.chest === undefined) {
      throw new Error(
        "chest measurement is required for adult top sizing (jerseys, jackets, vests)"
      );
    }
    const { row, onBorder, outOfRange } = matchRow(
      WOMEN,
      "chest",
      input.chest,
      "height",
      input.height
    );
    return buildResult(row.size, onBorder, outOfRange, "chest", isTop);
  }

  if (input.hips === undefined) {
    throw new Error(
      "hips measurement is required for adult bottom sizing (shorts, bibs)"
    );
  }
  const { row, onBorder, outOfRange } = matchRow(
    WOMEN,
    "hips",
    input.hips,
    "height",
    input.height
  );
  return buildResult(row.size, onBorder, outOfRange, "hips", isTop);
}

function getChildrenSize(type: ClothingType, input: SizeInput): SizeResult {
  const isTop = type === "top";

  if (isTop) {
    if (input.height === undefined && input.chest === undefined) {
      throw new Error(
        "height (or chest) measurement is required for children's top sizing"
      );
    }

    // Rule (from PDF): determine size by height first.
    // If the chest circumference places the child in a LARGER size than height
    // does, override with that larger chest-based size.
    const heightResult =
      input.height !== undefined
        ? matchRow(CHILDREN, "height", input.height)
        : null;

    const chestResult =
      input.chest !== undefined
        ? matchRow(CHILDREN, "chest", input.chest)
        : null;

    if (heightResult && chestResult) {
      const heightIndex = CHILDREN.indexOf(heightResult.row);
      const chestIndex = CHILDREN.indexOf(chestResult.row);
      if (chestIndex > heightIndex) {
        return buildResult(chestResult.row.size, chestResult.onBorder, chestResult.outOfRange, "chest", isTop);
      }
      return buildResult(heightResult.row.size, heightResult.onBorder, heightResult.outOfRange, "height", isTop);
    }

    if (chestResult) {
      return buildResult(chestResult.row.size, chestResult.onBorder, chestResult.outOfRange, "chest", isTop);
    }

    const r = heightResult!;
    return buildResult(r.row.size, r.onBorder, r.outOfRange, "height", isTop);
  } else {
    // bottom
    if (input.waist === undefined) {
      throw new Error(
        "waist measurement is required for children's bottom sizing"
      );
    }
    const { row, onBorder, outOfRange } = matchRow(
      CHILDREN,
      "waist",
      input.waist
    );
    return buildResult(row.size, onBorder, outOfRange, "waist", isTop);
  }
}

function getGloveSize(input: SizeInput): SizeResult {
  if (input.handCircumference === undefined) {
    throw new Error("handCircumference is required for glove sizing");
  }
  const v = Math.round(input.handCircumference * 10) / 10;

  // Children use only sizes 4 and 5. Anything >= 12.0 cm maps to size 5.
  if (input.gender === "children") {
    const onBorder = v === 12.0;
    const size = v < 12.0 ? "4" : "5";
    return {
      size,
      onBorder,
      note: onBorder
        ? `Hand circumference ${v} cm falls on the border between children glove sizes. The larger size ${size} is recommended.`
        : `Recommended glove size based on hand circumference ${v} cm.`,
    };
  }

  // Adults use sizes 6–10. Anything below 13.5 cm still maps to size 6.
  const adultGloves = GLOVES.filter((g) => Number(g.size) >= 6);
  const firstAdult = adultGloves[0];

  if (v < firstAdult.handMin) {
    return {
      size: firstAdult.size,
      onBorder: false,
      note: `Hand circumference ${v} cm is below the adult range. Nearest adult size: ${firstAdult.size}.`,
    };
  }

  const matched = adultGloves.find(
    (g) => v >= g.handMin && (g.isLastRow ? true : v < g.handMax)
  );

  if (!matched) {
    const fallback = adultGloves[adultGloves.length - 1];
    return {
      size: fallback.size,
      onBorder: false,
      note: `Hand circumference ${v} cm is outside the standard range. Nearest size: ${fallback.size}.`,
    };
  }

  // Border value between consecutive adult sizes -> recommend the larger size.
  const onBorder = adultGloves
    .slice(1)
    .some((g) => v === g.handMin);

  return {
    size: matched.size,
    onBorder,
    note: onBorder
      ? `Hand circumference ${v} cm falls on the border between two glove sizes. The larger size ${matched.size} is recommended.`
      : `Recommended glove size based on hand circumference ${v} cm.`,
  };
}

function getShoeCoverSize(input: SizeInput): SizeResult {
  if (input.shoeSize === undefined) {
    throw new Error("shoeSize (EU) is required for shoe cover / sock sizing");
  }
  const v = input.shoeSize;
  const matched = SHOE_COVERS.find((s) => v >= s.shoeMin && v <= s.shoeMax);
  if (!matched) {
    const fallback =
      v < SHOE_COVERS[0].shoeMin
        ? SHOE_COVERS[0]
        : SHOE_COVERS[SHOE_COVERS.length - 1];
    return {
      size: fallback.size,
      onBorder: false,
      note: `EU shoe size ${v} is outside the standard range. Nearest size: ${fallback.size}.`,
    };
  }
  return {
    size: matched.size,
    onBorder: false,
    note: `Recommended shoe cover / sock size for EU shoe size ${v}.`,
  };
}

// ---------------------------------------------------------------------------
// Result builder
// ---------------------------------------------------------------------------

function buildResult(
  size: string,
  onBorder: boolean,
  outOfRange: "below" | "above" | false,
  primaryMeasurement: string,
  isTop: boolean
): SizeResult {
  let note: string;

  if (outOfRange === "below") {
    note = `Your ${primaryMeasurement} measurement is smaller than our smallest size. Size ${size} is the closest available.`;
  } else if (outOfRange === "above") {
    note = `Your ${primaryMeasurement} measurement is larger than our largest size. Size ${size} is the closest available.`;
  } else if (onBorder) {
    note = `Your ${primaryMeasurement} measurement falls exactly on the border between two sizes. The larger size ${size} is recommended.`;
  } else {
    const garment = isTop ? "top" : "bottom";
    note = `Recommended ${garment} size based on ${primaryMeasurement}.`;
  }

  return { size, onBorder, note };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Returns the recommended Kalas size for the given measurements and clothing type.
 *
 * @throws {Error} When required measurements are missing.
 *
 * @example
 * ```ts
 * import { getSize } from 'kalas-size-wizard';
 *
 * getSize({ gender: 'men', type: 'top', chest: 96, height: 177 });
 * // → { size: '4', onBorder: false, note: 'Recommended top size based on chest.' }
 *
 * getSize({ gender: 'men', type: 'bottom', waist: 88 });
 * // → { size: '5', onBorder: true, note: '...falls exactly on the border...' }
 *
 * getSize({ gender: 'women', type: 'top', chest: 90 });
 * // → { size: '3', onBorder: false, note: 'Recommended top size based on chest.' }
 *
 * getSize({ gender: 'children', type: 'top', height: 130 });
 * // → { size: '134', onBorder: false, note: 'Recommended top size based on height.' }
 *
 * getSize({ gender: 'men', type: 'gloves', handCircumference: 21 });
 * // → { size: '8', onBorder: false, note: '...' }
 *
 * getSize({ gender: 'men', type: 'shoe_covers', shoeSize: 42 });
 * // → { size: '40-42', onBorder: false, note: '...' }
 * ```
 */
export function getSize(input: SizeInput): SizeResult {
  const { gender, type } = input;

  if (type === "gloves") {
    return getGloveSize(input);
  }

  if (type === "shoe_covers") {
    return getShoeCoverSize(input);
  }

  if (gender === "children") {
    return getChildrenSize(type, input);
  }

  if (gender === "men") {
    return getMenSize(type, input);
  }

  return getWomenSize(type, input);
}
