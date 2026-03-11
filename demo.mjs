import { getSize } from "./dist/index.js";

const cases = [
  // Men tops
  { label: "Man, jersey, chest 96cm",              input: { gender: "men",      type: "top",         chest: 96 } },
  { label: "Man, jersey, chest 88cm (border)",     input: { gender: "men",      type: "top",         chest: 88 } },
  { label: "Man, jersey, chest 89cm + height 181cm (auto +)", input: { gender: "men", type: "top", chest: 89, height: 181 } },
  // Men bottoms
  { label: "Man, bib shorts, hips 95cm",           input: { gender: "men",      type: "bottom",      hips: 95 } },
  { label: "Man, bib shorts, hips 95 + height 186cm (auto +)", input: { gender: "men", type: "bottom", hips: 95, height: 186 } },
  // Women tops
  { label: "Woman, jersey, chest 92cm",            input: { gender: "women",    type: "top",         chest: 92 } },
  // Women bottoms
  { label: "Woman, shorts, hips 100cm",            input: { gender: "women",    type: "bottom",      hips: 100 } },
  // Children tops
  { label: "Child, jersey, height 130cm",          input: { gender: "children", type: "top",         height: 130 } },
  { label: "Child, jersey, height 130cm, chest 70cm (big chest override)", input: { gender: "children", type: "top", height: 130, chest: 70 } },
  // Children bottoms
  { label: "Child, shorts, waist 58cm",            input: { gender: "children", type: "bottom",      waist: 58 } },
  // Gloves
  { label: "Gloves, hand 21cm",                    input: { gender: "men",      type: "gloves",      handCircumference: 21 } },
  { label: "Gloves, child, hand 13cm",             input: { gender: "children", type: "gloves",      handCircumference: 13 } },
  // Shoe covers
  { label: "Shoe covers, EU 42",                   input: { gender: "men",      type: "shoe_covers", shoeSize: 42 } },
  { label: "Shoe covers, EU 38",                   input: { gender: "women",    type: "shoe_covers", shoeSize: 38 } },
];

const PAD = 50;
console.log("\n" + "─".repeat(80));
console.log(" KALAS SIZE WIZARD – DEMO");
console.log("─".repeat(80));
for (const { label, input } of cases) {
  const result = getSize(input);
  const flag = result.onBorder ? " ⚠ border" : "";
  console.log(`  ${label.padEnd(PAD)} →  size ${result.size}${flag}`);
  console.log(`  ${"".padEnd(PAD)}    ${result.note}`);
  console.log();
}
console.log("─".repeat(80) + "\n");
