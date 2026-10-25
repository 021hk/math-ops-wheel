"use client";

import { useMemo } from "react";
import { CONFETTI_COLORS, OPERATIONS, polar } from "@/lib/game";

/* ---------------- confetti ---------------- */

export function Confetti({ burstKey }: { burstKey: number }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: 30 }, (_, i) => ({
        cx: (Math.random() * 2 - 1) * 230,
        cy: 100 + Math.random() * 250,
        cr: (Math.random() * 2 - 1) * 720,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        delay: Math.random() * 0.25,
        w: 7 + Math.random() * 6,
      })),
    [burstKey]
  );
  if (burstKey === 0) return null;
  return (
    <div
      key={burstKey}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-20"
    >
      {pieces.map((p, i) => (
        <span
          key={i}
          className="confetti-piece"
          style={
            {
              "--cx": `${p.cx}px`,
              "--cy": `${p.cy}px`,
              "--cr": `${p.cr}deg`,
              background: p.color,
              width: `${p.w}px`,
              height: `${p.w * 1.45}px`,
              animationDelay: `${p.delay}s`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}

/* ---------------- wheel ---------------- */

export function Wheel({
  rotation,
  burstKey,
}: {
  rotation: number;
  burstKey: number;
}) {
  const R = 168;
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[430px] select-none">
      {/* بخش چرخان: سکتورها و برچسب‌ها */}
      <div
        className="absolute inset-0 will-change-transform"
        style={{
          transform: `rotate(${rotation}deg)`,
          transition: "transform 4.4s cubic-bezier(0.15, 0.82, 0.08, 1)",
        }}
      >
        <svg
          viewBox="0 0 400 400"
          className="h-full w-full drop-shadow-xl"
          role="img"
          aria-label="گردونه چهار عمل اصلی ریاضی"
        >
          {OPERATIONS.map((op, i) => {
            const p1 = polar(200, 200, R, i * 90);
            const p2 = polar(200, 200, R, i * 90 + 90);
            const sym = polar(200, 200, 118, i * 90 + 45);
            const lbl = polar(200, 200, 74, i * 90 + 45);
            return (
              <g key={op.key}>
                <path
                  d={`M 200 200 L ${p1.x.toFixed(2)} ${p1.y.toFixed(2)} A ${R} ${R} 0 0 1 ${p2.x.toFixed(2)} ${p2.y.toFixed(2)} Z`}
                  fill={op.color}
                  stroke="#ffffff"
                  strokeWidth={3}
                />
                <text
                  x={sym.x}
                  y={sym.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={62}
                  fontWeight={900}
                  fill="#ffffff"
                >
                  {op.symbol}
                </text>
                <text
                  x={lbl.x}
                  y={lbl.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={26}
                  fontWeight={800}
                  fill="#ffffff"
                >
                  {op.name}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* بخش ثابت: رینگ، چراغ‌ها، مرکز و فلش */}
      <svg
        viewBox="0 0 400 400"
        className="pointer-events-none absolute inset-0 h-full w-full"
        aria-hidden="true"
      >
        <circle cx={200} cy={200} r={181} fill="none" stroke="#292524" strokeWidth={14} />
        {Array.from({ length: 12 }, (_, i) => {
          const p = polar(200, 200, 181, i * 30);
          return <circle key={i} cx={p.x} cy={p.y} r={4.2} fill="#fbbf24" />;
        })}
        <circle cx={200} cy={200} r={42} fill="#ffffff" stroke="#e7e5e4" strokeWidth={2} />
        <circle cx={200} cy={200} r={33} fill="#292524" />
        <text
          x={200}
          y={201}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={15}
          fontWeight={800}
          fill="#fbbf24"
        >
          گردونه
        </text>
        <polygon
          points="200,56 182,13 218,13"
          fill="#dc2626"
          stroke="#ffffff"
          strokeWidth={2.5}
          strokeLinejoin="round"
        />
      </svg>

      <Confetti burstKey={burstKey} />
    </div>
  );
}
