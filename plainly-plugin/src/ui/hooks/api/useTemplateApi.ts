import { post } from '@src/node/request';
import type { AnyAutoCreateTemplateDto } from '@src/ui/types/template';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { projectCacheReplace } from './useProjectApi';

export const useAutoGenerateProjectTemplates = () => {
  const queryClient = useQueryClient();

  const { isPending, isError, mutateAsync } = useMutation({
    mutationFn: async ({
      apiKey,
      projectId,
      autoCreateTemplateDto,
    }: {
      apiKey: string;
      projectId: string;
      autoCreateTemplateDto: AnyAutoCreateTemplateDto;
    }) => {
      const { data } = await post<AnyAutoCreateTemplateDto>(
        `api/v2/projects/${projectId}/templates/auto-generate`,
        apiKey,
        autoCreateTemplateDto,
      );

      return data;
    },
    onSuccess: (edited) => projectCacheReplace(queryClient, edited),
  });

  return { isPending, isError, mutateAsync };
};
