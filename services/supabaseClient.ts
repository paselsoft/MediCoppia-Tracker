import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SupabaseConfig } from '../types';
import { SUPABASE_CREDENTIALS } from '../constants';

let supabase: SupabaseClient | null = null;

export const initSupabase = (config?: SupabaseConfig) => {
  try {
    // Priority: Argument Config -> Hardcoded Constant
    const cfg = config || SUPABASE_CREDENTIALS;
    
    // Ensure URL is clean before creating client
    const cleanUrl = cfg.url.trim().replace(/\/$/, '');
    const cleanKey = cfg.key.trim();
    
    if (!cleanUrl.startsWith('https://')) {
      console.warn('Invalid Supabase URL: must start with https://');
      return null;
    }

    supabase = createClient(cleanUrl, cleanKey);
    return supabase;
  } catch (error) {
    console.error("Invalid Supabase Config", error);
    return null;
  }
};

// Create a temporary client just for testing connection
export const createTempClient = (url: string, key: string) => {
  try {
    const cleanUrl = url.trim().replace(/\/$/, '');
    const cleanKey = key.trim();
    return createClient(cleanUrl, cleanKey);
  } catch (e) {
    return null;
  }
};

export const getSupabase = () => {
  if (!supabase) {
    initSupabase();
  }
  return supabase;
};

// Always return true now that we have hardcoded credentials
export const hasSupabaseConfig = (): boolean => {
  return true; 
};

export const getStoredConfig = (): SupabaseConfig | null => {
  return SUPABASE_CREDENTIALS;
};

export const saveConfig = (config: SupabaseConfig) => {
  // No-op: we are using constants now, but keeping function signature for compatibility
  console.log("Config update requested but using hardcoded constants.");
};