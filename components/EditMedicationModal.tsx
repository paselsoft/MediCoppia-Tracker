import React, { useState, useEffect } from 'react';
import { Medication, UserProfile, Frequency } from '../types';
import { X, Save, Clock, Pill, FileText, Trash2, Droplets, Calendar, Type, Mail, Package, AlertTriangle, PauseCircle, PlayCircle, Users, PlusCircle, CheckCircle2 } from 'lucide-react';
import { differenceInDays } from 'date-fns';

interface EditMedicationModalProps {
  medication: Medication;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedMed: Medication) => void;
  onDelete?: (medId: string) => void;
  userTheme: UserProfile;
  isNew?: boolean;
}

export const EditMedicationModal: React.FC<EditMedicationModalProps> = ({
  medication,
  isOpen,
  onClose,
  onSave,
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
    sharedId: undefined
  });

  const [enableStock, setEnableStock] = useState(false);
  const [isShared, setIsShared] = useState(false);
  
  // State for Quick Refill
  const [isRefillMode, setIsRefillMode] = useState(false);
  const [refillAmount, setRefillAmount] = useState('');

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
        sharedId: medication.sharedId
      });
      setEnableStock(medication.stockQuantity !== undefined && medication.stockQuantity !== null);
      setIsShared(!!medication.sharedId);
      setIsRefillMode(false);
      setRefillAmount('');
    }
  }, [medication, isOpen]);

  if (!isOpen) return null;

  // Determine which Alternate Day option corresponds to "Today"
  const daysSinceEpoch = differenceInDays(new Date(), new Date(2024, 0, 1));
  const isEvenDay = daysSinceEpoch % 2 === 0;
  
  const freqEvenLabel = isEvenDay ? "Sì, Oggi" : "No, Domani";
  const freqOddLabel = !isEvenDay ? "Sì, Oggi" : "No, Domani";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Generate shared ID if shared is enabled
    // We use a simple slug of the name: "Vitamin C" -> "vitamin-c"
    const nameSlug = formData.name ? formData.name.toLowerCase().trim().replace(/\s+/g, '-') : undefined;
    const finalSharedId = (enableStock && isShared && nameSlug) ? nameSlug : undefined;

    onSave({
      ...medication, // Keep ID and UserId
      name: formData.name || 'Nuovo Medicinale',
      dosage: formData.dosage || '',
      timing: formData.timing || '',
      frequency: formData.frequency as Frequency,
      notes: formData.notes,
      icon: formData.icon as 'pill' | 'drop' | 'clock' | 'sachet',
      // If stock is not enabled, explicitly set to undefined so we don't send garbage
      stockQuantity: enableStock ? formData.stockQuantity : undefined,
      stockThreshold: enableStock ? formData.stockThreshold : undefined,
      isArchived: formData.isArchived,
      sharedId: finalSharedId
    });
    onClose();
  };

  const handleRefillSubmit = () => {
    const amountToAdd = parseInt(refillAmount);
    if (!isNaN(amountToAdd) && amountToAdd > 0) {
      const currentStock = formData.stockQuantity || 0;
      setFormData({ ...formData, stockQuantity: currentStock + amountToAdd });
      setIsRefillMode(false);
      setRefillAmount('');
    }
  };

  const handleDelete = () => {
    if (confirm('Sei sicuro di voler eliminare questo medicinale?')) {
      if (onDelete) onDelete(medication.id);
      onClose();
    }
  };

  const handleArchiveToggle = () => {
    setFormData({ ...formData, isArchived: !formData.isArchived });
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
          
          {/* Active/Archive Status - ONLY IF NOT NEW */}
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
                    {formData.isArchived ? 'Il farmaco non appare nella lista giornaliera.' : 'Il farmaco è visibile nel piano giornaliero.'}
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
            {/* Dosage Input */}
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

            {/* Timing Input */}
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

          {/* Frequency Select */}
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

           {/* Stock Management Section */}
           <div className="p-4 rounded-xl bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-900/50">
             <div className="flex items-center justify-between mb-3">
               <label className="text-xs font-bold text-orange-700 dark:text-orange-400 uppercase tracking-wide flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5" /> Gestione Scorte
               </label>
               <button
                  type="button"
                  onClick={() => setEnableStock(!enableStock)}
                  className={`w-10 h-6 rounded-full p-1 transition-colors ${enableStock ? 'bg-orange-500' : 'bg-gray-300 dark:bg-gray-600'}`}
               >
                 <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform ${enableStock ? 'translate-x-4' : 'translate-x-0'}`} />
               </button>
             </div>
             
             {enableStock && (
               <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                 <div className="grid grid-cols-2 gap-4">
                    {/* Stock Quantity + Refill Button */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-orange-600 dark:text-orange-400 block">Q.tà Attuale</span>
                      <div className="relative flex items-center">
                        <input
                          type="number"
                          value={formData.stockQuantity === undefined ? '' : formData.stockQuantity}
                          onChange={(e) => setFormData({...formData, stockQuantity: e.target.value === '' ? undefined : parseInt(e.target.value)})}
                          className="w-full px-3 py-2 rounded-lg border border-orange-200 dark:border-orange-800 bg-white dark:bg-gray-700 text-gray-800 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-orange-200"
                          placeholder="0"
                        />
                         <button 
                           type="button"
                           onClick={() => setIsRefillMode(!isRefillMode)}
                           className="absolute right-1 p-1 text-orange-500 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-200 transition-colors"
                         >
                           <PlusCircle className="w-5 h-5" />
                         </button>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-orange-600 dark:text-orange-400 block">Avviso sotto</span>
                      <input
                        type="number"
                        value={formData.stockThreshold === undefined ? '' : formData.stockThreshold}
                        onChange={(e) => setFormData({...formData, stockThreshold: e.target.value === '' ? undefined : parseInt(e.target.value)})}
                        className="w-full px-3 py-2 rounded-lg border border-orange-200 dark:border-orange-800 bg-white dark:bg-gray-700 text-gray-800 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-orange-200"
                        placeholder="5"
                      />
                    </div>
                 </div>

                 {/* QUICK REFILL PANEL */}
                 {isRefillMode && (
                   <div className="bg-white dark:bg-gray-800/80 p-3 rounded-lg border border-orange-200 dark:border-orange-800 animate-in slide-in-from-top-2">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-orange-800 dark:text-orange-200">Rifornimento Rapido</span>
                        <button onClick={() => setIsRefillMode(false)}><X className="w-3 h-3 text-gray-400" /></button>
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          value={refillAmount}
                          onChange={(e) => setRefillAmount(e.target.value)}
                          placeholder="Q.tà confezione"
                          className="flex-1 px-3 py-1.5 text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={handleRefillSubmit}
                          disabled={!refillAmount}
                          className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1 disabled:opacity-50 transition-colors"
                        >
                          <PlusCircle className="w-3.5 h-3.5" /> Aggiungi
                        </button>
                      </div>
                      <p className="text-[10px] text-gray-400 mt-1.5 leading-tight">
                         La quantità inserita verrà sommata alla scorta attuale ({formData.stockQuantity || 0}).
                      </p>
                   </div>
                 )}

                 {/* Shared Stock Toggle */}
                 <div className="pt-2 border-t border-orange-100 dark:border-orange-900/30">
                    <div className="flex items-center justify-between">
                       <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                          <div>
                             <span className="text-xs font-bold text-orange-700 dark:text-orange-300 block">Scorta Condivisa</span>
                             <span className="text-[10px] text-orange-500/80 dark:text-orange-400/60 leading-tight block">Scala anche dal partner</span>
                          </div>
                       </div>
                       <button
                          type="button"
                          onClick={() => setIsShared(!isShared)}
                          className={`w-8 h-5 rounded-full p-1 transition-colors ${isShared ? 'bg-orange-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                        >
                          <div className={`w-3 h-3 bg-white rounded-full shadow-sm transform transition-transform ${isShared ? 'translate-x-3' : 'translate-x-0'}`} />
                        </button>
                    </div>
                 </div>
               </div>
             )}
             {!enableStock && (
               <p className="text-xs text-orange-400 dark:text-orange-500/70">Attiva per tracciare la quantità residua e ricevere avvisi.</p>
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

          {/* Notes Input */}
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