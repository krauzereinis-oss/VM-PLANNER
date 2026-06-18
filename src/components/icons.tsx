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

/** Jogger-style pants outline — waistband with drawstring, flared hips, side
 * pockets, tapered legs and elastic ankle cuffs (matches the reference clipart).
 * viewBox is cropped tight to the path's own bounds (no margin) so the waistband
 * sits exactly at the top of the box — required to hang flush against its mount
 * line — and the box stretches to fill whatever height it's given, since width
 * is fixed at 0.25m. */
export function PantsIcon({ widthPx, colour = "#888", faded, height = 64 }: PantsIconProps) {
  return (
    <svg
      viewBox="6 0 52 92"
      width={widthPx}
      height={height}
      opacity={faded ? 0.35 : 1}
      preserveAspectRatio="none"
    >
      <path
        d="M14 0 L50 0 Q58 4 56 14 C53 35 49 55 46 76 Q50 84 42 88 Q38 92 34 88 L33 76
           C33 55 32 35 32 16 C32 35 31 55 31 76 L30 88 Q26 92 22 88 Q18 84 18 76
           C15 55 11 35 8 14 Q6 4 14 0 Z"
        fill={colour}
        stroke={STROKE}
        strokeWidth="2"
      />
      {/* drawstring */}
      <path d="M29 4 L28 20 M35 4 L36 20" stroke={STROKE} strokeWidth="1.5" fill="none" />
      {/* pocket lines */}
      <path d="M14 18 L22 28 M50 18 L42 28" stroke={STROKE} strokeWidth="1.5" fill="none" />
    </svg>
  );
}

interface TshirtIconProps {
  widthPx: number;
  colour?: string;
  faded?: boolean;
  height?: number;
}

/** Round-collar short-sleeve tee — collar notch, sloped shoulders, sleeve
 * corners, underarm notch, straight sides, flat hem. viewBox top is at y=0
 * so the collar sits flush against its mount line. */
export function TshirtIcon({ widthPx, colour = "#888", faded, height = 64 }: TshirtIconProps) {
  return (
    <svg
      viewBox="4 0 56 56"
      width={widthPx}
      height={height}
      opacity={faded ? 0.35 : 1}
      preserveAspectRatio="none"
    >
      <path
        d="M22 0 Q32 12 42 0 L54 12 L60 22 L46 28 L46 56 L18 56 L18 28 L4 22 L10 12 Z"
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
