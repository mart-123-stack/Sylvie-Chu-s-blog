import React from "react";

// --- Pixel art character system ---
// Characters are drawn on a grid using p=3px blocks

const P = 3;

// Snap coordinate to pixel grid
const px = (n: number) => Math.round(n / P) * P;

interface Ctx2D {
  ctx: CanvasRenderingContext2D;
  sx: number; // snapped top-left X
  sy: number; // snapped top Y (not bottom)
  p: number;  // pixel block size
  legPhase: number;
  grounded: boolean;
}

// ─── Girl: 美少女 ───

function girlHair(c: Ctx2D) {
  const { ctx, sx, sy, p } = c;
  ctx.fillStyle = "#8B5E3C";
  // Top hair
  ctx.fillRect(sx + p * 3, sy, p * 6, p * 3);
  ctx.fillRect(sx + p * 2, sy + p * 2, p * 8, p * 2);
  // Pigtails
  ctx.fillRect(sx, sy + p * 4, p * 2, p * 4);
  ctx.fillRect(sx + p * 10, sy + p * 4, p * 2, p * 4);
}

function girlFace(c: Ctx2D) {
  const { ctx, sx, sy, p } = c;
  // Skin
  ctx.fillStyle = "#FFE4C4";
  ctx.fillRect(sx + p * 3, sy + p * 3, p * 6, p * 5);
  // Eyes
  ctx.fillStyle = "#333";
  ctx.fillRect(sx + p * 4, sy + p * 5, p * 2, p * 2);
  ctx.fillRect(sx + p * 7, sy + p * 5, p * 2, p * 2);
  // Eye shine
  ctx.fillStyle = "#fff";
  ctx.fillRect(sx + p * 4, sy + p * 5, p, p);
  ctx.fillRect(sx + p * 7, sy + p * 5, p, p);
  // Blush
  ctx.fillStyle = "#FFB5B5";
  ctx.fillRect(sx + p * 2, sy + p * 7, p * 2, p);
  ctx.fillRect(sx + p * 8, sy + p * 7, p * 2, p);
  // Mouth
  ctx.fillStyle = "#E87D7D";
  ctx.fillRect(sx + p * 5, sy + p * 7, p * 2, p);
}

function girlBody(c: Ctx2D) {
  const { ctx, sx, sy, p } = c;
  // Dress
  ctx.fillStyle = "#FF6B6B";
  ctx.fillRect(sx + p * 2, sy + p * 8, p * 8, p * 2);
  ctx.fillRect(sx + p, sy + p * 9, p * 10, p * 4);
  // Collar
  ctx.fillStyle = "#FFF";
  ctx.fillRect(sx + p * 3, sy + p * 8, p, p * 2);
  ctx.fillRect(sx + p * 8, sy + p * 8, p, p * 2);
  // Dress stripe
  ctx.fillStyle = "#FF8E8E";
  ctx.fillRect(sx + p * 2, sy + p * 11, p * 8, p);
}

function girlLegs(c: Ctx2D) {
  const { ctx, sx, sy, p } = c;
  const legSwing = c.grounded ? Math.sin(c.legPhase) * p * 1.5 : 1;
  ctx.fillStyle = "#FFE4C4";
  ctx.fillRect(sx + p * 2, sy + p * 13, p * 2, p * 2 + Math.max(0, legSwing));
  ctx.fillRect(sx + p * 7, sy + p * 13, p * 2, p * 2 + Math.max(0, -legSwing));
  // Shoes
  ctx.fillStyle = "#FF4757";
  ctx.fillRect(sx + p * 1, sy + p * 15 + Math.max(0, legSwing), p * 3, p);
  ctx.fillRect(sx + p * 7, sy + p * 15 + Math.max(0, -legSwing), p * 3, p);
}

export function drawGirl(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  legPhase: number,
  grounded: boolean
) {
  const sx = px(x);
  const sy = px(y - h);
  const c: Ctx2D = { ctx, sx, sy, p: P, legPhase, grounded };
  girlHair(c);
  girlFace(c);
  girlBody(c);
  girlLegs(c);
}

// ─── Boy: 小男孩 ───

function boyHair(c: Ctx2D) {
  const { ctx, sx, sy, p } = c;
  ctx.fillStyle = "#374151";
  // Spiky top
  ctx.fillRect(sx + p * 1, sy, p * 2, p * 2);
  ctx.fillRect(sx + p * 3, sy - p, p * 6, p * 2);
  ctx.fillRect(sx + p * 9, sy, p * 2, p * 2);
  // Main hair
  ctx.fillRect(sx + p * 2, sy + p * 1, p * 8, p * 3);
  ctx.fillRect(sx + p * 1, sy + p * 3, p * 10, p * 2);
}

function boyFace(c: Ctx2D) {
  const { ctx, sx, sy, p } = c;
  // Skin
  ctx.fillStyle = "#FFE4C4";
  ctx.fillRect(sx + p * 3, sy + p * 3, p * 6, p * 5);
  // Eyes (big, curious)
  ctx.fillStyle = "#333";
  ctx.fillRect(sx + p * 4, sy + p * 5, p * 2, p * 2);
  ctx.fillRect(sx + p * 7, sy + p * 5, p * 2, p * 2);
  // Eye shine
  ctx.fillStyle = "#fff";
  ctx.fillRect(sx + p * 5, sy + p * 5, p, p);
  ctx.fillRect(sx + p * 8, sy + p * 5, p, p);
  // Eyebrows
  ctx.fillStyle = "#374151";
  ctx.fillRect(sx + p * 4, sy + p * 4, p * 2, p);
  ctx.fillRect(sx + p * 7, sy + p * 4, p * 2, p);
  // Mouth (smile)
  ctx.fillStyle = "#E87D7D";
  ctx.fillRect(sx + p * 5, sy + p * 7, p * 2, p);
  // Blush
  ctx.fillStyle = "#FFB5B5";
  ctx.fillRect(sx + p * 2, sy + p * 7, p * 2, p);
  ctx.fillRect(sx + p * 8, sy + p * 7, p * 2, p);
}

function boyBody(c: Ctx2D) {
  const { ctx, sx, sy, p } = c;
  // T-shirt
  ctx.fillStyle = "#4FC3F7";
  ctx.fillRect(sx + p * 2, sy + p * 8, p * 8, p * 3);
  ctx.fillRect(sx + p * 1, sy + p * 10, p * 10, p * 2);
  // Collar
  ctx.fillStyle = "#29B6F6";
  ctx.fillRect(sx + p * 4, sy + p * 8, p * 4, p);
  // Shorts
  ctx.fillStyle = "#1565C0";
  ctx.fillRect(sx + p * 2, sy + p * 12, p * 8, p * 2);
}

function boyLegs(c: Ctx2D) {
  const { ctx, sx, sy, p } = c;
  const legSwing = c.grounded ? Math.sin(c.legPhase) * p * 1.5 : 1;
  ctx.fillStyle = "#FFE4C4";
  ctx.fillRect(sx + p * 2, sy + p * 14, p * 2, p * 1 + Math.max(0, legSwing));
  ctx.fillRect(sx + p * 7, sy + p * 14, p * 2, p * 1 + Math.max(0, -legSwing));
  // Shoes
  ctx.fillStyle = "#2E7D32";
  ctx.fillRect(sx + p * 1, sy + p * 15 + Math.max(0, legSwing), p * 3, p);
  ctx.fillRect(sx + p * 7, sy + p * 15 + Math.max(0, -legSwing), p * 3, p);
}

// ─── Mascot: 小蓝 (Blog IP) ───
// 博客原创二次元 IP — 青蓝色系, 星星发饰, 大眼睛

function mascotHair(c: Ctx2D) {
  const { ctx, sx, sy, p } = c;
  // Flowing teal hair
  ctx.fillStyle = "#0EA5E9";
  ctx.fillRect(sx + p * 2, sy, p * 8, p * 4);
  ctx.fillRect(sx + p * 1, sy + p * 2, p * 10, p * 3);
  // Side flowing hair
  ctx.fillStyle = "#0891B2";
  ctx.fillRect(sx, sy + p * 4, p * 2, p * 7);
  ctx.fillRect(sx + p * 10, sy + p * 4, p * 2, p * 7);
  // Long hair trailing
  ctx.fillStyle = "#0C7BA3";
  ctx.fillRect(sx + p * 1, sy + p * 10, p * 2, p * 4);
  ctx.fillRect(sx + p * 9, sy + p * 10, p * 2, p * 4);
  // Star hairpin (gold)
  ctx.fillStyle = "#FBBF24";
  ctx.fillRect(sx + p * 8, sy + p * 1, p * 2, p * 2);
  ctx.fillStyle = "#F59E0B";
  ctx.fillRect(sx + p * 8, sy + p * 1, p * 2, p);
  ctx.fillRect(sx + p * 9, sy, p, p * 3);
}

function mascotFace(c: Ctx2D) {
  const { ctx, sx, sy, p } = c;
  // Skin
  ctx.fillStyle = "#FFE4C4";
  ctx.fillRect(sx + p * 3, sy + p * 3, p * 6, p * 5);
  // Big anime eyes (cyan-blue)
  ctx.fillStyle = "#38BDF8";
  ctx.fillRect(sx + p * 3, sy + p * 5, p * 3, p * 3);
  ctx.fillRect(sx + p * 7, sy + p * 5, p * 3, p * 3);
  // Pupils
  ctx.fillStyle = "#0284C7";
  ctx.fillRect(sx + p * 4, sy + p * 6, p * 2, p * 2);
  ctx.fillRect(sx + p * 8, sy + p * 6, p * 2, p * 2);
  // Star eye highlights
  ctx.fillStyle = "#FFF";
  ctx.fillRect(sx + p * 3, sy + p * 5, p, p);
  ctx.fillRect(sx + p * 7, sy + p * 5, p, p);
  ctx.fillRect(sx + p * 5, sy + p * 7, p, p);
  ctx.fillRect(sx + p * 9, sy + p * 7, p, p);
  // Blush
  ctx.fillStyle = "#FFB5B5";
  ctx.fillRect(sx + p * 2, sy + p * 7, p * 2, p);
  ctx.fillRect(sx + p * 9, sy + p * 7, p * 2, p);
  // Happy smile
  ctx.fillStyle = "#E87D7D";
  ctx.fillRect(sx + p * 5, sy + p * 7, p * 2, p);
}

function mascotBody(c: Ctx2D) {
  const { ctx, sx, sy, p } = c;
  // White blouse
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(sx + p * 2, sy + p * 8, p * 8, p * 3);
  ctx.fillRect(sx + p * 1, sy + p * 10, p * 10, p * 2);
  // Blue collar trim
  ctx.fillStyle = "#38BDF8";
  ctx.fillRect(sx + p * 2, sy + p * 8, p * 8, p);
  ctx.fillRect(sx + p * 1, sy + p * 11, p * 10, p);
  // Star pendant (gold)
  ctx.fillStyle = "#FBBF24";
  ctx.fillRect(sx + p * 5, sy + p * 9, p * 2, p * 2);
  // Skirt
  ctx.fillStyle = "#38BDF8";
  ctx.fillRect(sx + p * 2, sy + p * 12, p * 8, p * 2);
  ctx.fillRect(sx + p * 1, sy + p * 13, p * 10, p);
}

function mascotLegs(c: Ctx2D) {
  const { ctx, sx, sy, p } = c;
  const legSwing = c.grounded ? Math.sin(c.legPhase) * p * 1.5 : 1;
  ctx.fillStyle = "#FFE4C4";
  ctx.fillRect(sx + p * 2, sy + p * 14, p * 2, p * 1 + Math.max(0, legSwing));
  ctx.fillRect(sx + p * 7, sy + p * 14, p * 2, p * 1 + Math.max(0, -legSwing));
  // White shoes with blue accent
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(sx + p * 1, sy + p * 15 + Math.max(0, legSwing), p * 3, p);
  ctx.fillRect(sx + p * 7, sy + p * 15 + Math.max(0, -legSwing), p * 3, p);
  ctx.fillStyle = "#38BDF8";
  ctx.fillRect(sx + p * 1, sy + p * 15 + Math.max(0, legSwing), p * 3, 1);
  ctx.fillRect(sx + p * 7, sy + p * 15 + Math.max(0, -legSwing), p * 3, 1);
}

export function drawMascot(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  legPhase: number,
  grounded: boolean
) {
  const sx = px(x);
  const sy = px(y - h);
  const c: Ctx2D = { ctx, sx, sy, p: P, legPhase, grounded };
  mascotHair(c);
  mascotFace(c);
  mascotBody(c);
  mascotLegs(c);
}
export function drawBoy(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  legPhase: number,
  grounded: boolean
) {
  const sx = px(x);
  const sy = px(y - h);
  const c: Ctx2D = { ctx, sx, sy, p: P, legPhase, grounded };
  boyHair(c);
  boyFace(c);
  boyBody(c);
  boyLegs(c);
}

// ─── Character registry ───

export interface CharDef {
  id: string;
  label: string;
  draw: (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    legPhase: number,
    grounded: boolean
  ) => void;
  icon: React.ReactNode;
}

export const CHARACTERS: CharDef[] = [
  {
    id: "girl",
    label: "vv",
    draw: drawGirl,
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 12 16" fill="none">
        <rect x="3" y="0" width="6" height="3" fill="#8B5E3C" />
        <rect x="2" y="2" width="8" height="2" fill="#8B5E3C" />
        <rect x="3" y="3" width="6" height="5" fill="#FFE4C4" />
        <rect x="4" y="5" width="2" height="2" fill="#333" />
        <rect x="7" y="5" width="2" height="2" fill="#333" />
        <rect x="2" y="8" width="8" height="6" fill="#FF6B6B" />
        <rect x="2" y="14" width="2" height="1" fill="#FFE4C4" />
        <rect x="7" y="14" width="2" height="1" fill="#FFE4C4" />
      </svg>
    ),
  },
  {
    id: "boy",
    label: "cc",
    draw: drawBoy,
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 12 16" fill="none">
        <rect x="1" y="0" width="10" height="4" fill="#374151" />
        <rect x="3" y="3" width="6" height="5" fill="#FFE4C4" />
        <rect x="4" y="5" width="2" height="2" fill="#333" />
        <rect x="7" y="5" width="2" height="2" fill="#333" />
        <rect x="2" y="8" width="8" height="5" fill="#4FC3F7" />
        <rect x="2" y="12" width="8" height="2" fill="#1565C0" />
        <rect x="2" y="14" width="2" height="1" fill="#FFE4C4" />
        <rect x="7" y="14" width="2" height="1" fill="#FFE4C4" />
      </svg>
    ),
  },
  {
    id: "mascot",
    label: "小蓝",
    draw: drawMascot,
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 12 16" fill="none">
        <rect x="2" y="0" width="8" height="4" fill="#0EA5E9" />
        <rect x="1" y="2" width="10" height="3" fill="#0EA5E9" />
        <rect x="3" y="3" width="6" height="5" fill="#FFE4C4" />
        <rect x="3" y="5" width="3" height="3" fill="#38BDF8" />
        <rect x="7" y="5" width="3" height="3" fill="#38BDF8" />
        <rect x="8" y="1" width="2" height="2" fill="#FBBF24" />
        <rect x="2" y="8" width="8" height="6" fill="#FFFFFF" />
        <rect x="1" y="11" width="10" height="1" fill="#38BDF8" />
        <rect x="2" y="12" width="8" height="2" fill="#38BDF8" />
        <rect x="2" y="14" width="2" height="1" fill="#FFE4C4" />
        <rect x="7" y="14" width="2" height="1" fill="#FFE4C4" />
      </svg>
    ),
  },
];
