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
          className="fixed inset-0 z-40 lg:hidden bg-gray-600 bg-opacity-75"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={clsx(
          'fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0',
          {
            'translate-x-0': isOpen,
            '-translate-x-full': !isOpen,
          }
        )}
      >
        <div className="flex flex-col h-full">
          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {filteredNavigation.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  onClick={onClose}
                  className={({ isActive }) =>
                    clsx(
                      'flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200',
                      {
                        'bg-primary-100 text-primary-700 border-r-2 border-primary-500': isActive,
                        'text-gray-600 hover:bg-gray-100 hover:text-gray-900': !isActive,
                      }
                    )
                  }
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.name}
                </NavLink>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <div className="text-xs text-gray-500 text-center">
              GHS v2.0
              <br />
              © 2024 - Tous droits réservés
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;