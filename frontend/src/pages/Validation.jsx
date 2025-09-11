import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { requestService, employeeService } from '../services/ghs';
import toast from 'react-hot-toast';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Calendar, 
  Clock, 
  User,
  Filter,
  Eye
} from 'lucide-react';

const Validation = () => {
  const queryClient = useQueryClient();
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');

  // Récupérer les demandes et employés
  const { data: requests = [], isLoading } = useQuery('requests', requestService.getAll);
  const { data: employees = [] } = useQuery('employees', employeeService.getAll);

  // Filtrer les demandes selon le statut
  const filteredRequests = requests.filter(request => {
    if (statusFilter === 'all') return true;
    return request.status === statusFilter;
  });

  // Mutation pour approuver/rejeter une demande
  const updateStatusMutation = useMutation(
    ({ id, status, comment }) => requestService.update(id, { status, comment }),
    {
      onSuccess: (_, { status }) => {
        queryClient.invalidateQueries('requests');
        toast.success(
          status === 'Approved' ? 'Demande approuvée' : 'Demande rejetée'
        );
        setIsDetailModalOpen(false);
        setSelectedRequest(null);
      },
      onError: () => {
        toast.error('Erreur lors de la mise à jour');
      },
    }
  );

  const getEmployeeName = (employeeId) => {
    const employee = employees.find(emp => emp.id === employeeId);
    return employee ? `${employee.first_name} ${employee.last_name}` : 'Employé inconnu';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Approved':
        return <CheckCircle className="w-5 h-5 text-success-600" />;
      case 'Rejected':
        return <XCircle className="w-5 h-5 text-danger-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-warning-600" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'Approved':
        return 'Approuvée';
      case 'Rejected':
        return 'Rejetée';
      default:
        return 'En attente';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved':
        return 'bg-success-100 text-success-800';
      case 'Rejected':
        return 'bg-danger-100 text-danger-800';
      default:
        return 'bg-warning-100 text-warning-800';
    }
  };

  const handleApprove = (request) => {
    updateStatusMutation.mutate({
      id: request.id,
      status: 'Approved',
      comment: 'Demande approuvée'
    });
  };

  const handleReject = (request) => {
    const comment = prompt('Motif du rejet (optionnel):');
    updateStatusMutation.mutate({
      id: request.id,
      status: 'Rejected',
      comment: comment || 'Demande rejetée'
    });
  };

  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setIsDetailModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
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
          <h1 className="text-2xl font-bold text-gray-900">Validation des demandes</h1>
          <p className="text-gray-600">
            Approuvez ou rejetez les demandes d'heures supplémentaires
          </p>
        </div>
        
        {/* Filtres */}
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input w-auto"
          >
            <option value="all">Tous les statuts</option>
            <option value="Pending">En attente</option>
            <option value="Approved">Approuvées</option>
            <option value="Rejected">Rejetées</option>
          </select>
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">En attente</p>
              <p className="text-2xl font-bold text-warning-600">
                {requests.filter(r => r.status === 'Pending').length}
              </p>
            </div>
            <AlertCircle className="w-8 h-8 text-warning-600" />
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Approuvées</p>
              <p className="text-2xl font-bold text-success-600">
                {requests.filter(r => r.status === 'Approved').length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-success-600" />
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Rejetées</p>
              <p className="text-2xl font-bold text-danger-600">
                {requests.filter(r => r.status === 'Rejected').length}
              </p>
            </div>
            <XCircle className="w-8 h-8 text-danger-600" />
          </div>
        </Card>
      </div>

      {/* Liste des demandes */}
      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employé
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Heures
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Motif
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRequests.map((request) => (
                <tr key={request.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <User className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-900">
                        {getEmployeeName(request.employee_id)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">
                        {new Date(request.date).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-900">
                        {request.hours}h
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 max-w-xs">
                    <span className="text-sm text-gray-900 truncate block">
                      {request.reason}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getStatusIcon(request.status)}
                      <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(request.status)}`}>
                        {getStatusText(request.status)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetails(request)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      {request.status === 'Pending' && (
                        <>
                          <Button
                            variant="success"
                            size="sm"
                            onClick={() => handleApprove(request)}
                            loading={updateStatusMutation.isLoading}
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleReject(request)}
                            loading={updateStatusMutation.isLoading}
                          >
                            <XCircle className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredRequests.length === 0 && (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Aucune demande
              </h3>
              <p className="text-gray-600">
                {statusFilter === 'all' 
                  ? 'Aucune demande à valider pour le moment.'
                  : `Aucune demande avec le statut "${getStatusText(statusFilter)}".`
                }
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Modal de détails */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedRequest(null);
        }}
        title="Détails de la demande"
      >
        {selectedRequest && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Employé</label>
                <p className="text-sm text-gray-900">
                  {getEmployeeName(selectedRequest.employee_id)}
                </p>
              </div>
              <div>
                <label className="label">Date</label>
                <p className="text-sm text-gray-900">
                  {new Date(selectedRequest.date).toLocaleDateString('fr-FR')}
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Heures</label>
                <p className="text-sm text-gray-900">{selectedRequest.hours}h</p>
              </div>
              <div>
                <label className="label">Statut</label>
                <div className="flex items-center">
                  {getStatusIcon(selectedRequest.status)}
                  <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedRequest.status)}`}>
                    {getStatusText(selectedRequest.status)}
                  </span>
                </div>
              </div>
            </div>
            
            <div>
              <label className="label">Motif</label>
              <p className="text-sm text-gray-900">{selectedRequest.reason}</p>
            </div>
            
            {selectedRequest.comment && (
              <div>
                <label className="label">Commentaire</label>
                <p className="text-sm text-gray-900">{selectedRequest.comment}</p>
              </div>
            )}
            
            {selectedRequest.status === 'Pending' && (
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button
                  variant="danger"
                  onClick={() => handleReject(selectedRequest)}
                  loading={updateStatusMutation.isLoading}
                >
                  Rejeter
                </Button>
                <Button
                  variant="success"
                  onClick={() => handleApprove(selectedRequest)}
                  loading={updateStatusMutation.isLoading}
                >
                  Approuver
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Validation;