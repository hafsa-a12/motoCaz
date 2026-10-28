// Adresse de l'API backend. Peut être surchargée avec VITE_API_URL (voir .env.example).
export const API_BASE: string = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';
