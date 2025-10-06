export interface User {
  id: string;
  matricule: string;
  nom: string;
  prenom: string;
  departement: string;
  metier: string;
  email: string;
  passwordHash: string;
  role: 'employee' | 'admin';
  createdAt: string;
}

export interface Presence {
  id: string;
  userId: string;
  matricule: string;
  nom: string;
  prenom: string;
  departement: string;
  metier: string;
  date: string;
  heure: string;
  token: string;
  statut: 'Présent' | 'Absent' | 'Retard';
  markedManually?: boolean;
  createdAt: string;
}

export interface DailyToken {
  date: string;
  token: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
}
