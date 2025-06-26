import { platformBaseUrl } from '@src/env';
import { GlobalContext } from '@src/ui/context/GlobalProvider';
import { useGetProjects, useNavigate, useProjectData } from '@src/ui/hooks';
import { Routes } from '@src/ui/types';
import { isEmpty } from '@src/ui/utils';
import { LoaderCircleIcon } from 'lucide-react';
import { useCallback, useContext, useMemo } from 'react';
import { LinkedProject, ProjectsListItem } from '.';
import { Alert, InternalLink } from '../common';
import { Description, Label } from '../typography';

export function ProjectsList() {
  const { handleLinkClick } = useNavigate();
  const plainlyProject = useContext(GlobalContext)?.plainlyProject;
  const [setProjectData, removeProjectData] = useProjectData();
  const { isLoading, data } = useGetProjects();

  const linkedProject = useMemo(
    () => data?.find((p) => p.id === plainlyProject?.id),
    [data, plainlyProject],
  );

  const filteredData = useMemo(
    () =>
      data
        ?.filter((p) => p.id !== plainlyProject?.id)
        .sort(
          (p1, p2) =>
            new Date(p2.lastModified).getTime() -
            new Date(p1.lastModified).getTime(),
        ),
    [data, plainlyProject],
  );

  const linkedExists = useMemo(() => !!linkedProject, [linkedProject]);

  const openInWeb = useCallback(
    (projectId: string) => {
      handleLinkClick(`${platformBaseUrl}/dashboard/projects/${projectId}`);
    },
    [handleLinkClick],
  );

  const openProjectRenders = useCallback(
    (projectId: string) => {
      handleLinkClick(
        `${platformBaseUrl}/dashboard/renders?projectId=${projectId}`,
      );
    },
    [handleLinkClick],
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
                  openProjectRenders={openProjectRenders}
                />
              </>
            ) : (
              <Alert
                title="Working project is not linked to any project on the Plainly platform. If a matching project is listed below, use the Link button to connect it."
                type="info"
                className="mb-1"
              />
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
                  openProjectRenders={openProjectRenders}
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
