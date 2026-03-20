import { Prioridad, PRIORIDAD_LABELS } from '../types';
import styles from './PriorityBadge.module.css';

interface Props {
  priority: Prioridad | null;
}

const PRIORITY_CLASS: Record<Prioridad, string> = {
  critica: styles.critica,
  alta: styles.alta,
  media: styles.media,
  baja: styles.baja,
};

export default function PriorityBadge({ priority }: Props) {
  if (!priority) {
    return <span className={`${styles.badge} ${styles.sinAsignar}`}>Sin asignar</span>;
  }
  return (
    <span className={`${styles.badge} ${PRIORITY_CLASS[priority]}`}>
      {PRIORIDAD_LABELS[priority]}
    </span>
  );
}
