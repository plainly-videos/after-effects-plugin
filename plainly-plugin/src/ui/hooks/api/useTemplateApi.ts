import { post } from '@src/node/request';
import type { Project } from '@src/ui/types/project';
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
        data: unknown;
      },
    ) => {
      await post<Project>(
        `/projects/${projectId}/templates/${templateId}`,
        apiKey,
        data,
      );
    },
    {
      onSuccess: (edited: Project) => projectCacheReplace(queryClient, edited),
      onError: (_: unknown, { projectId }: { projectId: string }) =>
        projectsCacheRemove(queryClient, projectId),
    },
  );

  return { isPending, isError, mutateAsync };
};
