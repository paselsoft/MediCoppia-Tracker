import React, { useState, useEffect } from 'react';
import { Medication, UserProfile, Frequency } from '../types';
import { X, Save, Clock, Pill, FileText, Trash2, Droplets, Calendar, Type, Mail } from 'lucide-react';

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
    icon: 'pill'
  });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: medication.name,
        dosage: medication.dosage,
        timing: medication.timing,
        frequency: medication.frequency,
        notes: medication.notes || '',
        icon: medication.icon || 'pill'
      });
    }
  }, [medication, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...medication, // Keep ID and UserId
      name: formData.name || 'Nuovo Medicinale',
      dosage: formData.dosage || '',
      timing: formData.timing || '',
      frequency: formData.frequency as Frequency,
      notes: formData.notes,
      icon: formData.icon as 'pill' | 'drop' | 'clock' | 'sachet'
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
            <div className="grid grid-cols-2 gap-2 bg-gray-50 p-1.5 rounded-xl border border-gray-200">
              <button
                type="button"
                onClick={() => setFormData({...formData, frequency: Frequency.DAILY})}
                className={`py-2 rounded-lg text-sm font-semibold transition-all ${formData.frequency === Frequency.DAILY ? 'bg-white shadow-sm text-gray-800' : 'text-gray-400 hover:bg-gray-100'}`}
              >
                Ogni Giorno
              </button>
              <button
                type="button"
                onClick={() => setFormData({...formData, frequency: Frequency.ALTERNATE_DAYS})}
                className={`py-2 rounded-lg text-sm font-semibold transition-all ${formData.frequency === Frequency.ALTERNATE_DAYS ? 'bg-white shadow-sm text-gray-800' : 'text-gray-400 hover:bg-gray-100'}`}
              >
                Giorni Alterni
              </button>
            </div>
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