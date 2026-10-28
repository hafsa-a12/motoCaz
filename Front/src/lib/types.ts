export type Etat = 'neuve' | 'occasion';
export type Statut = 'en attente' | 'validee' | 'rejete';

export interface Annonce {
  _id: string;
  titre: string;
  description: string;
  type: string;
  energie: string;
  marque?: string;
  modele?: string;
  etat?: Etat;
  ville: string;
  prix: number;
  photos?: string[];
  statut?: Statut;
  datePublication?: string;
}
