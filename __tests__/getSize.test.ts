import { getSize } from "../src/index.js";

describe("getSize – men tops", () => {
  it("returns size 1 for chest 84", () => {
    const r = getSize({ gender: "men", type: "top", chest: 84 });
    expect(r.size).toBe("1");
    expect(r.onBorder).toBe(false);
  });

  it("returns size 4 for chest 96–100 mid-point", () => {
    const r = getSize({ gender: "men", type: "top", chest: 98 });
    expect(r.size).toBe("4");
  });

  it("border chest 88 → size 2 (larger)", () => {
    const r = getSize({ gender: "men", type: "top", chest: 88 });
    expect(r.size).toBe("2");
    expect(r.onBorder).toBe(true);
  });

  it("returns size 8 for very large chest 125", () => {
    const r = getSize({ gender: "men", type: "top", chest: 125 });
    expect(r.size).toBe("8");
  });

  it("clamps below for out-of-range small chest", () => {
    const r = getSize({ gender: "men", type: "top", chest: 70 });
    expect(r.size).toBe("1");
    expect(r.note).toMatch(/smaller than our smallest/);
  });

  it("throws when chest is missing", () => {
    expect(() => getSize({ gender: "men", type: "top" })).toThrow(/chest/);
  });
});

describe("getSize – men bottoms", () => {
  it("returns size 3 for hips 95", () => {
    const r = getSize({ gender: "men", type: "bottom", hips: 95 });
    expect(r.size).toBe("3");
  });

  it("border hips 101 → size 5 (larger)", () => {
    const r = getSize({ gender: "men", type: "bottom", hips: 101 });
    expect(r.size).toBe("5");
    expect(r.onBorder).toBe(true);
  });

  it("throws when hips is missing", () => {
    expect(() => getSize({ gender: "men", type: "bottom" })).toThrow(/hips/);
  });
});

describe("getSize – men extended fit", () => {
  it("returns 2+ for chest 89 and extended fit", () => {
    const r = getSize({ gender: "men", type: "top", chest: 89, menFit: "extended" });
    expect(r.size).toBe("2+");
  });

  it("standard fit with same chest returns 2", () => {
    const r = getSize({ gender: "men", type: "top", chest: 89, menFit: "standard" });
    expect(r.size).toBe("2");
  });
});

describe("getSize – women tops", () => {
  it("returns size 1 for chest 85", () => {
    const r = getSize({ gender: "women", type: "top", chest: 85 });
    expect(r.size).toBe("1");
  });

  it("border chest 86 → size 2 (larger)", () => {
    const r = getSize({ gender: "women", type: "top", chest: 86 });
    expect(r.size).toBe("2");
    expect(r.onBorder).toBe(true);
  });

  it("returns size 3 for chest 90 (border → larger)", () => {
    const r = getSize({ gender: "women", type: "top", chest: 90 });
    expect(r.size).toBe("3");
  });

  it("border chest 94 → size 4", () => {
    const r = getSize({ gender: "women", type: "top", chest: 94 });
    expect(r.size).toBe("4");
    expect(r.onBorder).toBe(true);
  });
});

describe("getSize – women bottoms", () => {
  it("returns size 2 for hips 92", () => {
    const r = getSize({ gender: "women", type: "bottom", hips: 92 });
    expect(r.size).toBe("2");
  });
});

describe("getSize – children tops", () => {
  it("returns size 134 for height 130", () => {
    const r = getSize({ gender: "children", type: "top", height: 130 });
    expect(r.size).toBe("134");
  });

  it("returns size 146 for height 140 (border → larger)", () => {
    const r = getSize({ gender: "children", type: "top", height: 140 });
    expect(r.size).toBe("146");
    expect(r.onBorder).toBe(true);
  });

  it("overrides to larger size when chest exceeds height-based size", () => {
    // height 130 → size 134, but chest 70 → size 146: chest wins
    const r = getSize({ gender: "children", type: "top", height: 130, chest: 70 });
    expect(r.size).toBe("146");
    expect(r.note).toMatch(/chest/);
  });

  it("keeps height-based size when chest does not push higher", () => {
    // height 130 → size 134, chest 66 → also 134: no override
    const r = getSize({ gender: "children", type: "top", height: 130, chest: 66 });
    expect(r.size).toBe("134");
    expect(r.note).toMatch(/height/);
  });

  it("throws when neither height nor chest provided", () => {
    expect(() => getSize({ gender: "children", type: "top" })).toThrow(
      /height/
    );
  });
});

describe("getSize – children bottoms", () => {
  it("returns size 122 for waist 56", () => {
    const r = getSize({ gender: "children", type: "bottom", waist: 56 });
    expect(r.size).toBe("122");
  });

  it("throws when waist is missing", () => {
    expect(() => getSize({ gender: "children", type: "bottom" })).toThrow(
      /waist/
    );
  });
});

describe("getSize – gloves", () => {
  it("returns size 6 for adult hand below 13.5 cm", () => {
    const r = getSize({ gender: "men", type: "gloves", handCircumference: 12.1 });
    expect(r.size).toBe("6");
  });

  it("border hand 16.2 cm -> size 7 (larger)", () => {
    const r = getSize({ gender: "women", type: "gloves", handCircumference: 16.2 });
    expect(r.size).toBe("7");
    expect(r.onBorder).toBe(true);
  });

  it("keeps one-decimal precision for glove measurements", () => {
    const r = getSize({ gender: "women", type: "gloves", handCircumference: 16.24 });
    expect(r.note).toContain("16.2 cm");
  });

  it("returns size 8 for hand 21 cm", () => {
    const r = getSize({ gender: "men", type: "gloves", handCircumference: 21 });
    expect(r.size).toBe("8");
  });

  it("returns size 10 for hand 25 cm (open-ended top)", () => {
    const r = getSize({ gender: "men", type: "gloves", handCircumference: 25 });
    expect(r.size).toBe("10");
  });

  it("returns size 4 for very small hand 10 cm", () => {
    const r = getSize({ gender: "children", type: "gloves", handCircumference: 10 });
    expect(r.size).toBe("4");
  });

  it("returns size 5 for children at 12.0 cm (border -> larger)", () => {
    const r = getSize({ gender: "children", type: "gloves", handCircumference: 12.0 });
    expect(r.size).toBe("5");
    expect(r.onBorder).toBe(true);
  });

  it("returns size 5 for children above 14.5 cm", () => {
    const r = getSize({ gender: "children", type: "gloves", handCircumference: 19.8 });
    expect(r.size).toBe("5");
  });

  it("throws when handCircumference is missing", () => {
    expect(() => getSize({ gender: "men", type: "gloves" })).toThrow(
      /handCircumference/
    );
  });
});

describe("getSize – shoe covers", () => {
  it("returns 40-42 for shoe size 42", () => {
    const r = getSize({ gender: "men", type: "shoe_covers", shoeSize: 42 });
    expect(r.size).toBe("40-42");
  });

  it("returns 35-36 for shoe size 35", () => {
    const r = getSize({ gender: "women", type: "shoe_covers", shoeSize: 35 });
    expect(r.size).toBe("35-36");
  });

  it("returns 46-48 for shoe size 47", () => {
    const r = getSize({ gender: "men", type: "shoe_covers", shoeSize: 47 });
    expect(r.size).toBe("46-48");
  });

  it("throws when shoeSize is missing", () => {
    expect(() => getSize({ gender: "men", type: "shoe_covers" })).toThrow(
      /shoeSize/
    );
  });
});
