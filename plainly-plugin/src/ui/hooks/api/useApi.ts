import { AuthContext } from '@src/ui/components';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useContext } from 'react';

export const useApiQuery = <TData, TError>(
  queryKey: readonly unknown[],
  queryFn: (apiKey: string) => Promise<TData>,
  options?: Record<string, unknown>,
) => {
  const apiKey = useContext(AuthContext).apiKey;

  return useQuery<TData, TError>({
    queryKey,
    queryFn: () => queryFn(apiKey),
    ...options,
  });
};

export const useApiMutation = <TData, TError, TVariables>(
  mutationFn: (apiKey: string, variables: TVariables) => Promise<TData>,
  options?: Record<string, unknown>,
) => {
  const apiKey = useContext(AuthContext).apiKey;

  return useMutation<TData, TError, TVariables>({
    mutationFn: (variables) => mutationFn(apiKey, variables),
    ...options,
  });
};
