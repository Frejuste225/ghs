import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { employeeService, serviceService } from '../services/ghs';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { 
  Plus, 
  Users, 
  Mail, 
  Phone, 
  Building2,
  Edit,
  Trash2,
  Search
} from 'lucide-react';

const Employees = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  // Récupérer les employés et services
  const { data: employees = [], isLoading } = useQuery('employees', employeeService.getAll);
  const { data: services = [] } = useQuery('services', serviceService.getAll);

  // Filtrer les employés selon la recherche
  const filteredEmployees = employees.filter(employee =>
    employee.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Mutations
  const createMutation = useMutation(employeeService.create, {
    onSuccess: () => {
      queryClient.invalidateQueries('employees');
      toast.success('Employé créé avec succès');
      setIsModalOpen(false);
      reset();
    },
    onError: () => {
      toast.error('Erreur lors de la création');
    },
  });

  const updateMutation = useMutation(
    ({ id, data }) => employeeService.update(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('employees');
        toast.success('Employé modifié avec succès');
        setIsModalOpen(false);
        setEditingEmployee(null);
        reset();
      },
      onError: () => {
        toast.error('Erreur lors de la modification');
      },
    }
  );

  const deleteMutation = useMutation(employeeService.delete, {
    onSuccess: () => {
      queryClient.invalidateQueries('employees');
      toast.success('Employé supprimé avec succès');
    },
    onError: () => {
      toast.error('Erreur lors de la suppression');
    },
  });

  const onSubmit = (data) => {
    if (editingEmployee) {
      updateMutation.mutate({ id: editingEmployee.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (employee) => {
    setEditingEmployee(employee);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet employé ?')) {
      deleteMutation.mutate(id);
    }
  };

  const getServiceName = (serviceId) => {
    const service = services.find(s => s.id === serviceId);
    return service ? service.name : 'Service inconnu';
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
          <h1 className="text-2xl font-bold text-gray-900">Employés</h1>
          <p className="text-gray-600">
            Gérez les employés de votre organisation
          </p>
        </div>
        <Button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Nouvel employé</span>
        </Button>
      </div>

      {/* Barre de recherche */}
      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Rechercher un employé..."
            className="input pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </Card>

      {/* Liste des employés */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEmployees.map((employee) => (
          <Card key={employee.id} className="hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {employee.first_name} {employee.last_name}
                  </h3>
                  <p className="text-sm text-gray-600">{employee.position}</p>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEdit(employee)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(employee.id)}
                  className="text-danger-600 hover:text-danger-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center text-sm text-gray-600">
                <Mail className="w-4 h-4 mr-2" />
                {employee.email}
              </div>
              {employee.phone && (
                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="w-4 h-4 mr-2" />
                  {employee.phone}
                </div>
              )}
              <div className="flex items-center text-sm text-gray-600">
                <Building2 className="w-4 h-4 mr-2" />
                {getServiceName(employee.service_id)}
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                {employee.employee_number}
              </span>
            </div>
          </Card>
        ))}
      </div>

      {filteredEmployees.length === 0 && (
        <Card className="text-center py-12">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm ? 'Aucun employé trouvé' : 'Aucun employé'}
          </h3>
          <p className="text-gray-600 mb-4">
            {searchTerm 
              ? 'Essayez de modifier votre recherche.'
              : 'Commencez par ajouter votre premier employé.'
            }
          </p>
          {!searchTerm && (
            <Button onClick={() => setIsModalOpen(true)}>
              Ajouter un employé
            </Button>
          )}
        </Card>
      )}

      {/* Modal de création/édition */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingEmployee(null);
          reset();
        }}
        title={editingEmployee ? 'Modifier l\'employé' : 'Nouvel employé'}
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Prénom</label>
              <input
                {...register('first_name', { required: 'Le prénom est requis' })}
                type="text"
                className="input"
                defaultValue={editingEmployee?.first_name}
              />
              {errors.first_name && (
                <p className="mt-1 text-sm text-danger-600">{errors.first_name.message}</p>
              )}
            </div>

            <div>
              <label className="label">Nom</label>
              <input
                {...register('last_name', { required: 'Le nom est requis' })}
                type="text"
                className="input"
                defaultValue={editingEmployee?.last_name}
              />
              {errors.last_name && (
                <p className="mt-1 text-sm text-danger-600">{errors.last_name.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="label">Email</label>
            <input
              {...register('email', { 
                required: 'L\'email est requis',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Email invalide'
                }
              })}
              type="email"
              className="input"
              defaultValue={editingEmployee?.email}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-danger-600">{errors.email.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Téléphone</label>
              <input
                {...register('phone')}
                type="tel"
                className="input"
                defaultValue={editingEmployee?.phone}
              />
            </div>

            <div>
              <label className="label">Numéro d'employé</label>
              <input
                {...register('employee_number', { required: 'Le numéro d\'employé est requis' })}
                type="text"
                className="input"
                defaultValue={editingEmployee?.employee_number}
              />
              {errors.employee_number && (
                <p className="mt-1 text-sm text-danger-600">{errors.employee_number.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Poste</label>
              <input
                {...register('position', { required: 'Le poste est requis' })}
                type="text"
                className="input"
                defaultValue={editingEmployee?.position}
              />
              {errors.position && (
                <p className="mt-1 text-sm text-danger-600">{errors.position.message}</p>
              )}
            </div>

            <div>
              <label className="label">Service</label>
              <select
                {...register('service_id', { required: 'Le service est requis' })}
                className="input"
                defaultValue={editingEmployee?.service_id}
              >
                <option value="">Sélectionner un service</option>
                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name}
                  </option>
                ))}
              </select>
              {errors.service_id && (
                <p className="mt-1 text-sm text-danger-600">{errors.service_id.message}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setIsModalOpen(false);
                setEditingEmployee(null);
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
              {editingEmployee ? 'Modifier' : 'Créer'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Employees;