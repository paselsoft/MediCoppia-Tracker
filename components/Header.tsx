import React from 'react';
import { UserProfile, UserID } from '../types';
import { Users } from 'lucide-react';

interface HeaderProps {
  currentUser: UserProfile;
  onSwitchUser: (id: UserID) => void;
  availableUsers: UserProfile[];
  dateDisplay: string;
}

export const Header: React.FC<HeaderProps> = ({ 
  currentUser, 
  onSwitchUser, 
  availableUsers,
  dateDisplay
}) => {
  return (
    <div className={`${currentUser.themeColor} text-white pt-12 pb-8 px-6 rounded-b-[2rem] shadow-lg sticky top-0 z-40 transition-colors duration-500`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-blue-100 text-sm font-medium uppercase tracking-wider opacity-80">
            {dateDisplay}
          </p>
          <h1 className="text-3xl font-bold mt-1">
            Ciao, {currentUser.name}
          </h1>
        </div>
        <div className="bg-white/20 backdrop-blur-md p-1 rounded-full flex gap-1">
          {availableUsers.map((user) => (
             <button
               key={user.id}
               onClick={() => onSwitchUser(user.id)}
               className={`
                 relative w-10 h-10 rounded-full overflow-hidden border-2 transition-all duration-300
                 ${currentUser.id === user.id ? 'border-white scale-110 shadow-md' : 'border-transparent opacity-60 grayscale'}
               `}
               aria-label={`Switch to ${user.name}`}
             >
               <img src={user.avatar} alt={user.name} className="w-full h-full object-cover bg-white" />
             </button>
          ))}
        </div>
      </div>
      
      {/* Progress Bar placeholder - could be dynamic later */}
      <div className="w-full bg-black/10 h-1.5 rounded-full overflow-hidden backdrop-blur-sm">
        <div className="h-full bg-white/90 w-full animate-pulse opacity-50" style={{ width: '0%' }}></div> 
        {/* We will animate this in the main component */}
      </div>
    </div>
  );
};