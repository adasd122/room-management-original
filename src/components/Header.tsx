import React, { ReactNode } from 'react';
import { BellRing, UserCircle } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

interface HeaderProps {
  children?: ReactNode;
}

const Header: React.FC<HeaderProps> = ({ children }) => {
  const { getPendingPayments } = useAppContext();
  const pendingPayments = getPendingPayments();
  
  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center px-4 shadow-sm">
      <div className="flex justify-between items-center w-full">
        <div className="flex items-center">
          {children}
          <h1 className="ml-4 text-xl font-semibold text-gray-800">Hostel Management System</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="relative">
            <button className="p-2 rounded-full hover:bg-gray-100 text-gray-600 focus:outline-none">
              <BellRing size={20} />
              {pendingPayments.length > 0 && (
                <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-red-500 flex items-center justify-center text-xs text-white">
                  {pendingPayments.length > 9 ? '9+' : pendingPayments.length}
                </span>
              )}
            </button>
          </div>
          <button className="p-2 rounded-full hover:bg-gray-100 text-gray-600 focus:outline-none">
            <UserCircle size={20} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;