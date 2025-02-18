import { useContext } from 'react';
import { AuthContext } from '../settings/AuthProvider';
import { useGetProjects } from '@src/ui/hooks';
import { ProjectsListItem } from './ProjectsListItem';
import { LoaderCircleIcon } from 'lucide-react';
import { isEmpty } from '@src/ui/utils';

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
            No projects found. Start by uploading your first your first project.
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
