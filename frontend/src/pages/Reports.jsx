import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { requestService, employeeService, serviceService } from '../services/ghs';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { 
  BarChart3, 
  Download, 
  Calendar, 
  TrendingUp,
  Users,
  Clock,
  Building2,
  Filter
} from 'lucide-react';

const Reports = () => {
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [selectedService, setSelectedService] = useState('all');

  // Récupérer les données
  const { data: requests = [], isLoading: requestsLoading } = useQuery('requests', requestService.getAll);
  const { data: employees = [], isLoading: employeesLoading } = useQuery('employees', employeeService.getAll);
  const { data: services = [], isLoading: servicesLoading } = useQuery('services', serviceService.getAll);

  const isLoading = requestsLoading || employeesLoading || servicesLoading;

  // Filtrer les demandes selon la période et le service
  const filteredRequests = requests.filter(request => {
    const requestDate = new Date(request.date);
    const startDate = new Date(dateRange.start);
    const endDate = new Date(dateRange.end);
    
    const isInDateRange = requestDate >= startDate && requestDate <= endDate;
    
    if (selectedService === 'all') return isInDateRange;
    
    const employee = employees.find(emp => emp.id === request.employee_id);
    return isInDateRange && employee?.service_id === parseInt(selectedService);
  });

  // Calculer les statistiques
  const stats = {
    totalRequests: filteredRequests.length,
    totalHours: filteredRequests.reduce((sum, req) => sum + req.hours, 0),
    approvedRequests: filteredRequests.filter(req => req.status === 'Approved').length,
    approvedHours: filteredRequests.filter(req => req.status === 'Approved').reduce((sum, req) => sum + req.hours, 0),
    pendingRequests: filteredRequests.filter(req => req.status === 'Pending').length,
    rejectedRequests: filteredRequests.filter(req => req.status === 'Rejected').length,
  };

  // Statistiques par service
  const serviceStats = services.map(service => {
    const serviceEmployees = employees.filter(emp => emp.service_id === service.id);
    const serviceRequests = filteredRequests.filter(req => {
      const employee = employees.find(emp => emp.id === req.employee_id);
      return employee?.service_id === service.id;
    });
    
    return {
      ...service,
      employeeCount: serviceEmployees.length,
      requestCount: serviceRequests.length,
      totalHours: serviceRequests.reduce((sum, req) => sum + req.hours, 0),
      approvedHours: serviceRequests.filter(req => req.status === 'Approved').reduce((sum, req) => sum + req.hours, 0),
    };
  });

  // Top employés par heures
  const employeeStats = employees.map(employee => {
    const employeeRequests = filteredRequests.filter(req => req.employee_id === employee.id);
    return {
      ...employee,
      requestCount: employeeRequests.length,
      totalHours: employeeRequests.reduce((sum, req) => sum + req.hours, 0),
      approvedHours: employeeRequests.filter(req => req.status === 'Approved').reduce((sum, req) => sum + req.hours, 0),
    };
  }).sort((a, b) => b.totalHours - a.totalHours).slice(0, 10);

  const handleExport = () => {
    // Simuler l'export (dans une vraie app, cela générerait un fichier Excel/PDF)
    const csvContent = [
      ['Date', 'Employé', 'Service', 'Heures', 'Motif', 'Statut'].join(','),
      ...filteredRequests.map(request => {
        const employee = employees.find(emp => emp.id === request.employee_id);
        const service = services.find(srv => srv.id === employee?.service_id);
        return [
          request.date,
          `${employee?.first_name} ${employee?.last_name}`,
          service?.name || 'N/A',
          request.hours,
          `"${request.reason}"`,
          request.status
        ].join(',');
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rapport-heures-supplementaires-${dateRange.start}-${dateRange.end}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rapports</h1>
          <p className="text-gray-600">
            Analysez les données des heures supplémentaires
          </p>
        </div>
        <Button
          onClick={handleExport}
          className="flex items-center space-x-2"
          variant="secondary"
        >
          <Download className="w-4 h-4" />
          <span>Exporter</span>
        </Button>
      </div>

      {/* Filtres */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="label">Date de début</label>
            <input
              type="date"
              className="input"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
            />
          </div>
          <div>
            <label className="label">Date de fin</label>
            <input
              type="date"
              className="input"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
            />
          </div>
          <div>
            <label className="label">Service</label>
            <select
              className="input"
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
            >
              <option value="all">Tous les services</option>
              {services.map(service => (
                <option key={service.id} value={service.id}>
                  {service.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Statistiques générales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total demandes</p>
              <p className="text-2xl font-bold text-primary-600">{stats.totalRequests}</p>
            </div>
            <BarChart3 className="w-8 h-8 text-primary-600" />
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total heures</p>
              <p className="text-2xl font-bold text-secondary-600">{stats.totalHours}h</p>
            </div>
            <Clock className="w-8 h-8 text-secondary-600" />
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Heures approuvées</p>
              <p className="text-2xl font-bold text-success-600">{stats.approvedHours}h</p>
            </div>
            <TrendingUp className="w-8 h-8 text-success-600" />
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Taux d'approbation</p>
              <p className="text-2xl font-bold text-warning-600">
                {stats.totalRequests > 0 ? Math.round((stats.approvedRequests / stats.totalRequests) * 100) : 0}%
              </p>
            </div>
            <Users className="w-8 h-8 text-warning-600" />
          </div>
        </Card>
      </div>

      {/* Graphiques et tableaux */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Statistiques par service */}
        <Card title="Statistiques par service">
          <div className="space-y-4">
            {serviceStats.map(service => (
              <div key={service.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Building2 className="w-5 h-5 text-primary-600" />
                  <div>
                    <p className="font-medium text-gray-900">{service.name}</p>
                    <p className="text-sm text-gray-600">{service.employeeCount} employé(s)</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">{service.totalHours}h</p>
                  <p className="text-sm text-gray-600">{service.requestCount} demande(s)</p>
                </div>
              </div>
            ))}
            {serviceStats.length === 0 && (
              <p className="text-center text-gray-500 py-4">Aucune donnée disponible</p>
            )}
          </div>
        </Card>

        {/* Top employés */}
        <Card title="Top employés (heures)">
          <div className="space-y-4">
            {employeeStats.slice(0, 5).map((employee, index) => (
              <div key={employee.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-primary-600">#{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {employee.first_name} {employee.last_name}
                    </p>
                    <p className="text-sm text-gray-600">{employee.position}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">{employee.totalHours}h</p>
                  <p className="text-sm text-success-600">{employee.approvedHours}h approuvées</p>
                </div>
              </div>
            ))}
            {employeeStats.length === 0 && (
              <p className="text-center text-gray-500 py-4">Aucune donnée disponible</p>
            )}
          </div>
        </Card>
      </div>

      {/* Tableau détaillé */}
      <Card title="Détail des demandes">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employé
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Service
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Heures
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRequests.slice(0, 10).map((request) => {
                const employee = employees.find(emp => emp.id === request.employee_id);
                const service = services.find(srv => srv.id === employee?.service_id);
                
                return (
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(request.date).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {employee ? `${employee.first_name} ${employee.last_name}` : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {service?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {request.hours}h
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        request.status === 'Approved' ? 'bg-success-100 text-success-800' :
                        request.status === 'Rejected' ? 'bg-danger-100 text-danger-800' :
                        'bg-warning-100 text-warning-800'
                      }`}>
                        {request.status === 'Approved' ? 'Approuvée' :
                         request.status === 'Rejected' ? 'Rejetée' : 'En attente'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          
          {filteredRequests.length === 0 && (
            <div className="text-center py-12">
              <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Aucune donnée
              </h3>
              <p className="text-gray-600">
                Aucune demande trouvée pour la période sélectionnée.
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default Reports;