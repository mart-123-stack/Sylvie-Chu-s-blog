"use client";

import { useEffect, useRef } from "react";

const floatingStars = [
  { x: 60, y: 80, r: 6, delay: 0 },
  { x: 340, y: 60, r: 4, delay: 0.8 },
  { x: 50, y: 240, r: 5, delay: 1.6 },
  { x: 350, y: 200, r: 7, delay: 0.3 },
  { x: 80, y: 360, r: 4, delay: 2.1 },
  { x: 320, y: 350, r: 5, delay: 1.2 },
];

function Star({ x, y, r, delay }: { x: number; y: number; r: number; delay: number }) {
  const s = r * 0.38;
  const pts = [];
  for (let i = 0; i < 5; i++) {
    const outer = (Math.PI / 2) * -1 + (i * 2 * Math.PI) / 5;
    const inner = outer + Math.PI / 5;
    pts.push(`${x + r * Math.cos(outer)},${y + r * Math.sin(outer)}`);
    pts.push(`${x + r * s * Math.cos(inner)},${y + r * s * Math.sin(inner)}`);
  }
  return (
    <polygon
      points={pts.join(" ")}
      fill="#FBBF24"
      opacity={0.4 + Math.random() * 0.2}
      className="mascot-star"
      style={{ animationDelay: `${delay}s` }}
    />
  );
}

export default function MascotIllustration({ className }: { className?: string }) {
  return (
    <div className={className}>
      <svg viewBox="0 0 400 500" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="hairGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0EA5E9" />
            <stop offset="100%" stopColor="#0891B2" />
          </linearGradient>
          <linearGradient id="hairDark" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0891B2" />
            <stop offset="100%" stopColor="#0C7BA3" />
          </linearGradient>
          <linearGradient id="eyeGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7DD3FC" />
            <stop offset="100%" stopColor="#38BDF8" />
          </linearGradient>
          <linearGradient id="pupilGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0284C7" />
            <stop offset="100%" stopColor="#0369A1" />
          </linearGradient>
        </defs>

        {/* === 背景长发 === */}
        <path d="M130,140 C90,180 70,280 85,380 Q90,420 110,450 Q100,400 105,340 Q100,260 130,180 Z" fill="url(#hairDark)" />
        <path d="M270,140 C310,180 330,280 315,380 Q310,420 290,450 Q300,400 295,340 Q300,260 270,180 Z" fill="url(#hairDark)" />

        {/* === 脸 === */}
        <ellipse cx="200" cy="225" rx="72" ry="82" fill="#FFE4C4" />

        {/* === 头发主体 === */}
        <path d="M120,170 C120,100 280,100 280,170 C285,200 275,220 260,230 C245,240 230,235 220,225 C210,245 190,245 180,225 C170,235 155,240 140,230 C125,220 115,200 120,170 Z" fill="url(#hairGrad)" />

        {/* === 刘海 === */}
        <path d="M128,190 C130,135 145,120 170,130 C175,135 180,145 185,140 C190,130 210,130 215,140 C220,145 225,135 230,130 C255,120 270,135 272,190 C268,200 258,200 248,192 C240,210 215,218 200,205 C185,218 160,210 152,192 C142,200 132,200 128,190 Z" fill="url(#hairGrad)" />

        {/* === 鬓发 === */}
        <path d="M125,185 C100,245 110,310 120,340 C125,352 132,348 130,335 C125,285 132,220 143,200 Z" fill="url(#hairGrad)" />
        <path d="M275,185 C300,245 290,310 280,340 C275,352 268,348 270,335 C275,285 268,220 257,200 Z" fill="url(#hairGrad)" />

        {/* === 头发高光 === */}
        <path d="M148,148 C160,140 180,138 195,145" stroke="#7DD3FC" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.5" />
        <path d="M208,142 C225,136 245,140 258,150" stroke="#7DD3FC" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.5" />
        <path d="M175,160 C188,155 205,155 218,162" stroke="#7DD3FC" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.3" />

        {/* === 眉毛 === */}
        <path d="M152,208 Q170,198 188,208" stroke="#0891B2" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path d="M212,208 Q230,198 248,208" stroke="#0891B2" strokeWidth="2.5" fill="none" strokeLinecap="round" />

        {/* === 眼睛（左） === */}
        <ellipse cx="168" cy="228" rx="19" ry="23" fill="url(#eyeGrad)" />
        <ellipse cx="168" cy="230" rx="14" ry="17" fill="url(#pupilGrad)" />
        <ellipse cx="163" cy="221" rx="7" ry="6" fill="white" opacity="0.9" />
        <circle cx="174" cy="236" r="3.5" fill="white" opacity="0.7" />
        {/* Star highlight */}
        <polygon points="158,235 160.5,230 165.5,230 161.5,227 163,222 158,225.5 153,222 154.5,227 150.5,230 155.5,230" fill="white" opacity="0.6" />

        {/* === 眼睛（右） === */}
        <ellipse cx="232" cy="228" rx="19" ry="23" fill="url(#eyeGrad)" />
        <ellipse cx="232" cy="230" rx="14" ry="17" fill="url(#pupilGrad)" />
        <ellipse cx="227" cy="221" rx="7" ry="6" fill="white" opacity="0.9" />
        <circle cx="238" cy="236" r="3.5" fill="white" opacity="0.7" />
        {/* Star highlight */}
        <polygon points="222,235 224.5,230 229.5,230 225.5,227 227,222 222,225.5 217,222 218.5,227 214.5,230 219.5,230" fill="white" opacity="0.6" />

        {/* === 眼影/下睫毛 === */}
        <path d="M152,248 Q160,252 168,249" stroke="#0EA5E9" strokeWidth="1" fill="none" opacity="0.3" />
        <path d="M232,249 Q240,252 248,248" stroke="#0EA5E9" strokeWidth="1" fill="none" opacity="0.3" />

        {/* === 腮红 === */}
        <ellipse cx="152" cy="252" rx="12" ry="6" fill="#FFB5B5" opacity="0.45" />
        <ellipse cx="248" cy="252" rx="12" ry="6" fill="#FFB5B5" opacity="0.45" />

        {/* === 嘴巴 === */}
        <path d="M190,260 Q200,268 210,260" stroke="#E87D7D" strokeWidth="2.5" fill="none" strokeLinecap="round" />

        {/* === 星星发饰（右侧） === */}
        <g transform="translate(268, 175) rotate(18)">
          <polygon points="0,-16 4.5,-5.5 16,-5.5 7,2 10,14 0,7 -10,14 -7,2 -16,-5.5 -4.5,-5.5" fill="#FBBF24" />
          <polygon points="0,-11 3,-3.5 10.5,-3.5 4.5,1 6.5,9 0,4.5 -6.5,9 -4.5,1 -10.5,-3.5 -3,-3.5" fill="#F59E0B" />
          <circle cx="0" cy="-1" r="2.5" fill="#FFF" opacity="0.4" />
        </g>

        {/* === 脖子 === */}
        <rect x="186" y="300" width="28" height="18" fill="#FFE4C4" />
        <path d="M186,305 Q200,310 214,305" stroke="#F5D5A5" strokeWidth="1" fill="none" opacity="0.5" />

        {/* === 水手领 === */}
        <path d="M118,318 Q165,305 200,318 Q235,305 282,318 L295,348 Q250,335 200,348 Q150,335 105,348 Z" fill="#38BDF8" />
        <path d="M160,318 Q200,310 240,318 L248,340 Q222,328 200,332 Q178,328 152,340 Z" fill="#0EA5E9" />
        <path d="M195,316 L205,316 L205,330 L195,330 Z" fill="#FFF" opacity="0.3" />

        {/* === 身体 === */}
        <path d="M125,342 L108,440 L292,440 L275,342 Z" fill="#FFFFFF" />
        <path d="M125,342 Q200,355 275,342" stroke="#E2E8F0" strokeWidth="1" fill="none" />

        {/* === 星星吊坠 === */}
        <g transform="translate(200, 365)">
          <polygon points="0,-14 4,-5 14,-5 6,1 8.5,12 0,6 -8.5,12 -6,1 -14,-5 -4,-5" fill="#FBBF24" />
          <polygon points="0,-9 2.5,-3 9,-3 4.5,1 6,8 0,4 -6,8 -4.5,1 -9,-3 -2.5,-3" fill="#F59E0B" />
          <circle cx="0" cy="0" r="2" fill="#FFF" opacity="0.4" />
        </g>

        {/* === 飘浮装饰星星 === */}
        {floatingStars.map((s, i) => (
          <Star key={i} x={s.x} y={s.y} r={s.r} delay={s.delay} />
        ))}
      </svg>
    </div>
  );
}
