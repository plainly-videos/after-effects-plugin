import { GlobalContext } from '@src/ui/components/context/GlobalProvider';
import type { Project } from '@src/ui/types/project';
import { format } from 'date-fns';
import {
  CalendarIcon,
  CircleCheckIcon,
  ExternalLinkIcon,
  FolderSync,
  LayoutTemplateIcon,
  LinkIcon,
  LoaderCircleIcon,
  VideoIcon,
  XCircleIcon,
} from 'lucide-react';
import { useCallback, useContext, useState } from 'react';
import { ProjectAction } from '.';
import { ConfirmationDialog, Tooltip } from '../common';
import { Label } from '../typography';

export function LinkedProject({
  project,
  removeProject,
  openInWeb,
  openProjectRenders,
}: {
  project: Project;
  removeProject: () => void;
  openInWeb: (id: string) => void;
  openProjectRenders: (id: string) => void;
}) {
  const { plainlyProject } = useContext(GlobalContext) || {};
  const [showConfirmation, setShowConfirmation] = useState(false);

  const analysisDone = project.analysis.done;
  const analysisFailed = project.analysis.failed;

  function getStatus(done: boolean, failed: boolean) {
    if (done)
      return (
        <>
          <CircleCheckIcon className="size-3" />
          <p>Analysis done</p>
        </>
      );
    if (failed)
      return (
        <>
          <XCircleIcon className="size-3 text-red-400" />
          <p className="text-red-400">Analysis failed</p>
        </>
      );
    return (
      <>
        <LoaderCircleIcon className="animate-spin size-3" />
        <p>Analysis pending</p>
      </>
    );
  }

  const unlink = useCallback(() => {
    if (!showConfirmation) {
      setShowConfirmation(true);
      return;
    }

    removeProject();
  }, [showConfirmation, removeProject]);

  const open = useCallback(
    () => openInWeb(project.id),
    [project.id, openInWeb],
  );

  const openRenders = useCallback(
    () => openProjectRenders(project.id),
    [project.id, openProjectRenders],
  );

  const templatesLength = project.templates.length;

  return (
    <>
      <div className="overflow-hidden rounded-md bg-secondary shadow border border-white/10">
        <div className="px-4 py-2">
          <div className="flex items-center justify-between mb-1 gap-2">
            <Label
              label={project.name}
              className="font-semibold whitespace-nowrap truncate"
            />
            <div className="flex items-center gap-2">
              <Tooltip text="Unlink project">
                <ProjectAction icon={LinkIcon} action={unlink} linked />
              </Tooltip>
              <Tooltip text="Renders">
                <ProjectAction icon={VideoIcon} action={openRenders} linked />
              </Tooltip>
              <Tooltip text="Open in web">
                <ProjectAction icon={ExternalLinkIcon} action={open} linked />
              </Tooltip>
            </div>
          </div>
          <div className="flex items-end justify-between text-xs text-gray-400 whitespace-nowrap flex-wrap gap-1">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1">
                {getStatus(analysisDone, analysisFailed)}
              </div>
              <div className="flex items-center gap-1">
                <Tooltip text="Sync status">
                  <FolderSync className="size-3" />
                </Tooltip>
                <p>Local v{plainlyProject?.revisionCount || 0}</p>
                <svg
                  viewBox="0 0 2 2"
                  className="size-0.5 flex-none fill-gray-400"
                >
                  <title>dot</title>
                  <circle r={1} cx={1} cy={1} />
                </svg>
                <p>Remote v{project.revisionHistory?.length || 0}</p>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1">
                <LayoutTemplateIcon className="size-3" />
                <p>
                  {templatesLength === 0 && 'No templates'}
                  {templatesLength === 1 && '1 template'}
                  {templatesLength > 1 && `${templatesLength} templates`}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <CalendarIcon className="size-3" />
                <p>{format(project.lastModified, 'PP')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ConfirmationDialog
        title="Unlinking local project"
        description="Are you sure you want to unlink the local project from the remote one? This action cannot be undone."
        buttonText="Unlink"
        open={showConfirmation}
        setOpen={setShowConfirmation}
        action={unlink}
      />
    </>
  );
}
