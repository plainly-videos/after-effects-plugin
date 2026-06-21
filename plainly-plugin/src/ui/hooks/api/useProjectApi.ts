import { get, postFormData } from '@src/node/request';
import type { Project } from '@src/ui/types/project';
import { type QueryClient, useQueryClient } from '@tanstack/react-query';
import type FormData from 'form-data';
import { useEffect, useRef } from 'react';
import { API_REFETCH_INTERVAL } from '.';
import { useApiMutation, useApiQuery } from './useApi';

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

export const projectCacheReplace = (client: QueryClient, project: Project) => {
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

export const useGetProjects = () => {
  const { isLoading, error, data } = useApiQuery(
    [PROJECTS_CACHE_ROOT],
    async (apiKey) => {
      const { data } = await get<Project[]>('/projects', apiKey);
      return data;
    },
    {
      refetchInterval: (): number | false =>
        getProjectListRefreshInterval(data),
    },
  );

  return { isLoading, error, data };
};

export const useGetProjectDetails = (projectId: string | undefined) => {
  const cacheKey = [PROJECTS_CACHE_ROOT, projectId];

  const { isLoading, error, data, refetch, isRefetching } = useApiQuery(
    cacheKey,
    async (apiKey) => {
      const { data } = await get<Project>(`/projects/${projectId}`, apiKey);
      return data;
    },
    {
      enabled: !!projectId,
      refetchInterval: (): number | false => {
        return data && !(data.analysis.done || data.analysis.failed)
          ? API_REFETCH_INTERVAL
          : false;
      },
    },
  );

  return { isLoading, error, data, refetch, isRefetching };
};

export const useUploadProject = () => {
  const queryClient = useQueryClient();
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => () => abortControllerRef.current?.abort(), []);

  const {
    isPending,
    isError,
    mutateAsync: mutateUpload,
  } = useApiMutation(
    async (apiKey, formData: FormData) => {
      const { data } = await postFormData<Project>(
        '/projects',
        apiKey,
        formData,
        abortControllerRef.current?.signal,
      );
      return data;
    },
    {
      onSuccess: (project: Project) => projectsCacheAdd(queryClient, project),
      onSettled: () => {
        abortControllerRef.current = null;
      },
    },
  );

  const mutateAsync = (formData: FormData) => {
    abortControllerRef.current = new AbortController();
    return mutateUpload(formData);
  };

  const cancel = () => abortControllerRef.current?.abort();

  return { isPending, isError, mutateAsync, cancel };
};

export const useEditProject = () => {
  const queryClient = useQueryClient();
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => () => abortControllerRef.current?.abort(), []);

  const {
    isPending,
    isError,
    mutateAsync: mutateEdit,
  } = useApiMutation(
    async (
      apiKey,
      { projectId, formData }: { projectId: string; formData: FormData },
    ) => {
      const { data } = await postFormData<Project>(
        `/projects/${projectId}`,
        apiKey,
        formData,
        abortControllerRef.current?.signal,
      );
      return data;
    },
    {
      onSuccess: (edited: Project) => projectCacheReplace(queryClient, edited),
      onError: (_: unknown, { projectId }: { projectId: string }) => {
        if (!abortControllerRef.current?.signal.aborted) {
          projectsCacheRemove(queryClient, projectId);
        }
      },
      onSettled: () => {
        abortControllerRef.current = null;
      },
    },
  );

  const mutateAsync = (variables: {
    projectId: string;
    formData: FormData;
  }) => {
    abortControllerRef.current = new AbortController();
    return mutateEdit(variables);
  };

  const cancel = () => abortControllerRef.current?.abort();

  return { isPending, isError, mutateAsync, cancel };
};
