import { EstadoNotificacion, ESTADO_LABELS } from '../types';
import styles from './StatusBadge.module.css';

interface Props {
  status: EstadoNotificacion;
}

const STATUS_CLASS: Record<EstadoNotificacion, string> = {
  A: styles.activa,
  P: styles.enProceso,
  R: styles.resuelta,
  C: styles.caducada,
  E: styles.error,
};

export default function StatusBadge({ status }: Props) {
  return (
    <span className={`${styles.badge} ${STATUS_CLASS[status]}`}>
      {ESTADO_LABELS[status]}
    </span>
  );
}
