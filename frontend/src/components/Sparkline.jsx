import React from "react";

/** Tiny inline trend line for risk cards — a miniature waterline per station. */
export default function Sparkline({ values = [], color = "#1C5D6B" }) {
  if (!values || !values.length) return null;
  const w = 110, h = 32;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const points = values
    .map((v, i) => {
      const x = (i / (values.length - 1 || 1)) * w;
      const y = h - 4 - ((v - min) / range) * (h - 8);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <div className="w-full py-1">
      <svg className="w-full h-8 overflow-visible" viewBox={`0 0 ${w} ${h}`} aria-hidden="true">
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
