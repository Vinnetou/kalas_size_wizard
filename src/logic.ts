import type { SizeInput, SizeResult, Gender, ClothingType, MenFit } from "./types.js";
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

function getAdultSize(
  rows: SizeRow[],
  type: ClothingType,
  input: SizeInput
): SizeResult {
  const isTop = type === "top";

  if (isTop) {
    if (input.chest === undefined) {
      throw new Error(
        "chest measurement is required for adult top sizing (jerseys, jackets, vests)"
      );
    }
    const { row, onBorder, outOfRange } = matchRow(
      rows,
      "chest",
      input.chest,
      "height",
      input.height
    );
    return buildResult(row.size, onBorder, outOfRange, "chest", isTop);
  } else {
    // bottom
    if (input.hips === undefined) {
      throw new Error(
        "hips measurement is required for adult bottom sizing (shorts, bibs)"
      );
    }
    const { row, onBorder, outOfRange } = matchRow(
      rows,
      "hips",
      input.hips,
      "height",
      input.height
    );
    return buildResult(row.size, onBorder, outOfRange, "hips", isTop);
  }
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
  const v = input.handCircumference;

  let matched = GLOVES.find(
    (g) => v >= g.handMin && (g.isLastRow ? true : v < g.handMax)
  );

  // Boundary value — if falls on a boundary between two sizes pick the larger.
  if (!matched) {
    // Try inclusive upper bound.
    matched = GLOVES.find((g) => v >= g.handMin && v <= g.handMax);
  }

  if (!matched) {
    // Clamp.
    matched = v < GLOVES[0].handMax ? GLOVES[0] : GLOVES[GLOVES.length - 1];
    return {
      size: matched.size,
      onBorder: false,
      note: `Hand circumference ${v} cm is outside the standard range. Nearest size: ${matched.size}.`,
    };
  }

  return {
    size: matched.size,
    onBorder: false,
    note: `Recommended glove size based on hand circumference ${v} cm.`,
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
 * Select the correct sizing table for the given gender and fit.
 */
function selectTable(
  gender: Gender,
  fit: MenFit
): SizeRow[] {
  if (gender === "men") return fit === "extended" ? MEN_EXTENDED : MEN_STANDARD;
  if (gender === "women") return WOMEN;
  return CHILDREN;
}

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
 * getSize({ gender: 'men', type: 'bottom', hips: 101 });
 * // → { size: '4', onBorder: true, note: '...falls exactly on the border...' }
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
  const { gender, type, menFit = "standard" } = input;

  if (type === "gloves") {
    return getGloveSize(input);
  }

  if (type === "shoe_covers") {
    return getShoeCoverSize(input);
  }

  if (gender === "children") {
    return getChildrenSize(type, input);
  }

  const table = selectTable(gender, menFit);
  return getAdultSize(table, type, input);
}
