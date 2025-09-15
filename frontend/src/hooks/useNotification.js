import { useState, useCallback } from 'react';

const useNotification = () => {
  const [notification, setNotification] = useState({
    isVisible: false,
    type: 'info',
    title: '',
    message: ''
  });

  const showNotification = useCallback((type, title, message) => {
    setNotification({
      isVisible: true,
      type,
      title,
      message
    });
  }, []);

  const hideNotification = useCallback(() => {
    setNotification(prev => ({
      ...prev,
      isVisible: false
    }));
  }, []);

  const showSuccess = useCallback((title, message) => {
    showNotification('success', title, message);
  }, [showNotification]);

  const showError = useCallback((title, message) => {
    showNotification('error', title, message);
  }, [showNotification]);

  const showWarning = useCallback((title, message) => {
    showNotification('warning', title, message);
  }, [showNotification]);

  const showInfo = useCallback((title, message) => {
    showNotification('info', title, message);
  }, [showNotification]);

  return {
    notification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    hideNotification
  };
};

export default useNotification;