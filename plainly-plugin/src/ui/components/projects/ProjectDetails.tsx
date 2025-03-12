import { useGetProjectDetails, useGetRenders } from '@src/ui/hooks';
import { Routes } from '@src/ui/types';
import { LoaderCircleIcon } from 'lucide-react';
import { useContext } from 'react';
import { Breadcrumb, Breadcrumbs } from '../common';
import { AuthContext } from '../settings';

export function ProjectDetails({ id }: { id: string }) {
  const { apiKey } = useContext(AuthContext);
  const { isLoading: loadingProject, data: project } = useGetProjectDetails(
    id,
    apiKey,
  );
  const { isLoading: loadingRenders, data: renders } = useGetRenders(apiKey, {
    projectId: id,
    size: 20,
  });

  const isLoading = loadingProject || loadingRenders;

  if (isLoading)
    return (
      <LoaderCircleIcon className="animate-spin shrink-0 mx-auto size-6 text-white my-auto" />
    );

  if (!project) return null;

  console.log(renders);

  return (
    <div className="space-y-4 w-full text-white">
      <Breadcrumbs>
        <Breadcrumb to={{ path: Routes.PROJECTS }} label="Projects" firstItem />
        <Breadcrumb
          to={{ path: Routes.PROJECT, params: { id } }}
          label={project.name}
        />
      </Breadcrumbs>
    </div>
  );
}
