import React, { useState, useEffect } from 'react';
import { useEmployees, useCreateEmployee, useUpdateEmployee, useDeleteEmployee } from '../hooks/useEmployees';
import { useServices } from '../hooks/useServices';
import Table from '../components/Table';
import Button from '../components/Button';
import Modal from '../components/Modal';
import FormField from '../components/FormField';
import { useForm } from 'react-hook-form';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const Employees = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  
  const { data: employees, isLoading } = useEmployees();
  const { data: services } = useServices();
  const createEmployeeMutation = useCreateEmployee();
  const updateEmployeeMutation = useUpdateEmployee();
  const deleteEmployeeMutation = useDeleteEmployee();
  
  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm();

  const contractTypes = [
    { value: 'CDI', label: 'CDI' },
    { value: 'CDD', label: 'CDD' },
    { value: 'Interim', label: 'Intérim' },
    { value: 'Stage', label: 'Stage' },
    { value: 'Alternance', label: 'Alternance' },
    { value: 'MOO', label: 'MOO' },
  ];

  // Préparer les options de services
  const serviceOptions = services?.map(service => ({
    value: service.id,
    label: service.name
  })) || [];

  // Fonction pour obtenir le nom du service
  const getServiceName = (serviceId) => {
    const service = services?.find(s => s.id === serviceId);
    return service ? service.name : 'Service inconnu';
  };

  const columns = [
    {
      header: 'Numéro',
      accessor: 'employeeNumber',
    },
    {
      header: 'Nom',
      cell: (row) => `${row.firstName} ${row.lastName}`,
    },
    {
      header: 'Service',
      cell: (row) => getServiceName(row.serviceID),
    },
    {
      header: 'Type de contrat',
      accessor: 'contractType',
    },
    {
      header: 'Contact',
      cell: (row) => row.contact || '-',
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
            onClick={() => handleDelete(row.id)}
          >
            <TrashIcon className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  // Effet pour remplir le formulaire lors de l'édition
  useEffect(() => {
    if (editingEmployee) {
      setValue('employeeNumber', editingEmployee.employeeNumber);
      setValue('firstName', editingEmployee.firstName);
      setValue('lastName', editingEmployee.lastName);
      setValue('serviceID', editingEmployee.serviceID);
      setValue('contractType', editingEmployee.contractType);
      setValue('contact', editingEmployee.contact || '');
    } else {
      reset();
    }
  }, [editingEmployee, setValue, reset]);

  const handleOpenModal = () => {
    setEditingEmployee(null);
    setIsModalOpen(true);
  };

  const handleEdit = (employee) => {
    setEditingEmployee(employee);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet employé ?')) {
      try {
        await deleteEmployeeMutation.mutateAsync(id);
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingEmployee(null);
    reset();
  };

  const onSubmit = async (data) => {
    try {
      if (editingEmployee) {
        await updateEmployeeMutation.mutateAsync({
          id: editingEmployee.id,
          data: data
        });
      } else {
        await createEmployeeMutation.mutateAsync(data);
      }
      handleCloseModal();
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Employés</h1>
        <Button onClick={handleOpenModal}>
          <PlusIcon className="h-5 w-5 mr-2" />
          Nouvel employé
        </Button>
      </div>

      <div className="bg-white shadow rounded-lg">
        <Table
          columns={columns}
          data={employees || []}
          loading={isLoading}
          emptyMessage="Aucun employé trouvé"
        />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingEmployee ? 'Modifier l\'employé' : 'Nouvel employé'}
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            label="Numéro d'employé"
            name="employeeNumber"
            register={register}
            error={errors.employeeNumber}
            required
            placeholder="Ex: EMP001"
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Prénom"
              name="firstName"
              register={register}
              error={errors.firstName}
              required
              placeholder="Prénom"
            />

            <FormField
              label="Nom"
              name="lastName"
              register={register}
              error={errors.lastName}
              required
              placeholder="Nom"
            />
          </div>

          <FormField
            label="Service"
            name="serviceID"
            type="select"
            register={register}
            error={errors.serviceID}
            required
            options={serviceOptions}
          />

          <FormField
            label="Type de contrat"
            name="contractType"
            type="select"
            register={register}
            error={errors.contractType}
            required
            options={contractTypes}
          />

          <FormField
            label="Contact"
            name="contact"
            register={register}
            error={errors.contact}
            placeholder="Email ou téléphone"
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
              loading={createEmployeeMutation.isLoading || updateEmployeeMutation.isLoading}
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