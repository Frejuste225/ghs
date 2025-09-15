import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  HomeIcon,
  ClockIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  DocumentTextIcon,
  CogIcon
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Tableau de bord', href: '/', icon: HomeIcon },
  { name: 'Mes demandes', href: '/my-requests', icon: ClockIcon },
  { name: 'Nouvelle demande', href: '/new-request', icon: DocumentTextIcon },
  { name: 'Employés', href: '/employees', icon: UserGroupIcon },
  { name: 'Services', href: '/services', icon: BuildingOfficeIcon },
  { name: 'Paramètres', href: '/settings', icon: CogIcon },
];

const Sidebar = () => {
  return (
    <div className="w-64 bg-gray-900 min-h-screen">
      <div className="flex items-center justify-center h-16 bg-gray-800">
        <div className="flex items-center space-x-2">
          <ClockIcon className="h-8 w-8 text-blue-400" />
          <span className="text-white text-xl font-bold">ChronosRH</span>
        </div>
      </div>
      
      <nav className="mt-8">
        <div className="px-4 space-y-2">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                `group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'bg-gray-800 text-white border-r-2 border-blue-400'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`
              }
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </NavLink>
          ))}
        </div>
      </nav>
      
      <div className="absolute bottom-4 left-4 right-4">
        <div className="bg-gray-800 rounded-lg p-3">
          <p className="text-xs text-gray-400 text-center">
            Version 1.0.0
          </p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;