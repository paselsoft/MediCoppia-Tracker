import React, { useState, useEffect } from 'react';
import { Medication, UserID, UserProfile, Frequency } from '../types';
import { USERS } from '../constants';
import { Settings, Plus, Pencil, Pill, Droplets, Clock, Trash2, Mail, Repeat, ArrowDownAZ, List, Package, AlertTriangle, Terminal, Copy, Check, ShoppingCart, Archive, PlayCircle, ChevronDown, ChevronRight, Layers } from 'lucide-react';
import { checkStockColumnsExist } from '../services/storageService';
import { ShoppingListModal } from './ShoppingListModal';

interface SettingsViewProps {
  medications: Medication[];
  currentUserId: UserID;
  onEdit: (med: Medication) => void;
  onAdd: (userId: UserID) => void;
}

const REQUIRED_SQL = `alter table medications add column if not exists stock_quantity numeric;
alter table medications add column if not exists stock_threshold numeric;
alter table medications add column if not exists is_archived boolean default false;
alter table medications add column if not exists shared_id text;`;

export const SettingsView: React.FC<SettingsViewProps> = ({
  medications,
  currentUserId,
  onEdit,
  onAdd
}) => {
  const [sortAlphabetical, setSortAlphabetical] = useState(false);
  const [missingColumns, setMissingColumns] = useState(false);
  const [sqlCopied, setSqlCopied] = useState(false);
  const [showShoppingList, setShowShoppingList] = useState(false);
  
  // Show only the current user in Settings
  const userList = [USERS[currentUserId]];

  useEffect(() => {
    const checkDB = async () => {
      const exists = await checkStockColumnsExist();
      setMissingColumns(!exists);
    };
    checkDB();
  }, []);

  const handleCopySql = () => {
    navigator.clipboard.writeText(REQUIRED_SQL);
    setSqlCopied(true);
    setTimeout(() => setSqlCopied(false), 2000);
  };

  const getIcon = (iconName?: string) => {
    switch(iconName) {
      case 'drop': return <Droplets className="w-4 h-4" />;
      case 'clock': return <Clock className="w-4 h-4" />;
      case 'sachet': return <Mail className="w-4 h-4" />;
      default: return <Pill className="w-4 h-4" />;
    }
  };

  // Calculate items to buy (Keeping this global for the household shopping list, 
  // or filtered if preferred. For now, keeping global helps whoever goes to pharmacy)
  const lowStockCount = medications.filter(med => 
    !med.isArchived &&
    med.stockQuantity !== undefined && 
    med.stockThreshold !== undefined && 
    med.stockQuantity <= med.stockThreshold
  ).length;

  return (
    <div className="pb-24 pt-6">
      <div className="px-6 mb-8 flex items-end justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-gray-200 dark:bg-gray-700 rounded-2xl text-gray-700 dark:text-gray-200">
               <Settings className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Impostazioni</h1>
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm pl-1">
            Gestisci i medicinali di {USERS[currentUserId].name}.
          </p>
        </div>

        <div className="flex gap-2">
          {/* Shopping Cart Button */}
          <button
            onClick={() => setShowShoppingList(true)}
            className="p-3 rounded-xl border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 relative transition-colors"
            aria-label="Lista Spesa"
          >
            <ShoppingCart className="w-5 h-5" />
            {lowStockCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-gray-800">
                {lowStockCount}
              </span>
            )}
          </button>

          {/* Sort Button */}
          <button
            onClick={() => setSortAlphabetical(!sortAlphabetical)}
            className={`p-3 rounded-xl border transition-colors flex items-center gap-2 ${
              sortAlphabetical 
                ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-300' 
                : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
            aria-label="Cambia ordinamento"
          >
            {sortAlphabetical ? <ArrowDownAZ className="w-5 h-5" /> : <List className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <div className="space-y-8">
        
        {/* Database Warning Banner */}
        {missingColumns && (
          <div className="mx-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 rounded-2xl p-4 animate-in slide-in-from-top-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-900/40 rounded-lg text-red-600 dark:text-red-400">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-red-700 dark:text-red-300 text-sm">Aggiornamento Database Richiesto</h3>
                <p className="text-xs text-red-600 dark:text-red-400 mt-1 leading-relaxed">
                  Per utilizzare le nuove funzionalità (scorte, archiviazione), il database necessita di nuove colonne. Esegui questo SQL nella Dashboard Supabase:
                </p>
                
                <div className="mt-3 bg-gray-900 rounded-lg p-3 relative group">
                  <pre className="text-[10px] text-green-400 font-mono whitespace-pre-wrap overflow-x-auto">
                    {REQUIRED_SQL}
                  </pre>
                  <button 
                    onClick={handleCopySql}
                    className="absolute top-2 right-2 p-1.5 bg-white/10 hover:bg-white/20 rounded text-white transition-colors"
                  >
                    {sqlCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {userList.map((user) => {
          let userMeds = medications.filter(m => m.userId === user.id);
          
          if (sortAlphabetical) {
            userMeds = [...userMeds].sort((a, b) => a.name.localeCompare(b.name));
          }

          // Split into active and archived
          const activeMeds = userMeds.filter(m => !m.isArchived);
          const archivedMeds = userMeds.filter(m => m.isArchived);

          // Group active meds by name (normalized)
          const groupedMeds = activeMeds.reduce((acc, med) => {
            const key = med.name.trim().toLowerCase();
            if (!acc[key]) acc[key] = [];
            acc[key].push(med);
            return acc;
          }, {} as Record<string, Medication[]>);

          // Get keys for rendering. If not alphabetized, we ideally want to preserve some order, 
          // but Object.keys order isn't guaranteed. If sorting is off, we might want to respect creation time 
          // of the *first* item in the group, but simple key iteration is usually fine for "grouped view".
          // If sortAlphabetical is on, keys should be sorted.
          let groupKeys = Object.keys(groupedMeds);
          if (sortAlphabetical) {
            groupKeys.sort();
          } else {
             // Try to preserve relative order based on the first appearance in the original activeMeds list
             const originalOrderMap = new Map();
             activeMeds.forEach((m, index) => {
                const key = m.name.trim().toLowerCase();
                if (!originalOrderMap.has(key)) originalOrderMap.set(key, index);
             });
             groupKeys.sort((a, b) => originalOrderMap.get(a) - originalOrderMap.get(b));
          }
          
          return (
            <div key={user.id} className="px-6 animate-in fade-in">
              <div className="flex items-center justify-between mb-4">
                <h2 className={`text-lg font-bold flex items-center gap-2 ${user.themeColor.replace('bg-', 'text-')}`}>
                  <img src={user.avatar} className="w-6 h-6 rounded-full border border-gray-200 dark:border-gray-600" alt="" />
                  Medicine di {user.name}
                </h2>
                <button 
                  onClick={() => onAdd(user.id)}
                  className={`text-xs font-bold px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 flex items-center gap-1 transition-colors`}
                >
                  <Plus className="w-3.5 h-3.5" /> Aggiungi
                </button>
              </div>

              {/* Active Meds List */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden transition-colors mb-4">
                {groupKeys.length > 0 ? (
                  <div className="divide-y divide-gray-50 dark:divide-gray-700">
                    {groupKeys.map(key => {
                       const group = groupedMeds[key];
                       const primary = group[0]; // Use first item for Name/Icon
                       const isGrouped = group.length > 1;

                       // If single item, render standard row
                       if (!isGrouped) {
                         const med = primary;
                         const hasStock = med.stockQuantity !== undefined && med.stockQuantity !== null;
                         const isLowStock = hasStock && (med.stockQuantity || 0) <= (med.stockThreshold || 5);
                         
                         return (
                          <div 
                            key={med.id} 
                            onClick={() => onEdit(med)}
                            className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 active:bg-gray-100 dark:active:bg-gray-600 transition-colors cursor-pointer"
                          >
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-300`}>
                                {getIcon(med.icon)}
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-800 dark:text-gray-100 text-sm">{med.name}</h3>
                                <div className="flex gap-2 text-xs text-gray-400 dark:text-gray-500 items-center mt-0.5">
                                  <span>{med.dosage} • {med.timing}</span>
                                  {med.frequency !== Frequency.DAILY && (
                                    <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 px-1.5 rounded flex items-center gap-0.5">
                                      <Repeat className="w-3 h-3" /> {med.frequency === Frequency.ALTERNATE_DAYS ? 'Turno A' : 'Turno B'}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-3">
                              {hasStock && (
                                <div className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-bold ${isLowStock ? 'bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-300' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}`}>
                                   <Package className="w-3 h-3" />
                                   {med.stockQuantity}
                                </div>
                              )}
                              <Pencil className="w-4 h-4 text-gray-300 dark:text-gray-600" />
                            </div>
                          </div>
                        );
                       } else {
                         // RENDER GROUPED CARD
                         // Check if stock is shared (all have same sharedId) or we pick the first
                         const sharedId = primary.sharedId;
                         const allShareId = sharedId && group.every(m => m.sharedId === sharedId);
                         const hasStock = primary.stockQuantity !== undefined && primary.stockQuantity !== null;
                         // If they share stock, show stock on the group header. 
                         // If they don't share stock but have same name, we can't easily sum them in a meaningful way for "Stock", 
                         // so we might show it on individual lines or just hide it on header. 
                         // For simplicity, if they have sharedId, show on Header.
                         
                         const isLowStock = hasStock && (primary.stockQuantity || 0) <= (primary.stockThreshold || 5);

                         return (
                           <div key={`group-${key}`} className="bg-white dark:bg-gray-800 transition-colors">
                              {/* Group Header */}
                              <div className="p-4 pb-2 flex items-center justify-between border-b border-dashed border-gray-100 dark:border-gray-700/50">
                                <div className="flex items-center gap-3">
                                  <div className={`p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-500 dark:text-blue-300`}>
                                    {getIcon(primary.icon)}
                                  </div>
                                  <div>
                                    <h3 className="font-bold text-gray-800 dark:text-gray-100 text-base">{primary.name}</h3>
                                    <div className="flex items-center gap-1 text-[10px] text-gray-400 font-medium uppercase tracking-wide">
                                      <Layers className="w-3 h-3" />
                                      {group.length} Assunzioni
                                    </div>
                                  </div>
                                </div>
                                {allShareId && hasStock && (
                                   <div className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-bold ${isLowStock ? 'bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-300' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}`}>
                                      <Package className="w-3 h-3" />
                                      {primary.stockQuantity}
                                   </div>
                                )}
                              </div>

                              {/* Group Children */}
                              <div className="bg-gray-50/50 dark:bg-black/10">
                                {group.map((med, idx) => (
                                  <div 
                                    key={med.id}
                                    onClick={() => onEdit(med)}
                                    className={`
                                      flex items-center justify-between px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700/50 cursor-pointer transition-colors group
                                      ${idx !== group.length - 1 ? 'border-b border-gray-100 dark:border-gray-700/50' : ''}
                                    `}
                                  >
                                     <div className="flex flex-col pl-11 relative">
                                        {/* Connector Line visual trick */}
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-px bg-gray-200 dark:bg-gray-600"></div>
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-500"></div>

                                        <div className="flex items-center gap-2">
                                          <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">{med.timing}</span>
                                          {med.frequency !== Frequency.DAILY && (
                                            <span className="text-[10px] bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 px-1.5 py-0.5 rounded border border-blue-100 dark:border-blue-900/50">
                                              {med.frequency === Frequency.ALTERNATE_DAYS ? 'A' : 'B'}
                                            </span>
                                          )}
                                        </div>
                                        <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">{med.dosage}</span>
                                     </div>

                                     <div className="flex items-center gap-3">
                                        {/* If not shared stock, show individual stock here */}
                                        {!allShareId && med.stockQuantity !== undefined && (
                                          <div className="flex items-center gap-1 text-[10px] text-gray-400">
                                             <Package className="w-3 h-3" /> {med.stockQuantity}
                                          </div>
                                        )}
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                           <Pencil className="w-3.5 h-3.5 text-gray-400" />
                                        </div>
                                     </div>
                                  </div>
                                ))}
                              </div>
                           </div>
                         );
                       }
                    })}
                  </div>
                ) : (
                  <div className="p-8 text-center text-gray-400 dark:text-gray-500 text-sm">
                    Nessun medicinale attivo.
                  </div>
                )}
              </div>

              {/* Archived Meds List */}
              {archivedMeds.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-2 px-1 flex items-center gap-1.5">
                    <Archive className="w-3.5 h-3.5" /> Farmaci Sospesi / Archiviati
                  </h3>
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700/50 overflow-hidden">
                    <div className="divide-y divide-gray-100 dark:divide-gray-700/50">
                      {archivedMeds.map(med => (
                        <div 
                          key={med.id} 
                          onClick={() => onEdit(med)}
                          className="p-3 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-700 active:bg-gray-200 dark:active:bg-gray-600 transition-colors cursor-pointer opacity-70 hover:opacity-100"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-1.5 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500">
                              {getIcon(med.icon)}
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-600 dark:text-gray-400 text-sm line-through decoration-gray-400/50">{med.name}</h3>
                              <p className="text-[10px] text-gray-400 dark:text-gray-500">Sospeso</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                             <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-md flex items-center gap-1">
                                <PlayCircle className="w-3 h-3" />
                                RIATTIVA
                             </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        <div className="px-6 pt-4">
           <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl text-xs text-blue-600 dark:text-blue-300 leading-relaxed border border-blue-100 dark:border-blue-900/30">
              <strong>Nota sulla privacy:</strong> I dati che inserisci qui vengono salvati nel tuo database Supabase privato.
           </div>
        </div>
      </div>

      {/* Shopping List Modal */}
      <ShoppingListModal 
        medications={medications}
        isOpen={showShoppingList}
        onClose={() => setShowShoppingList(false)}
      />
    </div>
  );
};