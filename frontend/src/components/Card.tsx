import styles from './Card.module.css';

interface Props {
  label: string;
  value: number | string;
}

export default function Card({ label, value }: Props) {
  return (
    <div className={styles.card}>
      <span className={styles.label}>{label}</span>
      <span className={styles.value}>{value}</span>
    </div>
  );
}
