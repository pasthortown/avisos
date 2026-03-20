import { useEffect, useMemo, useState } from 'react';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import DonutChart from '../components/DonutChart';
import HorizontalBar from '../components/HorizontalBar';
import { getNotificaciones } from '../services/api';
import PriorityBadge from '../components/PriorityBadge';
import { Notificacion, DashboardStats, Column, EstadoNotificacion } from '../types';
import styles from './Dashboard.module.css';

const COLORS: Record<EstadoNotificacion, string> = {
  A: '#22c55e',
  P: '#a855f7',
  R: '#3b82f6',
  C: '#eab308',
  E: '#ef4444',
};

const ORIGIN_COLORS = [
  '#3b82f6', '#22c55e', '#eab308', '#ef4444', '#a855f7',
  '#06b6d4', '#f97316', '#ec4899',
];

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('es-GT', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

function truncate(text: string | null, max: number): string {
  if (!text) return '—';
  return text.length > max ? text.slice(0, max) + '...' : text;
}

function formatPeriodo(inicio: string | null, fin: string | null): string {
  const fmt = (iso: string) => {
    const d = new Date(iso);
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
  };
  if (inicio && fin) return `${fmt(inicio)} - ${fmt(fin)}`;
  if (inicio) return fmt(inicio);
  if (fin) return fmt(fin);
  return '—';
}

function parseDestinatarios(raw: string): string[] {
  return raw
    .split(/[|;,]/)
    .map((d) => d.trim().toLowerCase())
    .filter(Boolean);
}

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
    key: 'descripcion',
    header: 'Descripción',
    render: (row) => truncate(row.descripcion, 80),
  },
  {
    key: 'destinatarios',
    header: 'Notificados',
    render: (row) => parseDestinatarios(row.destinatarios).join(', '),
  },
  {
    key: 'cantidadRegistros',
    header: 'Registros',
    render: (row) => row.cantidadRegistros ?? '—',
  },
  {
    key: 'periodo',
    header: 'Periodo',
    render: (row) => formatPeriodo(row.periodoInicio, row.periodoFin),
  },
];

export default function Dashboard() {
  const [data, setData] = useState<Notificacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getNotificaciones()
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const stats = useMemo<DashboardStats>(() => ({
    total: data.length,
    activas: data.filter((n) => n.estado === 'A').length,
    enProceso: data.filter((n) => n.estado === 'P').length,
    resueltas: data.filter((n) => n.estado === 'R').length,
    caducadas: data.filter((n) => n.estado === 'C').length,
    error: data.filter((n) => n.estado === 'E').length,
  }), [data]);

  const origenItems = useMemo(() => {
    const map = new Map<string, number>();
    data.forEach((n) => map.set(n.origen, (map.get(n.origen) || 0) + 1));
    return Array.from(map, ([label, value], i) => ({
      label,
      value,
      color: ORIGIN_COLORS[i % ORIGIN_COLORS.length],
    }));
  }, [data]);

  const donutSegments = [
    { label: 'Activas', value: stats.activas, color: COLORS.A },
    { label: 'En Proceso', value: stats.enProceso, color: COLORS.P },
    { label: 'Resueltas', value: stats.resueltas, color: COLORS.R },
    { label: 'Caducadas', value: stats.caducadas, color: COLORS.C },
    { label: 'Error', value: stats.error, color: COLORS.E },
  ];

  return (
    <>
      <PageHeader title="Dashboard de Alertas" />

      {error && <div className={styles.errorBanner}>Error al cargar datos: {error}</div>}

      {loading ? (
        <div className={styles.loading}>Cargando notificaciones...</div>
      ) : (
        <>
          <div className={styles.kpiRow}>
            <Card label="Total Alertas" value={stats.total} />
            <Card label="Activas" value={stats.activas} color={COLORS.A} />
            <Card label="En Proceso" value={stats.enProceso} color={COLORS.P} />
            <Card label="Resueltas" value={stats.resueltas} color={COLORS.R} />
            <Card label="Caducadas" value={stats.caducadas} color={COLORS.C} />
            <Card label="Error Envío" value={stats.error} color={COLORS.E} />
          </div>

          <div className={styles.chartsRow}>
            <div className={styles.chartCard}>
              <h3 className={styles.chartTitle}>Distribución por Estado</h3>
              <DonutChart segments={donutSegments} />
            </div>
            <div className={styles.chartCard}>
              <h3 className={styles.chartTitle}>Alertas por Origen</h3>
              <HorizontalBar items={origenItems} />
            </div>
          </div>

          <div className={styles.tableCard}>
            <h3 className={styles.chartTitle}>Notificaciones Recientes</h3>
            <DataTable columns={columns} data={data} rowKey={(row) => row.idNotificacion} />
          </div>
        </>
      )}
    </>
  );
}
