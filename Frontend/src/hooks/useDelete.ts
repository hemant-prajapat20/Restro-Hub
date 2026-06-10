import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../utils/api';

export const useDelete = (queryKey: string[], endpoint: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string | number) => {
      const response = await api.delete(`${endpoint}/${id}`);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Deleted successfully');
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to delete');
    }
  });
};
