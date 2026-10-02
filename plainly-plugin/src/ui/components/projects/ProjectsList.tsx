import { platformBaseUrl } from '@src/env';
import { selectFolder } from '@src/node';
import { FolderPermissionError } from '@src/node/errors';
import {
  finalizePath,
  openFolder,
  reserveUniqueFilePath,
} from '@src/node/utils';
import { GlobalContext } from '@src/ui/components/context/GlobalProvider';
import {
  useDownloadProject,
  useGetProjects,
  useNavigate,
  useNotifications,
  useProjectData,
} from '@src/ui/hooks';
import { Routes } from '@src/ui/types';
import type { Project } from '@src/ui/types/project';
import { isEmpty } from '@src/ui/utils';
import { LoaderCircleIcon } from 'lucide-react';
import { useCallback, useContext, useMemo, useRef } from 'react';
import { Alert, InternalLink } from '../common';
import { Description, Label } from '../typography';
import { LinkedProject, ProjectsListItem } from '.';

export function ProjectsList() {
  const { handleLinkClick } = useNavigate();
  const { plainlyProject } = useContext(GlobalContext);
  const { setProjectData, removeProjectData } = useProjectData();
  const { isLoading, data } = useGetProjects();
  const { notifySuccess, notifyError } = useNotifications();
  const { downloadingIds, mutateAsync: download } = useDownloadProject();

  const linkedProject = useMemo(
    () => data?.find((p) => p.id === plainlyProject?.id),
    [data, plainlyProject],
  );

  const unlinkedProjects = useMemo(
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

  // covers the folder dialog too, before the download shows up as pending
  const activeDownloadIds = useRef(new Set<string>());

  const downloadProject = useCallback(
    async (project: Project) => {
      if (activeDownloadIds.current.has(project.id)) return;
      activeDownloadIds.current.add(project.id);

      try {
        const folder = await selectFolder(
          'Select folder to download project to:',
        );
        if (!folder) return;

        const destPath = await reserveUniqueFilePath(
          finalizePath(folder),
          // strip characters not allowed in file names
          project.name.replace(/[\\/:*?"<>|]/g, '_'),
          '.zip',
        );
        await download({ projectId: project.id, destPath });
        notifySuccess(
          'Project downloaded',
          `Project downloaded to: ${destPath}`,
        );
        openFolder(folder);
      } catch (error) {
        const action =
          error instanceof FolderPermissionError
            ? {
                label: 'Open folder',
                onClick: () => openFolder(error.folderPath),
              }
            : undefined;
        notifyError('Failed to download project', error, action);
      } finally {
        activeDownloadIds.current.delete(project.id);
      }
    },
    [download, notifySuccess, notifyError],
  );

  if (isLoading) {
    return (
      <LoaderCircleIcon className="animate-spin shrink-0 mx-auto size-6 text-white my-auto" />
    );
  }

  return (
    <div className="rounded-md">
      {isEmpty(unlinkedProjects) && (
        <div className="p-4 text-center">
          <p className="text-sm text-gray-400">
            No projects found. Start by{' '}
            <InternalLink to={Routes.UPLOAD} text="uploading" /> your first your
            first project.
          </p>
        </div>
      )}

      {!isEmpty(unlinkedProjects) && (
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
                  downloadProject={downloadProject}
                  downloading={downloadingIds.includes(linkedProject.id)}
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
              {unlinkedProjects.map((project) => (
                <ProjectsListItem
                  key={project.id}
                  project={project}
                  linkProject={setProjectData}
                  openInWeb={openInWeb}
                  openProjectRenders={openProjectRenders}
                  downloadProject={downloadProject}
                  downloading={downloadingIds.includes(project.id)}
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
