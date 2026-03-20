export type AlertStatus = 'activa' | 'resuelta' | 'caducada';

export interface Alert {
  id: number;
  fechaCreacion: string;
  estado: AlertStatus;
  origen: string;
  descripcion: string;
  usuarioAsignado: string;
}

export interface AlertStats {
  total: number;
  activas: number;
  resueltas: number;
  caducadas: number;
}

export interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (row: T) => React.ReactNode;
}
