import type { WallSection } from "../types/domain";

const PX_PER_METER = 220;

// Bare grid only, no garments/icons — getting the metal-line/meter-line
// geometry right against the reference sketches before anything else.
const HEIGHT_LEVELS = [2.2, 2.1, 2.0, 1.2, 1.1, 1.0] as const;

// Schematic (not literal metric) vertical scale: lines within a cluster sit
// close together — just far enough apart to hang one row of garments — and
// the gap between the 2.0 and 1.2 lines is sized the same way, rather than
// the much larger true-to-scale 0.8m gap.
const TOP_MARGIN_PX = 30;
const BOTTOM_MARGIN_PX = 30;
const TIGHT_GAP_PX = 70;
const CLUSTER_GAP_PX = 150;

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

  return (
    <div className="wall-view">
      <h3>
        {section.brand} — {section.startMeter}m to {section.endMeter}m{" "}
        {section.isComplete ? "" : "(partial, flowing left-to-right)"}
      </h3>
      <div className="wall-grid" style={{ width: widthM * PX_PER_METER, height: gridHeight }}>
        <div className="wall-border wall-border-top" style={{ top: 0 }} />
        <div className="wall-border wall-border-bottom" style={{ top: gridHeight }} />
        {HEIGHT_LEVELS.map((height) => (
          <div key={height} className="height-line" style={{ top: yForHeight(height) }}>
            <span className="row-label">{height}m</span>
          </div>
        ))}
        {Array.from({ length: Math.floor(widthM) + 1 }).map((_, i) => (
          <div key={`m-${i}`} className="upright" style={{ left: i * PX_PER_METER }} />
        ))}
        {Array.from({ length: Math.floor(widthM * 2) }).map((_, i) => {
          const meterPos = i * 0.5;
          if (Number.isInteger(meterPos)) return null;
          return <div key={`h-${i}`} className="upright-half" style={{ left: meterPos * PX_PER_METER }} />;
        })}
      </div>
    </div>
  );
}
