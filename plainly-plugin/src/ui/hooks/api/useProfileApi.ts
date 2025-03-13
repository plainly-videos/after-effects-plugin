import { get } from '@src/node/request';
import { useMutation } from '@tanstack/react-query';

export const useUserProfile = () => {
  const { isPending, error, mutateAsync } = useMutation({
    mutationFn: async (apiKey: string) => {
      const { data } = await get('/user/me', apiKey);
      return data;
    },
  });

  return { isPending, error, mutateAsync };
};
