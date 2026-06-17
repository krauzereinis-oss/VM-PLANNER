import { useMemo } from "react";
import type { Garment, WallSection, WallSlot } from "../types/domain";
import { HEIGHT_LEVELS, assignGarments, generateSkeleton } from "../rules/wallEngine";
import { CATEGORY_COLORS } from "../utils/constants";
import { FrontIcon, PantsIcon, ShelfIcon, SidewaysIcon } from "./icons";

const PX_PER_METER = 220;
const ROW_HEIGHT_PX = 90;

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
      <PlanogramLegend />
    </div>
  );
}

function fillColour(garment: Garment | undefined): string | undefined {
  if (!garment) return undefined;
  const guess = garment.colour.split(" ")[0].toLowerCase();
  return guess || CATEGORY_COLORS[garment.category];
}

function SlotView({ slot, garments }: { slot: WallSlot; garments: Garment[] }) {
  const garment = slot.garmentId ? garments.find((g) => g.id === slot.garmentId) : undefined;
  const behind = slot.behindGarmentId ? garments.find((g) => g.id === slot.behindGarmentId) : undefined;
  const colour = fillColour(garment) ?? (garment ? CATEGORY_COLORS[garment.category] : "#444");

  if (slot.allowed === "Shelf") {
    return (
      <div
        className="slot shelf-slot"
        style={{ left: slot.x * PX_PER_METER, width: slot.width * PX_PER_METER }}
        title={`Shelf · ${slot.height}m · ${slot.metalType} · folded stock`}
      >
        <ShelfIcon faded={!garment} />
      </div>
    );
  }

  const tooltip = garment
    ? `${garment.category} · ${garment.colour} · ${slot.height}m · ${slot.width}m · ${slot.metalType}`
    : `Empty · ${slot.allowed.join("/")} · ${slot.height}m · ${slot.width}m · ${slot.metalType}`;

  const category = garment?.category ?? (Array.isArray(slot.allowed) ? slot.allowed[0] : undefined);
  let icon = null;
  if (slot.metalType === "DBar") {
    icon = <SidewaysIcon width={slot.width} colour={colour} faded={!garment} />;
  } else if (category === "Pants" || category === "Shorts") {
    icon = <PantsIcon width={slot.width} colour={colour} faded={!garment} />;
  } else {
    icon = <FrontIcon width={slot.width} colour={colour} faded={!garment} />;
  }

  return (
    <div
      className={`slot${garment ? "" : " empty-slot"}`}
      style={{ left: slot.x * PX_PER_METER, width: slot.width * PX_PER_METER }}
      title={tooltip}
    >
      {icon}
      {behind && (
        <span className="layer-indicator" title={`Layered behind: ${behind.category}`}>
          ⊞
        </span>
      )}
    </div>
  );
}

function PlanogramLegend() {
  return (
    <div className="legend">
      <div className="legend-box">
        <h4>Symbols</h4>
        <div className="legend-row">
          <FrontIcon width={0.25} colour="#888" />
          <span>Front 0.25m</span>
        </div>
        <div className="legend-row">
          <FrontIcon width={0.5} colour="#888" />
          <span>Front 0.5m</span>
        </div>
        <div className="legend-row">
          <PantsIcon width={0.25} colour="#888" />
          <span>Pants/Shorts 0.25m</span>
        </div>
        <div className="legend-row">
          <SidewaysIcon width={0.25} colour="#888" />
          <span>Sideways 0.25m (D-Bar)</span>
        </div>
        <div className="legend-row">
          <ShelfIcon />
          <span>Folded stock (Shelf)</span>
        </div>
      </div>
      <div className="legend-box">
        <h4>Metal</h4>
        <div className="legend-row">
          <span className="metal-swatch" />
          <span>Angle Arm — 2.2m</span>
        </div>
        <div className="legend-row">
          <span className="metal-swatch" />
          <span>Stepper / D-Bar — 2.0m, 1.0m</span>
        </div>
        <div className="legend-row">
          <span className="metal-swatch" />
          <span>Stepper — 1.2m</span>
        </div>
        <div className="legend-row">
          <span className="metal-swatch" />
          <span>Shelf — 2.1m, 1.1m</span>
        </div>
      </div>
    </div>
  );
}
