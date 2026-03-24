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
 * Input for skinsuit (kombinéza) sizing.
 * Both genders use men's size tables, capped at size 6.
 * Upper part is sized by chest; lower part by hips.
 * Height for each part drives the extended (+) size selection.
 */
interface SkinsuitInput {
    /** Chest circumference in cm (upper part) */
    chest: number;
    /** Height in cm — for upper part extended size decision */
    heightTop?: number;
    /** Hip circumference in cm (lower part) */
    hips: number;
    /** Height in cm — for lower part extended size decision */
    heightBottom?: number;
}
/**
 * Result returned by getSkinsuitSize().
 * When |topSizeNum − bottomSizeNum| > 1 the measurements fall outside any
 * regular cut combination and the user must contact the Kalas hotdesk.
 */
type SkinsuitSizeResult = {
    result: "sizes";
    top: SizeResult;
    bottom: SizeResult;
} | {
    result: "contact_hotdesk";
};
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
/**
 * Returns recommended sizes for both the upper (chest-based) and lower (hips-based)
 * parts of a Kalas skinsuit. Both genders use the men's size tables, capped at size 6.
 * Extended (+) sizes are applied the same way as for men's standard clothing.
 *
 * When the numeric size difference between the upper and lower part exceeds 1,
 * the result is `{ result: "contact_hotdesk" }` — the measurements fall outside
 * any regular cut and the customer should arrange personal fitting with Kalas.
 *
 * @example
 * ```ts
 * getSkinsuitSize({ chest: 96, heightTop: 177, hips: 97, heightBottom: 177 });
 * // → { result: 'sizes', top: { size: '4', ... }, bottom: { size: '4', ... } }
 *
 * getSkinsuitSize({ chest: 88, hips: 81 });
 * // → { result: 'contact_hotdesk' }  // top=2, bottom=0, diff=2 > 1
 * ```
 */
declare function getSkinsuitSize(input: SkinsuitInput): SkinsuitSizeResult;

export { type ClothingType, type Gender, type MenFit, type SizeInput, type SizeResult, type SkinsuitInput, type SkinsuitSizeResult, getSize, getSkinsuitSize };
