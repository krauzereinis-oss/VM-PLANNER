import type { GarmentCategory } from "../types/domain";

export const CATEGORY_COLORS: Record<GarmentCategory, string> = {
  Pants: "#3a5a78",
  Shorts: "#5a7a9a",
  Hoodie: "#7a3a3a",
  ZipHoodie: "#9a5a3a",
  TShirt: "#3a7a4a",
};

export const CATEGORY_OPTIONS: GarmentCategory[] = ["Pants", "Shorts", "Hoodie", "ZipHoodie", "TShirt"];

export const SUBTYPE_SUGGESTIONS: Record<GarmentCategory, string[]> = {
  Pants: ["Standard Fleece Jogger", "Tech Fleece Jogger", "Air Max Leg Print Jogger"],
  Shorts: ["Loose-Fit Fleece", "Cargo-Pocket", "Zip-Pocket", "Tech Fleece (above-knee)"],
  Hoodie: ["Pullover Kangaroo Pocket"],
  ZipHoodie: ["Tech Fleece Full-Zip", "Jacket"],
  TShirt: ["Swoosh Sounds Graphic", "Nike Swoosh Bubble-Text", "AM 95 Graphic", "Vintage Box Logo", "Plain Box Logo"],
};
