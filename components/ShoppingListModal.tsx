import React from 'react';
import { X, ShoppingCart, Share, Copy, MessageCircle } from 'lucide-react';
import { Medication, UserID } from '../types';
import { USERS } from '../constants';

interface ShoppingListModalProps {
  medications: Medication[];
  isOpen: boolean;
  onClose: () => void;
}

export const ShoppingListModal: React.FC<ShoppingListModalProps> = ({
  medications,
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  // Filter low stock medications
  const lowStockItems = medications.filter(med => 
    med.stockQuantity !== undefined && 
    med.stockThreshold !== undefined && 
    med.stockQuantity <= med.stockThreshold
  );

  const generateWhatsAppMessage = () => {
    if (lowStockItems.length === 0) return;

    const itemsList = lowStockItems
      .map(m => `- ${m.name} (ne restano ${m.stockQuantity})`)
      .join('\n');
      
    const text = `🛒 *Lista Farmacia MediCoppia*\n\nAmore, serve comprare:\n${itemsList}`;
    const encoded = encodeURIComponent(text);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  const copyToClipboard = () => {
    const itemsList = lowStockItems.map(m => `- ${m.name}`).join('\n');
    const text = `Lista Farmacia:\n${itemsList}`;
    navigator.clipboard.writeText(text);
    alert('Lista copiata negli appunti!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-sm shadow-2xl flex flex-col max-h-[85vh] transition-colors">
        
        {/* Header */}
        <div className="p-5 rounded-t-3xl flex justify-between items-center bg-emerald-600 text-white shadow-lg z-10">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-6 h-6" />
            <h2 className="text-xl font-bold">Lista Spesa</h2>
          </div>
          <button onClick={onClose} className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6 space-y-4 no-scrollbar flex-1">
          {lowStockItems.length === 0 ? (
            <div className="text-center py-10 opacity-60">
              <ShoppingCart className="w-16 h-16 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
              <p className="text-gray-500 dark:text-gray-400 font-medium">Tutto a posto!</p>
              <p className="text-sm text-gray-400 dark:text-gray-500">Le scorte sono sufficienti.</p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                I seguenti medicinali sono sotto la soglia minima:
              </p>
              {lowStockItems.map(med => {
                const user = USERS[med.userId];
                return (
                  <div key={med.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                       <img src={user.avatar} className="w-8 h-8 rounded-full bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500" alt={user.name} />
                       <div>
                         <h3 className="font-bold text-gray-800 dark:text-gray-200 text-sm">{med.name}</h3>
                         <p className="text-xs text-red-500 dark:text-red-400 font-semibold">
                           Ne restano: {med.stockQuantity}
                         </p>
                       </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {lowStockItems.length > 0 && (
          <div className="p-5 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 rounded-b-3xl grid grid-cols-2 gap-3">
             <button
                onClick={copyToClipboard}
                className="py-3 px-4 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-xl font-bold text-sm hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center justify-center gap-2"
             >
               <Copy className="w-4 h-4" /> Copia
             </button>
             <button
               onClick={generateWhatsAppMessage}
               className="py-3 px-4 bg-[#25D366] text-white rounded-xl font-bold text-sm shadow-lg shadow-green-100 dark:shadow-none hover:bg-[#20bd5a] flex items-center justify-center gap-2 active:scale-95 transition-transform"
             >
               <MessageCircle className="w-4 h-4" /> Invia WA
             </button>
          </div>
        )}
      </div>
    </div>
  );
};