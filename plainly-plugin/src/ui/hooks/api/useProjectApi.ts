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

// refresh project list and search as long as one in analysis
const getProjectListRefreshInterval = (
  projects?: Project[],
): number | false => {
  if (projects) {
    const anyNotDone = projects.some(
      (project) => !(project.analysis?.done || project.analysis?.failed),
    );
    if (anyNotDone) {
      return API_REFETCH_INTERVAL;
    }
  }
  return false;
};

const projectsCacheAdd = (client: QueryClient, project: Project) => {
  // Add new project to the list
  client.setQueryData<Project[]>([PROJECTS_CACHE_ROOT], (projects) =>
    projects ? [...projects, project] : [project],
  );
  // Add new project details
  client.setQueryData([PROJECTS_CACHE_ROOT, project.id], project);
};

const projectCacheReplace = (client: QueryClient, project: Project) => {
  // Update the list
  client.setQueryData<Project[]>([PROJECTS_CACHE_ROOT], (projects) =>
    projects
      ? projects.map((p) => (p.id === project.id ? project : p))
      : [project],
  );
  // Update the details
  client.setQueryData([PROJECTS_CACHE_ROOT, project.id], project);
};

export const projectsCacheRemove = (client: QueryClient, projectId: string) => {
  // Remove cache
  client.removeQueries({ queryKey: [PROJECTS_CACHE_ROOT, projectId] });
};

export const useGetProjects = (apiKey: string) => {
  const { isLoading, error, data } = useQuery({
    queryKey: [PROJECTS_CACHE_ROOT],
    queryFn: async () => {
      const { data } = await get<Project[]>('/api/v2/projects', apiKey);
      const sortedByLastModified = data.sort(
        (a, b) =>
          new Date(b.lastModified).getTime() -
          new Date(a.lastModified).getTime(),
      );
      return sortedByLastModified;
    },
    refetchInterval: (): number | false => getProjectListRefreshInterval(data),
  });

  return { isLoading, error, data };
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
    onError: (_, { projectId }) => projectsCacheRemove(queryClient, projectId),
  });

  return { isPending, isError, mutateAsync };
};
