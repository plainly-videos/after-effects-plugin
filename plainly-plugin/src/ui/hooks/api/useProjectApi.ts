import { get, postFormData } from '@src/node/request';
import type { Project } from '@src/ui/types/project';
import {
  type QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import type FormData from 'form-data';
import { API_REFETCH_INTERVAL } from '.';

const PROJECTS_CACHE_ROOT = 'projects';

const projectsCacheAdd = (client: QueryClient, project: Project) => {
  // Add new project details
  client.setQueryData([PROJECTS_CACHE_ROOT, project.id], project);
};

const projectCacheReplace = (client: QueryClient, project: Project) => {
  // Update the details
  client.setQueryData([PROJECTS_CACHE_ROOT, project.id], project);
};

export const useGetProjectDetails = (
  projectId: string | undefined,
  apiKey: string,
) => {
  const cacheKey = [PROJECTS_CACHE_ROOT, projectId];

  const { isLoading, error, data } = useQuery({
    queryKey: cacheKey,
    queryFn: async () => {
      const { data } = await get<Project>(
        `/api/v2/projects/${projectId}`,
        apiKey,
      );
      return data;
    },
    enabled: !!projectId,
    refetchInterval: (): number | false => {
      return data && !(data.analysis.done || data.analysis.failed)
        ? API_REFETCH_INTERVAL
        : false;
    },
  });

  return { isLoading, error, data };
};

export const useUploadProject = () => {
  const queryClient = useQueryClient();

  const { isPending, isError, mutateAsync } = useMutation({
    mutationFn: async ({
      apiKey,
      formData,
    }: { apiKey: string; formData: FormData }) => {
      const { data } = await postFormData<Project>(
        '/api/v2/projects',
        apiKey,
        formData,
      );
      return data;
    },
    onSuccess: (project) => projectsCacheAdd(queryClient, project),
  });

  return { isPending, isError, mutateAsync };
};

export const useEditProject = () => {
  const queryClient = useQueryClient();

  const { isPending, isError, mutateAsync } = useMutation({
    mutationFn: async ({
      apiKey,
      projectId,
      formData,
    }: { apiKey: string; projectId: string; formData: FormData }) => {
      const { data } = await postFormData<Project>(
        `api/v2/projects/${projectId}`,
        apiKey,
        formData,
      );
      return data;
    },
    onSuccess: (edited: Project) => projectCacheReplace(queryClient, edited),
  });

  return { isPending, isError, mutateAsync };
};
