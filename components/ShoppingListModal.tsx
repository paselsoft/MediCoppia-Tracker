
import React, { useMemo } from 'react';
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

  // Raggruppa i medicinali con scorte basse evitando duplicati per prodotti condivisi
  const uniqueItems = useMemo(() => {
    // 1. Filtra i medicinali sotto soglia e non archiviati
    const lowStock = medications.filter(med => 
      !med.isArchived &&
      med.stockQuantity !== undefined && 
      med.stockThreshold !== undefined && 
      med.stockQuantity <= med.stockThreshold
    );

    const grouped: Array<{
      key: string;
      name: string;
      stockQuantity: number;
      users: UserID[];
    }> = [];

    lowStock.forEach(med => {
      // Determina la chiave di raggruppamento (Prodotto fisico o ID condiviso)
      let key = med.id; // Default: medicinale singolo
      if (med.productId) {
        key = `prod_${med.productId}`;
      } else if (med.sharedId) {
        key = `shared_${med.sharedId}`;
      }
      
      // Controlla se abbiamo già inserito questo prodotto
      const existing = grouped.find(g => g.key === key);
      
      if (existing) {
        // Se esiste già, aggiungi l'utente alla lista se non presente (es. Paolo e Barbara)
        if (!existing.users.includes(med.userId)) {
          existing.users.push(med.userId);
        }
      } else {
        // Crea nuova voce
        grouped.push({
          key,
          name: med.name,
          stockQuantity: med.stockQuantity!,
          users: [med.userId]
        });
      }
    });

    return grouped;
  }, [medications]);

  const generateWhatsAppMessage = () => {
    if (uniqueItems.length === 0) return;

    const itemsList = uniqueItems
      .map(m => `- ${m.name} (ne restano ${m.stockQuantity})`)
      .join('\n');
      
    const text = `🛒 *Lista Farmacia MediCoppia*\n\nAmore, serve comprare:\n${itemsList}`;
    const encoded = encodeURIComponent(text);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  const copyToClipboard = () => {
    const itemsList = uniqueItems.map(m => `- ${m.name}`).join('\n');
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
          {uniqueItems.length === 0 ? (
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
              {uniqueItems.map(item => {
                return (
                  <div key={item.key} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                       {/* Stack Avatar Utenti */}
                       <div className="flex -space-x-2">
                         {item.users.map(uid => (
                           <img 
                             key={uid}
                             src={USERS[uid].avatar} 
                             className="w-8 h-8 rounded-full bg-white dark:bg-gray-600 border-2 border-white dark:border-gray-700 relative z-10" 
                             alt={USERS[uid].name} 
                           />
                         ))}
                       </div>
                       
                       <div>
                         <h3 className="font-bold text-gray-800 dark:text-gray-200 text-sm">{item.name}</h3>
                         <p className="text-xs text-red-500 dark:text-red-400 font-semibold">
                           Ne restano: {item.stockQuantity}
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
        {uniqueItems.length > 0 && (
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
