import type { WallSection } from "../types/domain";

const PX_PER_METER = 220;

// True-to-scale vertical axis: each height level sits at its real-world metre
// position, which is what produces the reference planogram's two tight
// clusters (2.0–2.2m, 1.0–1.2m) separated by a large gap, rather than 6 evenly
// stacked rows.
const PX_PER_METER_V = 900;
const WALL_TOP_M = 2.3;
const WALL_BOTTOM_M = 0.85;

// Bare grid only, no garments/icons — getting the metal-line/meter-line
// geometry right against the reference sketches before anything else.
const HEIGHT_LEVELS = [2.2, 2.1, 2.0, 1.2, 1.1, 1.0] as const;

function yForHeight(height: number): number {
  return (WALL_TOP_M - height) * PX_PER_METER_V;
}

interface Props {
  section: WallSection;
}

export function WallView({ section }: Props) {
  const widthM = section.endMeter - section.startMeter;
  const gridHeight = (WALL_TOP_M - WALL_BOTTOM_M) * PX_PER_METER_V;

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
