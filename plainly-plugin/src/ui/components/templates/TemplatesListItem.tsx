import { platformBaseUrl } from '@src/env';
import { useNavigate } from '@src/ui/hooks';
import type { Template } from '@src/ui/types/template';
import { format } from 'date-fns';
import { ExternalLinkIcon, ListVideoIcon, VideoIcon } from 'lucide-react';
import { useCallback, useMemo } from 'react';
import { Tooltip } from '../common';
import { ProjectAction } from '../projects';
import { Label } from '../typography';

export function TemplatesListItem({
  template,
  projectId,
}: { template: Template; projectId: string }) {
  const { handleLinkClick } = useNavigate();

  const openInWeb = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      handleLinkClick(
        `${platformBaseUrl}/dashboard/projects/${projectId}/templates/${template.id}`,
      );
    },
    [projectId, template.id, handleLinkClick],
  );

  const openTemplateRenders = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      handleLinkClick(
        `${platformBaseUrl}/dashboard/renders?projectId=${projectId}&templateId=${template.id}`,
      );
    },
    [projectId, template.id, handleLinkClick],
  );

  const openNewRender = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      handleLinkClick(
        `${platformBaseUrl}/dashboard/renders/new?projectId=${projectId}&templateId=${template.id}`,
      );
    },
    [projectId, template.id, handleLinkClick],
  );

  const layersLength = useMemo(() => template.layers.length, [template.layers]);

  return (
    <li className="p-2 text-xs min-w-fit w-full">
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center">
          <Label
            label={template.name}
            className="truncate w-24 xs:w-32 sm:w-48 md:w-64 ml-2"
          />
          <p className="whitespace-nowrap w-20 text-gray-400 ml-2">
            {format(template.lastModified, 'PP')}
          </p>
        </div>
        <div className="flex items-center gap-2 ml-2">
          <Tooltip text="New render">
            <ProjectAction icon={ListVideoIcon} action={openNewRender} />
          </Tooltip>
          <Tooltip text="Renders">
            <ProjectAction icon={VideoIcon} action={openTemplateRenders} />
          </Tooltip>
          <Tooltip text="Open in web">
            <ProjectAction icon={ExternalLinkIcon} action={openInWeb} />
          </Tooltip>
        </div>
      </div>
    </li>
  );
}
