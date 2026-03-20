import { useEffect, useState, useCallback } from 'react';
import PageHeader from '../components/PageHeader';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import Modal from '../components/Modal';
import { getNotificaciones, gestionarNotificacion } from '../services/api';
import {
  Notificacion, EstadoNotificacion, ESTADO_LABELS,
  GestionPayload, Column,
} from '../types';
import modalStyles from '../components/Modal.module.css';
import styles from './Gestion.module.css';

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('es-GT', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

const ESTADOS_GESTION: EstadoNotificacion[] = ['A', 'P', 'R', 'C'];

export default function Gestion() {
  const [data, setData] = useState<Notificacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Notificacion | null>(null);
  const [saving, setSaving] = useState(false);

  const [estado, setEstado] = useState<EstadoNotificacion>('A');
  const [usuarioAtencion, setUsuarioAtencion] = useState('');
  const [notasAtencion, setNotasAtencion] = useState('');
  const [usuarioResolucion, setUsuarioResolucion] = useState('');
  const [notasResolucion, setNotasResolucion] = useState('');

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
    setEstado(notif.estado);
    setUsuarioAtencion(notif.usuarioAtencion ?? '');
    setNotasAtencion(notif.notasAtencion ?? '');
    setUsuarioResolucion(notif.usuarioResolucion ?? '');
    setNotasResolucion(notif.notasResolucion ?? '');
  };

  const closeModal = () => {
    setSelected(null);
  };

  const handleSave = async () => {
    if (!selected) return;
    setSaving(true);
    const payload: GestionPayload = {
      estado,
      usuarioAtencion: usuarioAtencion || undefined,
      notasAtencion: notasAtencion || undefined,
    };
    if (estado === 'R' || estado === 'C') {
      payload.usuarioResolucion = usuarioResolucion || undefined;
      payload.notasResolucion = notasResolucion || undefined;
    }
    try {
      await gestionarNotificacion(selected.idNotificacion, payload);
      closeModal();
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const showResolucion = estado === 'R' || estado === 'C';

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
    {
      key: 'prioridad',
      header: 'Prioridad',
      render: (row) => <PriorityBadge priority={row.prioridad} />,
    },
    { key: 'origen', header: 'Origen' },
    { key: 'asunto', header: 'Asunto' },
    {
      key: 'usuarioAtencion',
      header: 'Usuario Atención',
      render: (row) => row.usuarioAtencion ?? '—',
    },
    {
      key: 'acciones',
      header: '',
      render: (row) => (
        <button className={modalStyles.btnPrimary} onClick={() => openModal(row)}>
          Gestionar
        </button>
      ),
    },
  ];

  return (
    <>
      <PageHeader title="Gestión de Alertas" />

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
          title="Gestionar Alerta"
          onClose={closeModal}
          footer={
            <>
              <button className={modalStyles.btnSecondary} onClick={closeModal}>Cancelar</button>
              <button className={modalStyles.btnPrimary} onClick={handleSave} disabled={saving}>
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </>
          }
        >
          <div className={styles.notifInfo}>
            <strong>{selected.origen}</strong> — {selected.asunto}
          </div>

          <div className={modalStyles.field}>
            <label>Estado</label>
            <select value={estado} onChange={(e) => setEstado(e.target.value as EstadoNotificacion)}>
              {ESTADOS_GESTION.map((e) => (
                <option key={e} value={e}>{ESTADO_LABELS[e]}</option>
              ))}
            </select>
          </div>

          <div className={modalStyles.field}>
            <label>Usuario de Atención</label>
            <input
              type="text"
              value={usuarioAtencion}
              onChange={(e) => setUsuarioAtencion(e.target.value)}
              placeholder="email@empresa.com"
            />
          </div>

          <div className={modalStyles.field}>
            <label>Notas de Atención</label>
            <textarea
              value={notasAtencion}
              onChange={(e) => setNotasAtencion(e.target.value)}
              placeholder="Observaciones sobre la atención..."
            />
          </div>

          {showResolucion && (
            <>
              <hr className={styles.separator} />
              <div className={modalStyles.field}>
                <label>Usuario de Resolución</label>
                <input
                  type="text"
                  value={usuarioResolucion}
                  onChange={(e) => setUsuarioResolucion(e.target.value)}
                  placeholder="email@empresa.com"
                />
              </div>
              <div className={modalStyles.field}>
                <label>Notas de Resolución</label>
                <textarea
                  value={notasResolucion}
                  onChange={(e) => setNotasResolucion(e.target.value)}
                  placeholder="Detalle de la resolución..."
                />
              </div>
            </>
          )}
        </Modal>
      )}
    </>
  );
}
