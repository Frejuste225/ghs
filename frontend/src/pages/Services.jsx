import React, { useState, useEffect } from 'react';
import { useServices, useCreateService, useUpdateService, useDeleteService } from '../hooks/useServices';
import Table from '../components/Table';
import Button from '../components/Button';
import Modal from '../components/Modal';
import FormField from '../components/FormField';
import { useForm } from 'react-hook-form';
import { PlusIcon, PencilIcon, TrashIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const Services = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  
  const { data: services, isLoading } = useServices();
  const createServiceMutation = useCreateService();
  const updateServiceMutation = useUpdateService();
  const deleteServiceMutation = useDeleteService();
  
  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm();

  const columns = [
    {
      header: 'Code',
      accessor: 'serviceCode',
    },
    {
      header: 'Nom du service',
      accessor: 'serviceName',
    },
    {
      header: 'Service parent',
      cell: (row) => {
        if (!row.parentServiceID) return '-';
        const parentService = services?.find(s => s.serviceID === row.parentServiceID);
        return parentService ? parentService.serviceName : 'Service inconnu';
      },
    },
    {
      header: 'Manager',
      cell: (row) => row.manager || '-',
    },
    {
      header: 'Description',
      cell: (row) => row.description ? (
        <span className="text-gray-600 truncate max-w-xs block" title={row.description}>
          {row.description}
        </span>
      ) : (
        <span className="text-gray-400">-</span>
      ),
    },
    {
      header: 'Actions',
      cell: (row) => (
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleEdit(row)}
          >
            <PencilIcon className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => handleDelete(row.serviceID)}
          >
            <TrashIcon className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  // Préparer les options de services parents
  const parentServiceOptions = services?.map(service => ({
    value: service.serviceID,
    label: service.serviceName
  })) || [];

  // Effet pour remplir le formulaire lors de l'édition
  useEffect(() => {
    if (editingService) {
      setValue('serviceCode', editingService.serviceCode);
      setValue('serviceName', editingService.serviceName);
      setValue('parentServiceID', editingService.parentServiceID || '');
      setValue('manager', editingService.manager || '');
      setValue('description', editingService.description || '');
    } else {
      reset();
    }
  }, [editingService, setValue, reset]);

  const handleOpenModal = () => {
    setEditingService(null);
    setIsModalOpen(true);
  };

  const handleEdit = (service) => {
    setEditingService(service);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce service ?')) {
      try {
        await deleteServiceMutation.mutateAsync(id);
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingService(null);
    reset();
  };

  const onSubmit = async (data) => {
    try {
      // Convertir parentServiceID en nombre ou null
      const serviceData = {
        ...data,
        parentServiceID: data.parentServiceID ? parseInt(data.parentServiceID) : null
      };

      if (editingService) {
        await updateServiceMutation.mutateAsync({
          id: editingService.serviceID,
          data: serviceData
        });
      } else {
        await createServiceMutation.mutateAsync(serviceData);
      }
      handleCloseModal();
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Services</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gérez les services et départements de votre organisation
          </p>
        </div>
        <Button onClick={handleOpenModal}>
          <PlusIcon className="h-5 w-5 mr-2" />
          Nouveau service
        </Button>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center">
            <BuildingOfficeIcon className="h-5 w-5 text-gray-400 mr-2" />
            <h2 className="text-lg font-medium text-gray-900">Liste des services</h2>
          </div>
        </div>
        <Table
          columns={columns}
          data={services || []}
          loading={isLoading}
          emptyMessage="Aucun service trouvé"
        />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingService ? 'Modifier le service' : 'Nouveau service'}
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Code du service"
              name="serviceCode"
              register={register}
              error={errors.serviceCode}
              required
              placeholder="Ex: IT, HR, FIN"
            />

            <FormField
              label="Nom du service"
              name="serviceName"
              register={register}
              error={errors.serviceName}
              required
              placeholder="Ex: Informatique"
            />
          </div>

          <FormField
            label="Service parent"
            name="parentServiceID"
            type="select"
            register={register}
            error={errors.parentServiceID}
            options={parentServiceOptions}
            placeholder="Sélectionner un service parent (optionnel)"
          />

          <FormField
            label="Manager"
            name="manager"
            register={register}
            error={errors.manager}
            placeholder="Nom du responsable"
          />

          <FormField
            label="Description"
            name="description"
            type="textarea"
            register={register}
            error={errors.description}
            placeholder="Description du service..."
          />

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCloseModal}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              loading={createServiceMutation.isLoading || updateServiceMutation.isLoading}
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