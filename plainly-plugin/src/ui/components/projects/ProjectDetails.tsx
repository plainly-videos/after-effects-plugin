import { platformBaseUrl } from '@src/env';
import { useGetProjectDetails, useNavigate } from '@src/ui/hooks';
import { Routes } from '@src/ui/types';
import classNames from 'classnames';
import {
  FunctionSquareIcon,
  LoaderCircleIcon,
  XCircleIcon,
} from 'lucide-react';
import { useCallback } from 'react';
import { Breadcrumb, Breadcrumbs, Tooltip } from '../common';
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
        <div className="flex items-center gap-2">
          <Label label="Templates" />
          <Tooltip text="Auto generate">
            <ProjectAction icon={FunctionSquareIcon} action={webAutoGenerate} />
          </Tooltip>
        </div>
        <Description className="mb-1">List of available templates</Description>
        <TemplatesList templates={project.templates} projectId={projectId} />
      </div>
    </div>
  );
}
