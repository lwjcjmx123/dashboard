import React from 'react';
import { Bell, Search, User } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { formatDate } from '../../utils/dateUtils';

const Header: React.FC = () => {
  const { state } = useApp();
  const { settings, selectedDate } = state;
  const isDark = settings.theme === 'dark';

  return (
    <header className={`h-16 flex items-center justify-between px-6 ${isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'} border-b border-gray-200 dark:border-gray-700 transition-colors duration-200`}>
      <div className="flex items-center gap-4">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {formatDate(selectedDate, settings.timeFormat)}
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search anything..."
            className={`w-64 pl-10 pr-4 py-2 rounded-lg border ${
              isDark 
                ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400' 
                : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500'
            } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
          />
        </div>
        
        <button className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} transition-colors duration-200 relative`}>
          <Bell size={20} />
          <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
        </button>
        
        <button className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} transition-colors duration-200`}>
          <User size={20} />
        </button>
      </div>
    </header>
  );
};

export default Header;