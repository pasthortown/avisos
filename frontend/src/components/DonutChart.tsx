import styles from './DonutChart.module.css';

interface Segment {
  label: string;
  value: number;
  color: string;
}

interface Props {
  segments: Segment[];
  centerLabel?: string;
}

export default function DonutChart({ segments, centerLabel = 'Total' }: Props) {
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  const radius = 54;
  const circumference = 2 * Math.PI * radius;

  let offset = 0;
  const arcs = segments.map((seg) => {
    const pct = total > 0 ? seg.value / total : 0;
    const dash = pct * circumference;
    const gap = circumference - dash;
    const currentOffset = offset;
    offset += dash;
    return { ...seg, dash, gap, offset: currentOffset };
  });

  return (
    <div className={styles.container}>
      <div className={styles.svgWrap}>
        <svg viewBox="0 0 140 140" width="140" height="140">
          {arcs.map((arc) => (
            <circle
              key={arc.label}
              cx="70"
              cy="70"
              r={radius}
              fill="none"
              stroke={arc.color}
              strokeWidth="28"
              strokeDasharray={`${arc.dash} ${arc.gap}`}
              strokeDashoffset={-arc.offset}
            />
          ))}
          {total === 0 && (
            <circle cx="70" cy="70" r={radius} fill="none" stroke="var(--border-color)" strokeWidth="28" />
          )}
        </svg>
        <div className={styles.centerLabel}>
          <span className={styles.centerValue}>{total}</span>
          <span className={styles.centerText}>{centerLabel}</span>
        </div>
      </div>
      <div className={styles.legend}>
        {segments.map((seg) => (
          <div key={seg.label} className={styles.legendItem}>
            <span className={styles.dot} style={{ background: seg.color }} />
            <span>{seg.label}</span>
            <span className={styles.legendValue}>{seg.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
