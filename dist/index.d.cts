/**
 * Gender categories for sizing.
 */
type Gender = "men" | "women" | "children";
/**
 * Clothing types available.
 * - top: jerseys, jackets, vests, arm sleeves (sized by chest for adults, height for children)
 * - skinsuit: race suits / kombinezy (same logic as top; men capped to max size 6)
 * - bottom: shorts, bibs, leg/knee sleeves (sized by hips for adults, waist for children)
 * - gloves: cycling gloves (sized by hand circumference)
 * - shoe_covers: shoe covers and socks (sized by EU shoe size)
 */
type ClothingType = "top" | "skinsuit" | "bottom" | "gloves" | "shoe_covers";
/**
 * Whether to use standard or extended (prodloužené) men's sizes.
 * Only applies when gender is "men". Extended sizes have longer inseam/torso
 * at the same chest/waist as standard sizes 1–4.
 */
type MenFit = "standard" | "extended";
/**
 * Input measurements for size calculation. All values in cm except shoeSize (EU).
 * Which fields are required depends on the clothing type:
 *
 * - top / skinsuit (men/women): chest required, height optional
 * - top (children): height required, chest optional (tiebreaker)
 * - bottom (men): hips required, height optional (auto-selects 1+ to 4+)
 * - bottom (women): hips required, height optional (tiebreaker)
 * - bottom (children): waist required
 * - gloves: handCircumference required
 * - shoe_covers: shoeSize required (EU)
 */
interface SizeInput {
    gender: Gender;
    type: ClothingType;
    /** Height in cm */
    height?: number;
    /** Chest circumference in cm */
    chest?: number;
    /** Waist circumference in cm */
    waist?: number;
    /** Hip circumference in cm */
    hips?: number;
    /** Hand circumference in cm (for gloves) */
    handCircumference?: number;
    /** EU shoe size (for shoe covers / socks) */
    shoeSize?: number;
    /**
     * Legacy input. Kept for backward compatibility; men extended sizes are
     * selected automatically from secondary measurements.
     */
    menFit?: MenFit;
}
/**
 * Result returned by getSize().
 */
interface SizeResult {
    /** Recommended size label, e.g. "3", "4+", "XL", "110", "8", "40-42" */
    size: string;
    /**
     * When the measurement falls on the boundary between two sizes the larger
     * size is recommended. This flag is true in that case.
     */
    onBorder: boolean;
    /** Human-readable note explaining the recommendation */
    note: string;
    /** Optional i18n key for the primary recommendation note */
    noteKey?: string;
    /** Optional i18n params for the primary recommendation note */
    noteParams?: Record<string, string | number | boolean>;
    /** Optional i18n key for extra note sentence (e.g. extended-size reason) */
    noteExtraKey?: string;
    /** Optional i18n params for extra note sentence */
    noteExtraParams?: Record<string, string | number | boolean>;
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
declare function getSize(input: SizeInput): SizeResult;

export { type ClothingType, type Gender, type MenFit, type SizeInput, type SizeResult, getSize };
