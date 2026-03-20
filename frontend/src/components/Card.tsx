import styles from './Card.module.css';

interface Props {
  label: string;
  value: number | string;
  color?: string;
}

export default function Card({ label, value, color }: Props) {
  return (
    <div className={styles.card}>
      <span className={styles.label}>{label}</span>
      <span className={styles.value} style={color ? { color } : undefined}>
        {value}
      </span>
    </div>
  );
}
