
import React, { useState } from 'react';
import { InventoryItem } from '../types';
import { X, PackagePlus, ArrowRight, Save, Minus, Plus } from 'lucide-react';

interface RefillModalProps {
  item: InventoryItem;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (packs: number, totalUnits: number, newPackSize: number) => Promise<void>;
}

export const RefillModal: React.FC<RefillModalProps> = ({ item, isOpen, onClose, onConfirm }) => {
  const [packs, setPacks] = useState(1);
  const [currentPackSize, setCurrentPackSize] = useState(item.packSize || 30);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const totalToAdd = packs * currentPackSize;
  const newTotal = (item.quantity || 0) + totalToAdd;

  const handleConfirm = async () => {
    setIsSubmitting(true);
    await onConfirm(packs, totalToAdd, currentPackSize);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-sm shadow-2xl flex flex-col transition-colors">
        
        {/* Header */}
        <div className="p-5 rounded-t-3xl flex justify-between items-center bg-green-600 text-white shadow-lg">
          <div className="flex items-center gap-2">
            <PackagePlus className="w-6 h-6" />
            <h2 className="text-xl font-bold">Rifornimento</h2>
          </div>
          <button onClick={onClose} className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="text-center">
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">{item.name}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Scorta attuale: <span className="font-bold text-gray-800 dark:text-gray-200">{item.quantity}</span></p>
          </div>

          {/* Config Pack Size */}
          <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl border border-gray-100 dark:border-gray-600">
            <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase block mb-2">Formato Confezione (Unità/ml)</label>
            <div className="flex items-center gap-3">
               <input 
                 type="number" 
                 value={currentPackSize}
                 onChange={(e) => setCurrentPackSize(parseInt(e.target.value) || 0)}
                 className="flex-1 px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-center font-bold text-lg dark:text-white"
               />
               <span className="text-sm text-gray-500 dark:text-gray-400">pz/ml</span>
            </div>
            <p className="text-[10px] text-gray-400 mt-2">
               Modifica questo valore se il formato è cambiato (es. da 30 a 50).
            </p>
          </div>

          {/* Quantity Selector */}
          <div>
            <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase block mb-2 text-center">Quante confezioni hai comprato?</label>
            <div className="flex items-center justify-center gap-4">
              <button 
                onClick={() => setPacks(Math.max(1, packs - 1))}
                className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center justify-center text-gray-600 dark:text-gray-300 transition-colors"
              >
                <Minus className="w-5 h-5" />
              </button>
              <span className="text-3xl font-bold text-gray-800 dark:text-white w-12 text-center">{packs}</span>
              <button 
                 onClick={() => setPacks(packs + 1)}
                 className="w-12 h-12 rounded-full bg-green-50 dark:bg-green-900/30 hover:bg-green-100 dark:hover:bg-green-900/50 flex items-center justify-center text-green-600 dark:text-green-400 transition-colors"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Summary */}
          <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-100 dark:border-green-900/40">
             <div className="text-center">
               <span className="block text-xs text-green-600 dark:text-green-400 font-bold uppercase">Attuale</span>
               <span className="text-xl font-bold text-green-800 dark:text-green-200">{item.quantity}</span>
             </div>
             <ArrowRight className="text-green-400" />
             <div className="text-center">
               <span className="block text-xs text-green-600 dark:text-green-400 font-bold uppercase">Aggiungo</span>
               <span className="text-xl font-bold text-green-800 dark:text-green-200">+{totalToAdd}</span>
             </div>
             <ArrowRight className="text-green-400" />
             <div className="text-center">
               <span className="block text-xs text-green-600 dark:text-green-400 font-bold uppercase">Nuovo Totale</span>
               <span className="text-xl font-bold text-green-800 dark:text-green-200">{newTotal}</span>
             </div>
          </div>

          <button
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="w-full py-3.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-lg shadow-lg shadow-green-200 dark:shadow-none flex items-center justify-center gap-2 active:scale-95 transition-transform"
          >
            {isSubmitting ? 'Salvataggio...' : (
              <>
                <Save className="w-5 h-5" /> Conferma Rifornimento
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
