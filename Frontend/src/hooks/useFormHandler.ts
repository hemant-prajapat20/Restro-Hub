import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../utils/api';

interface FormHandlerProps<TData> {
  queryKey: string[];
  endpoint: string;
  onSuccessCallback?: () => void;
}

export const useFormHandler = <TData>({ queryKey, endpoint, onSuccessCallback }: FormHandlerProps<TData>) => {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async (data: TData) => {
      const response = await api.post(endpoint, data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Created successfully');
      queryClient.invalidateQueries({ queryKey });
      onSuccessCallback?.();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to create');
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string | number; data: Partial<TData> }) => {
      const response = await api.put(`${endpoint}/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Updated successfully');
      queryClient.invalidateQueries({ queryKey });
      onSuccessCallback?.();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update');
    }
  });

  return {
    create: createMutation.mutateAsync,
    update: updateMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending
  };
};
