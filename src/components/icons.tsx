// Schematic planogram symbols — mirrors the JD planogram legend (front-facing vs
// sideways, narrow 0.25m vs wide 0.5m) rather than rendering real garment photos.
import type { SlotWidth } from "../types/domain";

interface IconProps {
  width: SlotWidth;
  colour?: string;
  faded?: boolean;
  height?: number;
}

interface PantsIconProps {
  widthPx: number;
  colour?: string;
  faded?: boolean;
  height?: number;
}

const STROKE = "#1a1b21";

/** Front-facing garment on a hanger (Stepper / Angle Arm), facing the viewer — a tee/hoodie silhouette. */
export function FrontIcon({ width, colour = "#888", faded, height = 64 }: IconProps) {
  const w = (width === 0.5 ? 64 : 32) * (height / 64);
  return (
    <svg
      viewBox="0 0 64 64"
      width={w}
      height={height}
      opacity={faded ? 0.35 : 1}
      preserveAspectRatio="xMidYMin meet"
    >
      <path
        d="M22 6 L28 4 L32 9 L36 4 L42 6 L56 16 L48 28 L42 22 L42 60 L22 60 L22 22 L16 28 L8 16 Z"
        fill={colour}
        stroke={STROKE}
        strokeWidth="1.5"
      />
    </svg>
  );
}

/** Pants silhouette — straight waistband with two distinct legs separated by a
 * crotch notch that reaches almost to the waist, the way real pants/jeans hang.
 * viewBox is cropped tight to the path's own bounds (no margin) so the waistband
 * sits exactly at the top of the box — required to hang flush against its mount
 * line — and the box stretches to fill whatever height it's given, since width
 * is fixed at 0.25m. */
export function PantsIcon({ widthPx, colour = "#888", faded, height = 64 }: PantsIconProps) {
  return (
    <svg
      viewBox="16 0 32 58"
      width={widthPx}
      height={height}
      opacity={faded ? 0.35 : 1}
      preserveAspectRatio="none"
    >
      <path
        d="M16 0 H48 V58 L36 58 L32 10 L28 58 L16 58 Z"
        fill={colour}
        stroke={STROKE}
        strokeWidth="1.5"
      />
    </svg>
  );
}

/** D-Bar sideways hang — a fan of thin parallel strips, like several garments hung edge-on. */
export function SidewaysIcon({ width, colour = "#888", faded }: IconProps) {
  const w = width === 0.5 ? 64 : 32;
  const stripCount = width === 0.5 ? 6 : 3;
  const strips = Array.from({ length: stripCount }, (_, i) => i);
  return (
    <svg viewBox={`0 0 ${stripCount * 10 + 4} 64`} width={w} height="64" opacity={faded ? 0.35 : 1}>
      {strips.map((i) => (
        <path
          key={i}
          d={`M${4 + i * 10} 6 L${10 + i * 10} 4 L${9 + i * 10} 58 L${5 + i * 10} 60 Z`}
          fill={colour}
          stroke={STROKE}
          strokeWidth="1"
        />
      ))}
    </svg>
  );
}

/** Folded stock on a shelf — a stack of rectangles. */
export function ShelfIcon({ faded }: { faded?: boolean }) {
  return (
    <svg viewBox="0 0 64 40" width="48" height="30" opacity={faded ? 0.35 : 1}>
      {[0, 1, 2].map((i) => (
        <rect key={i} x="4" y={4 + i * 11} width="56" height="8" fill="#9a9a7a" stroke={STROKE} strokeWidth="1" />
      ))}
    </svg>
  );
}
