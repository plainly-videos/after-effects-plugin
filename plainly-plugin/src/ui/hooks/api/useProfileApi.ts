import { get } from '@src/node/request';
import { useMutation } from '@tanstack/react-query';

const BASE_PATH = '/user';

export const useUserProfile = () => {
  const { isPending, error, mutateAsync } = useMutation({
    mutationFn: async (apiKey: string) => {
      const { data } = await get(`${BASE_PATH}/me`, apiKey);
      return data;
    },
  });

  return { isPending, error, mutateAsync };
};
