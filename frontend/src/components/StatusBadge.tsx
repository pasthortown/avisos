import { AlertStatus } from '../types';
import styles from './StatusBadge.module.css';

interface Props {
  status: AlertStatus;
}

export default function StatusBadge({ status }: Props) {
  return <span className={`${styles.badge} ${styles[status]}`}>{status}</span>;
}
