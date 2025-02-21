import { useProjectData } from '@src/ui/hooks/useProjectData';
import type { Project } from '@src/ui/types/project';
import { format } from 'date-fns';
import {
  CalendarIcon,
  CircleCheckIcon,
  ExternalLinkIcon,
  FolderSync,
  LayoutTemplateIcon,
  LoaderCircleIcon,
  StarIcon,
  XCircleIcon,
} from 'lucide-react';
import { useCallback } from 'react';
import { Tooltip } from '../common/Tooltip';
import Label from '../typography/Label';
import { ProjectAction } from './ProjectAction';

export function LinkedProject({
  project,
  openInWeb,
}: { project: Project; openInWeb: (id: string) => void }) {
  const [projectData] = useProjectData();

  const analysisDone = project.analysis.done;
  const analysisFailed = project.analysis.failed;

  function getStatus(done: boolean, failed: boolean) {
    if (done)
      return (
        <>
          <CircleCheckIcon className="size-4" />
          <p>Analysis done</p>
        </>
      );
    if (failed)
      return (
        <>
          <XCircleIcon className="size-4 text-red-400" />
          <p className="text-red-400">Analysis failed</p>
        </>
      );
    return (
      <>
        <LoaderCircleIcon className="animate-spin size-4" />
        <p>Analysis pending</p>
      </>
    );
  }

  const open = useCallback(
    () => openInWeb(project.id),
    [project.id, openInWeb],
  );

  return (
    <div className="overflow-hidden rounded-md bg-secondary shadow border border-white/10">
      <div className="px-4 py-2">
        <div className="flex items-center justify-between">
          <Label label={project.name} />
          <div className="flex items-center gap-2">
            <ProjectAction
              icon={StarIcon}
              action={() => {}}
              disabled
              linked
              fill="#fff"
            />
            <ProjectAction icon={ExternalLinkIcon} action={open} linked />
          </div>
        </div>
        <div className="flex items-end justify-between text-xs text-gray-400 whitespace-nowrap flex-wrap gap-1">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1">
              {getStatus(analysisDone, analysisFailed)}
            </div>
            <div className="flex items-center gap-1">
              <Tooltip text="Sync status">
                <FolderSync className="size-4" />
              </Tooltip>
              <p>
                Local{' '}
                <span className="text-gray-300">
                  v{projectData?.revisionCount}
                </span>
              </p>
              <svg
                viewBox="0 0 2 2"
                className="size-0.5 flex-none fill-gray-300"
              >
                <title>dot</title>
                <circle r={1} cx={1} cy={1} />
              </svg>
              <p>
                Remote{' '}
                <span className="text-gray-300">
                  v{project.revisionHistory?.length || 0}
                </span>
              </p>
            </div>
            <div className="flex items-center gap-1">
              <LayoutTemplateIcon className="size-4" />
              <p>
                Templates{' '}
                <span className="text-gray-300">
                  {project.templates.length}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <CalendarIcon className="size-4" />
            <p>{format(project.lastModified, 'PP')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
