import { API_BASE } from './config';

/**
 * Résout l'adresse d'une photo d'annonce :
 * - URL complète (http/https) -> telle quelle
 * - chemin relatif (/annonces/xxx.jpg) -> servi par notre backend
 */
export function photoUrl(path: string): string {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${API_BASE}${path}`;
}
