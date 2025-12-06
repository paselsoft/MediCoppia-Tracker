
import { getSupabase } from './supabaseClient';
import { Medication, LogEntry, InventoryItem } from '../types';
import { INITIAL_MEDICATIONS } from '../constants';

// --- Helpers ---

// Transform database row to InventoryItem
const mapDbToInventory = (row: any): InventoryItem => ({
  id: row.id,
  name: row.name,
  quantity: row.quantity,
  threshold: row.threshold
});

// Transform database row to Medication object
const mapDbToMed = (row: any): Medication => ({
  id: row.id,
  userId: row.user_id,
  name: row.name,
  dosage: row.dosage,
  timing: row.timing,
  frequency: row.frequency,
  notes: row.notes,
  icon: row.icon,
  stockQuantity: row.stock_quantity,
  stockThreshold: row.stock_threshold,
  isArchived: row.is_archived,
  sharedId: row.shared_id,
  productId: row.product_id
});

// Transform database row to Log format
const mapDbToLog = (rows: any[]): Record<string, boolean> => {
  const logs: Record<string, boolean> = {};
  rows.forEach(row => {
    // Key format: YYYY-MM-DD-medId
    const key = `${row.date}-${row.medication_id}`;
    if (row.taken) {
      logs[key] = true;
    }
  });
  return logs;
};

// Helper to check if error is a network error
const isNetworkError = (e: any) => {
  const msg = e?.message || e?.toString() || '';
  return msg.includes('Load failed') || msg.includes('Failed to fetch') || msg.includes('Network request failed');
};

// --- API ---

export const initializeDefaultDataIfNeeded = async () => {
  const supabase = getSupabase();
  if (!supabase) return;

  try {
    const { count, error } = await supabase.from('medications').select('*', { count: 'exact', head: true });
    
    if (error) {
      if (!isNetworkError(error)) {
        console.warn('Supabase initialization check failed:', error.message);
      }
      return;
    }
    
    if (count === 0) {
      const dbMeds = INITIAL_MEDICATIONS.map(med => ({
        id: med.id,
        user_id: med.userId,
        name: med.name,
        dosage: med.dosage,
        timing: med.timing,
        frequency: med.frequency,
        notes: med.notes,
        icon: med.icon,
        is_archived: false,
        shared_id: null
      }));
      
      const { error: insertError } = await supabase.from('medications').insert(dbMeds);
      if (insertError && !isNetworkError(insertError)) {
        console.error('Failed to insert initial data:', insertError.message);
      }
    }
  } catch (e) {
    if (!isNetworkError(e)) {
      console.error('Exception during initialization:', e);
    }
  }
};

// --- Inventory API ---

export const fetchInventory = async (): Promise<InventoryItem[]> => {
  const supabase = getSupabase();
  if (!supabase) return [];

  try {
    const { data, error } = await supabase.from('inventory').select('*').order('name', { ascending: true });
    if (error) {
       // If table doesn't exist yet, suppress error
       if (error.message.includes('relation "inventory" does not exist')) return [];
       throw error;
    }
    return data.map(mapDbToInventory);
  } catch (e) {
    // console.warn('Error fetching inventory (table might not exist yet):', e);
    return [];
  }
};

export const saveInventoryItem = async (item: InventoryItem): Promise<string | null> => {
  const supabase = getSupabase();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase.from('inventory').upsert({
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      threshold: item.threshold
    }).select().single();

    if (error) throw error;
    return data?.id || item.id;
  } catch (e) {
    console.error('Error saving inventory item:', e);
    return null;
  }
};

// --- Medication API ---

export const fetchMedications = async (): Promise<Medication[]> => {
  const supabase = getSupabase();
  if (!supabase) return INITIAL_MEDICATIONS;

  try {
    const { data, error } = await supabase.from('medications').select('*').order('created_at', { ascending: true });
    
    if (error) throw error;

    if (!data || data.length === 0) {
      return INITIAL_MEDICATIONS;
    }
    
    return data.map(mapDbToMed);
  } catch (e: any) {
    if (isNetworkError(e)) {
      console.warn('Supabase unreachable (offline?), using local defaults.');
    } else {
      console.error('Error fetching meds, using defaults:', e.message || e);
    }
    return INITIAL_MEDICATIONS;
  }
};

export const saveMedication = async (med: Medication) => {
  const supabase = getSupabase();
  if (!supabase) return;

  // Prepare base object (always safe)
  const baseDbRow = {
    id: med.id,
    user_id: med.userId,
    name: med.name,
    dosage: med.dosage,
    timing: med.timing,
    frequency: med.frequency,
    notes: med.notes,
    icon: med.icon
  };

  // Prepare full object
  const fullDbRow = {
    ...baseDbRow,
    stock_quantity: med.stockQuantity,
    stock_threshold: med.stockThreshold,
    is_archived: med.isArchived,
    shared_id: med.sharedId,
    product_id: med.productId
  };

  try {
    // Attempt full save first
    const { error } = await supabase.from('medications').upsert(fullDbRow);
    
    if (error) {
      // Check for Schema error regarding missing columns
      const msg = error.message || '';
      if (msg.includes('product_id') || msg.includes('stock_quantity') || msg.includes('is_archived')) {
        console.warn('New columns missing in database. Saving basic medication data only (Fallback mode).');
        // Retry with safe payload
        const { error: retryError } = await supabase.from('medications').upsert(baseDbRow);
        if (retryError && !isNetworkError(retryError)) {
             console.error('Error saving medication (fallback failed):', retryError.message);
        }
      } else if (!isNetworkError(error)) {
        console.error('Error saving medication:', error.message);
      }
    } else {
      // Legacy Sync: If med has sharedId but NO productId, sync legacy stock
      if (med.sharedId && !med.productId && med.stockQuantity !== undefined) {
         await supabase
          .from('medications')
          .update({ stock_quantity: med.stockQuantity })
          .eq('shared_id', med.sharedId)
          .neq('id', med.id);
      }
    }
  } catch (e) {
    if (!isNetworkError(e)) console.error('Exception saving medication:', e);
  }
};

export const deleteMedication = async (medId: string) => {
  const supabase = getSupabase();
  if (!supabase) return;

  try {
    await supabase.from('logs').delete().eq('medication_id', medId);
    const { error } = await supabase.from('medications').delete().eq('id', medId);
    if (error && !isNetworkError(error)) console.error('Error deleting medication:', error.message);
  } catch (e) {
    if (!isNetworkError(e)) console.error('Exception deleting medication:', e);
  }
};

export const fetchLogs = async (): Promise<Record<string, boolean>> => {
  const supabase = getSupabase();
  if (!supabase) return {};

  try {
    const { data, error } = await supabase.from('logs').select('*');
    if (error) throw error;
    return mapDbToLog(data || []);
  } catch (e: any) {
    if (isNetworkError(e)) {
       console.warn('Supabase unreachable (offline?), cannot fetch logs.');
    }
    return {};
  }
};

export const toggleLog = async (date: string, medId: string, taken: boolean) => {
  const supabase = getSupabase();
  if (!supabase) return;

  try {
    if (taken) {
      const { data } = await supabase.from('logs').select('id').match({ date, medication_id: medId });
      
      if (!data || data.length === 0) {
        await supabase.from('logs').insert({ date, medication_id: medId, taken: true });
      }
    } else {
      await supabase.from('logs').delete().match({ date, medication_id: medId });
    }
  } catch (e) {
    if (!isNetworkError(e)) console.error('Exception toggling log:', e);
  }
};

export const updateStock = async (medId: string, change: number) => {
  const supabase = getSupabase();
  if (!supabase) return;

  try {
    // 1. Get the current medication to check for product_id OR shared_id
    const { data: med, error: fetchError } = await supabase
      .from('medications')
      .select('id, stock_quantity, shared_id, product_id')
      .eq('id', medId)
      .single();

    if (fetchError || !med) return;
    
    // NEW LOGIC: If linked to a product, update inventory table
    if (med.product_id) {
       // Fetch current product stock first (safer than RPC for now)
       const { data: prod } = await supabase.from('inventory').select('quantity').eq('id', med.product_id).single();
       if (prod) {
         const newQty = (prod.quantity || 0) + change;
         await supabase.from('inventory').update({ quantity: newQty }).eq('id', med.product_id);
       }
       return;
    }

    // LEGACY LOGIC: Update local medication table
    if (med.stock_quantity === null || med.stock_quantity === undefined) return;
    const newQuantity = med.stock_quantity + change;
    
    let query = supabase.from('medications').update({ stock_quantity: newQuantity });
    if (med.shared_id) {
      query = query.eq('shared_id', med.shared_id);
    } else {
      query = query.eq('id', medId);
    }
    await query;

  } catch (e) {
    console.error('Exception updating stock:', e);
  }
}

// Check if the database has the new columns
export const checkStockColumnsExist = async (): Promise<boolean> => {
  const supabase = getSupabase();
  if (!supabase) return false;
  
  try {
    // Try to select the new columns limiting to 1 row. 
    const { error } = await supabase
      .from('medications')
      .select('stock_quantity, stock_threshold, is_archived, shared_id, product_id')
      .limit(1);

    if (error) return false;
    
    return true;
  } catch (e) {
    return false;
  }
};

// Realtime Subscription
export const subscribeToChanges = (onUpdate: () => void) => {
  const supabase = getSupabase();
  if (!supabase) return null;

  try {
    const channel = supabase.channel('medicoppia_updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'logs' }, () => onUpdate())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'medications' }, () => onUpdate())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'inventory' }, () => onUpdate()) // Subscribe to inventory too
      .subscribe();

    return channel;
  } catch (e) {
    console.error('Error subscribing to changes:', e);
    return null;
  }
};
