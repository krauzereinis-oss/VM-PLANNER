# VM Planner

A Visual Merchandising planner for retail store managers: photograph wall baselines and
garments, and the app places each garment automatically following the store's VM rules
(heights, metal types, spacing, no holes, seasonal zoning, sets, same-hanger layering).

Current scope (per spec): Men's apparel, Nike brand, first 3m of one wall. The data model
and rules engine generalize cleanly to more brands/walls/categories later.

## Running it

```
npm install
npm run dev
```

Open the printed local URL. It's a pure client-side app — no backend/server to start.

## How it works

- **Wall Setup** — define wall sections (brand, start/end meter, complete vs. partial) and
  capture a baseline photo/video of the real wall.
- **Add Garment** — one photo per garment, with category/subtype/colour/material/season/set/
  layering metadata. The photo attaches directly to the record (no separate library step).
- **Wall View** — a generated, pixel-accurate render of each wall section. Garments are
  auto-placed into a rule-compliant slot skeleton; hover any slot for its category/colour/
  height/width/metal.
- **Garments** — manage (view/delete) everything photographed so far.

Data (garment/section records + photo blobs) is stored locally in the browser's IndexedDB,
so it persists across reloads without needing a backend or base64-encoded images bloating
JSON files.

## Rules engine (`src/rules/wallEngine.ts`)

The wall is generated in two independent steps:

1. **Skeleton generation** — for a wall section, build the slot grid for all 6 height levels
   (2.2/2.1/2.0/1.2/1.1/1.0m), using the repeating width patterns from spec so the no-holes
   and 2-same-consecutive-width rules are satisfied by construction:
   - `2.2m` (Angle Arm): repeating `0.25 (pants/shorts) + 0.25 (pants/shorts) + 0.5 (torso)`.
   - `2.0m`/`1.0m` (Stepper/D-Bar, torso only): repeating `0.5 (Stepper torso) + 0.25 (D-Bar
     torso) + 0.25 (D-Bar torso)` — the same width trick, but breaking up the run with a
     different metal instead of a different product type, since only torso is allowed here.
   - `2.1m`/`1.1m` (Shelf): exempt from the 2-same rule per spec, filled with folded-stock
     placeholder slots.
   - `1.2m` (Stepper, pants/shorts only): **exempted from the 2-same rule** — pants and
     shorts are always 0.25m with no second width available to alternate with, so the rule
     as literally stated is unsatisfiable here. This mirrors the shelf-zone exemption and the
     spec's own acknowledgment that shorts placement has real-world flexibility. Flagged in
     code (`generateRow`) for whoever revisits this.
2. **Garment assignment** — garments are sorted by `createdAt` and greedily placed into the
   earliest compatible empty slot (matching category/width, season-preferred zone first,
   nearest to existing `setId` matches). Because earlier garments always claim slots first,
   adding a new garment can never move one already placed — minimum disruption falls out of
   the algorithm rather than needing a separate "diff" pass.

Same-hanger layering (`canLayer`) and same-metal pairing (`canPairOnSameMetal`) are
implemented as pure validators per the spec's three allowed layering pairs.

## Known scope gaps (intentionally deferred)

- **M-center mirroring for complete brand sections** — the data model (`WallSection
  .isComplete`) and partial-flow algorithm are implemented; the actual outward-from-center
  mirroring for a *complete* multi-meter brand run is not, since current scope is a single
  partial 3m section. `generateSkeleton` would need a mirroring pass added once a full
  section needs planning.
- **Shelf-zone items** (folded tees, shoes, accessories, small boxes) aren't a captured
  `Garment` category in the given data model — shelf rows render as generic "fully stocked"
  placeholders rather than individual photographed items.
- **Same-metal double-hanging** (`canPairOnSameMetal`) is implemented but not yet wired into
  the placement algorithm or UI — currently each slot holds at most one front + one layered
  garment.
- **Image cutout** — per spec's own note, clean background removal needs a real segmentation
  model (e.g. `rembg`); this app just renders the photo as-taken (`object-fit: cover`) and
  leaves cutout as a future enhancement.
