import React, { useState, useMemo } from 'react';
import { format, subDays, isSameDay, differenceInDays } from 'date-fns';
import { it } from 'date-fns/locale';
import { Check, X, Ban, CalendarDays } from 'lucide-react';
import { Medication, UserProfile, Frequency } from '../types';

interface HistoryViewProps {
  currentUser: UserProfile;
  medications: Medication[];
  logs: Record<string, boolean>;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  currentUser,
  medications,
  logs
}) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  // Generate last 14 days
  const pastDays = useMemo(() => {
    return Array.from({ length: 14 }, (_, i) => subDays(new Date(), i));
  }, []);

  // Helper to check if a med was scheduled for a specific date
  const isMedicationScheduled = (med: Medication, date: Date) => {
    if (med.frequency === Frequency.DAILY) return true;
    
    // Consistent epoch logic with App.tsx
    const daysSinceEpoch = differenceInDays(date, new Date(2024, 0, 1));
    const isEvenDay = daysSinceEpoch % 2 === 0;

    if (med.frequency === Frequency.ALTERNATE_DAYS) {
      return isEvenDay;
    }
    if (med.frequency === Frequency.ALTERNATE_DAYS_ODD) {
      return !isEvenDay;
    }
    return true;
  };

  const getDayStats = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const scheduledMeds = medications.filter(m => isMedicationScheduled(m, date));
    
    if (scheduledMeds.length === 0) return { taken: 0, total: 0, percentage: 0 };

    const takenCount = scheduledMeds.filter(m => logs[`${dateStr}-${m.id}`]).length;
    return {
      taken: takenCount,
      total: scheduledMeds.length,
      percentage: Math.round((takenCount / scheduledMeds.length) * 100)
    };
  };

  const selectedStats = getDayStats(selectedDate);
  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');

  return (
    <div className="pb-24">
      {/* Calendar Strip */}
      <div className="bg-white border-b border-gray-100 shadow-sm mb-6">
        <div className="flex overflow-x-auto no-scrollbar py-4 px-4 gap-3 snap-x">
          {pastDays.map((date) => {
            const isSelected = isSameDay(date, selectedDate);
            const stats = getDayStats(date);
            const isToday = isSameDay(date, new Date());

            return (
              <button
                key={date.toISOString()}
                onClick={() => setSelectedDate(date)}
                className={`
                  snap-start flex-shrink-0 flex flex-col items-center justify-center w-14 h-20 rounded-2xl border-2 transition-all duration-200
                  ${isSelected 
                    ? `border-${currentUser.themeColor.replace('bg-', '')} bg-gray-50` 
                    : 'border-transparent bg-white'
                  }
                `}
              >
                <span className="text-xs text-gray-400 capitalize">
                  {isToday ? 'Oggi' : format(date, 'EEE', { locale: it })}
                </span>
                <span className={`text-lg font-bold ${isSelected ? 'text-gray-800' : 'text-gray-600'}`}>
                  {format(date, 'd')}
                </span>
                
                {/* Mini Indicator */}
                <div className="mt-1 h-1.5 w-8 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${currentUser.themeColor}`} 
                    style={{ width: `${stats.percentage}%` }}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Day Header */}
      <div className="px-6 mb-6">
        <h2 className="text-xl font-bold text-gray-800 capitalize">
          {format(selectedDate, 'EEEE d MMMM', { locale: it })}
        </h2>
        <p className="text-gray-500 text-sm">
          Completamento: <span className="font-semibold text-gray-800">{selectedStats.percentage}%</span>
        </p>
      </div>

      {/* Medication List for Selected Date */}
      <div className="px-4 flex flex-col gap-3">
        {medications.map((med) => {
          const isScheduled = isMedicationScheduled(med, selectedDate);
          const isTaken = logs[`${selectedDateStr}-${med.id}`];
          
          if (!isScheduled) return null; // Don't show non-scheduled meds in history to avoid clutter

          return (
            <div 
              key={med.id}
              className={`
                p-4 rounded-xl border flex items-center justify-between
                ${isTaken 
                  ? 'bg-white border-green-100' 
                  : 'bg-white border-red-50' // Missed meds
                }
              `}
            >
              <div className="flex items-center gap-4">
                <div className={`
                  p-2 rounded-full 
                  ${isTaken ? 'bg-green-100 text-green-600' : 'bg-red-50 text-red-400'}
                `}>
                  {isTaken ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className={`font-semibold ${isTaken ? 'text-gray-800' : 'text-gray-400'}`}>
                    {med.name}
                  </h3>
                  <div className="flex gap-2 text-xs">
                    <span className="text-gray-500">{med.timing}</span>
                    {!isTaken && <span className="text-red-400 font-medium">Saltato</span>}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        
        {selectedStats.total === 0 && (
          <div className="text-center py-10 text-gray-400 flex flex-col items-center">
            <CalendarDays className="w-12 h-12 mb-2 opacity-20" />
            <p>Nessun medicinale previsto per questa data.</p>
          </div>
        )}
      </div>
    </div>
  );
};