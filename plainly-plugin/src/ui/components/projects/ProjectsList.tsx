import { useGetProjects } from '@src/ui/hooks';
import { useProjectData } from '@src/ui/hooks/useProjectData';
import { Routes } from '@src/ui/types';
import { isEmpty } from '@src/ui/utils';
import { LoaderCircleIcon } from 'lucide-react';
import { useContext, useMemo } from 'react';
import { InternalLink } from '../common';
import { AuthContext } from '../settings/AuthProvider';
import { ProjectsListItem } from './ProjectsListItem';

export function ProjectsList() {
  const { apiKey } = useContext(AuthContext);
  const [projectData, setProjectData] = useProjectData();
  const { isLoading, data } = useGetProjects(apiKey);

  const linkedProject = useMemo(
    () => data?.find((p) => p.id === projectData?.id),
    [data, projectData],
  );

  const filteredData = useMemo(
    () =>
      data
        ?.filter((p) => p.id !== projectData?.id)
        .sort(
          (p1, p2) =>
            new Date(p2.lastModified).getTime() -
            new Date(p1.lastModified).getTime(),
        ),
    [data, projectData],
  );

  if (isLoading) {
    return (
      <LoaderCircleIcon className="animate-spin shrink-0 mx-auto size-6 text-white my-auto" />
    );
  }

  return (
    <div className="rounded-md">
      {isEmpty(filteredData) && (
        <div className="p-4 text-center">
          <p className="text-sm text-gray-400">
            No projects found. Start by{' '}
            <InternalLink to={Routes.UPLOAD} text="uploading" /> your first your
            first project.
          </p>
        </div>
      )}

      {!isEmpty(filteredData) && (
        <ul className="divide-y divide-white/10 overflow-auto w-full">
          {linkedProject && <ProjectsListItem project={linkedProject} linked />}
          {filteredData.map((project) => (
            <ProjectsListItem
              key={project.id}
              project={project}
              linkProject={setProjectData}
              linkedExists={!!linkedProject}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
