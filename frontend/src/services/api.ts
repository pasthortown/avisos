import { Notificacion, GestionPayload } from '../types';

const API_BASE = 'http://localhost:8080/api';

export async function getNotificaciones(): Promise<Notificacion[]> {
  const response = await fetch(`${API_BASE}/notificaciones`);
  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }
  return response.json();
}

export async function gestionarNotificacion(
  id: number,
  payload: GestionPayload,
): Promise<void> {
  const response = await fetch(`${API_BASE}/notificaciones/${id}/gestion`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }
}
