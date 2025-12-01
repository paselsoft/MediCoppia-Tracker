import React, { useState } from 'react';
import { Database, ShieldCheck, Loader2, AlertCircle } from 'lucide-react';
import { SupabaseConfig } from '../types';
import { createTempClient } from '../services/supabaseClient';

interface SupabaseConfigModalProps {
  onSave: (config: SupabaseConfig) => void;
}

export const SupabaseConfigModal: React.FC<SupabaseConfigModalProps> = ({ onSave }) => {
  const [url, setUrl] = useState('');
  const [key, setKey] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsTesting(true);

    const cleanUrl = url.trim();
    const cleanKey = key.trim();

    if (!cleanUrl.startsWith('https://')) {
      setErrorMsg('L\'URL deve iniziare con https://');
      setIsTesting(false);
      return;
    }

    try {
      // Test the connection
      const tempClient = createTempClient(cleanUrl, cleanKey);
      if (!tempClient) {
        throw new Error('Configurazione non valida');
      }

      // Try a simple fetch to verify access
      const { error } = await tempClient.from('medications').select('count', { count: 'exact', head: true });
      
      if (error) {
        console.error("Test connection error:", error);
        throw new Error('Impossibile connettersi. Controlla URL e Key.');
      }

      // If success, save
      onSave({ url: cleanUrl, key: cleanKey });
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Errore di connessione');
      setIsTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-gray-900 bg-opacity-90">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="bg-emerald-600 p-6 text-center">
          <Database className="w-12 h-12 text-white mx-auto mb-2" />
          <h2 className="text-xl font-bold text-white">Configurazione Cloud</h2>
          <p className="text-emerald-100 text-sm mt-1">Connetti MediCoppia al database</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <p className="text-sm text-gray-500 text-center mb-4">
            Per sincronizzare i dati tra i telefoni di Paolo e Barbara, inserisci i dettagli del progetto Supabase.
          </p>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase">Project URL</label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none"
              placeholder="https://xyz.supabase.co"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase">API Key (Public/Anon)</label>
            <input
              type="text"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none"
              placeholder="eyJhbGciOiJIUzI1..."
              required
            />
          </div>

          {errorMsg && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {errorMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={isTesting}
            className={`
              w-full py-4 font-bold rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2 mt-4
              ${isTesting ? 'bg-gray-200 text-gray-400' : 'bg-emerald-600 text-white hover:bg-emerald-700'}
            `}
          >
            {isTesting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Verifica in corso...
              </>
            ) : (
              <>
                <ShieldCheck className="w-5 h-5" />
                Connetti e Inizia
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};