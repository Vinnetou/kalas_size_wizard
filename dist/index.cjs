"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  getSize: () => getSize
});
module.exports = __toCommonJS(index_exports);

// src/tables.ts
var MEN_STANDARD = [
  { size: "1", height: [160, 165], chest: [84, 88], waist: [72, 76], hips: [85, 89] },
  { size: "2", height: [165, 170], chest: [88, 92], waist: [76, 80], hips: [89, 93] },
  { size: "3", height: [170, 175], chest: [92, 96], waist: [80, 84], hips: [93, 97] },
  { size: "4", height: [175, 180], chest: [96, 100], waist: [84, 88], hips: [97, 101] },
  { size: "5", height: [180, 185], chest: [100, 104], waist: [88, 92], hips: [101, 105] },
  { size: "6", height: [185, 195], chest: [104, 112], waist: [92, 100], hips: [105, 113] },
  { size: "7", height: [195, 200], chest: [112, 120], waist: [100, 108], hips: [113, 121] },
  { size: "8", height: [195, 200], chest: [120, 128], waist: [108, 116], hips: [121, 129] }
];
var MEN_EXTENDED = [
  { size: "1+", height: [175, 180], chest: [84, 88], waist: [72, 76], hips: [85, 89] },
  { size: "2+", height: [180, 185], chest: [88, 92], waist: [76, 80], hips: [89, 93] },
  { size: "3+", height: [185, 190], chest: [92, 96], waist: [80, 84], hips: [93, 97] },
  { size: "4+", height: [190, 195], chest: [96, 100], waist: [84, 88], hips: [97, 101] }
];
var WOMEN = [
  { size: "1", height: [156, 160], chest: [85, 86], waist: [64, 68], hips: [86, 90] },
  { size: "2", height: [160, 164], chest: [86, 90], waist: [68, 72], hips: [90, 94] },
  { size: "3", height: [164, 168], chest: [90, 94], waist: [72, 76], hips: [94, 98] },
  { size: "4", height: [168, 172], chest: [94, 98], waist: [76, 80], hips: [98, 102] },
  { size: "5", height: [172, 180], chest: [98, 106], waist: [80, 88], hips: [102, 110] },
  { size: "6", height: [180, 184], chest: [106, 114], waist: [88, 96], hips: [110, 118] }
];
var CHILDREN = [
  { size: "110", height: [104, 116], chest: [56, 60], waist: [53, 55] },
  { size: "122", height: [116, 128], chest: [60, 64], waist: [55, 57] },
  { size: "134", height: [128, 140], chest: [64, 68], waist: [57, 61] },
  { size: "146", height: [140, 152], chest: [68, 72], waist: [61, 65] },
  { size: "158", height: [152, 161], chest: [72, 78], waist: [65, 69] }
];
var GLOVES = [
  { size: "4", handMin: 0, handMax: 12 },
  { size: "5", handMin: 12, handMax: 14.5 },
  { size: "6", handMin: 13.5, handMax: 16.2 },
  // ranges overlap slightly in source
  { size: "7", handMin: 16.2, handMax: 18.9 },
  { size: "8", handMin: 18.9, handMax: 21.6 },
  { size: "9", handMin: 21.6, handMax: 24.3 },
  { size: "10", handMin: 24.3, handMax: Infinity, isLastRow: true }
];
var SHOE_COVERS = [
  { size: "35-36", shoeMin: 35, shoeMax: 36 },
  { size: "37-39", shoeMin: 37, shoeMax: 39 },
  { size: "40-42", shoeMin: 40, shoeMax: 42 },
  { size: "43-45", shoeMin: 43, shoeMax: 45 },
  { size: "46-48", shoeMin: 46, shoeMax: 48 }
];

// src/logic.ts
function inRange(value, min, max) {
  return value >= min && value <= max;
}
function matchRow(rows, primaryKey, primaryValue, secondaryKey, secondaryValue) {
  const matching = rows.filter((r) => {
    const range = r[primaryKey];
    return range !== void 0 && inRange(primaryValue, range[0], range[1]);
  });
  if (matching.length > 0) {
    const row = matching[matching.length - 1];
    const onBorder = matching.length > 1;
    return { row, onBorder, outOfRange: false };
  }
  const firstRange = rows[0][primaryKey];
  const lastRange = rows[rows.length - 1][primaryKey];
  if (firstRange && primaryValue < firstRange[0]) {
    return { row: rows[0], onBorder: false, outOfRange: "below" };
  }
  if (lastRange && primaryValue > lastRange[1]) {
    return { row: rows[rows.length - 1], onBorder: false, outOfRange: "above" };
  }
  if (secondaryKey !== void 0 && secondaryValue !== void 0) {
    const secondaryMatching = rows.filter((r) => {
      const range = r[secondaryKey];
      return range !== void 0 && inRange(secondaryValue, range[0], range[1]);
    });
    if (secondaryMatching.length > 0) {
      const row = secondaryMatching[secondaryMatching.length - 1];
      return { row, onBorder: false, outOfRange: false };
    }
  }
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
function getAdultSize(rows, type, input) {
  const isTop = type === "top";
  if (isTop) {
    if (input.chest === void 0) {
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
    if (input.hips === void 0) {
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
function getChildrenSize(type, input) {
  const isTop = type === "top";
  if (isTop) {
    if (input.height === void 0 && input.chest === void 0) {
      throw new Error(
        "height (or chest) measurement is required for children's top sizing"
      );
    }
    const heightResult = input.height !== void 0 ? matchRow(CHILDREN, "height", input.height) : null;
    const chestResult = input.chest !== void 0 ? matchRow(CHILDREN, "chest", input.chest) : null;
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
    const r = heightResult;
    return buildResult(r.row.size, r.onBorder, r.outOfRange, "height", isTop);
  } else {
    if (input.waist === void 0) {
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
function getGloveSize(input) {
  if (input.handCircumference === void 0) {
    throw new Error("handCircumference is required for glove sizing");
  }
  const v = input.handCircumference;
  let matched = GLOVES.find(
    (g) => v >= g.handMin && (g.isLastRow ? true : v < g.handMax)
  );
  if (!matched) {
    matched = GLOVES.find((g) => v >= g.handMin && v <= g.handMax);
  }
  if (!matched) {
    matched = v < GLOVES[0].handMax ? GLOVES[0] : GLOVES[GLOVES.length - 1];
    return {
      size: matched.size,
      onBorder: false,
      note: `Hand circumference ${v} cm is outside the standard range. Nearest size: ${matched.size}.`
    };
  }
  return {
    size: matched.size,
    onBorder: false,
    note: `Recommended glove size based on hand circumference ${v} cm.`
  };
}
function getShoeCoverSize(input) {
  if (input.shoeSize === void 0) {
    throw new Error("shoeSize (EU) is required for shoe cover / sock sizing");
  }
  const v = input.shoeSize;
  const matched = SHOE_COVERS.find((s) => v >= s.shoeMin && v <= s.shoeMax);
  if (!matched) {
    const fallback = v < SHOE_COVERS[0].shoeMin ? SHOE_COVERS[0] : SHOE_COVERS[SHOE_COVERS.length - 1];
    return {
      size: fallback.size,
      onBorder: false,
      note: `EU shoe size ${v} is outside the standard range. Nearest size: ${fallback.size}.`
    };
  }
  return {
    size: matched.size,
    onBorder: false,
    note: `Recommended shoe cover / sock size for EU shoe size ${v}.`
  };
}
function buildResult(size, onBorder, outOfRange, primaryMeasurement, isTop) {
  let note;
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
function selectTable(gender, fit) {
  if (gender === "men") return fit === "extended" ? MEN_EXTENDED : MEN_STANDARD;
  if (gender === "women") return WOMEN;
  return CHILDREN;
}
function getSize(input) {
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  getSize
});
