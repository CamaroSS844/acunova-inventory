
import React from 'react';
import { Search, Bell, UserCircle, ChevronsUpDown } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';

const Header: React.FC = () => {
  const { currentUser, allStaff, login } = useAuth();

  return (
    <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
      <div className="flex items-center justify-between px-6 h-full">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search components, suppliers..."
            className="w-96 pl-10 pr-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 border border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        <div className="flex items-center space-x-4">
          <button className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 focus:outline-none">
            <Bell className="h-6 w-6" />
          </button>
          <div className="flex items-center">
            <UserCircle className="h-8 w-8 text-gray-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900 dark:text-white">{currentUser?.name || 'Loading...'}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{currentUser?.role}</p>
            </div>
          </div>
           <div className="relative">
              <select 
                value={currentUser?.id || ''} 
                onChange={(e) => login(e.target.value)}
                className="appearance-none w-full pl-3 pr-8 py-1.5 text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                aria-label="Switch user role"
              >
                {allStaff.map(staff => (
                  <option key={staff.id} value={staff.id}>{staff.name}</option>
                ))}
              </select>
              <ChevronsUpDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none"/>
            </div>
        </div>
      </div>
    </header>
  );
};

export default Header;