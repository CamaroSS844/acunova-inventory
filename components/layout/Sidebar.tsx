import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, Users, Banknote, UserCog, Bot, FileText, ShoppingCart } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';

const Sidebar: React.FC = () => {
  const { currentUser } = useAuth();

  const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
    `flex items-center px-4 py-2.5 rounded-lg transition-colors duration-200 ${
      isActive
        ? 'bg-primary-600 text-white shadow-md'
        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
    }`;

  const hasAccess = (allowedRoles: string[]) => {
      return currentUser && allowedRoles.includes(currentUser.role);
  }

  return (
    <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col flex-shrink-0">
      <div className="h-16 flex items-center justify-center px-4 border-b border-gray-200 dark:border-gray-700">
        <Bot className="h-8 w-8 text-primary-600" />
        <h1 className="text-xl font-bold ml-2 text-gray-900 dark:text-white">Acunova</h1>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-2">
        <NavLink to="/dashboard" className={navLinkClasses}>
          <LayoutDashboard className="h-5 w-5 mr-3" />
          Dashboard
        </NavLink>
        <NavLink to="/stock" className={navLinkClasses}>
          <Package className="h-5 w-5 mr-3" />
          Stock
        </NavLink>
        {hasAccess(['Admin', 'Warehouse Staff']) && (
          <NavLink to="/orders" className={navLinkClasses}>
            <ShoppingCart className="h-5 w-5 mr-3" />
            Orders
          </NavLink>
        )}
        {hasAccess(['Admin', 'Warehouse Staff']) && (
            <NavLink to="/suppliers" className={navLinkClasses}>
                <Users className="h-5 w-5 mr-3" />
                Suppliers
            </NavLink>
        )}
        {hasAccess(['Admin', 'Sales Rep']) && (
            <NavLink to="/finance" className={navLinkClasses}>
                <Banknote className="h-5 w-5 mr-3" />
                Finance
            </NavLink>
        )}
        {hasAccess(['Admin']) && (
            <NavLink to="/staff" className={navLinkClasses}>
                <UserCog className="h-5 w-5 mr-3" />
                Staff
            </NavLink>
        )}
        {hasAccess(['Admin', 'Sales Rep']) && (
            <NavLink to="/reports" className={navLinkClasses}>
                <FileText className="h-5 w-5 mr-3" />
                Reports
            </NavLink>
        )}
      </nav>
      <div className="px-4 py-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400">&copy; 2024 Acunova Inventory. Powered by Gemini.</p>
      </div>
    </aside>
  );
};

export default Sidebar;