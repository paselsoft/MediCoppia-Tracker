
export enum UserID {
  PAOLO = 'paolo',
  BARBARA = 'barbara'
}

export enum Frequency {
  DAILY = 'daily',
  ALTERNATE_DAYS = 'alternate_days',      // Turno A (Giorni Pari dall'epoca)
  ALTERNATE_DAYS_ODD = 'alternate_days_odd' // Turno B (Giorni Dispari dall'epoca)
}

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  threshold: number;
  packSize?: number; // Dimensione confezione standard (es. 50 cps, 50 ml)
  unit?: string; // Es. 'cps', 'ml', 'bustine'
}

export interface InventoryLog {
  id: number;
  inventoryId: string;
  productName: string;
  amountAdded: number; // Quantità totale aggiunta
  packsAdded: number; // Numero di confezioni aggiunte
  date: string; // ISO Timestamp
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
  
  // Inventory fields (Legacy or Derived from Product)
  stockQuantity?: number; // Quantità residua
  stockThreshold?: number; // Soglia per l'avviso
  
  // Status field
  isArchived?: boolean; // Se true, il farmaco è sospeso/in pausa
  
  // Shared Inventory (Legacy)
  sharedId?: string; 

  // Virtual Pharmacy Link (New Architecture)
  productId?: string; // Link alla tabella Inventory
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
