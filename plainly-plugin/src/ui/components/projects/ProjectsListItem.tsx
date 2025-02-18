import { platformBaseUrl } from '@src/env';
import type { Project } from '@src/ui/types/project';
import { getSizeWithUnit } from '@src/ui/utils';
import classNames from 'classnames';
import { format } from 'date-fns';
import {
  CalendarIcon,
  CircleCheckIcon,
  DatabaseIcon,
  LoaderCircleIcon,
  XCircleIcon,
} from 'lucide-react';
import { ExternalLink } from '../common';
import Label from '../typography/Label';

export function ProjectsListItem({ project }: { project: Project }) {
  const analysisFinished = project.analysis?.done || project.analysis?.failed;

  const renderAnalysisStatus = () => {
    if (analysisFinished) {
      return project.analysis.done ? (
        <ProjectAttribute icon={CircleCheckIcon} text="Render ready" />
      ) : (
        <ProjectAttribute
          icon={XCircleIcon}
          text="Analysis error"
          className="text-red-400"
        />
      );
    }
    return (
      <ProjectAttribute
        icon={LoaderCircleIcon}
        text="Analysis in progress"
        className="animate-spin"
      />
    );
  };

  const { value, unit } = getSizeWithUnit(project.size);

  return (
    <li className="px-4 py-2 text-xs">
      <div className="flex items-center justify-between w-full">
        <Label label={project.name} className="truncate" />
        <ExternalLink
          to={`${platformBaseUrl}/dashboard/projects/${project.id}`}
          text="View online"
        />
      </div>
      <div className="flex items-start justify-between w-full text-gray-400">
        <div className="flex flex-wrap items-center gap-2">
          <ProjectAttribute
            icon={DatabaseIcon}
            text={`${value.toFixed(2)} ${unit}`}
            className="min-w-20"
          />
          {renderAnalysisStatus()}
        </div>
        <ProjectAttribute
          icon={CalendarIcon}
          text={format(project.lastModified, 'PP')}
        />
      </div>
    </li>
  );
}

function ProjectAttribute({
  icon: Icon,
  text,
  className,
}: { icon: React.ElementType; text: string; className?: string }) {
  return (
    <p
      className={classNames(
        'flex items-center gap-1 whitespace-nowrap',
        className,
      )}
    >
      <Icon className="size-4" />
      {text}
    </p>
  );
}
