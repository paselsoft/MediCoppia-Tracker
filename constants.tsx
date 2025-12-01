import { Medication, UserID, Frequency, UserProfile } from './types';
import { Pill, Droplets, Clock } from 'lucide-react';

// Credenziali hardcoded per accesso immediato
export const SUPABASE_CREDENTIALS = {
  url: "https://hvltqbqmaonnogphmbqb.supabase.co", // Corretto da dashboard URL a API URL
  key: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh2bHRxYnFtYW9ubm9ncGhtYnFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2MDc1MDAsImV4cCI6MjA4MDE4MzUwMH0.LkJgQrC__AYNwZUmG12s5lZ-u6jIvbYXvj9iID99D9w"
};

export const USERS: Record<UserID, UserProfile> = {
  [UserID.PAOLO]: {
    id: UserID.PAOLO,
    name: "Paolo",
    themeColor: "bg-blue-600",
    secondaryColor: "bg-blue-50",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Paolo&backgroundColor=b6e3f4"
  },
  [UserID.BARBARA]: {
    id: UserID.BARBARA,
    name: "Barbara",
    themeColor: "bg-rose-500",
    secondaryColor: "bg-rose-50",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Barbara&backgroundColor=ffdfbf"
  }
};

export const INITIAL_MEDICATIONS: Medication[] = [
  // PAOLO
  {
    id: 'p-retigan',
    userId: UserID.PAOLO,
    name: 'RETIGAN Q10',
    dosage: '1 Bustina',
    timing: 'Mattina',
    frequency: Frequency.ALTERNATE_DAYS,
    notes: 'Giorni alterni',
    icon: 'sachet'
  },
  {
    id: 'p-zetavit',
    userId: UserID.PAOLO,
    name: 'ZETAVIT Mg+K',
    dosage: '1 Bustina',
    timing: 'Mattina',
    frequency: Frequency.ALTERNATE_DAYS,
    notes: 'Giorni alterni',
    icon: 'sachet'
  },
  {
    id: 'p-uncaria-am',
    userId: UserID.PAOLO,
    name: 'UNCARIA',
    dosage: '1 Capsula',
    timing: 'Mattina',
    frequency: Frequency.DAILY,
    icon: 'pill'
  },
  {
    id: 'p-uncaria-pm',
    userId: UserID.PAOLO,
    name: 'UNCARIA',
    dosage: '1 Capsula',
    timing: 'Pomeriggio',
    frequency: Frequency.DAILY,
    icon: 'pill'
  },
  {
    id: 'p-same',
    userId: UserID.PAOLO,
    name: 'SAMe',
    dosage: '1 Capsula',
    timing: 'Lontano dai pasti',
    frequency: Frequency.DAILY,
    icon: 'pill'
  },

  // BARBARA
  {
    id: 'b-osteoral',
    userId: UserID.BARBARA,
    name: 'OSTEORAL',
    dosage: '1 Capsula',
    timing: 'Colazione',
    frequency: Frequency.DAILY,
    icon: 'pill'
  },
  {
    id: 'b-carpino-am',
    userId: UserID.BARBARA,
    name: 'CARPINO BIANCO',
    dosage: '60 Gocce',
    timing: 'Mattina',
    frequency: Frequency.DAILY,
    icon: 'drop'
  },
  {
    id: 'b-ribes-am',
    userId: UserID.BARBARA,
    name: 'RIBES NERO',
    dosage: '60 Gocce',
    timing: 'Mattina',
    frequency: Frequency.DAILY,
    icon: 'drop'
  },
  {
    id: 'b-carpino-pm',
    userId: UserID.BARBARA,
    name: 'CARPINO BIANCO',
    dosage: '60 Gocce',
    timing: 'Pomeriggio',
    frequency: Frequency.DAILY,
    icon: 'drop'
  },
  {
    id: 'b-ribes-pm',
    userId: UserID.BARBARA,
    name: 'RIBES NERO',
    dosage: '60 Gocce',
    timing: 'Entro le 17:00',
    frequency: Frequency.DAILY,
    notes: 'Importante: Prima delle 17:00',
    icon: 'clock'
  },
  {
    id: 'b-uncaria-am',
    userId: UserID.BARBARA,
    name: 'UNCARIA',
    dosage: '1 Capsula',
    timing: 'Mattina',
    frequency: Frequency.DAILY,
    icon: 'pill'
  },
  {
    id: 'b-uncaria-pm',
    userId: UserID.BARBARA,
    name: 'UNCARIA',
    dosage: '1 Capsula',
    timing: 'Pomeriggio',
    frequency: Frequency.DAILY,
    icon: 'pill'
  },
  {
    id: 'b-same',
    userId: UserID.BARBARA,
    name: 'SAMe',
    dosage: '1 Capsula',
    timing: 'Lontano dai pasti',
    frequency: Frequency.DAILY,
    icon: 'pill'
  }
];