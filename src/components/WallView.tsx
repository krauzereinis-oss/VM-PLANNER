import { useMemo } from "react";
import type { Garment, WallSection, WallSlot } from "../types/domain";
import { HEIGHT_LEVELS, assignGarments, generateSkeleton } from "../rules/wallEngine";
import { useObjectUrl } from "../utils/useObjectUrl";
import { CATEGORY_COLORS } from "../utils/constants";

const PX_PER_METER = 220;
const ROW_HEIGHT_PX = 110;

interface Props {
  section: WallSection;
  garments: Garment[];
}

export function WallView({ section, garments }: Props) {
  const { slots, unplacedGarmentIds } = useMemo(() => {
    const sectionGarments = garments.filter((g) => g.brand === section.brand);
    const skeleton = generateSkeleton(section);
    return assignGarments(skeleton, sectionGarments);
  }, [section, garments]);

  const widthM = section.endMeter - section.startMeter;
  const unplaced = garments.filter((g) => unplacedGarmentIds.includes(g.id));

  return (
    <div className="wall-view">
      <h3>
        {section.brand} — {section.startMeter}m to {section.endMeter}m{" "}
        {section.isComplete ? "" : "(partial, flowing left-to-right)"}
      </h3>
      {unplaced.length > 0 && (
        <div className="warning">
          {unplaced.length} garment(s) could not be placed — extend this wall section to fit them.
        </div>
      )}
      <div
        className="wall-grid"
        style={{ width: widthM * PX_PER_METER, height: ROW_HEIGHT_PX * HEIGHT_LEVELS.length }}
      >
        {HEIGHT_LEVELS.map((height, rowIndex) => (
          <div
            key={height}
            className="wall-row"
            style={{ top: rowIndex * ROW_HEIGHT_PX, height: ROW_HEIGHT_PX }}
          >
            <span className="row-label">{height}m</span>
            {slots
              .filter((s) => s.height === height)
              .map((slot) => (
                <SlotView key={slot.id} slot={slot} garments={garments} />
              ))}
          </div>
        ))}
        {Array.from({ length: Math.floor(widthM) + 1 }).map((_, i) => (
          <div key={i} className="upright" style={{ left: i * PX_PER_METER }} />
        ))}
      </div>
    </div>
  );
}

function SlotView({ slot, garments }: { slot: WallSlot; garments: Garment[] }) {
  const garment = slot.garmentId ? garments.find((g) => g.id === slot.garmentId) : undefined;
  const behind = slot.behindGarmentId ? garments.find((g) => g.id === slot.behindGarmentId) : undefined;
  const url = useObjectUrl(garment?.imageBlobId);

  if (slot.allowed === "Shelf") {
    return (
      <div
        className="slot shelf-slot"
        style={{ left: slot.x * PX_PER_METER, width: slot.width * PX_PER_METER }}
        title={`Shelf · ${slot.height}m · ${slot.metalType} · folded stock`}
      />
    );
  }

  const tooltip = garment
    ? `${garment.category} · ${garment.colour} · ${slot.height}m · ${slot.width}m · ${slot.metalType}`
    : `Empty · ${slot.allowed.join("/")} · ${slot.height}m · ${slot.width}m · ${slot.metalType}`;

  return (
    <div
      className={`slot${garment ? "" : " empty-slot"}`}
      style={{
        left: slot.x * PX_PER_METER,
        width: slot.width * PX_PER_METER,
        backgroundColor: garment ? undefined : "transparent",
        borderColor: garment ? CATEGORY_COLORS[garment.category] : "#444",
      }}
      title={tooltip}
    >
      {garment && url && <img src={url} alt={garment.subtype} />}
      {behind && <span className="layer-indicator" title={`Layered behind: ${behind.category}`}>⊞</span>}
    </div>
  );
}
