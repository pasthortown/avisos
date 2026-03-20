export type EstadoNotificacion = 'A' | 'P' | 'R' | 'C' | 'E';

export const ESTADO_LABELS: Record<EstadoNotificacion, string> = {
  A: 'Activa',
  P: 'En Proceso',
  R: 'Resuelta',
  C: 'Cerrada',
  E: 'Error envío',
};

export type Prioridad = 'critica' | 'alta' | 'media' | 'baja';

export const PRIORIDAD_LABELS: Record<Prioridad, string> = {
  critica: 'Crítica',
  alta: 'Alta',
  media: 'Media',
  baja: 'Baja',
};

export interface Notificacion {
  idNotificacion: number;
  fechaCreacion: string;
  fechaEnvio: string | null;
  fechaResolucion: string | null;
  estado: EstadoNotificacion;
  origen: string;
  spOrigen: string;
  asunto: string;
  descripcion: string | null;
  descripcionHtml: string | null;
  cantidadRegistros: number | null;
  destinatarios: string;
  destinatariosCc: string | null;
  periodoInicio: string | null;
  periodoFin: string | null;
  fechaModificacion: string | null;
  usuarioResolucion: string | null;
  notasResolucion: string | null;
  prioridad: Prioridad | null;
  fechaAtencion: string | null;
  usuarioAtencion: string | null;
  notasAtencion: string | null;
}

export interface GestionPayload {
  estado?: EstadoNotificacion;
  prioridad?: Prioridad;
  usuarioAtencion?: string;
  notasAtencion?: string;
  usuarioResolucion?: string;
  notasResolucion?: string;
}

export interface DashboardStats {
  total: number;
  activas: number;
  enProceso: number;
  resueltas: number;
  caducadas: number;
  error: number;
}

export interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (row: T) => React.ReactNode;
}
