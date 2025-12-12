
import React, { useState } from 'react';
import { InventoryItem } from '../types';
import { X, Save, Package, Trash2, Ruler, Hash, AlertTriangle } from 'lucide-react';

interface EditInventoryModalProps {
  item: InventoryItem;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedItem: InventoryItem) => Promise<void>;
  onDelete?: (itemId: string) => Promise<void>;
}

export const EditInventoryModal: React.FC<EditInventoryModalProps> = ({ 
  item, 
  isOpen, 
  onClose, 
  onSave,
  onDelete
}) => {
  const [formData, setFormData] = useState<InventoryItem>({ ...item });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSave = async () => {
    setIsSubmitting(true);
    await onSave(formData);
    setIsSubmitting(false);
    onClose();
  };

  const handleDelete = async () => {
    if (onDelete && window.confirm(`Sei sicuro di voler eliminare "${item.name}" dalla dispensa?`)) {
        setIsSubmitting(true);
        await onDelete(item.id);
        setIsSubmitting(false);
        onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-sm shadow-2xl flex flex-col transition-colors">
        
        <div className="p-5 rounded-t-3xl flex justify-between items-center bg-gray-800 dark:bg-gray-700 text-white shadow-lg">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            <h2 className="text-lg font-bold">Modifica Prodotto</h2>
          </div>
          <button onClick={onClose} className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          
          {/* Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase">Nome Prodotto</label>
            <input 
              type="text" 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 font-bold text-gray-800 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Quantity (Manual Correction) */}
            <div className="space-y-1.5">
                <label className="text-xs font-bold text-orange-500 uppercase flex items-center gap-1">
                    <Hash className="w-3 h-3" /> Q.tà Attuale
                </label>
                <input 
                    type="number" 
                    value={formData.quantity}
                    onChange={(e) => setFormData({...formData, quantity: parseFloat(e.target.value) || 0})}
                    className="w-full px-4 py-3 rounded-xl bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 font-bold text-xl text-orange-800 dark:text-orange-200 text-center"
                />
            </div>

             {/* Unit */}
             <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase flex items-center gap-1">
                    <Ruler className="w-3 h-3" /> Unità
                </label>
                <input 
                    type="text" 
                    value={formData.unit || ''}
                    onChange={(e) => setFormData({...formData, unit: e.target.value})}
                    placeholder="es. ml, cps"
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-center"
                />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             {/* Pack Size */}
             <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase">Conf. Standard</label>
                <input 
                    type="number" 
                    value={formData.packSize || 0}
                    onChange={(e) => setFormData({...formData, packSize: parseFloat(e.target.value) || 0})}
                    className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600"
                />
            </div>

            {/* Threshold */}
            <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> Soglia Avviso
                </label>
                <input 
                    type="number" 
                    value={formData.threshold}
                    onChange={(e) => setFormData({...formData, threshold: parseFloat(e.target.value) || 0})}
                    className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600"
                />
            </div>
          </div>

          <p className="text-xs text-gray-400 text-center leading-relaxed">
            Usa "Q.tà Attuale" per correggere errori di inventario (es. conteggio manuale).
          </p>

          <div className="flex gap-3 pt-2">
            {onDelete && (
                <button 
                    onClick={handleDelete}
                    className="p-3.5 bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/40"
                >
                    <Trash2 className="w-5 h-5" />
                </button>
            )}
            <button
                onClick={handleSave}
                disabled={isSubmitting}
                className="flex-1 py-3.5 bg-gray-800 hover:bg-gray-900 dark:bg-white dark:hover:bg-gray-200 text-white dark:text-gray-900 rounded-xl font-bold shadow-lg flex items-center justify-center gap-2"
            >
                <Save className="w-5 h-5" /> Salva Correzioni
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
