import { useQuery, useMutation, useQueryClient } from 'react-query';
import { employeeService } from '../services/api';
import toast from 'react-hot-toast';

export const useEmployees = (skip = 0, limit = 100) => {
  return useQuery(['employees', skip, limit], () =>
    employeeService.getEmployees(skip, limit)
  );
};

export const useEmployee = (id) => {
  return useQuery(['employee', id], () =>
    employeeService.getEmployee(id), {
    enabled: !!id,
  });
};

export const useCreateEmployee = () => {
  const queryClient = useQueryClient();
  
  return useMutation(employeeService.createEmployee, {
    onSuccess: () => {
      queryClient.invalidateQueries('employees');
      toast.success('Employé créé avec succès');
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Erreur lors de la création');
    },
  });
};

export const useUpdateEmployee = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    ({ id, data }) => employeeService.updateEmployee(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('employees');
        toast.success('Employé mis à jour avec succès');
      },
      onError: (error) => {
        toast.error(error.response?.data?.detail || 'Erreur lors de la mise à jour');
      },
    }
  );
};

export const useDeleteEmployee = () => {
  const queryClient = useQueryClient();
  
  return useMutation(employeeService.deleteEmployee, {
    onSuccess: () => {
      queryClient.invalidateQueries('employees');
      toast.success('Employé supprimé avec succès');
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Erreur lors de la suppression');
    },
  });
};
