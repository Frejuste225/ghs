import React from 'react';
import { useForm } from 'react-hook-form';
import { useCreateRequest } from '../hooks/useRequests';
import { useEmployees } from '../hooks/useEmployees';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import FormField from '../components/FormField';
import toast from 'react-hot-toast';

const NewRequest = () => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
  const createRequest = useCreateRequest();
  const navigate = useNavigate();
  const { data: employees } = useEmployees();

  const onSubmit = async (data) => {
    try {
      // Convertir la date au format ISO
      const requestData = {
        ...data,
        requestDate: data.requestDate,
        employeeID: parseInt(data.employeeID),
      };
      
      await createRequest.mutateAsync(requestData);
      navigate('/my-requests');
    } catch (error) {
      console.error('Error creating request:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Nouvelle demande</h1>
        <p className="mt-1 text-sm text-gray-500">
          Créer une nouvelle demande d'heures supplémentaires
        </p>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Informations de la demande</h2>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <FormField
              label="Employé"
              name="employeeID"
              type="select"
              register={register}
              errors={errors}
              required
              options={employees?.map(emp => ({
                value: emp.employeeID,
                label: `${emp.firstName} ${emp.lastName} (${emp.employeeNumber})`
              })) || []}
            />
            
            <FormField
              label="Date de la demande"
              name="requestDate"
              type="date"
              register={register}
              errors={errors}
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <FormField
              label="Heure de début"
              name="startAt"
              type="time"
              register={register}
              errors={errors}
              required
            />
            
            <FormField
              label="Heure de fin"
              name="endAt"
              type="time"
              register={register}
              errors={errors}
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <FormField
              label="Heure de début précédente (optionnel)"
              name="previousStart"
              type="time"
              register={register}
              errors={errors}
            />
            
            <FormField
              label="Heure de fin précédente (optionnel)"
              name="previousEnd"
              type="time"
              register={register}
              errors={errors}
            />
          </div>

          <FormField
            label="Commentaire (optionnel)"
            name="comment"
            type="textarea"
            register={register}
            errors={errors}
            placeholder="Ajoutez un commentaire explicatif..."
          />

          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/my-requests')}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              loading={isSubmitting}
              disabled={isSubmitting}
            >
              Créer la demande
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewRequest;