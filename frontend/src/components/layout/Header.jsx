import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  User, 
  LogOut, 
  Settings, 
  Bell,
  Menu,
  X,
  Search,
  Sun,
  Moon
} from 'lucide-react';
import Button from '../ui/Button';

const Header = ({ onMenuToggle, isMobileMenuOpen }) => {
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
  };

  const notifications = [
    {
      id: 1,
      title: 'Nouvelle demande',
      message: 'Jean Dupont a soumis une demande d\'heures supplémentaires',
      time: '5 min',
      unread: true,
    },
    {
      id: 2,
      title: 'Demande approuvée',
      message: 'Votre demande du 15/01/2024 a été approuvée',
      time: '1h',
      unread: true,
    },
    {
      id: 3,
      title: 'Rappel',
      message: '3 demandes en attente de validation',
      time: '2h',
      unread: false,
    },
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <header className="header sticky top-0 z-30 animate-slide-in-down">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo et menu mobile */}
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden hover-scale"
              onClick={onMenuToggle}
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
            
            <div className="hidden sm:flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-sm">GHS</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">
                  ChronosRH
                </h1>
                <p className="text-xs text-gray-500 hidden md:block">
                  Gestion des Heures Supplémentaires
                </p>
              </div>
            </div>
          </div>

          {/* Barre de recherche */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Rechercher..."
                className="input pl-10 pr-4 py-2 w-full bg-gray-50 border-gray-200 focus:bg-white transition-all-300"
              />
            </div>
          </div>

          {/* Actions utilisateur */}
          <div className="flex items-center space-x-2">
            {/* Mode sombre */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="hover-scale"
            >
              {isDarkMode ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </Button>

            {/* Notifications */}
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative hover-scale"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-bounce-slow">
                    {unreadCount}
                  </span>
                )}
              </Button>

              {/* Dropdown notifications */}
              {showNotifications && (
                <div className="dropdown-menu w-80 animate-scale-in">
                  <div className="px-4 py-3 border-b border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-900">
                      Notifications
                    </h3>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={clsx(
                          'px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer border-l-4',
                          notification.unread
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-transparent'
                        )}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">
                              {notification.title}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                              {notification.message}
                            </p>
                          </div>
                          <span className="text-xs text-gray-400 ml-2">
                            {notification.time}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="px-4 py-3 border-t border-gray-200">
                    <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                      Voir toutes les notifications
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Menu utilisateur */}
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 hover-scale"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-md">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.username || 'Utilisateur'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {user?.profile || 'Profil'}
                  </p>
                </div>
              </Button>

              {/* Dropdown menu */}
              {showUserMenu && (
                <div className="dropdown-menu animate-scale-in">
                  <div className="px-4 py-3 border-b border-gray-200">
                    <p className="text-sm font-medium text-gray-900">
                      {user?.username}
                    </p>
                    <p className="text-sm text-gray-500">
                      {user?.profile}
                    </p>
                  </div>
                  <a
                    href="#"
                    className="dropdown-item"
                    onClick={(e) => e.preventDefault()}
                  >
                    <User className="w-4 h-4 mr-2" />
                    Mon profil
                  </a>
                  <a
                    href="#"
                    className="dropdown-item"
                    onClick={(e) => e.preventDefault()}
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Paramètres
                  </a>
                  <hr className="my-1" />
                  <button
                    onClick={handleLogout}
                    className="dropdown-item w-full text-left text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Déconnexion
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;