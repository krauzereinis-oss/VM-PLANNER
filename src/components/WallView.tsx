import type { WallSection } from "../types/domain";
import { PantsIcon } from "./icons";

const PX_PER_METER = 220;

// Pants always take 0.25m of horizontal hanging space, regardless of which
// mount they hang from.
const PANTS_WIDTH_M = 0.25;
// Leave a small reveal so the hem doesn't merge into the next metal/floor line.
const PANTS_HEM_CLEARANCE_PX = 10;

// Bare grid only, no garments/icons — getting the metal-line/meter-line
// geometry right against the reference sketches before anything else.
const HEIGHT_LEVELS = [2.2, 2.1, 2.0, 1.2, 1.1, 1.0] as const;

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
  // Pants render as a square that scales with height, so position by centre
  // point (left edge of the 0.25m slot + half its width) rather than by the
  // slot's own width.
  const pantsCenter = 0.5 * PX_PER_METER + (PANTS_WIDTH_M * PX_PER_METER) / 2;
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
              <div key={height} className="height-line" style={{ top: yForHeight(height) }} />
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
            <div className="pants-mount" style={{ top: yForHeight(2.2), left: pantsCenter }}>
              <PantsIcon width={0.25} colour="#3a5a78" height={angleArmPantsHeight} />
            </div>
            {/* Stepper @ 1.2 — pants hang directly off this metal line. */}
            <div className="pants-mount" style={{ top: yForHeight(1.2), left: pantsCenter }}>
              <PantsIcon width={0.25} colour="#5a7848" height={stepperPantsHeight} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
