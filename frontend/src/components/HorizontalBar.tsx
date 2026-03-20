import styles from './HorizontalBar.module.css';

interface BarItem {
  label: string;
  value: number;
  color: string;
}

interface Props {
  items: BarItem[];
  maxItems?: number;
}

export default function HorizontalBar({ items, maxItems = 8 }: Props) {
  const sorted = [...items].sort((a, b) => b.value - a.value).slice(0, maxItems);
  const max = sorted[0]?.value || 1;

  return (
    <div className={styles.container}>
      {sorted.map((item) => (
        <div key={item.label} className={styles.row}>
          <span className={styles.labelCol} title={item.label}>{item.label}</span>
          <div className={styles.barCol}>
            <div
              className={styles.bar}
              style={{
                width: `${(item.value / max) * 100}%`,
                background: item.color,
              }}
            />
          </div>
          <span className={styles.valueCol}>{item.value}</span>
        </div>
      ))}
    </div>
  );
}
