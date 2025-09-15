import { useQuery, useMutation, useQueryClient } from 'react-query';
import { serviceService } from '../services/api';
import toast from 'react-hot-toast';

export const useServices = (skip = 0, limit = 100) => {
  return useQuery(['services', skip, limit], () =>
    serviceService.getServices(skip, limit)
  );
};

export const useService = (id) => {
  return useQuery(['service', id], () =>
    serviceService.getService(id), {
    enabled: !!id,
  });
};

export const useCreateService = () => {
  const queryClient = useQueryClient();
  
  return useMutation(serviceService.createService, {
    onSuccess: () => {
      queryClient.invalidateQueries('services');
      toast.success('Service créé avec succès');
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Erreur lors de la création');
    },
  });
};

export const useUpdateService = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    ({ id, data }) => serviceService.updateService(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('services');
        toast.success('Service mis à jour avec succès');
      },
      onError: (error) => {
        toast.error(error.response?.data?.detail || 'Erreur lors de la mise à jour');
      },
    }
  );
};

export const useDeleteService = () => {
  const queryClient = useQueryClient();
  
  return useMutation(serviceService.deleteService, {
    onSuccess: () => {
      queryClient.invalidateQueries('services');
      toast.success('Service supprimé avec succès');
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Erreur lors de la suppression');
    },
  });
};