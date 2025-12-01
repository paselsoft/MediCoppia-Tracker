import React, { useState, useEffect, useMemo } from 'react';
import { format, differenceInDays } from 'date-fns';
import { it } from 'date-fns/locale';
import { MessageCircle, CalendarCheck, History, Loader2, Settings } from 'lucide-react';
import { Header } from './components/Header';
import { MedicationCard } from './components/MedicationCard';
import { HistoryView } from './components/HistoryView';
import { EditMedicationModal } from './components/EditMedicationModal';
import { SettingsView } from './components/SettingsView';
import { USERS } from './constants';
import { UserID, Frequency, Medication } from './types';
import * as storage from './services/storageService';
import * as supabaseClient from './services/supabaseClient';

const App: React.FC = () => {
  // --- State ---
  const [currentUserId, setCurrentUserId] = useState<UserID>(UserID.PAOLO);
  const [activeTab, setActiveTab] = useState<'today' | 'history' | 'settings'>('today');
  const [today] = useState<Date>(new Date());
  
  // Data State
  const [logs, setLogs] = useState<Record<string, boolean>>({});
  const [medications, setMedications] = useState<Medication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Edit Modal State
  const [editingMedication, setEditingMedication] = useState<Medication | null>(null);
  const [isNewMedication, setIsNewMedication] = useState(false);

  const currentUser = USERS[currentUserId];
  const formattedDate = format(today, 'yyyy-MM-dd');
  const displayDate = format(today, 'EEEE d MMMM', { locale: it });

  // --- Initialization & Data Fetching ---

  const loadData = async () => {
    const [fetchedMeds, fetchedLogs] = await Promise.all([
      storage.fetchMedications(),
      storage.fetchLogs()
    ]);
    setMedications(fetchedMeds);
    setLogs(fetchedLogs);
    setIsLoading(false);
  };

  useEffect(() => {
    supabaseClient.initSupabase();
    storage.initializeDefaultDataIfNeeded().then(() => {
      loadData();
    });
    
    const channel = storage.subscribeToChanges(() => {
      loadData(); 
    });

    return () => {
      if (channel) supabaseClient.getSupabase()?.removeChannel(channel);
    };
  }, []);

  // --- Logic ---
  const handleToggle = (medId: string) => {
    const key = `${formattedDate}-${medId}`;
    const newStatus = !logs[key];
    
    setLogs(prev => {
      const next = { ...prev };
      if (newStatus) next[key] = true;
      else delete next[key];
      return next;
    });

    storage.toggleLog(formattedDate, medId, newStatus);
  };

  const handleSaveMedication = (updatedMed: Medication) => {
    // Optimistic Update
    if (isNewMedication) {
      setMedications(prev => [...prev, updatedMed]);
    } else {
      setMedications(prev => prev.map(med => med.id === updatedMed.id ? updatedMed : med));
    }
    
    storage.saveMedication(updatedMed);
    setIsNewMedication(false);
  };

  const handleDeleteMedication = (medId: string) => {
    // Optimistic Update
    setMedications(prev => prev.filter(m => m.id !== medId));
    storage.deleteMedication(medId);
    setEditingMedication(null);
  };

  const handleAddMedication = (userId: UserID) => {
    setIsNewMedication(true);
    setEditingMedication({
      id: crypto.randomUUID(),
      userId: userId,
      name: '',
      dosage: '',
      timing: '',
      frequency: Frequency.DAILY,
      icon: 'pill'
    });
  };

  const handleEditClick = (med: Medication) => {
    setIsNewMedication(false);
    setEditingMedication(med);
  };

  const handleWhatsAppReminder = () => {
    const otherUser = Object.values(USERS).find(u => u.id !== currentUserId);
    if (!otherUser) return;

    const message = `Ciao amore! ❤️ Ricordati di prendere i tuoi integratori e le medicine di oggi. Controlla l'app MediCoppia!`;
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
  };

  const getDailyMedications = useMemo(() => {
    const userMeds = medications.filter(m => m.userId === currentUserId);
    
    const daysSinceEpoch = differenceInDays(today, new Date(2024, 0, 1));
    const isAlternateDayActive = daysSinceEpoch % 2 === 0;

    return userMeds.map(med => {
      const isDisabled = med.frequency === Frequency.ALTERNATE_DAYS && !isAlternateDayActive;
      return { ...med, disabled: isDisabled };
    });
  }, [currentUserId, today, medications]);

  const allUserMedications = useMemo(() => {
    return medications.filter(m => m.userId === currentUserId);
  }, [currentUserId, medications]);

  const activeMeds = getDailyMedications.filter(m => !m.disabled);
  const takenCount = activeMeds.filter(m => logs[`${formattedDate}-${m.id}`]).length;
  const progress = activeMeds.length > 0 ? (takenCount / activeMeds.length) * 100 : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
          <p className="text-gray-500 font-medium">Caricamento...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header 
        currentUser={currentUser} 
        onSwitchUser={setCurrentUserId}
        availableUsers={Object.values(USERS)}
        dateDisplay={displayDate}
      />

      <div className="flex-1 overflow-y-auto no-scrollbar">
        {activeTab === 'today' && (
          <>
            {/* Progress Bar */}
            <div className="-mt-1 px-6 relative z-20 mb-6">
              <div className="bg-white rounded-full p-1 shadow-sm border border-gray-100 flex items-center gap-3 pr-4">
                 <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden mx-2">
                   <div 
                     className={`h-full transition-all duration-700 ease-out ${currentUser.themeColor}`} 
                     style={{ width: `${progress}%` }}
                   />
                 </div>
                 <span className="text-xs font-bold text-gray-400 min-w-[3rem] text-right">
                   {takenCount}/{activeMeds.length}
                 </span>
              </div>
            </div>

            <main className="pb-24">
              <div className="px-6 mb-4 flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-800">Piano Giornaliero</h2>
                {progress === 100 && takenCount > 0 && (
                   <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-full animate-bounce">
                     Tutto fatto! 🎉
                   </span>
                )}
              </div>

              <div className="flex flex-col gap-1">
                {getDailyMedications.map((med) => (
                  <MedicationCard 
                    key={med.id}
                    medication={med}
                    isTaken={!!logs[`${formattedDate}-${med.id}`]}
                    onToggle={() => handleToggle(med.id)}
                    onEdit={handleEditClick}
                    userTheme={currentUser}
                    disabled={med.disabled}
                  />
                ))}

                {activeMeds.length === 0 && (
                   <div className="text-center py-10 text-gray-400">
                     Nessun medicinale previsto per oggi.
                   </div>
                )}
              </div>

              <div className="px-6 mt-8">
                <button 
                  onClick={handleWhatsAppReminder}
                  className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-semibold py-4 rounded-2xl shadow-lg shadow-green-100 flex items-center justify-center gap-2 transition-transform active:scale-95"
                >
                  <MessageCircle className="w-5 h-5" />
                  Ricorda a {currentUserId === UserID.PAOLO ? 'Barbara' : 'Paolo'}
                </button>
              </div>
            </main>
          </>
        )}

        {activeTab === 'history' && (
          <HistoryView 
            currentUser={currentUser}
            medications={allUserMedications}
            logs={logs}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsView
             medications={medications}
             onEdit={handleEditClick}
             onAdd={handleAddMedication}
          />
        )}
      </div>

      {/* Edit/Add Modal */}
      {editingMedication && (
        <EditMedicationModal
          medication={editingMedication}
          isOpen={!!editingMedication}
          onClose={() => setEditingMedication(null)}
          onSave={handleSaveMedication}
          onDelete={!isNewMedication ? handleDeleteMedication : undefined}
          userTheme={currentUser}
          isNew={isNewMedication}
        />
      )}

      {/* Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 pb-safe pt-2 px-6 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-40">
        <div className="flex justify-around items-center h-16 max-w-md mx-auto">
          <button 
            onClick={() => setActiveTab('today')}
            className={`flex flex-col items-center justify-center w-16 gap-1 transition-colors ${activeTab === 'today' ? currentUser.themeColor.replace('bg-', 'text-') : 'text-gray-400'}`}
          >
            <CalendarCheck className={`w-6 h-6 ${activeTab === 'today' ? 'fill-current opacity-20' : ''}`} strokeWidth={2.5} />
            <span className="text-[10px] font-bold tracking-wide">OGGI</span>
          </button>

          <button 
            onClick={() => setActiveTab('history')}
            className={`flex flex-col items-center justify-center w-16 gap-1 transition-colors ${activeTab === 'history' ? currentUser.themeColor.replace('bg-', 'text-') : 'text-gray-400'}`}
          >
            <History className={`w-6 h-6 ${activeTab === 'history' ? 'fill-current opacity-20' : ''}`} strokeWidth={2.5} />
            <span className="text-[10px] font-bold tracking-wide">STORICO</span>
          </button>

          <button 
            onClick={() => setActiveTab('settings')}
            className={`flex flex-col items-center justify-center w-16 gap-1 transition-colors ${activeTab === 'settings' ? currentUser.themeColor.replace('bg-', 'text-') : 'text-gray-400'}`}
          >
            <Settings className={`w-6 h-6 ${activeTab === 'settings' ? 'fill-current opacity-20' : ''}`} strokeWidth={2.5} />
            <span className="text-[10px] font-bold tracking-wide">SETUP</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;