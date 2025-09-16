import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  Home,
  Users,
  Building2,
  Clock,
  UserCheck,
  Settings,
  BarChart3,
  FileText,
  X,
} from 'lucide-react';
import { clsx } from 'clsx';

const Sidebar = ({ isOpen, onClose }) => {
  const { hasPermission } = useAuth();

  const navigation = [
    {
      name: 'Tableau de bord',
      href: '/',
      icon: Home,
      current: false,
    },
    {
      name: 'Mes demandes',
      href: '/requests',
      icon: Clock,
      current: false,
    },
    {
      name: 'Employés',
      href: '/employees',
      icon: Users,
      current: false,
      permission: ['Administrator', 'Supervisor'],
    },
    {
      name: 'Services',
      href: '/services',
      icon: Building2,
      current: false,
      permission: ['Administrator', 'Supervisor'],
    },
    {
      name: 'Validation',
      href: '/validation',
      icon: UserCheck,
      current: false,
      permission: ['Administrator', 'Supervisor', 'Coordinator'],
    },
    {
      name: 'Rapports',
      href: '/reports',
      icon: BarChart3,
      current: false,
      permission: ['Administrator', 'Supervisor'],
    },
    {
      name: 'Comptes',
      href: '/accounts',
      icon: Settings,
      current: false,
      permission: ['Administrator'],
    },
  ];

  const filteredNavigation = navigation.filter(item => 
    !item.permission || hasPermission(item.permission)
  );

  return (
    <>
      {/* Overlay mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden bg-gray-900 bg-opacity-50 transition-opacity duration-300 animate-fade-in"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={clsx(
          'fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0',
          {
            'translate-x-0': isOpen,
            '-translate-x-full': !isOpen,
          }
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header avec logo */}
          <div className="flex items-center justify-between h-16 px-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-lg font-bold">ChronosRH</h1>
                <p className="text-xs text-blue-100">Gestion des heures</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden p-1 rounded-md hover:bg-white hover:bg-opacity-20 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {filteredNavigation.map((item, index) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  onClick={onClose}
                  className={({ isActive }) =>
                    clsx(
                      'nav-link group animate-slide-in-left',
                      {
                        'nav-link-active bg-blue-50 text-blue-700 border-r-4 border-blue-500': isActive,
                        'nav-link-inactive text-gray-600 hover:bg-gray-50 hover:text-gray-900': !isActive,
                      }
                    )
                  }
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <Icon className="w-5 h-5 mr-3 transition-transform group-hover:scale-110" />
                  <span className="font-medium">{item.name}</span>
                  {item.name === 'Mes demandes' && (
                    <span className="ml-auto bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded-full">
                      3
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="text-center">
              <div className="text-xs text-gray-500 mb-2">
                Version 2.0.0
              </div>
              <div className="flex items-center justify-center space-x-2 text-xs text-gray-400">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>Système opérationnel</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;