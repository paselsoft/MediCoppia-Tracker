
import React, { useEffect, useState } from 'react';
import { InventoryLog } from '../types';
import { fetchInventoryLogs } from '../services/storageService';
import { X, History, Calendar, Package } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

interface InventoryHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InventoryHistoryModal: React.FC<InventoryHistoryModalProps> = ({ isOpen, onClose }) => {
  const [logs, setLogs] = useState<InventoryLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      fetchInventoryLogs().then(data => {
        setLogs(data);
        setLoading(false);
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-md shadow-2xl flex flex-col max-h-[85vh] transition-colors">
        
        <div className="p-5 rounded-t-3xl flex justify-between items-center bg-blue-600 text-white shadow-lg">
          <div className="flex items-center gap-2">
            <History className="w-6 h-6" />
            <h2 className="text-xl font-bold">Storico Rifornimenti</h2>
          </div>
          <button onClick={onClose} className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto p-4 flex-1 no-scrollbar">
          {loading ? (
             <div className="text-center py-10 text-gray-400">Caricamento...</div>
          ) : logs.length === 0 ? (
             <div className="text-center py-10 text-gray-400">Nessun rifornimento recente.</div>
          ) : (
            <div className="space-y-3">
               {logs.map(log => (
                 <div key={log.id} className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-gray-800 dark:text-gray-200">{log.productName}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                         <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {format(new Date(log.date), 'd MMM HH:mm', { locale: it })}</span>
                         <span className="flex items-center gap-1"><Package className="w-3 h-3" /> {log.packsAdded} confezioni</span>
                      </div>
                    </div>
                    <div className="text-green-600 dark:text-green-400 font-bold text-lg">
                      +{log.amountAdded}
                    </div>
                 </div>
               ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
