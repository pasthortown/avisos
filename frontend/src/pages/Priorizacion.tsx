import { useEffect, useState, useCallback } from 'react';
import PageHeader from '../components/PageHeader';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import Modal from '../components/Modal';
import { getNotificaciones, gestionarNotificacion } from '../services/api';
import { Notificacion, Prioridad, PRIORIDAD_LABELS, Column } from '../types';
import modalStyles from '../components/Modal.module.css';
import styles from './Priorizacion.module.css';

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('es-GT', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

const PRIORIDADES: Prioridad[] = ['critica', 'alta', 'media', 'baja'];

export default function Priorizacion() {
  const [data, setData] = useState<Notificacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Notificacion | null>(null);
  const [prioridad, setPrioridad] = useState<Prioridad | null>(null);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(() => {
    setLoading(true);
    getNotificaciones()
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const openModal = (notif: Notificacion) => {
    setSelected(notif);
    setPrioridad(notif.prioridad);
  };

  const closeModal = () => {
    setSelected(null);
    setPrioridad(null);
  };

  const handleSave = async () => {
    if (!selected || !prioridad) return;
    setSaving(true);
    try {
      await gestionarNotificacion(selected.idNotificacion, { prioridad });
      closeModal();
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const columns: Column<Notificacion>[] = [
    {
      key: 'fechaCreacion',
      header: 'Fecha',
      render: (row) => formatDate(row.fechaCreacion),
    },
    {
      key: 'estado',
      header: 'Estado',
      render: (row) => <StatusBadge status={row.estado} />,
    },
    { key: 'origen', header: 'Origen' },
    { key: 'asunto', header: 'Asunto' },
    {
      key: 'prioridad',
      header: 'Prioridad',
      render: (row) => <PriorityBadge priority={row.prioridad} />,
    },
    {
      key: 'acciones',
      header: '',
      render: (row) => (
        <button className={modalStyles.btnPrimary} onClick={() => openModal(row)}>
          Priorizar
        </button>
      ),
    },
  ];

  return (
    <>
      <PageHeader title="Priorización de Alertas" />

      {error && <div className={styles.errorBanner}>{error}</div>}

      {loading ? (
        <div className={styles.loading}>Cargando notificaciones...</div>
      ) : (
        <div className={styles.tableCard}>
          <DataTable columns={columns} data={data} rowKey={(row) => row.idNotificacion} />
        </div>
      )}

      {selected && (
        <Modal
          title="Asignar Prioridad"
          onClose={closeModal}
          footer={
            <>
              <button className={modalStyles.btnSecondary} onClick={closeModal}>Cancelar</button>
              <button className={modalStyles.btnPrimary} onClick={handleSave} disabled={!prioridad || saving}>
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </>
          }
        >
          <div className={styles.notifInfo}>
            <strong>{selected.origen}</strong> — {selected.asunto}
          </div>
          <div className={styles.priorityOptions}>
            {PRIORIDADES.map((p) => (
              <button
                key={p}
                className={`${styles.priorityOption} ${prioridad === p ? styles.priorityOptionSelected : ''}`}
                onClick={() => setPrioridad(p)}
              >
                <PriorityBadge priority={p} />
                <span>{PRIORIDAD_LABELS[p]}</span>
              </button>
            ))}
          </div>
        </Modal>
      )}
    </>
  );
}
