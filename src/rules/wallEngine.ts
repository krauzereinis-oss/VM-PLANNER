import type {
  Garment,
  GarmentCategory,
  HeightLevel,
  MetalType,
  Season,
  SlotWidth,
  WallSection,
  WallSlot,
} from "../types/domain";

export const HEIGHT_LEVELS: HeightLevel[] = [2.2, 2.1, 2.0, 1.2, 1.1, 1.0];

export const TOP_ZONE_HEIGHTS: HeightLevel[] = [2.2, 2.1, 2.0];
export const BOTTOM_ZONE_HEIGHTS: HeightLevel[] = [1.2, 1.1, 1.0];

export const TORSO_CATEGORIES: GarmentCategory[] = ["Hoodie", "ZipHoodie", "TShirt"];
export const BOTTOM_CATEGORIES: GarmentCategory[] = ["Pants", "Shorts"];

// Width a garment occupies when hung front-facing — fixed by category, never a free choice.
export const CATEGORY_DEFAULT_WIDTH: Record<GarmentCategory, SlotWidth> = {
  Pants: 0.25,
  Shorts: 0.25,
  Hoodie: 0.5,
  ZipHoodie: 0.5,
  TShirt: 0.5,
};

/**
 * Generates the rule-compliant slot skeleton for one wall section, independent of
 * which garments will eventually fill it. Width/spacing/no-holes rules are baked into
 * the repeating patterns below, so any valid garment assignment over this skeleton is
 * automatically rule-compliant — only category/zone choices need to be made afterward.
 */
export function generateSkeleton(section: WallSection): WallSlot[] {
  const widthM = section.endMeter - section.startMeter;
  const slots: WallSlot[] = [];

  for (const height of HEIGHT_LEVELS) {
    slots.push(...generateRow(section, height, widthM));
  }
  return slots;
}

function generateRow(section: WallSection, height: HeightLevel, widthM: number): WallSlot[] {
  if (height === 2.1 || height === 1.1) {
    return generateShelfRow(section, height, widthM);
  }
  if (height === 2.2) {
    // The only repeating pattern that satisfies the 2-same rule with no holes, given
    // pants/shorts are always 0.25m: 0.25 (pants/shorts) + 0.25 (pants/shorts) + 0.5 (torso).
    return generatePatternRow(section, height, widthM, {
      metal: "AngleArm",
      narrowAllowed: ["Pants", "Shorts"],
      wideAllowed: ["Hoodie", "ZipHoodie", "TShirt"],
    });
  }
  if (height === 1.2) {
    // Pants/Shorts are always 0.25m, so this row has no second width to alternate with.
    // Per spec, shorts placement here already has acknowledged real-world flexibility, so
    // (like the shelf zones) we exempt this row from the 2-same rule rather than leave holes.
    return generateUniformRow(section, height, widthM, "Stepper", ["Pants", "Shorts"]);
  }
  // 2.0m / 1.0m: torso only, Stepper (0.5, front-facing) or D-Bar (0.25, sideways) —
  // different metals at the same height break up the run, same trick as the 2.2m row.
  return generatePatternRow(section, height, widthM, {
    metal: "Stepper",
    narrowMetal: "DBar",
    narrowAllowed: ["Hoodie", "ZipHoodie", "TShirt"],
    wideAllowed: ["Hoodie", "ZipHoodie", "TShirt"],
  });
}

function generatePatternRow(
  section: WallSection,
  height: HeightLevel,
  widthM: number,
  opts: {
    metal: MetalType;
    narrowMetal?: MetalType;
    narrowAllowed: GarmentCategory[];
    wideAllowed: GarmentCategory[];
  }
): WallSlot[] {
  const slots: WallSlot[] = [];
  let x = 0;
  let step = 0; // 0 -> narrow, 1 -> narrow, 2 -> wide, repeat
  while (x < widthM - 1e-9) {
    const isWide = step % 3 === 2;
    const width: SlotWidth = isWide ? 0.5 : 0.25;
    const remaining = round2(widthM - x);
    const actualWidth = Math.min(width, remaining) as SlotWidth;
    slots.push({
      id: `${section.id}-${height}-${round2(x)}`,
      sectionId: section.id,
      x: round2(x),
      width: actualWidth,
      height,
      metalType: isWide ? opts.metal : opts.narrowMetal ?? opts.metal,
      allowed: isWide ? opts.wideAllowed : opts.narrowAllowed,
    });
    x = round2(x + actualWidth);
    step++;
  }
  return slots;
}

function generateUniformRow(
  section: WallSection,
  height: HeightLevel,
  widthM: number,
  metal: MetalType,
  allowed: GarmentCategory[]
): WallSlot[] {
  const slots: WallSlot[] = [];
  let x = 0;
  while (x < widthM - 1e-9) {
    const remaining = round2(widthM - x);
    const width = Math.min(0.25, remaining) as SlotWidth;
    slots.push({
      id: `${section.id}-${height}-${round2(x)}`,
      sectionId: section.id,
      x: round2(x),
      width,
      height,
      metalType: metal,
      allowed,
    });
    x = round2(x + width);
  }
  return slots;
}

function generateShelfRow(section: WallSection, height: HeightLevel, widthM: number): WallSlot[] {
  // Shelf zones just need full coverage with folded stock — no spacing pattern required.
  const slots: WallSlot[] = [];
  let x = 0;
  while (x < widthM - 1e-9) {
    const remaining = round2(widthM - x);
    const width = Math.min(0.25, remaining) as SlotWidth;
    slots.push({
      id: `${section.id}-${height}-${round2(x)}`,
      sectionId: section.id,
      x: round2(x),
      width,
      height,
      metalType: "Shelf",
      allowed: "Shelf",
    });
    x = round2(x + width);
  }
  return slots;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function preferredZone(category: GarmentCategory, season: Season): "top" | "bottom" {
  if (season === "Summer") {
    return category === "TShirt" || category === "Shorts" ? "top" : "bottom";
  }
  if (season === "Winter") {
    return category === "Hoodie" || category === "ZipHoodie" || category === "Pants"
      ? "top"
      : "bottom";
  }
  // AllSeason: top zone is always priority per spec.
  return "top";
}

function isTorso(category: GarmentCategory): boolean {
  return TORSO_CATEGORIES.includes(category);
}

function slotMatchesGarment(slot: WallSlot, garment: Garment): boolean {
  if (slot.allowed === "Shelf") return false;
  if (!slot.allowed.includes(garment.category)) return false;
  if (isTorso(garment.category)) return slot.width === 0.25 || slot.width === 0.5;
  return slot.width === 0.25;
}

export interface LayoutResult {
  slots: WallSlot[];
  unplacedGarmentIds: string[];
}

/**
 * Assigns garments to skeleton slots in createdAt order, greedily filling the earliest
 * compatible empty slot. Because earlier garments always claim slots before later ones,
 * appending a new garment can never move an already-placed item — i.e. minimum disruption
 * falls out of the algorithm rather than needing to be solved for explicitly.
 */
export function assignGarments(skeleton: WallSlot[], garments: Garment[]): LayoutResult {
  const slots = skeleton.map((s) => ({ ...s }));
  const bySection = new Map<string, WallSlot[]>();
  for (const s of slots) {
    const arr = bySection.get(s.sectionId) ?? [];
    arr.push(s);
    bySection.set(s.sectionId, arr);
  }

  const frontGarments = garments
    .filter((g) => !g.layeredBehindId)
    .slice()
    .sort((a, b) => a.createdAt - b.createdAt);

  const setPositions = new Map<string, number[]>(); // setId -> meter x-positions already used
  const unplacedGarmentIds: string[] = [];

  for (const garment of frontGarments) {
    const placed = placeOne(slots, garment, setPositions);
    if (!placed) unplacedGarmentIds.push(garment.id);
  }

  // Second pass: layered garments attach to their front garment's slot, validated by canLayer.
  const layered = garments
    .filter((g) => g.layeredBehindId)
    .sort((a, b) => a.createdAt - b.createdAt);
  for (const back of layered) {
    const front = garments.find((g) => g.id === back.layeredBehindId);
    const frontSlot = front && slots.find((s) => s.garmentId === front.id);
    if (front && frontSlot && canLayer(front, back)) {
      frontSlot.behindGarmentId = back.id;
    } else {
      unplacedGarmentIds.push(back.id);
    }
  }

  return { slots, unplacedGarmentIds };
}

function placeOne(
  slots: WallSlot[],
  garment: Garment,
  setPositions: Map<string, number[]>
): boolean {
  const zone = preferredZone(garment.category, garment.season);
  const zoneOrder: ("top" | "bottom")[] = zone === "top" ? ["top", "bottom"] : ["bottom", "top"];

  for (const z of zoneOrder) {
    const heights = z === "top" ? TOP_ZONE_HEIGHTS : BOTTOM_ZONE_HEIGHTS;
    const candidates = slots
      .filter(
        (s) =>
          heights.includes(s.height) &&
          !s.garmentId &&
          slotMatchesGarment(s, garment)
      )
      .sort((a, b) => heights.indexOf(a.height) - heights.indexOf(b.height) || a.x - b.x);

    if (candidates.length === 0) continue;

    let chosen = candidates[0];
    if (garment.setId) {
      const used = setPositions.get(garment.setId);
      if (used && used.length > 0) {
        chosen = candidates
          .slice()
          .sort(
            (a, b) =>
              Math.min(...used.map((x) => Math.abs(x - a.x))) -
              Math.min(...used.map((x) => Math.abs(x - b.x)))
          )[0];
      }
    }

    chosen.garmentId = garment.id;
    if (garment.setId) {
      const used = setPositions.get(garment.setId) ?? [];
      used.push(chosen.x);
      setPositions.set(garment.setId, used);
    }
    return true;
  }
  return false;
}

function isJacket(g: Garment): boolean {
  return g.category === "ZipHoodie" && /jacket/i.test(g.subtype);
}

/**
 * Same-hanger layering: lighter item in front, heavier behind. Encodes the three
 * allowed pairs from spec — Tee+Jacket, Tee+ZipHoodie (only if zippered), ZipHoodie+Jacket.
 */
export function canLayer(front: Garment, behind: Garment): boolean {
  if (front.category === "TShirt") {
    if (isJacket(behind)) return true;
    if (behind.category === "ZipHoodie" && behind.isZipHoodie) return true;
    return false;
  }
  if (front.category === "ZipHoodie" && front.isZipHoodie && !isJacket(front)) {
    return isJacket(behind);
  }
  return false;
}

/** Double garments sharing one metal must be identical category AND identical material. */
export function canPairOnSameMetal(a: Garment, b: Garment): boolean {
  return a.category === b.category && a.material === b.material;
}
