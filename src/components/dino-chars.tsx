import React from "react";

// ─── Pixel art character system ───
// Each character is drawn as small colored blocks (1px logical size)
// With integer SCALE in the game canvas, each block maps to 3×3 physical pixels

type Pixel = [number, number, number, number, string]; // x, y, w, h, color

function px(ctx: CanvasRenderingContext2D, blocks: Pixel[], ox: number, oy: number) {
  for (const [x, y, w, h, color] of blocks) {
    ctx.fillStyle = color;
    ctx.fillRect(ox + x, oy + y, w, h);
  }
}

// Shared palette
const C = {
  skin: "#FFE4C4",
  skinShadow: "#E8C9A8",
  hair: "#5C3A21",
  hairLight: "#7A5030",
  eyeWhite: "#FFFFFF",
  pupil: "#1e293b",
  blush: "#FFB5B5",
  mouth: "#D4736B",
  white: "#FFFFFF",
  black: "#1E293B",
  gray: "#94A3B8",
  darkGray: "#475569",
};

// ─── Girl: vv ───
// Brown bob with pigtails, red dress, cute expression

const GIRL_BODY: Pixel[] = [
  // ── Hair ──
  [6, 0, 6, 2, C.hair],          // top
  [4, 2, 10, 2, C.hair],         // top-mid
  [1, 4, 4, 13, C.hair],         // left hanging
  [13, 4, 4, 13, C.hair],        // right hanging
  [3, 4, 12, 2, C.hair],         // bangs top
  [3, 6, 2, 2, C.hair],          // left bang gap fill
  [13, 6, 2, 2, C.hair],         // right bang gap fill
  [5, 4, 8, 2, C.hairLight],     // hair shine
  [3, 5, 2, 1, C.hairLight],     // shine left
  [13, 5, 2, 1, C.hairLight],    // shine right

  // ── Pigtails ──
  [0, 8, 2, 4, C.hair],          // left pigtail
  [-1, 12, 2, 3, C.hair],        // left pigtail bottom
  [16, 8, 2, 4, C.hair],         // right pigtail
  [17, 12, 2, 3, C.hair],        // right pigtail bottom
  [0, 8, 1, 1, "#8B4513"],       // left tie
  [17, 8, 1, 1, "#8B4513"],      // right tie

  // ── Face ──
  [4, 6, 10, 10, C.skin],        // main face

  // ── Eyes ──
  [5, 8, 3, 3, C.eyeWhite],      // left eye white
  [10, 8, 3, 3, C.eyeWhite],     // right eye white
  [6, 9, 2, 2, C.pupil],         // left pupil
  [11, 9, 2, 2, C.pupil],        // right pupil
  [6, 8, 1, 1, C.eyeWhite],      // left highlight
  [11, 8, 1, 1, C.eyeWhite],     // right highlight

  // ── Blush ──
  [3, 11, 3, 2, C.blush],        // left blush
  [12, 11, 3, 2, C.blush],       // right blush

  // ── Mouth ──
  [7, 13, 4, 1, C.mouth],        // smile

  // ── Dress body ──
  [4, 16, 10, 2, "#FF6B6B"],     // collar area
  [3, 18, 12, 2, "#FF6B6B"],     // upper
  [2, 20, 14, 2, "#FF6B6B"],     // mid
  [2, 22, 14, 2, "#FF4757"],     // mid shadow
  [3, 24, 12, 2, "#FF6B6B"],     // lower
  [4, 26, 10, 2, "#FF4757"],     // lower shadow
  [5, 28, 8, 1, "#FF6B6B"],      // skirt bottom

  // ── Collar ──
  [5, 16, 4, 2, C.white],        // white collar left
  [9, 16, 4, 2, C.white],        // white collar right

  // ── Arms (skin) ──
  [1, 18, 2, 6, C.skin],         // left arm
  [15, 18, 2, 6, C.skin],        // right arm

  // ── Legs ──
  [5, 29, 3, 4, C.skin],         // left leg
  [10, 29, 3, 4, C.skin],        // right leg

  // ── Shoes ──
  [4, 33, 5, 2, "#FF4757"],      // left shoe
  [9, 33, 5, 2, "#FF4757"],      // right shoe
];

// Animated legs for running
function getGirlLegs(phase: number): Pixel[] {
  const swing = Math.sin(phase) * 2;
  return [
    // Left leg
    [5 + swing, 29, 3, 4, C.skin],
    // Right leg
    [10 - swing, 29, 3, 4, C.skin],
    // Shoes
    [4 + swing, 33, 5, 2, "#FF4757"],
    [9 - swing, 33, 5, 2, "#FF4757"],
  ];
}

// ─── Boy: cc ───
// Spiky hair, blue jacket, dark pants

const BOY_STATIC: Pixel[] = [
  // ── Spiky hair ──
  [3, 0, 3, 3, C.black],         // left spike
  [7, 0, 4, 2, C.black],         // center spike top
  [11, 0, 3, 3, C.black],        // right spike
  [5, 2, 2, 3, C.black],         // left-mid spike
  [11, 2, 2, 3, C.black],        // right-mid spike
  [2, 3, 4, 2, C.black],         // left side
  [12, 3, 4, 2, C.black],        // right side
  [4, 3, 10, 4, C.black],        // hair main
  [6, 2, 6, 1, C.darkGray],      // hair highlight

  // ── Face ──
  [4, 7, 10, 9, C.skin],         // main face

  // ── Eyes ──
  [5, 9, 3, 3, C.eyeWhite],      // left eye
  [10, 9, 3, 3, C.eyeWhite],     // right eye
  [6, 10, 2, 2, C.pupil],        // left pupil
  [11, 10, 2, 2, C.pupil],       // right pupil
  [6, 9, 1, 1, C.eyeWhite],      // highlight
  [11, 9, 1, 1, C.eyeWhite],

  // ── Eyebrows ──
  [4, 7, 4, 1, C.black],         // left brow
  [10, 7, 4, 1, C.black],        // right brow

  // ── Blush ──
  [3, 11, 3, 2, C.blush],
  [12, 11, 3, 2, C.blush],

  // ── Mouth ──
  [7, 13, 4, 1, C.mouth],

  // ── Jacket body ──
  [4, 16, 10, 2, "#3B82F6"],     // collar area
  [3, 18, 12, 3, "#3B82F6"],     // upper
  [3, 21, 12, 3, "#2563EB"],     // mid shadow
  [4, 24, 10, 3, "#3B82F6"],     // lower
  [5, 27, 8, 2, "#2563EB"],      // bottom

  // ── Zipper line ──
  [8, 17, 2, 11, C.white],       // zipper

  // ── White shirt collar ──
  [4, 16, 3, 2, C.white],
  [11, 16, 3, 2, C.white],

  // ── Arms ──
  [1, 18, 2, 7, C.skin],
  [15, 18, 2, 7, C.skin],

  // ── Pants ──
  [5, 29, 8, 2, C.black],
  [5, 31, 3, 3, C.black],        // left pant leg
  [10, 31, 3, 3, C.black],       // right pant leg

  // ── Belt ──
  [5, 28, 8, 1, "#475569"],
  [8, 28, 2, 2, "#FBBF24"],      // belt buckle
];

function getBoyLegs(phase: number): Pixel[] {
  const swing = Math.sin(phase) * 2;
  return [
    // Pant legs
    [5 + swing, 31, 3, 3, C.black],
    [10 - swing, 31, 3, 3, C.black],
    // Skin legs
    [5 + swing, 34, 3, 1, C.skin],
    [10 - swing, 34, 3, 1, C.skin],
    // Shoes
    [4 + swing, 35, 5, 2, "#1E293B"],
    [9 - swing, 35, 5, 2, "#1E293B"],
  ];
}

// ─── Fox: Rusty ───
// Orange fox with pointy ears, white belly, bushy tail

const FOX_STATIC: Pixel[] = [
  // ── Ears ──
  [2, 0, 4, 4, "#FB923C"],       // left ear
  [12, 0, 4, 4, "#FB923C"],      // right ear
  [3, 1, 2, 3, C.skin],          // left inner ear
  [13, 1, 2, 3, C.skin],         // right inner ear

  // ── Head ──
  [3, 4, 12, 10, "#FB923C"],     // main head
  [4, 5, 10, 2, "#F97316"],      // head highlight

  // ── White muzzle ──
  [5, 9, 8, 5, C.white],         // snout area
  [6, 10, 6, 3, "#FFE4C4"],      // lighter center

  // ── Eyes (fox - angled slits) ──
  [4, 6, 3, 2, C.pupil],         // left eye
  [11, 6, 3, 2, C.pupil],        // right eye
  [4, 6, 1, 1, C.white],         // left glint
  [13, 6, 1, 1, C.white],        // right glint

  // ── Nose ──
  [7, 11, 4, 2, C.black],

  // ── Mouth ──
  [7, 13, 4, 1, C.mouth],

  // ── Body ──
  [3, 14, 12, 10, "#FB923C"],    // main body
  [4, 15, 10, 2, "#F97316"],     // body highlight
  [3, 22, 12, 2, "#F97316"],     // body shadow

  // ── White belly ──
  [5, 16, 8, 7, C.white],        // belly

  // ── Tail ──
  [13, 20, 6, 5, "#FB923C"],     // tail
  [14, 21, 5, 3, "#F97316"],     // tail highlight
  [16, 19, 4, 2, C.white],       // tail tip white

  // ── Paws (short, four-legged) ──
  [3, 24, 3, 3, "#FB923C"],      // front left
  [5, 24, 3, 3, "#FB923C"],      // front right
  [10, 24, 3, 3, "#FB923C"],     // back left
  [12, 24, 3, 3, "#FB923C"],     // back right

  // ── Paw tips (white) ──
  [3, 26, 3, 1, C.white],
  [5, 26, 3, 1, C.white],
  [10, 26, 3, 1, C.white],
  [12, 26, 3, 1, C.white],
];

function getFoxLegs(phase: number): Pixel[] {
  const swing = Math.sin(phase) * 1.5;
  return [
    [3, 24, 3, 3, "#FB923C"],
    [5 + Math.floor(swing), 24, 3, 3, "#FB923C"],
    [10 - Math.floor(swing), 24, 3, 3, "#FB923C"],
    [12, 24, 3, 3, "#FB923C"],
    // Paw tips
    [3, 26, 3, 1, C.white],
    [5 + Math.floor(swing), 26, 3, 1, C.white],
    [10 - Math.floor(swing), 26, 3, 1, C.white],
    [12, 26, 3, 1, C.white],
  ];
}

// Sprite heights (how many pixel rows each character occupies)
// Used to position feet at ground level
const GIRL_H = 35;
const BOY_H = 37;
const FOX_H = 28;

// ─── Drawing wrapper ───
// Each draw function receives raw canvas + player state from the game engine

export function drawGirl(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  legPhase: number, grounded: boolean
) {
  // Center the 18-wide sprite horizontally, align feet just above ground
  const ox = x + (w - 18) / 2;
  const oy = y - GIRL_H - 1;
  px(ctx, GIRL_BODY, ox, oy);
  if (grounded) {
    px(ctx, getGirlLegs(legPhase), ox, oy);
  } else {
    px(ctx, getGirlLegs(0.5), ox, oy);
  }
}

export function drawBoy(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  legPhase: number, grounded: boolean
) {
  const ox = x + (w - 18) / 2;
  const oy = y - BOY_H - 1;
  px(ctx, BOY_STATIC, ox, oy);
  if (grounded) {
    px(ctx, getBoyLegs(legPhase), ox, oy);
  } else {
    px(ctx, getBoyLegs(0.3), ox, oy);
  }
}

export function drawFox(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  legPhase: number, grounded: boolean
) {
  const ox = x + (w - 18) / 2;
  const oy = y - FOX_H - 1;
  px(ctx, FOX_STATIC, ox, oy);
  if (grounded) {
    px(ctx, getFoxLegs(legPhase), ox, oy);
  } else {
    px(ctx, getFoxLegs(0.25), ox, oy);
  }
}

// ─── Character registry ───

export interface CharDef {
  id: string;
  label: string;
  draw: (
    ctx: CanvasRenderingContext2D,
    x: number, y: number, w: number, h: number,
    legPhase: number, grounded: boolean
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
        <rect x="4" y="2" width="8" height="2" fill="#5C3A21" />
        <rect x="6" y="4" width="4" height="4" fill="#FFE4C4" />
        <rect x="5" y="6" width="1" height="1" fill="#1e293b" />
        <rect x="10" y="6" width="1" height="1" fill="#1e293b" />
        <rect x="4" y="8" width="8" height="4" fill="#FF6B6B" />
        <rect x="6" y="12" width="1" height="2" fill="#FFE4C4" />
        <rect x="9" y="12" width="1" height="2" fill="#FFE4C4" />
      </svg>
    ),
  },
  {
    id: "boy",
    label: "cc",
    draw: drawBoy,
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
        <rect x="5" y="1" width="6" height="1" fill="#1E293B" />
        <rect x="3" y="2" width="10" height="1" fill="#1E293B" />
        <rect x="6" y="3" width="4" height="4" fill="#FFE4C4" />
        <rect x="5" y="5" width="1" height="1" fill="#1e293b" />
        <rect x="10" y="5" width="1" height="1" fill="#1e293b" />
        <rect x="4" y="7" width="8" height="4" fill="#3B82F6" />
        <rect x="6" y="11" width="1" height="3" fill="#1E293B" />
        <rect x="9" y="11" width="1" height="3" fill="#1E293B" />
      </svg>
    ),
  },
  {
    id: "fox",
    label: "Rusty",
    draw: drawFox,
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
        <rect x="4" y="3" width="8" height="4" fill="#FB923C" />
        <rect x="3" y="0" width="2" height="4" fill="#FB923C" />
        <rect x="11" y="0" width="2" height="4" fill="#FB923C" />
        <rect x="5" y="6" width="6" height="4" fill="#FB923C" />
        <rect x="4" y="7" width="8" height="2" fill="#FB923C" />
        <rect x="6" y="5" width="1" height="1" fill="#1e293b" />
        <rect x="9" y="5" width="1" height="1" fill="#1e293b" />
        <rect x="3" y="9" width="10" height="4" fill="#FB923C" />
        <rect x="12" y="10" width="2" height="2" fill="#FB923C" />
      </svg>
    ),
  },
];
