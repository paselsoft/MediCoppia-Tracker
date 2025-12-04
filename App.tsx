import React, { useState, useEffect, useMemo } from 'react';
import { format, differenceInDays } from 'date-fns';
import { it } from 'date-fns/locale';
import { MessageCircle, CalendarCheck, History, Loader2, Settings, Trophy, PartyPopper } from 'lucide-react';
import { Header } from './components/Header';
import { MedicationCard } from './components/MedicationCard';
import { HistoryView } from './components/HistoryView';
import { EditMedicationModal } from './components/EditMedicationModal';
import { SettingsView } from './components/SettingsView';
import { USERS } from './constants';
import { UserID, Frequency, Medication } from './types';
import * as storage from './services/storageService';
import * as supabaseClient from './services/supabaseClient';

// --- Confetti Component ---
const Confetti = () => {
  const pieces = useMemo(() => {
    const colors = ['#FFC700', '#FF0000', '#2E3192', '#41BBC7', '#73F02D'];
    return Array.from({ length: 40 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100 + '%',
      delay: Math.random() * 2 + 's',
      bg: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 8 + 4 + 'px'
    }));
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 rounded-2xl">
      {pieces.map((p) => (
        <div
          key={p.id}
          className="confetti-piece"
          style={{
            left: p.left,
            animationDelay: p.delay,
            backgroundColor: p.bg,
            width: p.size,
            height: p.size,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px'
          }}
        />
      ))}
    </div>
  );
};

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
    // Handle App Shortcuts (URL Parameters)
    const params = new URLSearchParams(window.location.search);
    const userParam = params.get('user');
    if (userParam === UserID.PAOLO) setCurrentUserId(UserID.PAOLO);
    if (userParam === UserID.BARBARA) setCurrentUserId(UserID.BARBARA);

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
    
    // 1. Update Logs State
    setLogs(prev => {
      const next = { ...prev };
      if (newStatus) next[key] = true;
      else delete next[key];
      return next;
    });

    // 2. Update Stock (Locally & DB)
    setMedications(prev => prev.map(med => {
      if (med.id !== medId) return med;
      // If stock tracking is enabled
      if (med.stockQuantity !== undefined && med.stockQuantity !== null) {
        // Taking (true) -> -1, Untaking (false) -> +1
        const change = newStatus ? -1 : 1;
        return { ...med, stockQuantity: med.stockQuantity + change };
      }
      return med;
    }));

    // 3. Persist
    storage.toggleLog(formattedDate, medId, newStatus);
    
    // Only update DB stock if medication has stock tracking
    const med = medications.find(m => m.id === medId);
    if (med && med.stockQuantity !== undefined) {
      storage.updateStock(medId, newStatus ? -1 : 1);
    }
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
      icon: 'pill',
      stockThreshold: 5 // default
    });
  };

  const handleEditClick = (med: Medication) => {
    setIsNewMedication(false);
    setEditingMedication(med);
  };

  const handleWhatsAppReminder = () => {
    const otherUser = Object.keys(USERS).map(key => USERS[key as UserID]).find(u => u.id !== currentUserId);
    if (!otherUser) return;

    const message = `Ciao amore! ❤️ Ricordati di prendere i tuoi integratori e le medicine di oggi. Controlla l'app MediCoppia!`;
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
  };

  const getDailyMedications = useMemo(() => {
    const userMeds = medications.filter(m => m.userId === currentUserId);
    
    // Logic for alternate days (Turno A vs Turno B)
    // Epoch: Jan 1 2024. Even days vs Odd days.
    const daysSinceEpoch = differenceInDays(today, new Date(2024, 0, 1));
    const isEvenDay = daysSinceEpoch % 2 === 0;

    return userMeds.filter(med => {
      if (med.frequency === Frequency.DAILY) return true;
      if (med.frequency === Frequency.ALTERNATE_DAYS) return isEvenDay; // Show only on even days
      if (med.frequency === Frequency.ALTERNATE_DAYS_ODD) return !isEvenDay; // Show only on odd days
      return true;
    }).map(med => ({ ...med, disabled: false }));
  }, [currentUserId, today, medications]);

  const allUserMedications = useMemo(() => {
    return medications.filter(m => m.userId === currentUserId);
  }, [currentUserId, medications]);

  const activeMeds = getDailyMedications; // All meds in this list are active today
  const takenCount = activeMeds.filter(m => logs[`${formattedDate}-${m.id}`]).length;
  const progress = activeMeds.length > 0 ? (takenCount / activeMeds.length) * 100 : 0;
  const isComplete = progress === 100 && takenCount > 0;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600 dark:text-blue-400" />
          <p className="text-gray-500 dark:text-gray-400 font-medium">Caricamento...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col transition-colors duration-300">
      <Header 
        currentUser={currentUser} 
        onSwitchUser={setCurrentUserId}
        availableUsers={[USERS[UserID.BARBARA], USERS[UserID.PAOLO]]} // Ordine corretto: Barbara (SX), Paolo (DX)
        dateDisplay={displayDate}
      />

      <div className="flex-1 overflow-y-auto no-scrollbar">
        {activeTab === 'today' && (
          <>
            {/* Progress Bar or Completion Banner */}
            <div className="-mt-1 px-6 relative z-20 mb-6">
              {isComplete ? (
                <div className="relative overflow-hidden bg-gradient-to-br from-yellow-400 via-orange-400 to-red-400 text-white rounded-2xl p-6 shadow-xl shadow-orange-200 animate-pop transform transition-all ring-4 ring-white dark:ring-gray-700">
                  <Confetti />
                  <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-white/20 rounded-full backdrop-blur-md shadow-inner border border-white/30">
                        <Trophy className="w-8 h-8 text-white fill-yellow-200 animate-bounce" />
                      </div>
                      <div>
                        <h3 className="font-bold text-xl leading-tight flex items-center gap-2">
                          Ottimo lavoro! <PartyPopper className="w-5 h-5" />
                        </h3>
                        <p className="text-orange-50 text-sm font-medium opacity-90 mt-0.5">Hai completato il piano di oggi.</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white dark:bg-gray-800 rounded-full p-1.5 shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-3 pr-4 transition-colors">
                   <div className="flex-1 h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden mx-2 relative">
                     <div 
                       className={`h-full transition-all duration-700 ease-out rounded-full ${currentUser.themeColor}`} 
                       style={{ width: `${progress}%` }}
                     />
                   </div>
                   <span className="text-xs font-bold text-gray-400 dark:text-gray-500 min-w-[3rem] text-right">
                     {takenCount}/{activeMeds.length}
                   </span>
                </div>
              )}
            </div>

            <main className="pb-24">
              <div className="px-6 mb-4 flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">Piano Giornaliero</h2>
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
                    disabled={false}
                  />
                ))}

                {activeMeds.length === 0 && (
                   <div className="text-center py-10 text-gray-400 dark:text-gray-500">
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
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 pb-safe pt-2 px-6 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-40 transition-colors duration-300">
        <div className="flex justify-around items-center h-16 max-w-md mx-auto">
          <button 
            onClick={() => setActiveTab('today')}
            className={`flex flex-col items-center justify-center w-16 gap-1 transition-colors ${activeTab === 'today' ? currentUser.themeColor.replace('bg-', 'text-') : 'text-gray-400 dark:text-gray-500'}`}
          >
            <CalendarCheck className={`w-6 h-6 ${activeTab === 'today' ? 'fill-current opacity-20' : ''}`} strokeWidth={2.5} />
            <span className="text-[10px] font-bold tracking-wide">OGGI</span>
          </button>

          <button 
            onClick={() => setActiveTab('history')}
            className={`flex flex-col items-center justify-center w-16 gap-1 transition-colors ${activeTab === 'history' ? currentUser.themeColor.replace('bg-', 'text-') : 'text-gray-400 dark:text-gray-500'}`}
          >
            <History className={`w-6 h-6 ${activeTab === 'history' ? 'fill-current opacity-20' : ''}`} strokeWidth={2.5} />
            <span className="text-[10px] font-bold tracking-wide">STORICO</span>
          </button>

          <button 
            onClick={() => setActiveTab('settings')}
            className={`flex flex-col items-center justify-center w-16 gap-1 transition-colors ${activeTab === 'settings' ? currentUser.themeColor.replace('bg-', 'text-') : 'text-gray-400 dark:text-gray-500'}`}
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