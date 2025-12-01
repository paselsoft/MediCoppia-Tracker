import React from 'react';
import { Medication, UserID, UserProfile } from '../types';
import { USERS } from '../constants';
import { Settings, Plus, Pencil, Pill, Droplets, Clock, Trash2, Mail } from 'lucide-react';

interface SettingsViewProps {
  medications: Medication[];
  onEdit: (med: Medication) => void;
  onAdd: (userId: UserID) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  medications,
  onEdit,
  onAdd
}) => {
  const userList = Object.values(USERS);

  const getIcon = (iconName?: string) => {
    switch(iconName) {
      case 'drop': return <Droplets className="w-4 h-4" />;
      case 'clock': return <Clock className="w-4 h-4" />;
      case 'sachet': return <Mail className="w-4 h-4" />;
      default: return <Pill className="w-4 h-4" />;
    }
  };

  return (
    <div className="pb-24 pt-6">
      <div className="px-6 mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-gray-200 rounded-2xl text-gray-700">
             <Settings className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Impostazioni</h1>
        </div>
        <p className="text-gray-500 text-sm pl-1">
          Gestisci i medicinali e i dosaggi per ogni utente.
        </p>
      </div>

      <div className="space-y-8">
        {userList.map((user) => {
          const userMeds = medications.filter(m => m.userId === user.id);
          
          return (
            <div key={user.id} className="px-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className={`text-lg font-bold flex items-center gap-2 ${user.themeColor.replace('bg-', 'text-')}`}>
                  <img src={user.avatar} className="w-6 h-6 rounded-full border border-gray-200" alt="" />
                  Medicine di {user.name}
                </h2>
                <button 
                  onClick={() => onAdd(user.id)}
                  className={`text-xs font-bold px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center gap-1 transition-colors`}
                >
                  <Plus className="w-3.5 h-3.5" /> Aggiungi
                </button>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {userMeds.length > 0 ? (
                  <div className="divide-y divide-gray-50">
                    {userMeds.map(med => (
                      <div 
                        key={med.id} 
                        onClick={() => onEdit(med)}
                        className="p-4 flex items-center justify-between hover:bg-gray-50 active:bg-gray-100 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg bg-gray-100 text-gray-400`}>
                            {getIcon(med.icon)}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-800 text-sm">{med.name}</h3>
                            <p className="text-xs text-gray-400">{med.dosage} • {med.timing}</p>
                          </div>
                        </div>
                        <Pencil className="w-4 h-4 text-gray-300" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-gray-400 text-sm">
                    Nessun medicinale configurato.
                  </div>
                )}
              </div>
            </div>
          );
        })}

        <div className="px-6 pt-4">
           <div className="bg-blue-50 p-4 rounded-xl text-xs text-blue-600 leading-relaxed border border-blue-100">
              <strong>Nota sulla privacy:</strong> I dati che inserisci qui vengono salvati nel tuo database Supabase privato.
           </div>
        </div>
      </div>
    </div>
  );
};