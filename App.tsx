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
import { UserID, Frequency, Medication, InventoryItem } from './types';
import * as storage from './services/storageService';
import * as supabaseClient from './services/supabaseClient';
import { requestNotificationPermission, sendStockNotification } from './services/notificationService';

// --- Constants ---
// const PAOLO_SPLASH_IMAGE = "https://raw.githubusercontent.com/paselsoft/MediCoppia-Tracker/af93b24a68e30fdee84957e1568650040d12a76a/4DE7537D-561D-4D70-9C20-742205A7E145.png";

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

// Helper sorting function for timing priority
const getTimingPriority = (timing: string = '') => {
  const t = timing.toLowerCase();
  if (t.includes('colazione')) return 1;
  if (t.includes('mattina')) return 2;
  if (t.includes('pranzo')) return 3;
  if (t.includes('pomeriggio')) return 4;
  if (t.includes('lontano')) return 5;
  if (t.includes('17:00')) return 6;
  if (t.includes('cena') || t.includes('sera')) return 7;
  if (t.includes('notte') || t.includes('dormire')) return 8;
  return 99;
};

const App: React.FC = () => {
  // --- State ---
  
  const [currentUserId, setCurrentUserId] = useState<UserID>(() => {
    const params = new URLSearchParams(window.location.search);
    const userParam = params.get('user');

    if (userParam === UserID.PAOLO) return UserID.PAOLO;
    if (userParam === UserID.BARBARA) return UserID.BARBARA;

    try {
      const ua = navigator.userAgent.toLowerCase();
      const isAndroid = /android/.test(ua);
      const isIOS = /iphone|ipad|ipod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

      if (isAndroid) return UserID.BARBARA;
      if (isIOS) return UserID.PAOLO;
    } catch (e) {
      console.warn("Error detecting OS", e);
    }
    return UserID.PAOLO;
  });

  const [activeTab, setActiveTab] = useState<'today' | 'history' | 'settings'>('today');
  const [today] = useState<Date>(new Date());
  
  // Data State
  const [logs, setLogs] = useState<Record<string, boolean>>({});
  const [medications, setMedications] = useState<Medication[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Edit Modal State
  const [editingMedication, setEditingMedication] = useState<Medication | null>(null);
  const [isNewMedication, setIsNewMedication] = useState(false);

  const currentUser = USERS[currentUserId];
  const formattedDate = format(today, 'yyyy-MM-dd');
  const displayDate = format(today, 'EEEE d MMMM', { locale: it });

  // --- Initialization & Data Fetching ---

  const loadData = async () => {
    const [fetchedMeds, fetchedLogs, fetchedInventory] = await Promise.all([
      storage.fetchMedications(),
      storage.fetchLogs(),
      storage.fetchInventory()
    ]);

    // HYDRATION: Merge Inventory Data into Medications
    // This allows UI components to see the "Product" stock as if it was the medication's stock
    const hydratedMeds = fetchedMeds.map(med => {
      if (med.productId) {
        const product = fetchedInventory.find(i => i.id === med.productId);
        if (product) {
          return {
            ...med,
            stockQuantity: product.quantity,
            stockThreshold: product.threshold
          };
        }
      }
      return med;
    });

    setInventory(fetchedInventory);
    setMedications(hydratedMeds);
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

    requestNotificationPermission();

    return () => {
      if (channel) supabaseClient.getSupabase()?.removeChannel(channel);
    };
  }, []);

  // --- Security: Redirect if user changes to Barbara while in Settings ---
  useEffect(() => {
    if (activeTab === 'settings' && currentUserId !== UserID.PAOLO) {
      setActiveTab('today');
    }
  }, [currentUserId, activeTab]);

  // --- Logic ---
  const handleToggle = (medId: string) => {
    const key = `${formattedDate}-${medId}`;
    const newStatus = !logs[key];
    const targetMed = medications.find(m => m.id === medId);
    
    // NOTIFICATION LOGIC
    if (newStatus && targetMed && targetMed.stockQuantity !== undefined && targetMed.stockThreshold !== undefined) {
      const projectedStock = targetMed.stockQuantity - 1;
      if (projectedStock <= targetMed.stockThreshold) {
        sendStockNotification(targetMed.name, projectedStock);
      }
    }

    // 1. Update Logs State
    setLogs(prev => {
      const next = { ...prev };
      if (newStatus) next[key] = true;
      else delete next[key];
      return next;
    });

    // 2. Update Stock (Locally)
    // We need to know if this updates the INVENTORY or just the MEDICATION
    const change = newStatus ? -1 : 1;

    if (targetMed?.productId) {
      // NEW ARCHITECTURE: Update Inventory
      const linkedProductId = targetMed.productId;
      setInventory(prevInv => prevInv.map(item => {
        if (item.id === linkedProductId) {
          return { ...item, quantity: item.quantity + change };
        }
        return item;
      }));
      
      // Also update all medications linked to this product in the UI
      setMedications(prevMeds => prevMeds.map(med => {
        if (med.productId === linkedProductId && med.stockQuantity !== undefined) {
           return { ...med, stockQuantity: med.stockQuantity + change };
        }
        return med;
      }));

    } else {
       // LEGACY ARCHITECTURE: Update Medication directly
       setMedications(prev => prev.map(med => {
        const shouldUpdate = med.id === medId || (targetMed?.sharedId && med.sharedId === targetMed.sharedId);
        if (!shouldUpdate) return med;
        if (med.stockQuantity !== undefined && med.stockQuantity !== null) {
          return { ...med, stockQuantity: med.stockQuantity + change };
        }
        return med;
      }));
    }

    // 3. Persist
    storage.toggleLog(formattedDate, medId, newStatus);
    storage.updateStock(medId, change);
  };

  const handleSaveMedication = async (updatedMed: Medication) => {
    await storage.saveMedication(updatedMed);
    // Refresh data to ensure all links are correct (lazy way, safer)
    loadData();
    setIsNewMedication(false);
  };

  const handleSaveInventory = async (item: InventoryItem) => {
    const id = await storage.saveInventoryItem(item);
    // Reload to get new data
    loadData();
    return id;
  };

  const handleDeleteMedication = (medId: string) => {
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
      stockThreshold: 5,
      isArchived: false,
      sharedId: undefined,
      productId: undefined
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
    const userMeds = medications.filter(m => m.userId === currentUserId && !m.isArchived);
    const daysSinceEpoch = differenceInDays(today, new Date(2024, 0, 1));
    const isEvenDay = daysSinceEpoch % 2 === 0;

    return userMeds.filter(med => {
      if (med.frequency === Frequency.DAILY) return true;
      if (med.frequency === Frequency.ALTERNATE_DAYS) return isEvenDay; 
      if (med.frequency === Frequency.ALTERNATE_DAYS_ODD) return !isEvenDay;
      return true;
    })
    .sort((a, b) => {
      const pA = getTimingPriority(a.timing);
      const pB = getTimingPriority(b.timing);
      if (pA !== pB) return pA - pB;
      return a.name.localeCompare(b.name);
    })
    .map(med => ({ ...med, disabled: false }));
  }, [currentUserId, today, medications]);

  const allUserMedications = useMemo(() => {
    return medications
      .filter(m => m.userId === currentUserId)
      .sort((a, b) => {
        const pA = getTimingPriority(a.timing);
        const pB = getTimingPriority(b.timing);
        if (pA !== pB) return pA - pB;
        return a.name.localeCompare(b.name);
      });
  }, [currentUserId, medications]);

  const activeMeds = getDailyMedications; 
  const takenCount = activeMeds.filter(m => logs[`${formattedDate}-${m.id}`]).length;
  const progress = activeMeds.length > 0 ? (takenCount / activeMeds.length) * 100 : 0;
  const isComplete = progress === 100 && takenCount > 0 && activeMeds.length > 0;

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
        availableUsers={[USERS[UserID.BARBARA], USERS[UserID.PAOLO]]} 
        dateDisplay={displayDate}
      />

      <div className="flex-1 overflow-y-auto no-scrollbar">
        {activeTab === 'today' && (
          <>
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
                     {activeMeds.length > 0 ? `${takenCount}/${activeMeds.length}` : '-/-'}
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
             inventory={inventory}
             currentUserId={currentUserId}
             onEdit={handleEditClick}
             onAdd={handleAddMedication}
          />
        )}
      </div>

      {editingMedication && (
        <EditMedicationModal
          medication={editingMedication}
          inventory={inventory}
          isOpen={!!editingMedication}
          onClose={() => setEditingMedication(null)}
          onSave={handleSaveMedication}
          onSaveInventory={handleSaveInventory}
          onDelete={!isNewMedication ? handleDeleteMedication : undefined}
          userTheme={currentUser}
          isNew={isNewMedication}
        />
      )}

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

          {currentUserId === UserID.PAOLO && (
            <button 
              onClick={() => setActiveTab('settings')}
              className={`flex flex-col items-center justify-center w-16 gap-1 transition-colors ${activeTab === 'settings' ? currentUser.themeColor.replace('bg-', 'text-') : 'text-gray-400 dark:text-gray-500'}`}
            >
              <Settings className={`w-6 h-6 ${activeTab === 'settings' ? 'fill-current opacity-20' : ''}`} strokeWidth={2.5} />
              <span className="text-[10px] font-bold tracking-wide">SETUP</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;