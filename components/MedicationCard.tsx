import React, { useState, useEffect, useRef } from 'react';
import { Pill, Droplets, Clock, Check, AlertCircle, Pencil, Mail, ShoppingCart } from 'lucide-react';
import { Medication, UserProfile } from '../types';

interface MedicationCardProps {
  medication: Medication;
  isTaken: boolean;
  onToggle: () => void;
  onEdit: (med: Medication) => void;
  userTheme: UserProfile;
  disabled?: boolean;
}

export const MedicationCard: React.FC<MedicationCardProps> = ({ 
  medication, 
  isTaken, 
  onToggle, 
  onEdit,
  userTheme,
  disabled = false
}) => {
  const [flash, setFlash] = useState(false);
  const isFirstRender = useRef(true);

  // Trigger flash effect when marked as taken (but not on initial load)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (isTaken) {
      setFlash(true);
      const timer = setTimeout(() => setFlash(false), 400); // 400ms flash
      return () => clearTimeout(timer);
    }
  }, [isTaken]);
  
  const getIcon = () => {
    switch(medication.icon) {
      case 'drop': return <Droplets className="w-5 h-5" />;
      case 'clock': return <Clock className="w-5 h-5" />;
      case 'sachet': return <Mail className="w-5 h-5" />;
      default: return <Pill className="w-5 h-5" />;
    }
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(medication);
  };

  // Stock logic
  const showLowStockWarning = 
    medication.stockQuantity !== undefined && 
    medication.stockThreshold !== undefined && 
    medication.stockQuantity <= medication.stockThreshold;

  const isOutOfStock = medication.stockQuantity !== undefined && medication.stockQuantity <= 0;

  // Determine accent color for the left border based on theme
  const accentBorderColor = userTheme.themeColor.includes('blue') ? 'border-l-blue-600' : 'border-l-rose-500';

  if (disabled) {
    return (
      <div className="mx-4 mb-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700 opacity-50 flex items-center justify-between grayscale">
         <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-200 dark:bg-gray-700 rounded-full text-gray-400 dark:text-gray-500">
              {getIcon()}
            </div>
            <div>
              <h3 className="font-semibold text-gray-400 dark:text-gray-500">{medication.name}</h3>
              <p className="text-xs text-gray-400 dark:text-gray-500">Non previsto oggi</p>
            </div>
         </div>
      </div>
    );
  }

  return (
    <div 
      onClick={onToggle}
      className={`
        mx-4 mb-3 p-4 rounded-xl transition-all duration-300 cursor-pointer select-none active:scale-[0.98] group relative overflow-hidden
        ${flash 
          ? 'bg-green-100 dark:bg-green-900 border border-green-300 dark:border-green-800 scale-[1.01] shadow-md' 
          : (isTaken 
            ? `bg-white/60 dark:bg-gray-800/60 border border-green-100 dark:border-green-900 shadow-sm` // Taken state: cleaner, flatter
            : `bg-white dark:bg-gray-800 border-y border-r border-gray-100 dark:border-gray-700 ${accentBorderColor} border-l-[6px] shadow-md` // Pending state: High contrast, thick border
          )
        }
      `}
    >
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-4 flex-1">
          {/* Icon Circle */}
          <div className={`
            p-3 rounded-full transition-colors duration-300 flex-shrink-0 relative
            ${isTaken 
              ? 'bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400 opacity-70' 
              : `${userTheme.secondaryColor} dark:bg-gray-700 ${userTheme.themeColor.replace('bg-', 'text-')} dark:text-gray-200`
            }
          `}>
            {isTaken ? <Check className="w-6 h-6 animate-pop" /> : getIcon()}
            
            {/* Out of Stock Indicator on Icon */}
            {!isTaken && isOutOfStock && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white dark:border-gray-800" />
            )}
          </div>
          
          {/* Text Content */}
          <div className="flex flex-col flex-1 min-w-0 pr-2">
            <h3 className={`font-bold text-lg leading-tight truncate transition-all ${isTaken ? 'text-gray-400 dark:text-gray-500 line-through' : 'text-gray-800 dark:text-gray-100'}`}>
              {medication.name}
            </h3>
            
            <div className="flex flex-wrap items-center gap-2 mt-1.5">
              <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${isTaken ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>
                {medication.dosage}
              </span>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-md flex items-center gap-1 ${isTaken ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500' : 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'}`}>
                <Clock className="w-3 h-3" />
                {medication.timing}
              </span>
            </div>

            {/* Notes Section */}
            {medication.notes && !isTaken && (
              <div className="mt-2 flex items-start gap-1.5 bg-amber-50 dark:bg-amber-900/30 border border-amber-100 dark:border-amber-900/50 p-2 rounded-lg text-amber-800 dark:text-amber-200">
                <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 animate-pulse" />
                <p className="text-xs font-medium leading-tight">
                  {medication.notes}
                </p>
              </div>
            )}
            
            {/* Low Stock Warning */}
            {!isTaken && showLowStockWarning && (
               <div className={`mt-2 flex items-center gap-1.5 px-2 py-1 rounded-lg w-fit ${isOutOfStock ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/50' : 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 border border-orange-100 dark:border-orange-900/50'}`}>
                  <ShoppingCart className="w-3 h-3" />
                  <span className="text-[10px] font-bold">
                    {isOutOfStock ? 'ESAURITO' : `Rimasti: ${medication.stockQuantity}`}
                  </span>
               </div>
            )}

             {medication.notes && isTaken && (
              <p className="text-xs text-gray-300 dark:text-gray-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {medication.notes}
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pl-2">
          {!isTaken && (
            <button 
              onClick={handleEditClick}
              className="p-2 text-gray-300 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors z-10"
              aria-label="Modifica"
            >
              <Pencil className="w-4 h-4" />
            </button>
          )}

          <div className={`
            w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all duration-500
            ${isTaken ? 'border-green-500 bg-green-500 scale-110' : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 group-hover:border-gray-300'}
          `}>
            {isTaken && <Check className="w-3.5 h-3.5 text-white animate-pop" />}
          </div>
        </div>
      </div>
    </div>
  );
};