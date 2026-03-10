/**
 * Sizing tables transcribed from the Kalas Sportswear PDF (19. 10. 2022).
 *
 * Each row represents one size. Ranges are [min, max] inclusive.
 * All measurements in cm unless noted otherwise.
 *
 * Business rules (from the "Důležité informace" section of the PDF):
 *  - Men/women TOPS  → primary key: chest. Height is supplementary.
 *  - Men/women BOTTOMS → primary key: hips. Height is supplementary.
 *  - Children TOPS  → primary key: height. If chest > table, use chest.
 *  - Children BOTTOMS → primary key: waist.
 *  - When on a border between sizes → choose the larger size.
 */

export interface SizeRow {
  size: string;
  height?: [number, number];
  chest?: [number, number];
  waist?: [number, number];
  hips?: [number, number];
}

// ---------------------------------------------------------------------------
// Men – standard sizes (1 – 8)
// ---------------------------------------------------------------------------
export const MEN_STANDARD: SizeRow[] = [
  { size: "1", height: [160, 165], chest: [84, 88],   waist: [72, 76],   hips: [85, 89]   },
  { size: "2", height: [165, 170], chest: [88, 92],   waist: [76, 80],   hips: [89, 93]   },
  { size: "3", height: [170, 175], chest: [92, 96],   waist: [80, 84],   hips: [93, 97]   },
  { size: "4", height: [175, 180], chest: [96, 100],  waist: [84, 88],   hips: [97, 101]  },
  { size: "5", height: [180, 185], chest: [100, 104], waist: [88, 92],   hips: [101, 105] },
  { size: "6", height: [185, 195], chest: [104, 112], waist: [92, 100],  hips: [105, 113] },
  { size: "7", height: [195, 200], chest: [112, 120], waist: [100, 108], hips: [113, 121] },
  { size: "8", height: [195, 200], chest: [120, 128], waist: [108, 116], hips: [121, 129] },
];

// ---------------------------------------------------------------------------
// Men – extended / prodloužené sizes (1+ – 4+)
// Same chest/waist/hips as standard 1–4 but taller build.
// ---------------------------------------------------------------------------
export const MEN_EXTENDED: SizeRow[] = [
  { size: "1+", height: [175, 180], chest: [84, 88],  waist: [72, 76], hips: [85, 89]  },
  { size: "2+", height: [180, 185], chest: [88, 92],  waist: [76, 80], hips: [89, 93]  },
  { size: "3+", height: [185, 190], chest: [92, 96],  waist: [80, 84], hips: [93, 97]  },
  { size: "4+", height: [190, 195], chest: [96, 100], waist: [84, 88], hips: [97, 101] },
];

// ---------------------------------------------------------------------------
// Women – sizes 1 – 6
// ---------------------------------------------------------------------------
export const WOMEN: SizeRow[] = [
  { size: "1", height: [156, 160], chest: [85, 86],   waist: [64, 68], hips: [86, 90]   },
  { size: "2", height: [160, 164], chest: [86, 90],   waist: [68, 72], hips: [90, 94]   },
  { size: "3", height: [164, 168], chest: [90, 94],   waist: [72, 76], hips: [94, 98]   },
  { size: "4", height: [168, 172], chest: [94, 98],   waist: [76, 80], hips: [98, 102]  },
  { size: "5", height: [172, 180], chest: [98, 106],  waist: [80, 88], hips: [102, 110] },
  { size: "6", height: [180, 184], chest: [106, 114], waist: [88, 96], hips: [110, 118] },
];

// ---------------------------------------------------------------------------
// Children – sizes 110 – 158  (label = height-based size name)
// ---------------------------------------------------------------------------
export const CHILDREN: SizeRow[] = [
  { size: "110", height: [104, 116], chest: [56, 60], waist: [53, 55] },
  { size: "122", height: [116, 128], chest: [60, 64], waist: [55, 57] },
  { size: "134", height: [128, 140], chest: [64, 68], waist: [57, 61] },
  { size: "146", height: [140, 152], chest: [68, 72], waist: [61, 65] },
  { size: "158", height: [152, 161], chest: [72, 78], waist: [65, 69] },
];

// ---------------------------------------------------------------------------
// Gloves – sized by hand circumference (A = obvod ruky) in cm
// ---------------------------------------------------------------------------
export interface GloveSizeRow {
  size: string;
  handMin: number;    // inclusive
  handMax: number;    // exclusive (< handMax), except last row which is open-ended
  isLastRow?: boolean;
}

export const GLOVES: GloveSizeRow[] = [
  { size: "4",  handMin: 0,    handMax: 12.0 },
  { size: "5",  handMin: 12.0, handMax: 14.5 },
  { size: "6",  handMin: 13.5, handMax: 16.2 },  // ranges overlap slightly in source
  { size: "7",  handMin: 16.2, handMax: 18.9 },
  { size: "8",  handMin: 18.9, handMax: 21.6 },
  { size: "9",  handMin: 21.6, handMax: 24.3 },
  { size: "10", handMin: 24.3, handMax: Infinity, isLastRow: true },
];

// ---------------------------------------------------------------------------
// Shoe covers & socks – sized by EU shoe size
// ---------------------------------------------------------------------------
export interface ShoeSizeRow {
  size: string;
  shoeMin: number;
  shoeMax: number;
}

export const SHOE_COVERS: ShoeSizeRow[] = [
  { size: "35-36", shoeMin: 35, shoeMax: 36 },
  { size: "37-39", shoeMin: 37, shoeMax: 39 },
  { size: "40-42", shoeMin: 40, shoeMax: 42 },
  { size: "43-45", shoeMin: 43, shoeMax: 45 },
  { size: "46-48", shoeMin: 46, shoeMax: 48 },
];
