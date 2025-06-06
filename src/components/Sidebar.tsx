import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  Users, 
  DollarSign, 
  PieChart,
  Settings, 
  X,
  Building,
  UserCircle
} from 'lucide-react';

interface SidebarProps {
  closeSidebar: () => void;
}

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label, onClick }) => {
  return (
    <NavLink 
      to={to} 
      onClick={onClick}
      className={({ isActive }) => 
        `flex items-center px-4 py-3 text-gray-700 hover:bg-primary-50 hover:text-primary-600 rounded-lg transition-colors ${
          isActive ? 'bg-primary-50 text-primary-600 font-medium' : ''
        }`
      }
    >
      <span className="mr-3">{icon}</span>
      {label}
    </NavLink>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ closeSidebar }) => {
  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      {/* Logo and close button (for mobile) */}
      <div className="flex items-center justify-between px-4 py-6 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <Building size={24} className="text-primary-600" />
          <span className="text-xl font-bold text-primary-600">HMS</span>
        </div>
        <button 
          className="p-1 rounded-md text-gray-500 hover:text-gray-700 md:hidden" 
          onClick={closeSidebar}
        >
          <X size={20} />
        </button>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1">
        <NavItem to="/" icon={<Home size={20} />} label="Dashboard" onClick={closeSidebar} />
        <NavItem to="/residents" icon={<Users size={20} />} label="Residents" onClick={closeSidebar} />
        <NavItem to="/payments" icon={<DollarSign size={20} />} label="Payments" onClick={closeSidebar} />
        <NavItem to="/reports" icon={<PieChart size={20} />} label="Reports" onClick={closeSidebar} />
        <NavItem to="/settings" icon={<Settings size={20} />} label="Settings" onClick={closeSidebar} />
      </nav>
      
      {/* User info at bottom */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <UserCircle className="h-8 w-8 text-gray-500" />
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-700">Admin User</p>
            <p className="text-xs text-gray-500">admin@example.com</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;