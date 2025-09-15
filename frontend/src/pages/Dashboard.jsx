import React from 'react';
import { useMyRequests, usePendingRequests } from '../hooks/useRequests';
import { useEmployees } from '../hooks/useEmployees';
import { useServices } from '../hooks/useServices';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  ClockIcon,
  UserGroupIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  BuildingOfficeIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

const Dashboard = () => {
  const { data: myRequests, isLoading: loadingMyRequests } = useMyRequests();
  const { data: pendingRequests, isLoading: loadingPending } = usePendingRequests();
  const { data: employees, isLoading: loadingEmployees } = useEmployees();
  const { data: services, isLoading: loadingServices } = useServices();

  const stats = [
    {
      name: 'Mes demandes',
      value: myRequests?.length || 0,
      icon: ClockIcon,
      color: 'bg-blue-500',
      loading: loadingMyRequests,
    },
    {
      name: 'Demandes en attente',
      value: pendingRequests?.length || 0,
      icon: ExclamationTriangleIcon,
      color: 'bg-yellow-500',
      loading: loadingPending,
    },
    {
      name: 'Employés',
      value: employees?.length || 0,
      icon: UserGroupIcon,
      color: 'bg-green-500',
      loading: loadingEmployees,
    },
    {
      name: 'Services',
      value: services?.length || 0,
      icon: BuildingOfficeIcon,
      color: 'bg-purple-500',
      loading: loadingServices,
    },
  ];

  const recentRequests = myRequests?.slice(0, 5) || [];
  const urgentRequests = pendingRequests?.slice(0, 3) || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
        <p className="mt-1 text-sm text-gray-500">
          Vue d'ensemble de votre activité ChronosRH
        </p>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`p-3 rounded-md ${stat.color}`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {stat.name}
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stat.loading ? <LoadingSpinner size="sm" /> : stat.value}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mes dernières demandes */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900 flex items-center">
                <DocumentTextIcon className="h-5 w-5 text-gray-400 mr-2" />
                Mes dernières demandes
              </h2>
              <span className="text-sm text-gray-500">
                {myRequests?.length || 0} au total
              </span>
            </div>
          </div>
          <div className="p-6">
            {loadingMyRequests ? (
              <div className="flex justify-center py-4">
                <LoadingSpinner />
              </div>
            ) : recentRequests.length > 0 ? (
              <div className="space-y-4">
                {recentRequests.map((request) => (
                  <div key={request.requestID} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        Demande du {new Date(request.requestDate).toLocaleDateString('fr-FR')}
                      </p>
                      <p className="text-sm text-gray-500">
                        {request.startAt} - {request.endAt}
                      </p>
                      {request.comment && (
                        <p className="text-xs text-gray-400 mt-1 truncate">
                          {request.comment}
                        </p>
                      )}
                    </div>
                    <StatusBadge status={request.status} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-gray-500">Aucune demande trouvée</p>
              </div>
            )}
          </div>
        </div>

        {/* Demandes urgentes */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900 flex items-center">
                <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500 mr-2" />
                Demandes urgentes
              </h2>
              <span className="text-sm text-gray-500">
                {pendingRequests?.length || 0} en attente
              </span>
            </div>
          </div>
          <div className="p-6">
            {loadingPending ? (
              <div className="flex justify-center py-4">
                <LoadingSpinner />
              </div>
            ) : urgentRequests.length > 0 ? (
              <div className="space-y-4">
                {urgentRequests.map((request) => (
                  <div key={request.requestID} className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        Demande du {new Date(request.requestDate).toLocaleDateString('fr-FR')}
                      </p>
                      <p className="text-sm text-gray-500">
                        Employé ID: {request.employeeID}
                      </p>
                      <p className="text-xs text-yellow-600 mt-1">
                        En attente de validation
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors">
                        Approuver
                      </button>
                      <button className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors">
                        Rejeter
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <CheckCircleIcon className="mx-auto h-12 w-12 text-green-400" />
                <p className="mt-2 text-gray-500">Aucune demande urgente</p>
                <p className="text-xs text-gray-400">Toutes les demandes sont à jour</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Résumé rapide */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Résumé de la semaine</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {myRequests?.filter(r => r.status === 'accepted').length || 0}
              </div>
              <div className="text-sm text-gray-500">Demandes approuvées</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {myRequests?.filter(r => r.status === 'pending').length || 0}
              </div>
              <div className="text-sm text-gray-500">En attente</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {myRequests?.filter(r => r.status === 'rejected').length || 0}
              </div>
              <div className="text-sm text-gray-500">Rejetées</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;