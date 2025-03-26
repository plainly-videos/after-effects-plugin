import { useGetProjectDetails } from '@src/ui/hooks';
import { Routes } from '@src/ui/types';
import { LoaderCircleIcon } from 'lucide-react';
import { Breadcrumb, Breadcrumbs } from '../common';

export function ProjectDetails({
  projectId,
}: { projectId: string | undefined }) {
  const { isLoading, data: project } = useGetProjectDetails(projectId);

  if (isLoading)
    return (
      <LoaderCircleIcon className="animate-spin shrink-0 mx-auto size-6 text-white my-auto" />
    );

  if (!project || !projectId) return null;

  return (
    <div className="space-y-4 w-full text-white">
      <Breadcrumbs>
        <Breadcrumb to={{ path: Routes.PROJECTS }} label="Projects" firstItem />
        <Breadcrumb
          to={{ path: Routes.PROJECT, params: { projectId } }}
          label={project.name}
        />
      </Breadcrumbs>
    </div>
  );
}
