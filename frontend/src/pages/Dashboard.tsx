import { useEffect, useState } from 'react';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import { getAlerts, getAlertStats } from '../services/api';
import { Alert, AlertStats, Column } from '../types';
import styles from './Dashboard.module.css';

const columns: Column<Alert>[] = [
  { key: 'fechaCreacion', header: 'Fecha Creación' },
  {
    key: 'estado',
    header: 'Estado',
    render: (row) => <StatusBadge status={row.estado} />,
  },
  { key: 'origen', header: 'Origen' },
  { key: 'descripcion', header: 'Descripción' },
  { key: 'usuarioAsignado', header: 'Usuario Asignado' },
];

export default function Dashboard() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [stats, setStats] = useState<AlertStats>({ total: 0, activas: 0, resueltas: 0, caducadas: 0 });

  useEffect(() => {
    getAlerts().then(setAlerts);
    getAlertStats().then(setStats);
  }, []);

  return (
    <>
      <PageHeader title="Dashboard de Alertas" />
      <div className={styles.cards}>
        <Card label="Total Alertas" value={stats.total} />
        <Card label="Activas" value={stats.activas} />
        <Card label="Resueltas" value={stats.resueltas} />
        <Card label="Caducadas" value={stats.caducadas} />
      </div>
      <DataTable columns={columns} data={alerts} rowKey={(row) => row.id} />
    </>
  );
}
