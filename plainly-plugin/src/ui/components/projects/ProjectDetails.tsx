import { platformBaseUrl } from '@src/env';
import { useGetProjectDetails, useNavigate } from '@src/ui/hooks';
import { Routes } from '@src/ui/types';
import { isEmpty } from '@src/ui/utils';
import classNames from 'classnames';
import { format } from 'date-fns';
import {
  CalendarIcon,
  CircleCheckIcon,
  DatabaseIcon,
  FunctionSquareIcon,
  HistoryIcon,
  LoaderCircleIcon,
  TagIcon,
  TextIcon,
  XCircleIcon,
} from 'lucide-react';
import { useCallback, useMemo } from 'react';
import {
  Alert,
  Breadcrumb,
  Breadcrumbs,
  ExternalLink,
  Tooltip,
} from '../common';
import { TemplatesList } from '../templates';
import { Description, Label, PageHeading } from '../typography';
import { ProjectAction } from './ProjectAction';

export function ProjectDetails({
  projectId,
}: { projectId: string | undefined }) {
  const { isLoading, data: project } = useGetProjectDetails(projectId);
  const { navigate, sidebarOpen, handleLinkClick } = useNavigate();

  const webAutoGenerate = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      handleLinkClick(`${platformBaseUrl}/dashboard/projects/${projectId}`);
    },
    [handleLinkClick, projectId],
  );

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

  const revisions = useMemo(() => project?.revisionHistory?.length, [project]);

  if (isLoading)
    return (
      <LoaderCircleIcon className="animate-spin shrink-0 mx-auto size-6 text-white my-auto" />
    );

  if (!project || !projectId) {
    return (
      <div
        className={classNames(
          'absolute inset-0 w-full h-screen flex items-center justify-center bg-[rgb(29,29,30)] z-10',
          sidebarOpen ? 'pl-[3.75rem] xs:pl-36' : 'pl-[3.75rem]',
        )}
      >
        <div className="p-6 sm:p-14 lg:p-20 flex flex-col items-center justify-center">
          <XCircleIcon className="text-red-400" />
          <PageHeading heading="Not found" />
          <Description>
            Project not found, please return to the{' '}
            <button
              type="button"
              className="text-white underline"
              onClick={() => navigate(Routes.PROJECTS)}
            >
              Projects
            </button>{' '}
            page.
          </Description>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 w-full text-white">
      <Breadcrumbs>
        <Breadcrumb to={{ path: Routes.PROJECTS }} label="Projects" firstItem />
        <Breadcrumb
          to={{ path: Routes.PROJECT, params: { projectId } }}
          label={project.name}
        />
      </Breadcrumbs>
      <div>
        <Label label="Project information" />
        <div className="grid grid-cols-2 gap-1 text-xs text-gray-400 whitespace-nowrap overflow-hidden rounded-md bg-secondary shadow border border-white/10 w-full px-4 py-2">
          <div className="col-span-2">
            <Label
              label={project.name}
              className="whitespace-nowrap truncate font-medium"
            />
          </div>
          <div className="flex items-center gap-1 col-span-1">
            {getStatus(project.analysis.done, project.analysis.failed)}
          </div>
          <div className="flex items-center gap-1 col-span-1">
            <DatabaseIcon className="size-3" />
            <p>{(project.size / 1024 / 1024).toFixed(1)} MB</p>
          </div>
          <div className="flex items-center gap-1 col-span-1">
            <CalendarIcon className="size-3" />
            <p>{format(project.lastModified, 'PP')}</p>
          </div>
          <div className="flex items-center gap-1 col-span-1">
            <HistoryIcon className="size-3" />
            <p>
              {revisions === 0 && 'No revisions'}
              {revisions === 1 && '1 revision'}
              {revisions && revisions > 1 && `${revisions} revisions`}
            </p>
          </div>
          <div className="flex items-center gap-1 col-span-2">
            <TextIcon className="size-3" />
            <p className="flex flex-wrap gap-1">
              {project.description || 'No description'}
            </p>
          </div>
          <div className="flex items-center gap-1 col-span-2">
            <TagIcon className="size-3" />
            <p className="flex flex-wrap gap-1">
              {project.attributes?.tags?.map((tag) => (
                <span
                  key={tag}
                  className="bg-primary px-1 py-[0.1rem] rounded-md border-white/10"
                >
                  {tag}
                </span>
              ))}
            </p>
          </div>
        </div>
      </div>
      <div>
        <div className="flex items-center gap-2">
          <Label label="Templates" />
          <Tooltip text="Auto generate">
            <ProjectAction icon={FunctionSquareIcon} action={webAutoGenerate} />
          </Tooltip>
        </div>
        <Description className="mb-1">
          List of available templates for this project
        </Description>
        {isEmpty(project.templates) ? (
          <Alert
            title={
              <p>
                There are no templates for this project. Start by{' '}
                <ExternalLink
                  to={`${platformBaseUrl}/dashboard/projects/${projectId}`}
                  text="Auto-generating"
                />{' '}
                one.
              </p>
            }
            type="info"
          />
        ) : (
          <TemplatesList templates={project.templates} projectId={projectId} />
        )}
      </div>
    </div>
  );
}
