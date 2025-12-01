export enum UserID {
  PAOLO = 'paolo',
  BARBARA = 'barbara'
}

export enum Frequency {
  DAILY = 'daily',
  ALTERNATE_DAYS = 'alternate_days',      // Turno A (Giorni Pari dall'epoca)
  ALTERNATE_DAYS_ODD = 'alternate_days_odd' // Turno B (Giorni Dispari dall'epoca)
}

export interface Medication {
  id: string;
  userId: UserID;
  name: string;
  dosage: string;
  timing: string; // e.g., "Mattina", "Pomeriggio", "Ore 16:30"
  frequency: Frequency;
  notes?: string;
  icon?: 'pill' | 'drop' | 'clock' | 'sachet';
}

export interface LogEntry {
  date: string; // YYYY-MM-DD
  medicationId: string;
  taken: boolean;
  takenAt?: string; // ISO timestamp
}

export interface UserProfile {
  id: UserID;
  name: string;
  themeColor: string;
  secondaryColor: string;
  avatar: string;
}

export interface SupabaseConfig {
  url: string;
  key: string;
}