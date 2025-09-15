import { useQuery, useMutation, useQueryClient } from 'react-query';
import { requestService } from '../services/api';
import toast from 'react-hot-toast';

export const useRequests = (skip = 0, limit = 100) => {
  return useQuery(['requests', skip, limit], () =>
    requestService.getRequests(skip, limit)
  );
};

export const useMyRequests = () => {
  return useQuery('myRequests', requestService.getMyRequests);
};

export const usePendingRequests = () => {
  return useQuery('pendingRequests', requestService.getPendingRequests);
};

export const useRequest = (id) => {
  return useQuery(['request', id], () =>
    requestService.getRequest(id), {
    enabled: !!id,
  });
};

export const useCreateRequest = () => {
  const queryClient = useQueryClient();
  
  return useMutation(requestService.createRequest, {
    onSuccess: () => {
      queryClient.invalidateQueries('requests');
      queryClient.invalidateQueries('myRequests');
      toast.success('Demande créée avec succès');
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Erreur lors de la création');
    },
  });
};

export const useApproveRequest = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    ({ id, level }) => requestService.approveRequest(id, level),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('requests');
        queryClient.invalidateQueries('pendingRequests');
        toast.success('Demande approuvée avec succès');
      },
      onError: (error) => {
        toast.error(error.response?.data?.detail || 'Erreur lors de l\'approbation');
      },
    }
  );
};

export const useRejectRequest = () => {
  const queryClient = useQueryClient();
  
  return useMutation(requestService.rejectRequest, {
    onSuccess: () => {
      queryClient.invalidateQueries('requests');
      queryClient.invalidateQueries('pendingRequests');
      toast.success('Demande rejetée');
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Erreur lors du rejet');
    },
  });
};