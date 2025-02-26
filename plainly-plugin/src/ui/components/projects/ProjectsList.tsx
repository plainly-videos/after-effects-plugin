import { platformBaseUrl } from '@src/env';
import { useGetProjects } from '@src/ui/hooks';
import { useProjectData } from '@src/ui/hooks/useProjectData';
import { Routes } from '@src/ui/types';
import { handleLinkClick, isEmpty } from '@src/ui/utils';
import { InfoIcon, LoaderCircleIcon } from 'lucide-react';
import { useCallback, useContext, useMemo } from 'react';
import { InternalLink } from '../common';
import { AuthContext } from '../settings/AuthProvider';
import Description from '../typography/Description';
import Label from '../typography/Label';
import { LinkedProject } from './LinkedProject';
import { ProjectsListItem } from './ProjectsListItem';

export function ProjectsList() {
  const { apiKey } = useContext(AuthContext);
  const [projectData, setProjectData, removeProjectData] = useProjectData();
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

  const linkedExists = useMemo(() => !!linkedProject, [linkedProject]);

  const openInWeb = useCallback((projectId: string) => {
    handleLinkClick(`${platformBaseUrl}/dashboard/projects/${projectId}`);
  }, []);

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
        <>
          <div className="mb-4">
            <Label label="Linked project" />
            {linkedProject ? (
              <>
                <Description className="mb-1">
                  Working project is linked to the project on the Plainly
                  platform.
                </Description>
                <LinkedProject
                  project={linkedProject}
                  removeProject={removeProjectData}
                  openInWeb={openInWeb}
                />
              </>
            ) : (
              <Description className="flex items-center gap-1 mb-1">
                <InfoIcon className="size-4 text-blue-400" />
                Working project is not linked to any project on the Plainly
                platform.
              </Description>
            )}
          </div>

          <div>
            <Label label="Existing projects" />
            <Description className="mb-1">
              List of all of your existing projects on the Plainly platform.
            </Description>
            <ul className="divide-y divide-white/10 overflow-auto w-full">
              {filteredData.map((project) => (
                <ProjectsListItem
                  key={project.id}
                  project={project}
                  linkProject={setProjectData}
                  openInWeb={openInWeb}
                  linkedExists={linkedExists}
                />
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
