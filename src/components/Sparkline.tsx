"use client";

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  positive?: boolean;
}

export default function Sparkline({ data, width = 120, height = 40, positive = true }: SparklineProps) {
  if (!data || data.length < 2) return null;

  const sampled = data.length > 50
    ? data.filter((_, i) => i % Math.ceil(data.length / 50) === 0)
    : data;

  const min = Math.min(...sampled);
  const max = Math.max(...sampled);
  const range = max - min || 1;

  const points = sampled
    .map((v, i) => {
      const x = (i / (sampled.length - 1)) * width;
      const y = height - ((v - min) / range) * (height - 4) - 2;
      return `${x},${y}`;
    })
    .join(" ");

  const color = positive ? "#00c896" : "#ff3b5c";

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="inline-block">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
