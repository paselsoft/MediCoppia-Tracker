import { getSupabase } from './supabaseClient';
import { Medication, LogEntry } from '../types';
import { INITIAL_MEDICATIONS } from '../constants';

// --- Helpers ---

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
  stockThreshold: row.stock_threshold
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
        icon: med.icon
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

  try {
    const dbRow = {
      id: med.id,
      user_id: med.userId,
      name: med.name,
      dosage: med.dosage,
      timing: med.timing,
      frequency: med.frequency,
      notes: med.notes,
      icon: med.icon,
      stock_quantity: med.stockQuantity,
      stock_threshold: med.stockThreshold
    };

    const { error } = await supabase.from('medications').upsert(dbRow);
    if (error && !isNetworkError(error)) console.error('Error saving medication:', error.message);
  } catch (e) {
    if (!isNetworkError(e)) console.error('Exception saving medication:', e);
  }
};

export const deleteMedication = async (medId: string) => {
  const supabase = getSupabase();
  if (!supabase) return;

  try {
    // First delete associated logs to satisfy foreign key constraints (if not set to cascade)
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
    } else {
      console.error('Error fetching logs:', e.message || e);
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
        const { error } = await supabase.from('logs').insert({
          date: date,
          medication_id: medId,
          taken: true
        });
        if (error && !isNetworkError(error)) console.error('Error inserting log:', error.message);
      }
    } else {
      const { error } = await supabase.from('logs').delete().match({ date: date, medication_id: medId });
      if (error && !isNetworkError(error)) console.error('Error deleting log:', error.message);
    }
  } catch (e) {
    if (!isNetworkError(e)) console.error('Exception toggling log:', e);
  }
};

export const updateStock = async (medId: string, change: number) => {
  const supabase = getSupabase();
  if (!supabase) return;

  try {
    // We need to fetch current stock first to ensure atomic-like operation logic locally,
    // though for simple use case we trust the UI state or just decrement DB.
    // Better: use an RPC for atomic decrement, but for this app, fetch-then-update is acceptable.
    const { data: med, error: fetchError } = await supabase
      .from('medications')
      .select('stock_quantity')
      .eq('id', medId)
      .single();

    if (fetchError || !med || med.stock_quantity === null) return;

    const newQuantity = med.stock_quantity + change;
    
    const { error: updateError } = await supabase
      .from('medications')
      .update({ stock_quantity: newQuantity })
      .eq('id', medId);

    if (updateError && !isNetworkError(updateError)) console.error('Error updating stock:', updateError.message);

  } catch (e) {
    console.error('Exception updating stock:', e);
  }
}

// Realtime Subscription
export const subscribeToChanges = (onUpdate: () => void) => {
  const supabase = getSupabase();
  if (!supabase) return null;

  try {
    const channel = supabase.channel('medicoppia_updates')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'logs' },
        () => onUpdate()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'medications' },
        () => onUpdate()
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          // Connection established
        }
      });

    return channel;
  } catch (e) {
    console.error('Error subscribing to changes:', e);
    return null;
  }
};