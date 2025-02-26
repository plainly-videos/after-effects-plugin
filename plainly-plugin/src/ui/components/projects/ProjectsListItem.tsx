import type { ProjectData } from '@src/ui/types';
import type { Project } from '@src/ui/types/project';
import classNames from 'classnames';
import { format } from 'date-fns';
import { ExternalLinkIcon, StarIcon } from 'lucide-react';
import { useCallback, useState } from 'react';
import { ProjectAction } from '.';
import { ConfirmationDialog, Tooltip } from '../common';
import { Label } from '../typography';

const statuses = {
  failed: 'text-red-400 bg-red-400/10',
  done: 'text-green-400 bg-green-400/10',
  pending: 'text-yellow-400 bg-yellow-400/10',
};

export function ProjectsListItem({
  project,
  linkProject,
  openInWeb,
  linkedExists,
}: {
  project: Project;
  linkProject: (data: ProjectData) => void;
  openInWeb: (id: string) => void;
  linkedExists?: boolean;
}) {
  const [showConfirmation, setShowConfirmation] = useState(false);

  const analysisDone = project.analysis.done;
  const analysisFailed = project.analysis.failed;

  const status = analysisDone ? 'done' : analysisFailed ? 'failed' : 'pending';
  const statusText = analysisDone
    ? 'Render ready'
    : analysisFailed
      ? 'Analysis error'
      : 'Analysis pending';

  const link = useCallback(() => {
    if (linkedExists && !showConfirmation) {
      setShowConfirmation(true);
      return;
    }

    linkProject({
      id: project.id,
      revisionCount: project.revisionHistory?.length || 0,
    });

    // scroll window to top
    window.scrollTo(0, 0);
  }, [
    linkedExists,
    showConfirmation,
    linkProject,
    project.id,
    project.revisionHistory,
  ]);

  const open = useCallback(() => {
    openInWeb(project.id);
  }, [project.id, openInWeb]);

  return (
    <>
      <li className="p-2 text-xs min-w-fit w-full">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center">
            <Tooltip text={statusText}>
              <div
                className={classNames(
                  statuses[status],
                  'flex-none rounded-full p-1',
                )}
              >
                <div className="size-1 rounded-full bg-current" />
              </div>
            </Tooltip>
            <Label
              label={project.name}
              className="truncate w-24 xs:w-32 sm:w-48 md:w-64 ml-2"
            />
            <p className="whitespace-nowrap w-20 text-gray-400 ml-2">
              {format(project.lastModified, 'PP')}
            </p>
          </div>
          <div className="flex items-center gap-2 ml-2">
            <Tooltip text="Link project">
              <ProjectAction icon={StarIcon} action={link} />
            </Tooltip>
            <Tooltip text="Open in web">
              <ProjectAction icon={ExternalLinkIcon} action={open} />
            </Tooltip>
          </div>
        </div>
      </li>
      <ConfirmationDialog
        title="Relinking local project"
        description="Working project is already linked to a project on the platform. Are you sure you want to relink this project to another project?"
        buttonText="Link"
        open={showConfirmation}
        setOpen={setShowConfirmation}
        action={link}
      />
    </>
  );
}
