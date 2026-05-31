import React from "react";

// --- Pixel art character system ---
// Characters are drawn on a grid using p=3px blocks

const P = 3;

const px = (n: number) => Math.round(n / P) * P;

interface Ctx2D {
  ctx: CanvasRenderingContext2D;
  sx: number;
  sy: number;
  p: number;
  legPhase: number;
  grounded: boolean;
}

// ─── Shared helpers ───

function drawLegs(
  c: Ctx2D,
  skinColor: string,
  shoeColor: string,
  shoeAccent?: string
) {
  const { ctx, sx, sy, p } = c;
  const swing = c.grounded ? Math.sin(c.legPhase) * p * 2 : 2;
  ctx.fillStyle = skinColor;
  // Left leg
  ctx.fillRect(sx + p * 3, sy + p * 14, p * 2, p * 1 + Math.max(0, swing));
  // Right leg
  ctx.fillRect(sx + p * 7, sy + p * 14, p * 2, p * 1 + Math.max(0, -swing));
  // Shoes
  ctx.fillStyle = shoeColor;
  ctx.fillRect(sx + p * 2, sy + p * 15 + Math.max(0, swing), p * 3, p);
  ctx.fillRect(sx + p * 7, sy + p * 15 + Math.max(0, -swing), p * 3, p);
  if (shoeAccent) {
    ctx.fillStyle = shoeAccent;
    ctx.fillRect(sx + p * 2, sy + p * 15 + Math.max(0, swing), p * 3, 1);
    ctx.fillRect(sx + p * 7, sy + p * 15 + Math.max(0, -swing), p * 3, 1);
  }
}

// ─── Girl: vv ───

function girlHair(c: Ctx2D) {
  const { ctx, sx, sy, p } = c;
  // Dark base
  ctx.fillStyle = "#5C3A21";
  ctx.fillRect(sx + p * 4, sy, p * 4, p * 2);
  ctx.fillRect(sx + p * 3, sy + p * 1, p * 6, p * 2);
  ctx.fillRect(sx + p * 2, sy + p * 3, p * 8, p * 2);
  // Longer sides
  ctx.fillRect(sx + p * 1, sy + p * 4, p * 2, p * 6);
  ctx.fillRect(sx + p * 9, sy + p * 4, p * 2, p * 6);
  // Pigtails
  ctx.fillRect(sx, sy + p * 6, p * 2, p * 5);
  ctx.fillRect(sx + p * 10, sy + p * 6, p * 2, p * 5);
  // Lighter brown highlights
  ctx.fillStyle = "#8B5E3C";
  ctx.fillRect(sx + p * 5, sy + p * 1, p * 2, p);
  ctx.fillRect(sx + p * 4, sy + p * 2, p * 4, p);
  ctx.fillRect(sx + p * 3, sy + p * 3, p * 2, p);
  ctx.fillRect(sx + p * 7, sy + p * 3, p * 2, p);
  ctx.fillRect(sx + p * 2, sy + p * 5, p, p);
  ctx.fillRect(sx + p * 9, sy + p * 5, p, p);
}

function girlFace(c: Ctx2D) {
  const { ctx, sx, sy, p } = c;
  ctx.fillStyle = "#FFE4C4";
  ctx.fillRect(sx + p * 3, sy + p * 4, p * 6, p * 6);
  // Eyes
  ctx.fillStyle = "#475569";
  ctx.fillRect(sx + p * 4, sy + p * 6, p * 2, p * 2);
  ctx.fillRect(sx + p * 7, sy + p * 6, p * 2, p * 2);
  // Iris
  ctx.fillStyle = "#1e293b";
  ctx.fillRect(sx + p * 4, sy + p * 6, p, p * 2);
  ctx.fillRect(sx + p * 7, sy + p * 6, p, p * 2);
  // Highlights
  ctx.fillStyle = "#FFF";
  ctx.fillRect(sx + p * 4, sy + p * 6, p, p);
  ctx.fillRect(sx + p * 7, sy + p * 6, p, p);
  ctx.fillRect(sx + p * 5, sy + p * 7, p, p);
  ctx.fillRect(sx + p * 8, sy + p * 7, p, p);
  // Eyelashes
  ctx.fillStyle = "#5C3A21";
  ctx.fillRect(sx + p * 3, sy + p * 5, p, p);
  ctx.fillRect(sx + p * 8, sy + p * 5, p, p);
  // Blush
  ctx.fillStyle = "#FFB5B5";
  ctx.fillRect(sx + p * 2, sy + p * 8, p * 2, p);
  ctx.fillRect(sx + p * 8, sy + p * 8, p * 2, p);
  // Mouth
  ctx.fillStyle = "#E87D7D";
  ctx.fillRect(sx + p * 5, sy + p * 8, p * 2, p);
}

function girlBody(c: Ctx2D) {
  const { ctx, sx, sy, p } = c;
  // Dress
  ctx.fillStyle = "#FF6B6B";
  ctx.fillRect(sx + p * 2, sy + p * 10, p * 8, p * 2);
  ctx.fillRect(sx + p * 1, sy + p * 11, p * 10, p * 2);
  ctx.fillRect(sx, sy + p * 12, p * 12, p * 2);
  // Dress highlight
  ctx.fillStyle = "#FF8E8E";
  ctx.fillRect(sx + p * 3, sy + p * 10, p * 6, p);
  ctx.fillRect(sx + p * 2, sy + p * 11, p * 8, p);
  // Collar
  ctx.fillStyle = "#FFF";
  ctx.fillRect(sx + p * 4, sy + p * 9, p * 4, p);
  ctx.fillRect(sx + p * 5, sy + p * 9, p * 2, p * 2);
  // Bow
  ctx.fillStyle = "#FF4757";
  ctx.fillRect(sx + p * 5, sy + p * 10, p * 2, p);
  ctx.fillRect(sx + p * 3, sy + p * 9, p * 2, p);
  ctx.fillRect(sx + p * 7, sy + p * 9, p * 2, p);
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
  const sx = px(x + (w - 12 * P) / 2);
  const sy = px(y - h);
  const c: Ctx2D = { ctx, sx, sy, p: P, legPhase, grounded };
  girlHair(c);
  girlFace(c);
  girlBody(c);
  drawLegs(c, "#FFE4C4", "#FF4757");
}

// ─── Boy: cc ───

function boyHair(c: Ctx2D) {
  const { ctx, sx, sy, p } = c;
  ctx.fillStyle = "#374151";
  // Spiky top
  ctx.fillRect(sx + p * 3, sy - p, p * 2, p * 2);
  ctx.fillRect(sx + p * 5, sy - p, p * 2, p);
  ctx.fillRect(sx + p * 7, sy - p, p * 2, p * 2);
  ctx.fillRect(sx + p * 9, sy, p * 2, p);
  // Main hair
  ctx.fillRect(sx + p * 2, sy, p * 8, p * 3);
  ctx.fillRect(sx + p * 1, sy + p * 2, p * 10, p * 2);
  ctx.fillRect(sx, sy + p * 3, p * 12, p);
  // Side hair
  ctx.fillRect(sx + p * 1, sy + p * 4, p * 2, p * 4);
  ctx.fillRect(sx + p * 9, sy + p * 4, p * 2, p * 4);
  // Highlights
  ctx.fillStyle = "#4B5563";
  ctx.fillRect(sx + p * 4, sy + p, p * 2, p);
  ctx.fillRect(sx + p * 3, sy + p * 2, p * 6, p);
  ctx.fillRect(sx + p * 2, sy + p * 3, p * 2, p);
}

function boyFace(c: Ctx2D) {
  const { ctx, sx, sy, p } = c;
  ctx.fillStyle = "#FFE4C4";
  ctx.fillRect(sx + p * 3, sy + p * 3, p * 6, p * 6);
  // Eyebrows
  ctx.fillStyle = "#374151";
  ctx.fillRect(sx + p * 4, sy + p * 4, p * 2, p);
  ctx.fillRect(sx + p * 7, sy + p * 4, p * 2, p);
  // Eyes
  ctx.fillStyle = "#475569";
  ctx.fillRect(sx + p * 4, sy + p * 5, p * 2, p * 2);
  ctx.fillRect(sx + p * 7, sy + p * 5, p * 2, p * 2);
  // Iris
  ctx.fillStyle = "#1e293b";
  ctx.fillRect(sx + p * 4, sy + p * 5, p, p * 2);
  ctx.fillRect(sx + p * 7, sy + p * 5, p, p * 2);
  // Highlights
  ctx.fillStyle = "#FFF";
  ctx.fillRect(sx + p * 5, sy + p * 5, p, p);
  ctx.fillRect(sx + p * 8, sy + p * 5, p, p);
  ctx.fillRect(sx + p * 4, sy + p * 6, p, p);
  ctx.fillRect(sx + p * 7, sy + p * 6, p, p);
  // Blush
  ctx.fillStyle = "#FFB5B5";
  ctx.fillRect(sx + p * 2, sy + p * 7, p * 2, p);
  ctx.fillRect(sx + p * 8, sy + p * 7, p * 2, p);
  // Smile
  ctx.fillStyle = "#E87D7D";
  ctx.fillRect(sx + p * 5, sy + p * 7, p * 2, p);
}

function boyBody(c: Ctx2D) {
  const { ctx, sx, sy, p } = c;
  // Jacket
  ctx.fillStyle = "#3B82F6";
  ctx.fillRect(sx + p * 2, sy + p * 9, p * 8, p * 3);
  ctx.fillRect(sx + p * 1, sy + p * 11, p * 10, p * 2);
  // Jacket front line
  ctx.fillStyle = "#2563EB";
  ctx.fillRect(sx + p * 5, sy + p * 9, p * 2, p * 4);
  // White shirt visible
  ctx.fillStyle = "#FFF";
  ctx.fillRect(sx + p * 3, sy + p * 9, p * 2, p);
  ctx.fillRect(sx + p * 7, sy + p * 9, p * 2, p);
  // Zipper
  ctx.fillStyle = "#94a3b8";
  ctx.fillRect(sx + p * 6, sy + p * 10, p, p * 3);
  // Pants
  ctx.fillStyle = "#1E293B";
  ctx.fillRect(sx + p * 2, sy + p * 13, p * 8, p * 2);
  // Belt
  ctx.fillStyle = "#475569";
  ctx.fillRect(sx + p * 2, sy + p * 12, p * 8, p);
  ctx.fillRect(sx + p * 5, sy + p * 12, p * 2, p * 2);
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
  const sx = px(x + (w - 12 * P) / 2);
  const sy = px(y - h);
  const c: Ctx2D = { ctx, sx, sy, p: P, legPhase, grounded };
  boyHair(c);
  boyFace(c);
  boyBody(c);
  drawLegs(c, "#FFE4C4", "#2E7D32", "#4ADE80");
}

// ─── Fox: Rusty ───

function foxEars(c: Ctx2D) {
  const { ctx, sx, sy, p } = c;
  // Ears
  ctx.fillStyle = "#FB923C";
  ctx.fillRect(sx + p * 2, sy + p * 1, p * 2, p * 2);
  ctx.fillRect(sx + p * 8, sy + p * 1, p * 2, p * 2);
  // Inner ears
  ctx.fillStyle = "#FFE4C4";
  ctx.fillRect(sx + p * 2, sy + p * 1, p, p * 2);
  ctx.fillRect(sx + p * 9, sy + p * 1, p, p * 2);
}

function foxHead(c: Ctx2D) {
  const { ctx, sx, sy, p } = c;
  // Head
  ctx.fillStyle = "#FB923C";
  ctx.fillRect(sx + p * 3, sy + p * 3, p * 6, p * 4);
  ctx.fillRect(sx + p * 2, sy + p * 4, p * 8, p * 3);
  // White cheeks
  ctx.fillStyle = "#FFF";
  ctx.fillRect(sx + p * 2, sy + p * 6, p * 8, p);
  // Eyes
  ctx.fillStyle = "#1e293b";
  ctx.fillRect(sx + p * 4, sy + p * 5, p * 2, p);
  ctx.fillRect(sx + p * 7, sy + p * 5, p * 2, p);
  // Eye highlights
  ctx.fillStyle = "#FFF";
  ctx.fillRect(sx + p * 4, sy + p * 5, p, p);
  ctx.fillRect(sx + p * 7, sy + p * 5, p, p);
  // Nose
  ctx.fillStyle = "#1e293b";
  ctx.fillRect(sx + p * 5, sy + p * 6, p * 2, p);
  // Mouth
  ctx.fillStyle = "#475569";
  ctx.fillRect(sx + p * 5, sy + p * 7, p * 2, p);
}

function foxBody(c: Ctx2D) {
  const { ctx, sx, sy, p } = c;
  // Body
  ctx.fillStyle = "#FB923C";
  ctx.fillRect(sx + p * 2, sy + p * 9, p * 9, p * 4);
  // White belly
  ctx.fillStyle = "#FFF";
  ctx.fillRect(sx + p * 4, sy + p * 10, p * 5, p * 3);
  // Front paws
  ctx.fillStyle = "#FB923C";
  ctx.fillRect(sx + p * 3, sy + p * 13, p * 2, p);
  ctx.fillRect(sx + p * 8, sy + p * 13, p * 2, p);
  // Paw tips
  ctx.fillStyle = "#FFF";
  ctx.fillRect(sx + p * 3, sy + p * 13, p, p);
  ctx.fillRect(sx + p * 9, sy + p * 13, p, p);
  // Tail
  ctx.fillStyle = "#FB923C";
  ctx.fillRect(sx + p * 10, sy + p * 11, p * 2, p * 3);
  ctx.fillRect(sx + p * 11, sy + p * 12, p, p * 2);
  // Tail tip
  ctx.fillStyle = "#FFF";
  ctx.fillRect(sx + p * 11, sy + p * 13, p, p);
}

function foxLegs(c: Ctx2D) {
  const { ctx, sx, sy, p } = c;
  const swing = c.grounded ? Math.sin(c.legPhase) * p * 1.5 : 1;
  // Back legs
  ctx.fillStyle = "#FB923C";
  ctx.fillRect(sx + p * 2, sy + p * 13 + Math.max(0, swing), p * 2, p * 2);
  ctx.fillRect(sx + p * 8, sy + p * 13 + Math.max(0, -swing), p * 2, p * 2);
  // Paws
  ctx.fillStyle = "#FFF";
  ctx.fillRect(sx + p * 2, sy + p * 15 + Math.max(0, swing), p * 2, p);
  ctx.fillRect(sx + p * 8, sy + p * 15 + Math.max(0, -swing), p * 2, p);
}

export function drawFox(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  legPhase: number,
  grounded: boolean
) {
  const sx = px(x + (w - 12 * P) / 2);
  const sy = px(y - h + 3 * P);
  const c: Ctx2D = { ctx, sx, sy, p: P, legPhase, grounded };
  foxEars(c);
  foxHead(c);
  foxBody(c);
  foxLegs(c);
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
      <svg className="w-4 h-4" viewBox="0 0 14 18" fill="none">
        <rect x="4" y="0" width="4" height="2" fill="#5C3A21" />
        <rect x="3" y="1" width="6" height="2" fill="#5C3A21" />
        <rect x="2" y="3" width="8" height="3" fill="#8B5E3C" />
        <rect x="1" y="5" width="10" height="2" fill="#8B5E3C" />
        <rect x="3" y="4" width="6" height="6" fill="#FFE4C4" />
        <rect x="4" y="6" width="2" height="2" fill="#475569" />
        <rect x="7" y="6" width="2" height="2" fill="#475569" />
        <rect x="2" y="10" width="8" height="6" fill="#FF6B6B" />
        <rect x="1" y="12" width="10" height="2" fill="#FF6B6B" />
        <rect x="3" y="14" width="2" height="1" fill="#FFE4C4" />
        <rect x="7" y="14" width="2" height="1" fill="#FFE4C4" />
      </svg>
    ),
  },
  {
    id: "boy",
    label: "cc",
    draw: drawBoy,
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 14 18" fill="none">
        <rect x="3" y="0" width="2" height="1" fill="#374151" />
        <rect x="5" y="0" width="2" height="1" fill="#374151" />
        <rect x="7" y="0" width="2" height="1" fill="#374151" />
        <rect x="2" y="1" width="8" height="2" fill="#374151" />
        <rect x="3" y="3" width="6" height="6" fill="#FFE4C4" />
        <rect x="4" y="5" width="2" height="2" fill="#475569" />
        <rect x="7" y="5" width="2" height="2" fill="#475569" />
        <rect x="2" y="9" width="8" height="5" fill="#3B82F6" />
        <rect x="2" y="13" width="8" height="2" fill="#1E293B" />
        <rect x="3" y="14" width="2" height="1" fill="#FFE4C4" />
        <rect x="7" y="14" width="2" height="1" fill="#FFE4C4" />
      </svg>
    ),
  },
  {
    id: "fox",
    label: "Rusty",
    draw: drawFox,
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 14 18" fill="none">
        <rect x="2" y="0" width="2" height="2" fill="#FB923C" />
        <rect x="8" y="0" width="2" height="2" fill="#FB923C" />
        <rect x="3" y="3" width="6" height="4" fill="#FB923C" />
        <rect x="4" y="5" width="2" height="1" fill="#1e293b" />
        <rect x="7" y="5" width="2" height="1" fill="#1e293b" />
        <rect x="2" y="6" width="8" height="1" fill="#FFF" />
        <rect x="3" y="7" width="6" height="1" fill="#FB923C" />
        <rect x="2" y="8" width="9" height="4" fill="#FB923C" />
        <rect x="4" y="9" width="5" height="3" fill="#FFF" />
        <rect x="10" y="10" width="2" height="3" fill="#FB923C" />
        <rect x="11" y="12" width="1" height="1" fill="#FFF" />
        <rect x="3" y="13" width="2" height="1" fill="#FB923C" />
        <rect x="8" y="13" width="2" height="1" fill="#FB923C" />
      </svg>
    ),
  },
];
