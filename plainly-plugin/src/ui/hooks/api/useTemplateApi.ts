import { put } from '@src/node/request';
import type { Project } from '@src/ui/types/project';
import type { TemplatePut } from '@src/ui/types/template';
import { useQueryClient } from '@tanstack/react-query';
import { useApiMutation } from './useApi';
import { projectCacheReplace, projectsCacheRemove } from './useProjectApi';

export const useEditTemplate = () => {
  const queryClient = useQueryClient();

  const { isPending, isError, mutateAsync } = useApiMutation(
    async (
      apiKey,
      {
        projectId,
        templateId,
        data,
      }: {
        projectId: string;
        templateId: string;
        data: TemplatePut;
      },
    ) => {
      const { data: responseData } = await put<Project, TemplatePut>(
        `/projects/${projectId}/templates/${templateId}`,
        apiKey,
        data,
      );
      return responseData;
    },
    {
      onSuccess: (edited: Project) => projectCacheReplace(queryClient, edited),
      onError: (_: unknown, { projectId }: { projectId: string }) =>
        projectsCacheRemove(queryClient, projectId),
    },
  );

  return { isPending, isError, mutateAsync };
};
