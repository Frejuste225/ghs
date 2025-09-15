import React from 'react';

const StatusBadge = ({ status }) => {
  const getStatusConfig = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
      case 'en_attente':
        return {
          label: 'En attente',
          className: 'bg-yellow-100 text-yellow-800',
        };
      case 'accepted':
      case 'approuve':
      case 'approved':
        return {
          label: 'Approuvé',
          className: 'bg-green-100 text-green-800',
        };
      case 'rejected':
      case 'refuse':
        return {
          label: 'Refusé',
          className: 'bg-red-100 text-red-800',
        };
      case 'cancelled':
      case 'annule':
        return {
          label: 'Annulé',
          className: 'bg-gray-100 text-gray-800',
        };
      default:
        return {
          label: status || 'Inconnu',
          className: 'bg-gray-100 text-gray-800',
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  );
};

export default StatusBadge;