import { useGetProjects } from '@src/ui/hooks';
import { Routes } from '@src/ui/types';
import { isEmpty } from '@src/ui/utils';
import { LoaderCircleIcon } from 'lucide-react';
import { useContext } from 'react';
import { InternalLink } from '../common';
import { AuthContext } from '../settings/AuthProvider';
import { ProjectsListItem } from './ProjectsListItem';

export function ProjectsList() {
  const { apiKey } = useContext(AuthContext);
  const { isLoading, data } = useGetProjects(apiKey);

  if (isLoading) {
    return (
      <LoaderCircleIcon className="animate-spin shrink-0 mx-auto size-6 text-white my-auto" />
    );
  }

  return (
    <div className="overflow-hidden rounded-md bg-[rgb(43,43,43)] shadow">
      {isEmpty(data) && (
        <div className="p-4 text-center">
          <p className="text-sm text-gray-400">
            No projects found. Start by{' '}
            <InternalLink to={Routes.UPLOAD} text="uploading" /> your first your
            first project.
          </p>
        </div>
      )}

      {!isEmpty(data) && (
        <ul className="divide-y divide-white/10">
          {data.map((project) => (
            <ProjectsListItem key={project.id} project={project} />
          ))}
        </ul>
      )}
    </div>
  );
}
