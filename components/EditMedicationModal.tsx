import React, { useState, useEffect } from 'react';
import { Medication, UserProfile, Frequency } from '../types';
import { X, Save, Clock, Pill, FileText, Trash2, Droplets, Calendar, Type, Mail, Package, AlertTriangle } from 'lucide-react';
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
    stockThreshold: 5
  });

  const [enableStock, setEnableStock] = useState(false);

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
        stockThreshold: medication.stockThreshold || 5
      });
      setEnableStock(medication.stockQuantity !== undefined && medication.stockQuantity !== null);
    }
  }, [medication, isOpen]);

  if (!isOpen) return null;

  // Determine which Alternate Day option corresponds to "Today"
  const daysSinceEpoch = differenceInDays(new Date(), new Date(2024, 0, 1));
  const isEvenDay = daysSinceEpoch % 2 === 0;
  
  // If today is Even: ALTERNATE_DAYS is Today, ALTERNATE_DAYS_ODD is Tomorrow
  // If today is Odd: ALTERNATE_DAYS is Tomorrow, ALTERNATE_DAYS_ODD is Today
  const freqEvenLabel = isEvenDay ? "Sì, Oggi" : "No, Domani";
  const freqOddLabel = !isEvenDay ? "Sì, Oggi" : "No, Domani";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...medication, // Keep ID and UserId
      name: formData.name || 'Nuovo Medicinale',
      dosage: formData.dosage || '',
      timing: formData.timing || '',
      frequency: formData.frequency as Frequency,
      notes: formData.notes,
      icon: formData.icon as 'pill' | 'drop' | 'clock' | 'sachet',
      stockQuantity: enableStock ? Number(formData.stockQuantity) : undefined,
      stockThreshold: enableStock ? Number(formData.stockThreshold) : undefined
    });
    onClose();
  };

  const handleDelete = () => {
    if (confirm('Sei sicuro di voler eliminare questo medicinale?')) {
      if (onDelete) onDelete(medication.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className={`p-5 rounded-t-3xl flex justify-between items-center ${userTheme.themeColor} text-white shadow-lg z-10`}>
          <h2 className="text-xl font-bold">{isNew ? 'Nuovo Medicinale' : 'Modifica'}</h2>
          <button onClick={onClose} className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Content */}
        <div className="overflow-y-auto p-6 space-y-5 no-scrollbar">
          
          {/* Name Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wide flex items-center gap-1.5">
              <Type className="w-3.5 h-3.5" /> Nome Farmaco
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-4 py-3.5 rounded-2xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-opacity-50 focus:ring-blue-500 transition-all font-bold text-lg text-gray-800 placeholder-gray-300"
              placeholder="Es. Tachipirina"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Dosage Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wide flex items-center gap-1.5">
                <Pill className="w-3.5 h-3.5" /> Dosaggio
              </label>
              <input
                type="text"
                value={formData.dosage}
                onChange={(e) => setFormData({...formData, dosage: e.target.value})}
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-opacity-50 focus:ring-blue-500 transition-all font-medium text-gray-800"
                placeholder="Es. 1 cps"
              />
            </div>

            {/* Timing Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wide flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> Orario
              </label>
              <input
                type="text"
                value={formData.timing}
                onChange={(e) => setFormData({...formData, timing: e.target.value})}
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-opacity-50 focus:ring-blue-500 transition-all font-medium text-gray-800"
                placeholder="Es. Mattina"
              />
            </div>
          </div>

          {/* Frequency Select */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wide flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" /> Frequenza
            </label>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => setFormData({...formData, frequency: Frequency.DAILY})}
                className={`py-3 px-4 rounded-xl text-sm font-semibold text-left transition-all border ${formData.frequency === Frequency.DAILY ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-gray-50 border-gray-200 text-gray-500'}`}
              >
                Ogni Giorno
              </button>
              
              <div className="grid grid-cols-2 gap-2">
                 <button
                  type="button"
                  onClick={() => setFormData({...formData, frequency: Frequency.ALTERNATE_DAYS})}
                  className={`py-3 px-3 rounded-xl text-sm font-semibold text-left transition-all border flex flex-col ${formData.frequency === Frequency.ALTERNATE_DAYS ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-gray-50 border-gray-200 text-gray-500'}`}
                >
                  <span>Giorni Alterni (A)</span>
                  <span className={`text-[10px] mt-0.5 ${isEvenDay ? 'text-green-600 font-bold' : 'text-gray-400'}`}>Inizia: {freqEvenLabel}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({...formData, frequency: Frequency.ALTERNATE_DAYS_ODD})}
                  className={`py-3 px-3 rounded-xl text-sm font-semibold text-left transition-all border flex flex-col ${formData.frequency === Frequency.ALTERNATE_DAYS_ODD ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-gray-50 border-gray-200 text-gray-500'}`}
                >
                  <span>Giorni Alterni (B)</span>
                  <span className={`text-[10px] mt-0.5 ${!isEvenDay ? 'text-green-600 font-bold' : 'text-gray-400'}`}>Inizia: {freqOddLabel}</span>
                </button>
              </div>
            </div>
          </div>

           {/* Stock Management Section */}
           <div className="p-4 rounded-xl bg-orange-50 border border-orange-100">
             <div className="flex items-center justify-between mb-3">
               <label className="text-xs font-bold text-orange-700 uppercase tracking-wide flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5" /> Gestione Scorte
               </label>
               <button
                  type="button"
                  onClick={() => setEnableStock(!enableStock)}
                  className={`w-10 h-6 rounded-full p-1 transition-colors ${enableStock ? 'bg-orange-500' : 'bg-gray-300'}`}
               >
                 <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform ${enableStock ? 'translate-x-4' : 'translate-x-0'}`} />
               </button>
             </div>
             
             {enableStock && (
               <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-orange-600 block">Q.tà Attuale</span>
                    <input
                      type="number"
                      value={formData.stockQuantity || ''}
                      onChange={(e) => setFormData({...formData, stockQuantity: parseInt(e.target.value) || 0})}
                      className="w-full px-3 py-2 rounded-lg border border-orange-200 bg-white text-gray-800 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-orange-200"
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-orange-600 block">Avviso sotto</span>
                    <input
                      type="number"
                      value={formData.stockThreshold || 5}
                      onChange={(e) => setFormData({...formData, stockThreshold: parseInt(e.target.value) || 0})}
                      className="w-full px-3 py-2 rounded-lg border border-orange-200 bg-white text-gray-800 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-orange-200"
                      placeholder="5"
                    />
                  </div>
               </div>
             )}
             {!enableStock && (
               <p className="text-xs text-orange-400">Attiva per tracciare la quantità residua e ricevere avvisi.</p>
             )}
           </div>

          {/* Icon Selector */}
          <div className="space-y-1.5">
             <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">Icona</label>
             <div className="grid grid-cols-4 gap-2">
                {['pill', 'drop', 'clock', 'sachet'].map((ic) => (
                  <button
                    key={ic}
                    type="button"
                    onClick={() => setFormData({...formData, icon: ic as any})}
                    className={`aspect-square rounded-xl border flex items-center justify-center transition-all ${formData.icon === ic ? `border-${userTheme.themeColor.replace('bg-', '')} bg-${userTheme.themeColor.replace('bg-', '')}/10 text-${userTheme.themeColor.replace('bg-', '')}` : 'border-gray-200 text-gray-400 hover:bg-gray-50'}`}
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
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wide flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" /> Note (Opzionale)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              rows={2}
              className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-opacity-50 focus:ring-blue-500 transition-all font-medium text-gray-800 resize-none"
              placeholder="Note aggiuntive..."
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-gray-100 bg-gray-50 rounded-b-3xl flex gap-3">
           {!isNew && (
             <button
                type="button"
                onClick={handleDelete}
                className="p-4 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-colors"
             >
               <Trash2 className="w-5 h-5" />
             </button>
           )}
           <button
             type="button"
             onClick={handleSubmit}
             className={`flex-1 py-3 px-6 rounded-xl text-white font-bold shadow-lg shadow-blue-100 flex items-center justify-center gap-2 ${userTheme.themeColor} active:scale-95 transition-transform`}
           >
             <Save className="w-5 h-5" />
             {isNew ? 'Crea Medicinale' : 'Salva Modifiche'}
           </button>
        </div>

      </div>
    </div>
  );
};