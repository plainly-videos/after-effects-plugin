import { get } from '@src/node/request';
import { useMutation } from '@tanstack/react-query';

export const useAppmixerUserProfile = () => {
  const { isPending, error, mutateAsync } = useMutation({
    mutationFn: async (apiKey: string) => {
      const { data } = await get(
        '/api/v2/integrations/appmixer/user-profile',
        apiKey,
      );
      return data;
    },
  });

  return { isPending, error, mutateAsync };
};
