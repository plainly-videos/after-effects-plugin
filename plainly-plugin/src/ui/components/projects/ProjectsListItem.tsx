import { platformBaseUrl } from '@src/env';
import type { ProjectData } from '@src/ui/types';
import type { Project } from '@src/ui/types/project';
import { handleLinkClick } from '@src/ui/utils';
import classNames from 'classnames';
import { format } from 'date-fns';
import { GlobeIcon, LinkIcon } from 'lucide-react';
import { useCallback, useState } from 'react';
import { ConfirmationDialog } from '../common';
import Label from '../typography/Label';

export function ProjectsListItem({
  project,
  linked,
  linkedExists,
  linkProject,
}: {
  project: Project;
  linked?: boolean;
  linkedExists?: boolean;
  linkProject?: (data: ProjectData) => void;
}) {
  const [showConfirmation, setShowConfirmation] = useState(false);

  const statuses = {
    failed: 'text-red-400 bg-red-400/10',
    done: 'text-green-400 bg-green-400/10',
    pending: 'text-yellow-400 bg-yellow-400/10',
  };

  const link = useCallback(() => {
    if (linkedExists && !showConfirmation) {
      setShowConfirmation(true);
      return;
    }

    linkProject?.({
      id: project.id,
      revisionCount: project.revisionHistory?.length || 0,
    });
  }, [
    linkedExists,
    showConfirmation,
    linkProject,
    project.id,
    project.revisionHistory,
  ]);

  const openInWeb = useCallback(() => {
    handleLinkClick(`${platformBaseUrl}/projects/${project.id}`);
  }, [project.id]);

  return (
    <>
      <li
        className={classNames(
          'p-2 text-xs min-w-fit w-full',
          linked && 'bg-[rgb(43,43,43)]',
        )}
      >
        <div
          className={classNames(
            'flex items-center justify-between w-full',
            linked && '',
          )}
        >
          <div className="flex items-center">
            <div
              className={classNames(
                statuses[
                  project.analysis.done
                    ? 'done'
                    : project.analysis.failed
                      ? 'failed'
                      : 'pending'
                ],
                'flex-none rounded-full p-1',
              )}
            >
              <div className="size-1 rounded-full bg-current" />
            </div>
            <Label
              label={project.name}
              className="truncate w-24 xs:w-32 sm:w-48 md:w-64 ml-2"
            />
            <ProjectAttribute
              text={format(project.lastModified, 'PP')}
              className="w-20 text-gray-400 ml-2"
            />
          </div>
          <div className="flex items-center gap-1 ml-2">
            <ProjectAction icon={LinkIcon} action={link} disabled={linked} />
            <ProjectAction icon={GlobeIcon} action={openInWeb} />
          </div>
        </div>
      </li>
      <ConfirmationDialog
        open={showConfirmation}
        setOpen={setShowConfirmation}
        action={link}
      />
    </>
  );
}

function ProjectAttribute({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  return <p className={classNames('whitespace-nowrap', className)}>{text}</p>;
}

function ProjectAction({
  icon: Icon,
  action,
  disabled,
}: {
  icon: React.ElementType;
  action: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      className="size-3 flex items-center justify-center cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
      type="button"
      onClick={action}
      disabled={disabled}
    >
      <Icon className="size-3" />
    </button>
  );
}
