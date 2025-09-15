import React, { useState } from 'react';
import { useMyRequests } from '../hooks/useRequests';
import Table from '../components/Table';
import StatusBadge from '../components/StatusBadge';
import Button from '../components/Button';
import { Link } from 'react-router-dom';
import { PlusIcon } from '@heroicons/react/outline';

const MyRequests = () => {
  const { data: requests, isLoading } = useMyRequests();

  const columns = [
    {
      header: 'Date',
      accessor: 'requestDate',
      cell: (row) => new Date(row.requestDate).toLocaleDateString('fr-FR'),
    },
    {
      header: 'Horaires',
      cell: (row) => `${row.startAt} - ${row.endAt}`,
    },
    {
      header: 'Statut',
      cell: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: 'Commentaire',
      accessor: 'comment',
      cell: (row) => row.comment ? (
        <span className="text-gray-600 truncate max-w-xs block" title={row.comment}>
          {row.comment}
        </span>
      ) : (
        <span className="text-gray-400">-</span>
      ),
    },
    {
      header: 'Créé le',
      cell: (row) => new Date(row.createdAt).toLocaleDateString('fr-FR'),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mes demandes</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gérez vos demandes d'heures supplémentaires
          </p>
        </div>
        <Link to="/new-request">
          <Button>
            <PlusIcon className="w-4 h-4 mr-2" />
            Nouvelle demande
          </Button>
        </Link>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Liste des demandes</h2>
        </div>
        <Table
          columns={columns}
          data={requests}
          loading={isLoading}
          emptyMessage="Vous n'avez aucune demande pour le moment"
        />
      </div>
    </div>
  );
};

export default MyRequests;
