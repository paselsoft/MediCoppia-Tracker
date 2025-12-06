
import React, { useState, useEffect } from 'react';
import { Medication, UserProfile, Frequency, InventoryItem } from '../types';
import { X, Save, Clock, Pill, FileText, Trash2, Droplets, Calendar, Type, Mail, Package, PauseCircle, PlayCircle, Users, Link as LinkIcon, PlusCircle, Check } from 'lucide-react';
import { differenceInDays } from 'date-fns';

interface EditMedicationModalProps {
  medication: Medication;
  inventory?: InventoryItem[]; // List of available products
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedMed: Medication) => void;
  onSaveInventory?: (item: InventoryItem) => Promise<string | null>; // Callback to create/update inventory
  onDelete?: (medId: string) => void;
  userTheme: UserProfile;
  isNew?: boolean;
}

export const EditMedicationModal: React.FC<EditMedicationModalProps> = ({
  medication,
  inventory = [],
  isOpen,
  onClose,
  onSave,
  onSaveInventory,
  onDelete,
  userTheme,
  isNew = false
}) => {
  const [formData, setFormData] = useState<Partial<Medication>>({
    name: '',
    dosage: '',
    timing: '',
    frequency: Frequency.DAILY,
    notes: '',
    icon: 'pill',
    stockQuantity: undefined,
    stockThreshold: 5,
    isArchived: false,
    sharedId: undefined,
    productId: undefined
  });

  // State for Inventory linking
  const [stockMode, setStockMode] = useState<'none' | 'linked'>('none');
  const [selectedProduct, setSelectedProduct] = useState<InventoryItem | 'new' | null>(null);
  const [newProductData, setNewProductData] = useState({ name: '', quantity: 0, threshold: 5 });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: medication.name,
        dosage: medication.dosage,
        timing: medication.timing,
        frequency: medication.frequency,
        notes: medication.notes || '',
        icon: medication.icon || 'pill',
        stockQuantity: medication.stockQuantity,
        stockThreshold: medication.stockThreshold || 5,
        isArchived: medication.isArchived || false,
        sharedId: medication.sharedId,
        productId: medication.productId
      });

      // Initialize stock mode
      if (medication.productId) {
        setStockMode('linked');
        const prod = inventory.find(i => i.id === medication.productId);
        setSelectedProduct(prod || null);
        if (prod) setNewProductData({ name: prod.name, quantity: prod.quantity, threshold: prod.threshold });
      } else if (medication.stockQuantity !== undefined && medication.stockQuantity !== null) {
        // Legacy stock mode - maybe we should encourage conversion?
        // For now, treat as unlinked but don't show UI for legacy stock, force user to link if they want stock
        setStockMode('none'); 
      } else {
        setStockMode('none');
      }
    }
  }, [medication, isOpen, inventory]);

  if (!isOpen) return null;

  const daysSinceEpoch = differenceInDays(new Date(), new Date(2024, 0, 1));
  const isEvenDay = daysSinceEpoch % 2 === 0;
  
  const freqEvenLabel = isEvenDay ? "Sì, Oggi" : "No, Domani";
  const freqOddLabel = !isEvenDay ? "Sì, Oggi" : "No, Domani";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let finalProductId = formData.productId;
    let finalStockQty = undefined;
    let finalStockThreshold = undefined;

    // Handle Inventory Logic
    if (stockMode === 'linked' && onSaveInventory) {
      if (selectedProduct === 'new') {
        // Create new product
        const newId = crypto.randomUUID();
        const createdId = await onSaveInventory({
          id: newId,
          name: newProductData.name || formData.name || 'Nuovo Prodotto',
          quantity: newProductData.quantity,
          threshold: newProductData.threshold
        });
        finalProductId = createdId || undefined;
      } else if (selectedProduct) {
        // Use existing product (we assume we don't update it here unless we add logic for it)
        finalProductId = selectedProduct.id;
        // Optionally update the existing product values if changed?
        if (selectedProduct.quantity !== newProductData.quantity || selectedProduct.threshold !== newProductData.threshold) {
             await onSaveInventory({
                ...selectedProduct,
                quantity: newProductData.quantity,
                threshold: newProductData.threshold
             });
        }
      }
    } else {
       finalProductId = undefined;
    }

    onSave({
      ...medication,
      name: formData.name || 'Nuovo Medicinale',
      dosage: formData.dosage || '',
      timing: formData.timing || '',
      frequency: formData.frequency as Frequency,
      notes: formData.notes,
      icon: formData.icon as any,
      isArchived: formData.isArchived,
      stockQuantity: finalStockQty, // We clear legacy fields if moving to new system
      stockThreshold: finalStockThreshold,
      sharedId: undefined, // Deprecate sharedId
      productId: finalProductId
    });
    onClose();
  };

  const handleArchiveToggle = () => {
    setFormData({ ...formData, isArchived: !formData.isArchived });
  };

  const handleDelete = () => {
    if (onDelete && window.confirm("Sei sicuro di voler eliminare questo farmaco?")) {
      onDelete(medication.id);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-sm shadow-2xl flex flex-col max-h-[90vh] transition-colors">
        
        {/* Header */}
        <div className={`p-5 rounded-t-3xl flex justify-between items-center ${userTheme.themeColor} text-white shadow-lg z-10`}>
          <h2 className="text-xl font-bold">{isNew ? 'Nuovo Medicinale' : 'Modifica'}</h2>
          <button onClick={onClose} className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Content */}
        <div className="overflow-y-auto p-6 space-y-5 no-scrollbar">
          
          {/* Active/Archive Status */}
          {!isNew && (
            <div 
              onClick={handleArchiveToggle}
              className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${formData.isArchived ? 'bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600' : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-900/40'}`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${formData.isArchived ? 'bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-300' : 'bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400'}`}>
                  {formData.isArchived ? <PauseCircle className="w-5 h-5" /> : <PlayCircle className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className={`font-bold text-sm ${formData.isArchived ? 'text-gray-700 dark:text-gray-300' : 'text-green-800 dark:text-green-300'}`}>
                    {formData.isArchived ? 'Terapia Sospesa' : 'Terapia Attiva'}
                  </h3>
                  <p className="text-xs opacity-70 dark:text-gray-400">
                    {formData.isArchived ? 'Non visibile nel piano giornaliero.' : 'Visibile nel piano giornaliero.'}
                  </p>
                </div>
              </div>
              <div className={`w-10 h-6 rounded-full p-1 transition-colors ${!formData.isArchived ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
                <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform ${!formData.isArchived ? 'translate-x-4' : 'translate-x-0'}`} />
              </div>
            </div>
          )}

          {/* Name Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
              <Type className="w-3.5 h-3.5" /> Nome Farmaco
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-4 py-3.5 rounded-2xl bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-opacity-50 focus:ring-blue-500 transition-all font-bold text-lg text-gray-800 dark:text-white placeholder-gray-300"
              placeholder="Es. Tachipirina"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
                <Pill className="w-3.5 h-3.5" /> Dosaggio
              </label>
              <input
                type="text"
                value={formData.dosage}
                onChange={(e) => setFormData({...formData, dosage: e.target.value})}
                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-opacity-50 focus:ring-blue-500 transition-all font-medium text-gray-800 dark:text-gray-200"
                placeholder="Es. 1 cps"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> Orario
              </label>
              <input
                type="text"
                value={formData.timing}
                onChange={(e) => setFormData({...formData, timing: e.target.value})}
                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-opacity-50 focus:ring-blue-500 transition-all font-medium text-gray-800 dark:text-gray-200"
                placeholder="Es. Mattina"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" /> Frequenza
            </label>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => setFormData({...formData, frequency: Frequency.DAILY})}
                className={`py-3 px-4 rounded-xl text-sm font-semibold text-left transition-all border ${formData.frequency === Frequency.DAILY ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300' : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400'}`}
              >
                Ogni Giorno
              </button>
              
              <div className="grid grid-cols-2 gap-2">
                 <button
                  type="button"
                  onClick={() => setFormData({...formData, frequency: Frequency.ALTERNATE_DAYS})}
                  className={`py-3 px-3 rounded-xl text-sm font-semibold text-left transition-all border flex flex-col ${formData.frequency === Frequency.ALTERNATE_DAYS ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300' : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400'}`}
                >
                  <span>Giorni Alterni (A)</span>
                  <span className={`text-[10px] mt-0.5 ${isEvenDay ? 'text-green-600 dark:text-green-400 font-bold' : 'text-gray-400'}`}>Inizia: {freqEvenLabel}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({...formData, frequency: Frequency.ALTERNATE_DAYS_ODD})}
                  className={`py-3 px-3 rounded-xl text-sm font-semibold text-left transition-all border flex flex-col ${formData.frequency === Frequency.ALTERNATE_DAYS_ODD ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300' : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400'}`}
                >
                  <span>Giorni Alterni (B)</span>
                  <span className={`text-[10px] mt-0.5 ${!isEvenDay ? 'text-green-600 dark:text-green-400 font-bold' : 'text-gray-400'}`}>Inizia: {freqOddLabel}</span>
                </button>
              </div>
            </div>
          </div>

           {/* VIRTUAL PHARMACY / INVENTORY SECTION */}
           <div className="p-4 rounded-xl bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-900/50">
             <div className="flex items-center justify-between mb-3">
               <label className="text-xs font-bold text-orange-700 dark:text-orange-400 uppercase tracking-wide flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5" /> Magazzino & Scorte
               </label>
               <button
                  type="button"
                  onClick={() => setStockMode(stockMode === 'none' ? 'linked' : 'none')}
                  className={`w-10 h-6 rounded-full p-1 transition-colors ${stockMode !== 'none' ? 'bg-orange-500' : 'bg-gray-300 dark:bg-gray-600'}`}
               >
                 <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform ${stockMode !== 'none' ? 'translate-x-4' : 'translate-x-0'}`} />
               </button>
             </div>
             
             {stockMode === 'linked' && (
               <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                 
                 {/* Product Selector */}
                 <div className="space-y-1">
                   <label className="text-[10px] font-bold text-orange-600 dark:text-orange-400 block">Prodotto Collegato</label>
                   <select
                     value={selectedProduct === 'new' ? 'new' : (selectedProduct?.id || '')}
                     onChange={(e) => {
                       const val = e.target.value;
                       if (val === 'new') {
                         setSelectedProduct('new');
                         setNewProductData({ name: formData.name || '', quantity: 0, threshold: 5 });
                       } else {
                         const prod = inventory.find(i => i.id === val);
                         setSelectedProduct(prod || null);
                         if (prod) setNewProductData({ name: prod.name, quantity: prod.quantity, threshold: prod.threshold });
                       }
                     }}
                     className="w-full px-3 py-2 rounded-lg border border-orange-200 dark:border-orange-800 bg-white dark:bg-gray-700 text-gray-800 dark:text-white text-sm focus:outline-none"
                   >
                     <option value="">-- Seleziona Prodotto --</option>
                     {inventory.map(item => (
                       <option key={item.id} value={item.id}>{item.name}</option>
                     ))}
                     <option value="new">+ Crea Nuovo Prodotto</option>
                   </select>
                 </div>

                 {/* Product Details (Editable) */}
                 {(selectedProduct) && (
                   <div className="bg-white/50 dark:bg-black/20 p-3 rounded-lg border border-orange-100 dark:border-orange-900/30 space-y-3">
                      {selectedProduct === 'new' && (
                        <div className="space-y-1">
                           <span className="text-[10px] font-bold text-orange-600 dark:text-orange-400 block">Nome Prodotto</span>
                           <input 
                             type="text" 
                             value={newProductData.name}
                             onChange={(e) => setNewProductData({...newProductData, name: e.target.value})}
                             className="w-full px-2 py-1.5 rounded text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600"
                             placeholder="Es. Uncaria 60cps"
                           />
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold text-orange-600 dark:text-orange-400 block">Q.tà Attuale</span>
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                value={newProductData.quantity}
                                onChange={(e) => setNewProductData({...newProductData, quantity: parseInt(e.target.value) || 0})}
                                className="w-full px-2 py-1.5 rounded text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 font-bold text-orange-800 dark:text-orange-100"
                              />
                            </div>
                          </div>
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold text-orange-600 dark:text-orange-400 block">Avviso Sotto</span>
                            <input
                              type="number"
                              value={newProductData.threshold}
                              onChange={(e) => setNewProductData({...newProductData, threshold: parseInt(e.target.value) || 0})}
                              className="w-full px-2 py-1.5 rounded text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600"
                            />
                          </div>
                      </div>
                      <div className="text-[10px] text-gray-400 leading-tight">
                        {selectedProduct !== 'new' 
                          ? "Modificando questi valori aggiornerai la scorta per TUTTI i medicinali collegati a questo prodotto." 
                          : "Verrà creato un nuovo prodotto in magazzino."}
                      </div>
                   </div>
                 )}
               </div>
             )}
             {stockMode === 'none' && (
               <p className="text-xs text-orange-400 dark:text-orange-500/70">Attiva per collegare a un prodotto e tracciare la scorta.</p>
             )}
           </div>

          {/* Icon Selector */}
          <div className="space-y-1.5">
             <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide">Icona</label>
             <div className="grid grid-cols-4 gap-2">
                {['pill', 'drop', 'clock', 'sachet'].map((ic) => (
                  <button
                    key={ic}
                    type="button"
                    onClick={() => setFormData({...formData, icon: ic as any})}
                    className={`aspect-square rounded-xl border flex items-center justify-center transition-all ${formData.icon === ic ? `border-${userTheme.themeColor.replace('bg-', '')} bg-${userTheme.themeColor.replace('bg-', '')}/10 text-${userTheme.themeColor.replace('bg-', '')}` : 'border-gray-200 dark:border-gray-600 text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                  >
                    {ic === 'pill' && <Pill className="w-5 h-5" />}
                    {ic === 'drop' && <Droplets className="w-5 h-5" />}
                    {ic === 'clock' && <Clock className="w-5 h-5" />}
                    {ic === 'sachet' && <Mail className="w-5 h-5" />}
                  </button>
                ))}
             </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" /> Note (Opzionale)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              rows={2}
              className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-opacity-50 focus:ring-blue-500 transition-all font-medium text-gray-800 dark:text-white resize-none"
              placeholder="Note aggiuntive..."
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 rounded-b-3xl flex gap-3">
           {!isNew && (
             <button
                type="button"
                onClick={handleDelete}
                className="p-4 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
             >
               <Trash2 className="w-5 h-5" />
             </button>
           )}
           <button
             type="button"
             onClick={handleSubmit}
             className={`flex-1 py-3 px-6 rounded-xl text-white font-bold shadow-lg shadow-blue-100 dark:shadow-none flex items-center justify-center gap-2 ${userTheme.themeColor} active:scale-95 transition-transform`}
           >
             <Save className="w-5 h-5" />
             {isNew ? 'Crea Medicinale' : 'Salva Modifiche'}
           </button>
        </div>

      </div>
    </div>
  );
};
