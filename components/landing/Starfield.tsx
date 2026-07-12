"use client";

import { useMemo } from "react";

interface StarfieldProps {
  count?: number;
}

export function Starfield({ count = 120 }: StarfieldProps) {
  const stars = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        let seed = (count + 1) * (i + 1)

        const random = () => {
          seed = (seed * 1664525 + 1013904223) % 4294967296
          return seed / 4294967296
        }

        return {
          id: i,
          x: random() * 100,
          y: random() * 100,
          size: random() * 1.8 + 0.3,
          delay: random() * 4,
          duration: 3 + random() * 5,
          opacity: 0.3 + random() * 0.7,
        }
      }),
    [count],
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {stars.map((s) => (
        <span
          key={s.id}
          className="absolute rounded-full bg-white animate-twinkle"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.size,
            height: s.size,
            opacity: s.opacity,
            animationDelay: `${s.delay}s`,
            animationDuration: `${s.duration}s`,
            boxShadow: `0 0 ${s.size * 4}px rgba(180, 200, 255, 0.7)`,
          }}
        />
      ))}
    </div>
  );
}
