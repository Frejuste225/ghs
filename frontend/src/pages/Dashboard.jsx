import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { requestService, employeeService, serviceService } from '../services/ghs';
import { useAuth } from '../contexts/AuthContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { 
  Clock, 
  Users, 
  Building2, 
  TrendingUp, 
  AlertCircle,
  CheckCircle,
  XCircle,
  Calendar,
  BarChart3,
  Plus,
  ArrowRight,
  Activity
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();
  const [timeOfDay, setTimeOfDay] = useState('');

  // Récupérer les données
  const { data: requests = [], isLoading: requestsLoading } = useQuery('requests', requestService.getAll);
  const { data: employees = [], isLoading: employeesLoading } = useQuery('employees', employeeService.getAll);
  const { data: services = [], isLoading: servicesLoading } = useQuery('services', serviceService.getAll);

  const isLoading = requestsLoading || employeesLoading || servicesLoading;

  // Déterminer le moment de la journée
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setTimeOfDay('Bonjour');
    } else if (hour < 18) {
      setTimeOfDay('Bon après-midi');
    } else {
      setTimeOfDay('Bonsoir');
    }
  }, []);

  // Calculer les statistiques
  const stats = {
    totalRequests: requests.length,
    pendingRequests: requests.filter(r => r.status === 'Pending').length,
    approvedRequests: requests.filter(r => r.status === 'Approved').length,
    rejectedRequests: requests.filter(r => r.status === 'Rejected').length,
    totalEmployees: employees.length,
    totalServices: services.length,
    totalHours: requests.reduce((sum, r) => sum + (r.hours || 0), 0),
    approvedHours: requests.filter(r => r.status === 'Approved').reduce((sum, r) => sum + (r.hours || 0), 0),
  };

  // Données pour les graphiques
  const chartData = {
    monthly: [
      { month: 'Jan', requests: 45, hours: 120 },
      { month: 'Fév', requests: 52, hours: 140 },
      { month: 'Mar', requests: 38, hours: 95 },
      { month: 'Avr', requests: 61, hours: 165 },
      { month: 'Mai', requests: 48, hours: 128 },
      { month: 'Juin', requests: 55, hours: 148 }
    ]
  };

  const maxRequests = Math.max(...chartData.monthly.map(d => d.requests));

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* En-tête de bienvenue */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 rounded-2xl p-8 text-white animate-slide-in-down">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              {timeOfDay}, {user?.username} ! 👋
            </h1>
            <p className="text-blue-100 text-lg">
              Voici un aperçu de votre activité aujourd'hui
            </p>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <div className="text-right">
              <p className="text-2xl font-bold">{new Date().toLocaleDateString('fr-FR')}</p>
              <p className="text-blue-200">Aujourd'hui</p>
            </div>
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <Calendar className="w-8 h-8" />
            </div>
          </div>
        </div>
      </div>

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="stat-card hover-lift animate-slide-in-up" style={{ animationDelay: '100ms' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="stat-label">Total demandes</p>
              <p className="stat-value text-blue-600">{stats.totalRequests}</p>
              <p className="text-xs text-green-600 mt-1">
                +12% ce mois
              </p>
            </div>
            <div className="stat-icon bg-blue-100 text-blue-600 p-3 rounded-xl">
              <Clock className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card className="stat-card hover-lift animate-slide-in-up" style={{ animationDelay: '200ms' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="stat-label">En attente</p>
              <p className="stat-value text-yellow-600">{stats.pendingRequests}</p>
              <p className="text-xs text-yellow-600 mt-1">
                Nécessite attention
              </p>
            </div>
            <div className="stat-icon bg-yellow-100 text-yellow-600 p-3 rounded-xl">
              <AlertCircle className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card className="stat-card hover-lift animate-slide-in-up" style={{ animationDelay: '300ms' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="stat-label">Approuvées</p>
              <p className="stat-value text-green-600">{stats.approvedRequests}</p>
              <p className="text-xs text-green-600 mt-1">
                {stats.approvedHours}h validées
              </p>
            </div>
            <div className="stat-icon bg-green-100 text-green-600 p-3 rounded-xl">
              <CheckCircle className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card className="stat-card hover-lift animate-slide-in-up" style={{ animationDelay: '400ms' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="stat-label">Employés</p>
              <p className="stat-value text-purple-600">{stats.totalEmployees}</p>
              <p className="text-xs text-purple-600 mt-1">
                {stats.totalServices} services
              </p>
            </div>
            <div className="stat-icon bg-purple-100 text-purple-600 p-3 rounded-xl">
              <Users className="w-6 h-6" />
            </div>
          </div>
        </Card>
      </div>

      {/* Actions rapides */}
      <Card className="p-6 animate-slide-in-up" style={{ animationDelay: '500ms' }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Actions rapides</h2>
          <Activity className="w-5 h-5 text-gray-400" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to="/requests">
            <Button className="w-full justify-start hover-lift" variant="ghost">
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle demande
              <ArrowRight className="w-4 h-4 ml-auto" />
            </Button>
          </Link>
          <Link to="/validation">
            <Button className="w-full justify-start hover-lift" variant="ghost">
              <CheckCircle className="w-4 h-4 mr-2" />
              Valider demandes
              <ArrowRight className="w-4 h-4 ml-auto" />
            </Button>
          </Link>
          <Link to="/reports">
            <Button className="w-full justify-start hover-lift" variant="ghost">
              <BarChart3 className="w-4 h-4 mr-2" />
              Voir rapports
              <ArrowRight className="w-4 h-4 ml-auto" />
            </Button>
          </Link>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Graphique des tendances */}
        <Card className="p-6 animate-slide-in-left" style={{ animationDelay: '600ms' }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Évolution mensuelle</h2>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <div className="space-y-4">
            {chartData.monthly.map((data, index) => (
              <div key={data.month} className="flex items-center space-x-4">
                <div className="w-8 text-sm text-gray-600 font-medium">
                  {data.month}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-700">{data.requests} demandes</span>
                    <span className="text-sm text-gray-500">{data.hours}h</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-1000 ease-out"
                      style={{ 
                        width: `${(data.requests / maxRequests) * 100}%`,
                        animationDelay: `${index * 100}ms`
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Demandes récentes */}
        <Card className="p-6 animate-slide-in-right" style={{ animationDelay: '700ms' }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Demandes récentes</h2>
            <Clock className="w-5 h-5 text-blue-500" />
          </div>
          <div className="space-y-4">
            {requests.slice(0, 5).map((request, index) => (
              <div 
                key={request.id} 
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer animate-slide-in-up"
                style={{ animationDelay: `${800 + index * 100}ms` }}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    request.status === 'Approved' ? 'bg-green-500' :
                    request.status === 'Rejected' ? 'bg-red-500' : 'bg-yellow-500'
                  }`}></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {request.hours}h - {new Date(request.date).toLocaleDateString('fr-FR')}
                    </p>
                    <p className="text-xs text-gray-500 truncate max-w-48">
                      {request.reason}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`status-badge ${
                    request.status === 'Approved' ? 'status-approved' :
                    request.status === 'Rejected' ? 'status-rejected' : 'status-pending'
                  }`}>
                    {request.status === 'Approved' ? 'Approuvée' :
                     request.status === 'Rejected' ? 'Rejetée' : 'En attente'}
                  </span>
                </div>
              </div>
            ))}
            {requests.length === 0 && (
              <div className="text-center py-8">
                <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Aucune demande récente</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Résumé par statut */}
      <Card className="p-6 animate-slide-in-up" style={{ animationDelay: '800ms' }}>
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Résumé par statut</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-green-50 rounded-xl hover-lift">
            <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <div className="text-3xl font-bold text-green-600 mb-2">
              {stats.approvedRequests}
            </div>
            <div className="text-sm text-green-700 font-medium">
              Demandes approuvées
            </div>
            <div className="text-xs text-green-600 mt-1">
              {stats.totalRequests > 0 ? Math.round((stats.approvedRequests / stats.totalRequests) * 100) : 0}% du total
            </div>
          </div>

          <div className="text-center p-6 bg-yellow-50 rounded-xl hover-lift">
            <AlertCircle className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
            <div className="text-3xl font-bold text-yellow-600 mb-2">
              {stats.pendingRequests}
            </div>
            <div className="text-sm text-yellow-700 font-medium">
              En attente de validation
            </div>
            <div className="text-xs text-yellow-600 mt-1">
              Nécessite votre attention
            </div>
          </div>

          <div className="text-center p-6 bg-red-50 rounded-xl hover-lift">
            <XCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <div className="text-3xl font-bold text-red-600 mb-2">
              {stats.rejectedRequests}
            </div>
            <div className="text-sm text-red-700 font-medium">
              Demandes rejetées
            </div>
            <div className="text-xs text-red-600 mt-1">
              {stats.totalRequests > 0 ? Math.round((stats.rejectedRequests / stats.totalRequests) * 100) : 0}% du total
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;