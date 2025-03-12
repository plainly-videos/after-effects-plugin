import { useGetProjectDetails, useGetRenders } from '@src/ui/hooks';
import { Routes } from '@src/ui/types';
import { RenderState } from '@src/ui/types/render';
import { FunctionSquareIcon, LoaderCircleIcon } from 'lucide-react';
import { useContext, useMemo, useState } from 'react';
import { Breadcrumb, Breadcrumbs, Tooltip } from '../common';
import { AuthContext } from '../settings';
import { AutoGenerateTemplatesDialog } from '../templates';
import TemplatesList from '../templates/TemplateList';
import { Description, Label } from '../typography';
import { ProjectAction } from './ProjectAction';

export function ProjectDetails({ id }: { id: string }) {
  const [showAutoGenerateModal, setShowAutoGenerateModal] = useState(false);

  const { apiKey } = useContext(AuthContext);
  const { isLoading: loadingProject, data: project } = useGetProjectDetails(
    id,
    apiKey,
  );
  const { isLoading: loadingRenders, data: renders } = useGetRenders(apiKey, {
    projectId: id,
    size: 1,
    state: RenderState.DONE,
  });

  const isLoading = loadingProject || loadingRenders;
  const render = useMemo(() => renders?.[0], [renders]);

  if (isLoading)
    return (
      <LoaderCircleIcon className="animate-spin shrink-0 mx-auto size-6 text-white my-auto" />
    );

  if (!project) return null;

  return (
    <>
      <div className="space-y-4 w-full text-white">
        <Breadcrumbs>
          <Breadcrumb
            to={{ path: Routes.PROJECTS }}
            label="Projects"
            firstItem
          />
          <Breadcrumb
            to={{ path: Routes.PROJECT, params: { id } }}
            label={project.name}
          />
        </Breadcrumbs>
        {!render && (
          <div className="p-4 text-center">
            <p className="text-sm text-gray-400">
              There are no renders for this project.
            </p>
          </div>
        )}

        {render && (
          <div className="mb-4">
            <Label label="Latest render" />
            <div className="w-full rounded-md shadow border border-white/10">
              <video src={render.output} />
            </div>
          </div>
        )}

        <div>
          <div className="flex items-center gap-2">
            <Label label="Templates" />
            <Tooltip text="Auto-generate templates">
              <ProjectAction
                icon={FunctionSquareIcon}
                action={() => setShowAutoGenerateModal(true)}
              />
            </Tooltip>
          </div>
          <Description>List of all projects templates.</Description>
          <TemplatesList templates={project.templates} />
        </div>
      </div>
      <AutoGenerateTemplatesDialog
        id={project.id}
        title="Auto-generate templates"
        buttonText="Generate"
        open={true}
        setOpen={setShowAutoGenerateModal}
      />
    </>
  );
}
