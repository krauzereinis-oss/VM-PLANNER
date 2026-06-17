import type { WallSection } from "../types/domain";
import { PantsIcon } from "./icons";

const PX_PER_METER = 340;

// Pants always take 0.25m of horizontal hanging space, regardless of which
// mount they hang from.
const PANTS_WIDTH_M = 0.25;
// Leave a small reveal so the hem doesn't merge into the next metal/floor line.
const PANTS_HEM_CLEARANCE_PX = 10;

// Bare grid only, no garments/icons — getting the metal-line/meter-line
// geometry right against the reference sketches before anything else.
const HEIGHT_LEVELS = [2.2, 2.1, 2.0, 1.2, 1.1, 1.0] as const;

// Pants only ever hang from these two lines, so only these stay visible
// where a pants icon overlaps the rest of their cluster (2.1/2.0, 1.1/1.0).
const MOUNT_HEIGHTS = new Set([2.2, 1.2]);

// Schematic (not literal metric) vertical scale: lines within a cluster
// (2.0/2.1/2.2 and 1.0/1.1/1.2) sit almost touching — they're mounting
// points on the same upright — while the gap between the 2.0 and 1.2 lines
// is a real merchandising row, sized to hang a garment.
const TOP_MARGIN_PX = 24;
const TIGHT_GAP_PX = 22;
const CLUSTER_GAP_PX = 170;
const BOTTOM_MARGIN_PX = 170;

const HEIGHT_Y: Record<number, number> = (() => {
  const y: Record<number, number> = {};
  let cursor = TOP_MARGIN_PX;
  HEIGHT_LEVELS.forEach((height, i) => {
    if (i === 0) {
      y[height] = cursor;
    } else {
      const prev = HEIGHT_LEVELS[i - 1];
      cursor += prev - height > 0.5 ? CLUSTER_GAP_PX : TIGHT_GAP_PX;
      y[height] = cursor;
    }
  });
  return y;
})();

function yForHeight(height: number): number {
  return HEIGHT_Y[height];
}

interface Props {
  section: WallSection;
}

export function WallView({ section }: Props) {
  const widthM = section.endMeter - section.startMeter;
  const gridHeight = yForHeight(HEIGHT_LEVELS[HEIGHT_LEVELS.length - 1]) + BOTTOM_MARGIN_PX;
  const pantsWidthPx = PANTS_WIDTH_M * PX_PER_METER;
  const pantsLeft = 0.5 * PX_PER_METER;
  // Angle arm @ 2.2 hangs almost down to the 1.2 line; stepper @ 1.2 hangs
  // almost down to the floor.
  const angleArmPantsHeight = yForHeight(1.2) - yForHeight(2.2) - PANTS_HEM_CLEARANCE_PX;
  const stepperPantsHeight = gridHeight - yForHeight(1.2) - PANTS_HEM_CLEARANCE_PX;

  return (
    <div className="wall-view">
      <h3>
        {section.brand} — {section.startMeter}m to {section.endMeter}m{" "}
        {section.isComplete ? "" : "(partial, flowing left-to-right)"}
      </h3>
      <div className="wall-grid-row">
        <div className="height-labels" style={{ height: gridHeight }}>
          {HEIGHT_LEVELS.map((height) => (
            <span key={height} className="row-label" style={{ top: yForHeight(height) }}>
              {height}m
            </span>
          ))}
        </div>
        <div className="wall-scroll">
          <div className="wall-grid" style={{ width: widthM * PX_PER_METER, height: gridHeight }}>
            <div className="wall-border wall-border-top" style={{ top: 0 }} />
            <div className="wall-border wall-border-bottom" style={{ top: gridHeight }} />
            {HEIGHT_LEVELS.map((height) => (
              <div
                key={height}
                className={`height-line${MOUNT_HEIGHTS.has(height) ? " mount-line" : ""}`}
                style={{ top: yForHeight(height) }}
              />
            ))}
            {Array.from({ length: Math.floor(widthM) + 1 }).map((_, i) => (
              <div key={`m-${i}`} className="upright" style={{ left: i * PX_PER_METER }} />
            ))}
            {Array.from({ length: Math.floor(widthM * 2) }).map((_, i) => {
              const meterPos = i * 0.5;
              if (Number.isInteger(meterPos)) return null;
              return <div key={`h-${i}`} className="upright-half" style={{ left: meterPos * PX_PER_METER }} />;
            })}
            {/* Angle arm @ 2.2 — pants hang directly off this metal line. */}
            <div className="pants-mount" style={{ top: yForHeight(2.2), left: pantsLeft }}>
              <PantsIcon widthPx={pantsWidthPx} colour="#f0f0f0" height={angleArmPantsHeight} />
            </div>
            {/* Stepper @ 1.2 — the stepper arm is Z-shaped, so 2 SKUs share the
                same 0.25m slot, one hung in front and one behind (not side by
                side); the peeking back garment is itself the "2 SKUs" signal. */}
            <div
              className="pants-mount stepper-2sku"
              style={{ top: yForHeight(1.2), left: pantsLeft, width: pantsWidthPx }}
            >
              <div className="stepper-2sku-back">
                <PantsIcon widthPx={pantsWidthPx} colour="#9a9ea8" height={stepperPantsHeight} />
              </div>
              <div className="stepper-2sku-front">
                <PantsIcon widthPx={pantsWidthPx} colour="#f0f0f0" height={stepperPantsHeight} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
