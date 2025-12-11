import React, { useState, useMemo } from 'react';
import { 
  format, 
  addDays, 
  isSameDay, 
  differenceInDays, 
  endOfMonth, 
  endOfWeek, 
  eachDayOfInterval, 
  addMonths, 
  isAfter, 
  isSameMonth
} from 'date-fns';
import it from 'date-fns/locale/it';
import { Check, X, CalendarDays, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
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
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  
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
    
    // Filter logic:
    // 1. Must be scheduled based on frequency
    // 2. If ARCHIVED, exclude it UNLESS there is a log proving it was taken that day.
    const scheduledMeds = medications.filter(med => {
      const isScheduled = isMedicationScheduled(med, date);
      if (!isScheduled) return false;

      // Fix for suspended therapy showing as missed:
      if (med.isArchived) {
        const wasTaken = logs[`${dateStr}-${med.id}`];
        if (!wasTaken) return false;
      }
      
      return true;
    });
    
    if (scheduledMeds.length === 0) return { taken: 0, total: 0, percentage: 0, isEmpty: true };

    const takenCount = scheduledMeds.filter(m => logs[`${dateStr}-${m.id}`]).length;
    return {
      taken: takenCount,
      total: scheduledMeds.length,
      percentage: Math.round((takenCount / scheduledMeds.length) * 100),
      isEmpty: false
    };
  };

  // Calendar Logic
  const calendarDays = useMemo(() => {
    // Manual implementation of startOfMonth to avoid import error
    const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const monthEnd = endOfMonth(monthStart);
    
    // Manual implementation of startOfWeek (Monday start) to avoid import error
    const day = monthStart.getDay();
    const diff = (day === 0 ? 6 : day - 1);
    const startDate = new Date(monthStart);
    startDate.setDate(monthStart.getDate() - diff);
    startDate.setHours(0, 0, 0, 0);

    const endDate = endOfWeek(monthEnd, { locale: it, weekStartsOn: 1 });

    return eachDayOfInterval({ start: startDate, end: endDate });
  }, [currentMonth]);

  const nextMonth = () => setCurrentMonth(prev => addMonths(prev, 1));
  // Use addMonths with negative value instead of subMonths to avoid import error
  const prevMonth = () => setCurrentMonth(prev => addMonths(prev, -1));

  const weekDays = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];

  const selectedStats = getDayStats(selectedDate);
  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
  const isToday = isSameDay(selectedDate, new Date());

  return (
    <div className="pb-24 pt-4">
      {/* Calendar Container */}
      <div className="mx-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden mb-6 transition-colors">
        
        {/* Month Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-50 dark:border-gray-700">
           <button onClick={prevMonth} className="p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-full text-gray-400 dark:text-gray-500 active:bg-gray-100 dark:active:bg-gray-600 transition-colors">
             <ChevronLeft className="w-5 h-5" />
           </button>
           <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 capitalize">
             {format(currentMonth, 'MMMM yyyy', { locale: it })}
           </h2>
           <button onClick={nextMonth} className="p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-full text-gray-400 dark:text-gray-500 active:bg-gray-100 dark:active:bg-gray-600 transition-colors">
             <ChevronRight className="w-5 h-5" />
           </button>
        </div>

        {/* Days Grid */}
        <div className="p-2">
           {/* Weekday Labels */}
           <div className="grid grid-cols-7 mb-2">
             {weekDays.map(d => (
               <div key={d} className="text-center text-[10px] font-bold text-gray-300 dark:text-gray-600 uppercase">
                 {d}
               </div>
             ))}
           </div>

           {/* Dates */}
           <div className="grid grid-cols-7 gap-1">
             {calendarDays.map((day) => {
               const isCurrentMonth = isSameMonth(day, currentMonth);
               const isSelected = isSameDay(day, selectedDate);
               const isDayToday = isSameDay(day, new Date());
               const isFuture = isAfter(day, new Date()) && !isDayToday;
               
               const stats = getDayStats(day);
               
               // Dot Logic
               let dotColor = 'bg-gray-200 dark:bg-gray-600'; // Default/Empty
               
               if (stats.isEmpty) {
                 dotColor = 'bg-transparent';
               } else if (isFuture) {
                 dotColor = 'bg-gray-200 dark:bg-gray-600'; // Future placeholder
               } else {
                 if (stats.percentage === 100) dotColor = 'bg-green-500';
                 else if (stats.percentage > 0) dotColor = 'bg-yellow-400';
                 else dotColor = isDayToday ? 'bg-gray-300 dark:bg-gray-500' : 'bg-red-400';
               }

               return (
                 <button
                   key={day.toISOString()}
                   onClick={() => setSelectedDate(day)}
                   className={`
                     aspect-[4/5] rounded-xl flex flex-col items-center justify-center gap-1 relative transition-all
                     ${!isCurrentMonth ? 'opacity-30' : ''}
                     ${isSelected ? `bg-${currentUser.themeColor.replace('bg-', '')}/10 ring-2 ring-${currentUser.themeColor.replace('bg-', '')} ring-inset` : 'hover:bg-gray-50 dark:hover:bg-gray-700'}
                   `}
                 >
                   <span className={`text-sm font-semibold ${isSelected ? `text-${currentUser.themeColor.replace('bg-', '')}` : (isDayToday ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-200')}`}>
                     {format(day, 'd')}
                   </span>
                   
                   {/* Status Dot */}
                   {!stats.isEmpty && (
                     <div className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
                   )}
                 </button>
               );
             })}
           </div>
        </div>
      </div>

      {/* Selected Day Header (Mini) */}
      <div className="px-6 mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 capitalize">
            {format(selectedDate, 'EEEE d MMMM', { locale: it })}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
             {selectedStats.isEmpty 
               ? 'Nessun piano' 
               : `Completamento: ${selectedStats.percentage}%`
             }
          </p>
        </div>
      </div>

      {/* Medication List for Selected Date */}
      <div className="px-4 flex flex-col gap-3">
        {medications.map((med) => {
          const isScheduled = isMedicationScheduled(med, selectedDate);
          const isTaken = logs[`${selectedDateStr}-${med.id}`];
          
          if (!isScheduled) return null;

          // Fix for list rendering: Hide archived meds unless they were taken
          if (med.isArchived && !isTaken) return null;

          // Determine Style based on state
          let containerClass = "bg-white dark:bg-gray-800 border-red-50 dark:border-red-900/50"; // Default skipped (past)
          let iconBgClass = "bg-red-50 dark:bg-red-900/30 text-red-400 dark:text-red-300";
          let icon = <X className="w-5 h-5" />;
          let statusLabel = <span className="text-red-400 font-medium">Saltato</span>;
          let textClass = "text-gray-400 dark:text-gray-500";

          // Future logic for list items
          if (isAfter(selectedDate, new Date()) && !isToday) {
             containerClass = "bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-700 opacity-60";
             iconBgClass = "bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500";
             icon = <Clock className="w-5 h-5" />;
             statusLabel = null; // No label for future
             textClass = "text-gray-400 dark:text-gray-500";
          }
          else if (isTaken) {
             containerClass = "bg-white dark:bg-gray-800 border-green-100 dark:border-green-900/50";
             iconBgClass = "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400";
             icon = <Check className="w-5 h-5" />;
             statusLabel = <span className="text-green-600 dark:text-green-400 font-bold text-xs">PRESO</span>;
             textClass = "text-gray-800 dark:text-gray-100";
          } else if (isToday) {
             containerClass = "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 border-dashed";
             iconBgClass = "bg-blue-50 dark:bg-blue-900/30 text-blue-500 dark:text-blue-400";
             icon = <Clock className="w-5 h-5" />;
             statusLabel = <span className="text-blue-500 dark:text-blue-400 font-medium bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded text-[10px]">Da prendere</span>;
             textClass = "text-gray-600 dark:text-gray-300";
          }

          return (
            <div 
              key={med.id}
              className={`p-4 rounded-xl border flex items-center justify-between transition-colors ${containerClass}`}
            >
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-full ${iconBgClass}`}>
                  {icon}
                </div>
                <div>
                  <h3 className={`font-semibold ${textClass}`}>
                    {med.name}
                  </h3>
                  <div className="flex gap-2 text-xs items-center">
                    <span className="text-gray-500 dark:text-gray-400">{med.timing}</span>
                    {statusLabel}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        
        {selectedStats.isEmpty && (
          <div className="text-center py-10 text-gray-400 dark:text-gray-600 flex flex-col items-center">
            <CalendarDays className="w-12 h-12 mb-2 opacity-20" />
            <p>Nessun medicinale previsto per questa data.</p>
          </div>
        )}
      </div>
    </div>
  );
};