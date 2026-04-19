'use client';

interface OakRingProps {
  value: number;      // 0–100
  size?: number;      // default 44
  stroke?: number;    // ширина дуги прогресса, default 3
  segments?: number;  // количество внутренних декоративных колец, default 3
  className?: string;
}

export default function OakRing({
  value,
  size = 44,
  stroke = 3,
  segments = 3,
  className,
}: OakRingProps) {
  const cx = size / 2;
  const cy = size / 2;
  const outerR = (size - stroke) / 2;
  const circumference = 2 * Math.PI * outerR;
  const offset = circumference * (1 - Math.max(0, Math.min(100, value)) / 100);

  // Внутренние декоративные кольца (годичные кольца дуба)
  const innerRings = Array.from({ length: segments }, (_, i) => {
    const ratio = (i + 1) / (segments + 1);
    return outerR * ratio;
  });

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      fill="none"
      className={className}
      aria-label={`Прогресс: ${Math.round(value)}%`}
      role="img"
    >
      {/* Внутренние декоративные кольца */}
      {innerRings.map((r, i) => (
        <circle
          key={i}
          cx={cx}
          cy={cy}
          r={r}
          stroke="var(--border)"
          strokeWidth={1}
          fill="none"
        />
      ))}

      {/* Трек (фон дуги) */}
      <circle
        cx={cx}
        cy={cy}
        r={outerR}
        stroke="var(--surface-3)"
        strokeWidth={stroke}
        fill="none"
      />

      {/* Дуга прогресса */}
      <circle
        cx={cx}
        cy={cy}
        r={outerR}
        stroke={value >= 100 ? 'var(--done)' : 'var(--accent)'}
        strokeWidth={stroke}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        fill="none"
        transform={`rotate(-90 ${cx} ${cy})`}
        style={{
          transition: 'stroke-dashoffset 0.5s cubic-bezier(.2,.8,.2,1)',
        }}
      />

      {/* Текст процента */}
      <text
        x={cx}
        y={cy}
        textAnchor="middle"
        dominantBaseline="central"
        fill="var(--fg-muted)"
        fontFamily="var(--font-mono)"
        fontSize={size * 0.28}
        fontWeight={500}
      >
        {Math.round(value)}
      </text>
    </svg>
  );
}
