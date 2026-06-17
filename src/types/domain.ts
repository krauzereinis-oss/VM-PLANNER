// Core domain model — see VM_PLANNER_SPEC for the rules these types encode.

export type GarmentCategory = "Pants" | "Shorts" | "Hoodie" | "ZipHoodie" | "TShirt";

export type Season = "Summer" | "Winter" | "AllSeason";

export type MetalType = "AngleArm" | "Stepper" | "DBar" | "Shelf";

export type HeightLevel = 2.2 | 2.1 | 2.0 | 1.2 | 1.1 | 1.0;

export type SlotWidth = 0.25 | 0.5;

export interface Garment {
  id: string;
  category: GarmentCategory;
  subtype: string;
  colour: string;
  brand: string;
  material: string;
  imageBlobId: string; // references a blob stored in the blobs store (idb)
  width: SlotWidth; // derived from category, stored for clarity
  season: Season;
  setId?: string; // links matching tee+pant+hoodie sets
  isZipHoodie?: boolean; // true means the Hoodie/ZipHoodie has a working zip (layering rule)
  layeredBehindId?: string; // this garment hangs behind another garment on the same hanger
  createdAt: number; // epoch ms — determines fill order for minimum-disruption placement
}

export interface WallSection {
  id: string;
  brand: string;
  startMeter: number;
  endMeter: number;
  isComplete: boolean; // false = partial, flows left-to-right; true = symmetrical build-out
  order: number; // left-to-right order among sections on the wall
}

export interface WallBaseline {
  id: string;
  sectionId: string;
  imageBlobId: string;
  kind: "photo" | "video";
  capturedAt: number;
}

// A computed (not persisted) slot in the generated skeleton for a section.
export interface WallSlot {
  id: string; // stable within a section: `${height}-${xStart}`
  sectionId: string;
  x: number; // position in meters from the section's start
  width: SlotWidth;
  height: HeightLevel;
  metalType: MetalType;
  allowed: GarmentCategory[] | "Shelf";
  garmentId?: string;
  behindGarmentId?: string;
}
