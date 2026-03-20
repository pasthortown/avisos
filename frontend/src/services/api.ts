import { Alert, AlertStats } from '../types';

const API_BASE = 'http://localhost:8080/api';

// Mock data - reemplazar con llamadas reales al backend
const mockAlerts: Alert[] = [
  {
    id: 1,
    fechaCreacion: '2026-03-15',
    estado: 'activa',
    origen: 'Nómina',
    descripcion: 'Diferencia detectada en cálculo de horas extras',
    usuarioAsignado: 'maria.garcia@empresa.com',
  },
  {
    id: 2,
    fechaCreacion: '2026-03-14',
    estado: 'resuelta',
    origen: 'Deducciones',
    descripcion: 'Deducción duplicada en periodo quincenal',
    usuarioAsignado: 'juan.lopez@empresa.com',
  },
  {
    id: 3,
    fechaCreacion: '2026-03-13',
    estado: 'caducada',
    origen: 'Impuestos',
    descripcion: 'Retención ISR fuera de rango permitido',
    usuarioAsignado: 'ana.martinez@empresa.com',
  },
  {
    id: 4,
    fechaCreacion: '2026-03-12',
    estado: 'activa',
    origen: 'Prestaciones',
    descripcion: 'Fondo de ahorro sin aportación patronal',
    usuarioAsignado: 'carlos.ruiz@empresa.com',
  },
  {
    id: 5,
    fechaCreacion: '2026-03-11',
    estado: 'resuelta',
    origen: 'Nómina',
    descripcion: 'Empleado dado de baja con nómina activa',
    usuarioAsignado: 'maria.garcia@empresa.com',
  },
  {
    id: 6,
    fechaCreacion: '2026-03-10',
    estado: 'activa',
    origen: 'Vacaciones',
    descripcion: 'Prima vacacional no calculada correctamente',
    usuarioAsignado: 'juan.lopez@empresa.com',
  },
  {
    id: 7,
    fechaCreacion: '2026-03-09',
    estado: 'caducada',
    origen: 'Aguinaldo',
    descripcion: 'Proporción de aguinaldo incorrecta para ingreso tardío',
    usuarioAsignado: 'ana.martinez@empresa.com',
  },
];

export async function getAlerts(): Promise<Alert[]> {
  // TODO: conectar al backend
  // const response = await fetch(`${API_BASE}/alerts`);
  // return response.json();
  void API_BASE;
  return Promise.resolve(mockAlerts);
}

export async function getAlertStats(): Promise<AlertStats> {
  // TODO: conectar al backend
  const alerts = await getAlerts();
  return {
    total: alerts.length,
    activas: alerts.filter((a) => a.estado === 'activa').length,
    resueltas: alerts.filter((a) => a.estado === 'resuelta').length,
    caducadas: alerts.filter((a) => a.estado === 'caducada').length,
  };
}

