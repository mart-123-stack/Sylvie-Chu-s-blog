import React from "react";

// ─── Vector-style character system ───
// Smooth, rounded characters drawn with canvas paths
// Not pixel art — clean anti-aliased rendering for higher visual quality

interface CharCtx {
  ctx: CanvasRenderingContext2D;
  cx: number;   // center X
  bottom: number; // foot Y (ground level)
  h: number;    // total height
  legPhase: number;
  grounded: boolean;
}

// ─── Shared helpers ───

function drawShadow(c: CharCtx) {
  const { ctx, cx, bottom } = c;
  ctx.fillStyle = "rgba(0,0,0,0.08)";
  ctx.beginPath();
  ctx.ellipse(cx, bottom + 2, 14, 3, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawLegs(c: CharCtx, skin: string, shoe: string) {
  const { ctx, cx, bottom, h, legPhase, grounded } = c;
  const legH = h * 0.22;
  const swing = grounded ? Math.sin(legPhase) * 4 : 2;
  const top = bottom - legH;

  ctx.fillStyle = skin;
  // Left leg
  ctx.fillRect(cx - 6, top + Math.max(0, swing), 4, legH - Math.max(0, swing) + 2);
  // Right leg
  ctx.fillRect(cx + 2, top + Math.max(0, -swing), 4, legH - Math.max(0, -swing) + 2);

  // Shoes
  ctx.fillStyle = shoe;
  const shoeyL = top + legH + Math.max(0, swing);
  const shoeyR = top + legH + Math.max(0, -swing);
  ctx.beginPath();
  ctx.ellipse(cx - 4, shoeyL, 4, 2.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(cx + 4, shoeyR, 4, 2.5, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawEyes(c: CharCtx, eyeX: number, eyeY: number) {
  const { ctx, cx } = c;
  // Whites
  ctx.fillStyle = "#FFF";
  ctx.beginPath();
  ctx.ellipse(cx - eyeX, eyeY, 3.5, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(cx + eyeX, eyeY, 3.5, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  // Pupils
  ctx.fillStyle = "#1e293b";
  ctx.beginPath();
  ctx.arc(cx - eyeX + 0.5, eyeY + 0.5, 2.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx + eyeX + 0.5, eyeY + 0.5, 2.2, 0, Math.PI * 2);
  ctx.fill();

  // Highlights
  ctx.fillStyle = "#FFF";
  ctx.beginPath();
  ctx.arc(cx - eyeX - 1, eyeY - 1.2, 1.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx + eyeX - 1, eyeY - 1.2, 1.2, 0, Math.PI * 2);
  ctx.fill();
}

function drawBlush(c: CharCtx, bx: number, by: number) {
  const { ctx, cx } = c;
  ctx.fillStyle = "rgba(255, 150, 150, 0.35)";
  ctx.beginPath();
  ctx.ellipse(cx - bx, by, 4, 2.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(cx + bx, by, 4, 2.5, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawMouth(c: CharCtx, mx: number, my: number) {
  const { ctx, cx } = c;
  ctx.strokeStyle = "#D4736B";
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.arc(cx + mx, my, 2.5, 0.15, Math.PI - 0.15);
  ctx.stroke();
}

// ─── Girl: vv ───
// Round face, brown bob with pigtails, red dress

export function drawGirl(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  legPhase: number,
  grounded: boolean
) {
  const cx = x + w / 2;
  const bottom = y;
  const c: CharCtx = { ctx, cx, bottom, h, legPhase, grounded };

  drawShadow(c);

  const headR = h * 0.17;
  const headCY = bottom - h + h * 0.33;

  // Hair behind
  ctx.fillStyle = "#5C3A21";
  ctx.beginPath();
  ctx.arc(cx, headCY + 1, headR + 4, Math.PI, 0);
  ctx.fill();
  ctx.fillRect(cx - headR - 4, headCY - 3, headR * 2 + 8, headR * 0.5);

  // Pigtails
  ctx.beginPath();
  ctx.ellipse(cx - headR - 7, headCY + headR * 0.3, 4, 7, -0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(cx + headR + 7, headCY + headR * 0.3, 4, 7, 0.2, 0, Math.PI * 2);
  ctx.fill();

  // Head
  ctx.fillStyle = "#FFE4C4";
  ctx.beginPath();
  ctx.arc(cx, headCY, headR, 0, Math.PI * 2);
  ctx.fill();

  // Bangs
  ctx.fillStyle = "#5C3A21";
  ctx.beginPath();
  ctx.arc(cx, headCY - 2, headR, Math.PI * 1.15, Math.PI * 1.85);
  ctx.lineTo(cx - headR * 0.7, headCY - 4);
  ctx.fill();

  // Hair shine
  ctx.fillStyle = "rgba(139, 94, 60, 0.3)";
  ctx.beginPath();
  ctx.ellipse(cx, headCY - headR * 0.5, headR * 0.5, headR * 0.15, 0, 0, Math.PI * 2);
  ctx.fill();

  // Eyes
  drawEyes(c, 5, headCY + 1.5);

  // Blush
  drawBlush(c, 8.5, headCY + 5);

  // Mouth
  drawMouth(c, 0, headCY + 5.5);

  // Body (dress)
  const bodyTop = headCY + headR + 2;
  const bodyBot = bottom - h * 0.22;

  ctx.fillStyle = "#FF6B6B";
  // Dress body
  ctx.beginPath();
  ctx.moveTo(cx - 10, bodyTop);
  ctx.lineTo(cx + 10, bodyTop);
  ctx.lineTo(cx + 12, bodyBot);
  ctx.lineTo(cx - 12, bodyBot);
  ctx.closePath();
  ctx.fill();

  // Dress highlight
  ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
  ctx.fillRect(cx - 7, bodyTop + 3, 5, bodyBot - bodyTop - 6);

  // Collar
  ctx.fillStyle = "#FFF";
  ctx.beginPath();
  ctx.arc(cx, bodyTop, 5, Math.PI, 0);
  ctx.fill();

  // Legs
  drawLegs(c, "#FFE4C4", "#FF4757");
}

// ─── Boy: cc ───
// Spiky hair, blue jacket, dark pants

export function drawBoy(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  legPhase: number,
  grounded: boolean
) {
  const cx = x + w / 2;
  const bottom = y;
  const c: CharCtx = { ctx, cx, bottom, h, legPhase, grounded };

  drawShadow(c);

  const headR = h * 0.17;
  const headCY = bottom - h + h * 0.33;

  // Spiky hair
  ctx.fillStyle = "#374151";
  // Hair spikes
  const spikes = [
    [cx - 9, headCY - headR - 2],
    [cx - 5, headCY - headR - 6],
    [cx, headCY - headR - 8],
    [cx + 5, headCY - headR - 6],
    [cx + 9, headCY - headR - 2],
  ];
  for (const [sx, sy] of spikes) {
    ctx.beginPath();
    ctx.arc(sx, sy + 4, 5, 0, Math.PI * 2);
    ctx.fill();
  }
  // Hair base
  ctx.fillRect(cx - headR - 2, headCY - headR + 4, headR * 2 + 4, headR * 0.6);

  // Head
  ctx.fillStyle = "#FFE4C4";
  ctx.beginPath();
  ctx.arc(cx, headCY, headR, 0, Math.PI * 2);
  ctx.fill();

  // Eyes
  drawEyes(c, 5, headCY + 1.5);

  // Eyebrows
  ctx.strokeStyle = "#374151";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(cx - 8, headCY - 3);
  ctx.lineTo(cx - 3, headCY - 4);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx + 8, headCY - 3);
  ctx.lineTo(cx + 3, headCY - 4);
  ctx.stroke();

  // Blush
  drawBlush(c, 8.5, headCY + 5);

  // Mouth
  drawMouth(c, 0, headCY + 5.5);

  // Body (jacket)
  const bodyTop = headCY + headR + 2;
  const bodyBot = bottom - h * 0.22;

  // Jacket
  ctx.fillStyle = "#3B82F6";
  ctx.beginPath();
  ctx.roundRect(cx - 10, bodyTop, 20, bodyBot - bodyTop, 3);
  ctx.fill();

  // Jacket zipper line
  ctx.fillStyle = "#2563EB";
  ctx.fillRect(cx - 1, bodyTop + 2, 2, bodyBot - bodyTop - 4);

  // White shirt collar
  ctx.fillStyle = "#FFF";
  ctx.fillRect(cx - 4, bodyTop, 3, 4);
  ctx.fillRect(cx + 1, bodyTop, 3, 4);

  // Pants
  ctx.fillStyle = "#1E293B";
  ctx.fillRect(cx - 9, bodyBot - 4, 18, 4);

  // Belt
  ctx.fillStyle = "#475569";
  ctx.fillRect(cx - 9, bodyBot - 6, 18, 2);
  ctx.fillRect(cx - 2, bodyBot - 6, 4, 6);

  // Legs
  drawLegs(c, "#FFE4C4", "#2E7D32");
}

// ─── Fox: Rusty ───

export function drawFox(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  legPhase: number,
  grounded: boolean
) {
  const cx = x + w / 2;
  const bottom = y;
  const c: CharCtx = { ctx, cx, bottom, h, legPhase, grounded };

  drawShadow(c);

  const headR = h * 0.14;
  const headCY = bottom - h + h * 0.35;

  // Ears
  ctx.fillStyle = "#FB923C";
  // Left ear
  ctx.beginPath();
  ctx.moveTo(cx - headR - 2, headCY - headR + 4);
  ctx.lineTo(cx - headR + 4, headCY - headR - 4);
  ctx.lineTo(cx - headR + 8, headCY - headR + 4);
  ctx.closePath();
  ctx.fill();
  // Right ear
  ctx.beginPath();
  ctx.moveTo(cx + headR - 8, headCY - headR + 4);
  ctx.lineTo(cx + headR - 4, headCY - headR - 4);
  ctx.lineTo(cx + headR + 2, headCY - headR + 4);
  ctx.closePath();
  ctx.fill();

  // Inner ears
  ctx.fillStyle = "#FFE4C4";
  ctx.beginPath();
  ctx.moveTo(cx - headR, headCY - headR + 4);
  ctx.lineTo(cx - headR + 4, headCY - headR - 2);
  ctx.lineTo(cx - headR + 6, headCY - headR + 4);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(cx + headR - 6, headCY - headR + 4);
  ctx.lineTo(cx + headR - 4, headCY - headR - 2);
  ctx.lineTo(cx + headR, headCY - headR + 4);
  ctx.closePath();
  ctx.fill();

  // Head
  ctx.fillStyle = "#FB923C";
  ctx.beginPath();
  ctx.arc(cx, headCY, headR, 0, Math.PI * 2);
  ctx.fill();

  // White cheeks/snout
  ctx.fillStyle = "#FFF";
  ctx.beginPath();
  ctx.ellipse(cx, headCY + headR * 0.3, headR * 0.6, headR * 0.4, 0, 0, Math.PI * 2);
  ctx.fill();

  // Eyes (fox - slightly angled)
  ctx.fillStyle = "#1e293b";
  ctx.beginPath();
  ctx.ellipse(cx - 5, headCY + 1, 2.5, 3, -0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(cx + 5, headCY + 1, 2.5, 3, 0.1, 0, Math.PI * 2);
  ctx.fill();

  // Eye highlights
  ctx.fillStyle = "#FFF";
  ctx.beginPath();
  ctx.arc(cx - 5.5, headCY - 0.5, 1, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx + 4.5, headCY - 0.5, 1, 0, Math.PI * 2);
  ctx.fill();

  // Nose
  ctx.fillStyle = "#1e293b";
  ctx.beginPath();
  ctx.ellipse(cx, headCY + 4, 2, 1.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Body
  const bodyTop = headCY + headR;
  const bodyBot = bottom - h * 0.2;

  ctx.fillStyle = "#FB923C";
  ctx.beginPath();
  ctx.ellipse(cx + 2, (bodyTop + bodyBot) / 2, 12, (bodyBot - bodyTop) / 2, 0, 0, Math.PI * 2);
  ctx.fill();

  // White belly
  ctx.fillStyle = "#FFF";
  ctx.beginPath();
  ctx.ellipse(cx + 2, (bodyTop + bodyBot) / 2 + 2, 7, (bodyBot - bodyTop) / 2 - 2, 0, 0, Math.PI * 2);
  ctx.fill();

  // Tail
  ctx.fillStyle = "#FB923C";
  ctx.beginPath();
  ctx.ellipse(cx + 16, bodyBot - 4, 10, 5, 0.3, 0, Math.PI * 2);
  ctx.fill();
  // Tail tip
  ctx.fillStyle = "#FFF";
  ctx.beginPath();
  ctx.ellipse(cx + 18, bodyBot - 5, 4, 3, 0.3, 0, Math.PI * 2);
  ctx.fill();

  // Legs (shorter for fox - four legged stance implied)
  const legH = h * 0.15;
  const swing = grounded ? Math.sin(legPhase) * 2.5 : 1;
  ctx.fillStyle = "#FB923C";
  ctx.fillRect(cx - 7, bodyBot + Math.max(0, swing), 4, legH - Math.max(0, swing) + 1);
  ctx.fillRect(cx + 3, bodyBot + Math.max(0, -swing), 4, legH - Math.max(0, -swing) + 1);
  // Paws
  ctx.fillStyle = "#FFF";
  ctx.fillRect(cx - 7, bodyBot + legH + Math.max(0, swing), 4, 2);
  ctx.fillRect(cx + 3, bodyBot + legH + Math.max(0, -swing), 4, 2);
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
      <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="5" r="3" fill="#FFE4C4" />
        <circle cx="8" cy="3" r="3.5" fill="#5C3A21" />
        <ellipse cx="4" cy="6" rx="1.5" ry="3" fill="#5C3A21" />
        <ellipse cx="12" cy="6" rx="1.5" ry="3" fill="#5C3A21" />
        <circle cx="7" cy="5" r="1" fill="#1e293b" />
        <circle cx="9" cy="5" r="1" fill="#1e293b" />
        <path d="M5 10 L8 14 L11 10 Z" fill="#FF6B6B" />
      </svg>
    ),
  },
  {
    id: "boy",
    label: "cc",
    draw: drawBoy,
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="5" r="3" fill="#FFE4C4" />
        <path d="M4 4 L6 1 L8 0 L10 1 L12 4" fill="#374151" />
        <circle cx="7" cy="5" r="1" fill="#1e293b" />
        <circle cx="9" cy="5" r="1" fill="#1e293b" />
        <path d="M5 9 L8 14 L11 9 Z" fill="#3B82F6" />
        <rect x="6" y="13" width="4" height="2" fill="#1E293B" />
      </svg>
    ),
  },
  {
    id: "fox",
    label: "Rusty",
    draw: drawFox,
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
        <path d="M4 4 L5 2 L7 4" fill="#FB923C" />
        <path d="M12 4 L11 2 L9 4" fill="#FB923C" />
        <circle cx="8" cy="6" r="3" fill="#FB923C" />
        <ellipse cx="8" cy="7.5" rx="2.5" ry="1.5" fill="#FFF" />
        <circle cx="7" cy="6" r="0.8" fill="#1e293b" />
        <circle cx="9" cy="6" r="0.8" fill="#1e293b" />
        <ellipse cx="8" cy="11" rx="4" ry="3" fill="#FB923C" />
        <ellipse cx="13" cy="11" rx="3" ry="1.5" fill="#FB923C" />
        <circle cx="14" cy="11" r="1" fill="#FFF" />
      </svg>
    ),
  },
];
