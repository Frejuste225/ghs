import React from 'react';
import { useQuery } from 'react-query';
import { useAuth } from '../contexts/AuthContext';
import { requestService } from '../services/ghs';
import Card from '../components/ui/Card';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Users,
  Calendar,
  TrendingUp
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();

  // Récupérer les statistiques des demandes
  const { data: requests = [], isLoading } = useQuery(
    'dashboard-requests',
    requestService.getAll,
    {
      refetchInterval: 30000, // Actualiser toutes les 30 secondes
    }
  );

  // Calculer les statistiques
  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'Pending').length,
    approved: requests.filter(r => r.status === 'Approved').length,
    rejected: requests.filter(r => r.status === 'Rejected').length,
    myRequests: requests.filter(r => r.employee_id === user?.id).length,
  };

  const StatCard = ({ title, value, icon: Icon, color = 'primary', trend }) => (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`text-2xl font-bold text-${color}-600`}>{value}</p>
          {trend && (
            <p className="text-xs text-gray-500 mt-1">
              <TrendingUp className="w-3 h-3 inline mr-1" />
              {trend}
            </p>
          )}
        </div>
        <div className={`p-3 bg-${color}-100 rounded-full`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
      </div>
    </Card>
  );

  const RecentRequest = ({ request }) => (
    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
      <div className="flex items-center space-x-3">
        <div className={`p-2 rounded-full ${
          request.status === 'Approved' ? 'bg-success-100' :
          request.status === 'Rejected' ? 'bg-danger-100' :
          'bg-warning-100'
        }`}>
          {request.status === 'Approved' ? (
            <CheckCircle className="w-4 h-4 text-success-600" />
          ) : request.status === 'Rejected' ? (
            <XCircle className="w-4 h-4 text-danger-600" />
          ) : (
            <AlertCircle className="w-4 h-4 text-warning-600" />
          )}
        </div>
        <div>
          <p className="font-medium text-gray-900">
            {request.hours}h - {request.date}
          </p>
          <p className="text-sm text-gray-600">{request.reason}</p>
        </div>
      </div>
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
        request.status === 'Approved' ? 'bg-success-100 text-success-800' :
        request.status === 'Rejected' ? 'bg-danger-100 text-danger-800' :
        'bg-warning-100 text-warning-800'
      }`}>
        {request.status === 'Pending' ? 'En attente' :
         request.status === 'Approved' ? 'Approuvée' : 'Rejetée'}
      </span>
    </div>
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Bonjour, {user?.username} 👋
        </h1>
        <p className="text-gray-600">
          Voici un aperçu de vos heures supplémentaires
        </p>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total des demandes"
          value={stats.total}
          icon={Clock}
          color="primary"
          trend="+12% ce mois"
        />
        <StatCard
          title="En attente"
          value={stats.pending}
          icon={AlertCircle}
          color="warning"
        />
        <StatCard
          title="Approuvées"
          value={stats.approved}
          icon={CheckCircle}
          color="success"
        />
        <StatCard
          title="Mes demandes"
          value={stats.myRequests}
          icon={Users}
          color="secondary"
        />
      </div>

      {/* Contenu principal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Demandes récentes */}
        <Card title="Demandes récentes" className="h-fit">
          <div className="space-y-3">
            {requests.slice(0, 5).map((request) => (
              <RecentRequest key={request.id} request={request} />
            ))}
            {requests.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Aucune demande pour le moment</p>
              </div>
            )}
          </div>
        </Card>

        {/* Actions rapides */}
        <Card title="Actions rapides">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors">
              <Calendar className="w-8 h-8 text-primary-600 mx-auto mb-2" />
              <p className="font-medium text-gray-900">Nouvelle demande</p>
              <p className="text-sm text-gray-600">Créer une demande d'heures sup</p>
            </button>
            
            <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors">
              <TrendingUp className="w-8 h-8 text-primary-600 mx-auto mb-2" />
              <p className="font-medium text-gray-900">Mes statistiques</p>
              <p className="text-sm text-gray-600">Voir mes heures du mois</p>
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;