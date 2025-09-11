import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { serviceService, employeeService } from '../services/ghs';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { 
  Plus, 
  Building2, 
  Users, 
  Edit,
  Trash2,
  Search
} from 'lucide-react';

const Services = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  // Récupérer les services et employés
  const { data: services = [], isLoading } = useQuery('services', serviceService.getAll);
  const { data: employees = [] } = useQuery('employees', employeeService.getAll);

  // Filtrer les services selon la recherche
  const filteredServices = services.filter(service =>
    service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Mutations
  const createMutation = useMutation(serviceService.create, {
    onSuccess: () => {
      queryClient.invalidateQueries('services');
      toast.success('Service créé avec succès');
      setIsModalOpen(false);
      reset();
    },
    onError: () => {
      toast.error('Erreur lors de la création');
    },
  });

  const updateMutation = useMutation(
    ({ id, data }) => serviceService.update(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('services');
        toast.success('Service modifié avec succès');
        setIsModalOpen(false);
        setEditingService(null);
        reset();
      },
      onError: () => {
        toast.error('Erreur lors de la modification');
      },
    }
  );

  const deleteMutation = useMutation(serviceService.delete, {
    onSuccess: () => {
      queryClient.invalidateQueries('services');
      toast.success('Service supprimé avec succès');
    },
    onError: () => {
      toast.error('Erreur lors de la suppression');
    },
  });

  const onSubmit = (data) => {
    if (editingService) {
      updateMutation.mutate({ id: editingService.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (service) => {
    setEditingService(service);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    const employeesInService = employees.filter(emp => emp.service_id === id);
    if (employeesInService.length > 0) {
      toast.error('Impossible de supprimer un service qui contient des employés');
      return;
    }
    
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce service ?')) {
      deleteMutation.mutate(id);
    }
  };

  const getEmployeeCount = (serviceId) => {
    return employees.filter(emp => emp.service_id === serviceId).length;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
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
          <h1 className="text-2xl font-bold text-gray-900">Services</h1>
          <p className="text-gray-600">
            Gérez les services de votre organisation
          </p>
        </div>
        <Button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Nouveau service</span>
        </Button>
      </div>

      {/* Barre de recherche */}
      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Rechercher un service..."
            className="input pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </Card>

      {/* Liste des services */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredServices.map((service) => (
          <Card key={service.id} className="hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {service.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {getEmployeeCount(service.id)} employé(s)
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEdit(service)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(service.id)}
                  className="text-danger-600 hover:text-danger-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {service.description && (
              <p className="text-sm text-gray-600 mb-4">
                {service.description}
              </p>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="flex items-center text-sm text-gray-500">
                <Users className="w-4 h-4 mr-1" />
                {getEmployeeCount(service.id)} employé(s)
              </div>
              <span className="text-xs text-gray-400">
                ID: {service.id}
              </span>
            </div>
          </Card>
        ))}
      </div>

      {filteredServices.length === 0 && (
        <Card className="text-center py-12">
          <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm ? 'Aucun service trouvé' : 'Aucun service'}
          </h3>
          <p className="text-gray-600 mb-4">
            {searchTerm 
              ? 'Essayez de modifier votre recherche.'
              : 'Commencez par ajouter votre premier service.'
            }
          </p>
          {!searchTerm && (
            <Button onClick={() => setIsModalOpen(true)}>
              Ajouter un service
            </Button>
          )}
        </Card>
      )}

      {/* Modal de création/édition */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingService(null);
          reset();
        }}
        title={editingService ? 'Modifier le service' : 'Nouveau service'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="label">Nom du service</label>
            <input
              {...register('name', { required: 'Le nom est requis' })}
              type="text"
              className="input"
              placeholder="Ex: Ressources Humaines"
              defaultValue={editingService?.name}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-danger-600">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="label">Description</label>
            <textarea
              {...register('description')}
              className="input"
              rows="3"
              placeholder="Description du service (optionnel)"
              defaultValue={editingService?.description}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setIsModalOpen(false);
                setEditingService(null);
                reset();
              }}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              loading={createMutation.isLoading || updateMutation.isLoading}
              disabled={createMutation.isLoading || updateMutation.isLoading}
            >
              {editingService ? 'Modifier' : 'Créer'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Services;