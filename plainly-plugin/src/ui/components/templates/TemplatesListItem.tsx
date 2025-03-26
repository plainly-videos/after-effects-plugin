import { platformBaseUrl } from '@src/env';
import { useNavigate } from '@src/ui/hooks';
import type { Template } from '@src/ui/types/template';
import { format } from 'date-fns';
import {
  CalendarIcon,
  ExternalLinkIcon,
  LayersIcon,
  ListVideoIcon,
  VideoIcon,
} from 'lucide-react';
import { useCallback } from 'react';
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

  return (
    <div className="px-4 py-2">
      <div className="flex items-center justify-between mb-1 gap-2">
        <Label label={template.name} className="whitespace-nowrap truncate" />
        <div className="flex items-center gap-2">
          <Tooltip text="New render">
            <ProjectAction icon={ListVideoIcon} action={openNewRender} linked />
          </Tooltip>
          <Tooltip text="Renders">
            <ProjectAction
              icon={VideoIcon}
              action={openTemplateRenders}
              linked
            />
          </Tooltip>
          <Tooltip text="Open in web">
            <ProjectAction icon={ExternalLinkIcon} action={openInWeb} linked />
          </Tooltip>
        </div>
      </div>
      <div className="flex items-end justify-between text-xs text-gray-400 whitespace-nowrap flex-wrap gap-1">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1">
            <LayersIcon className="size-3" />
            <p>
              {template.layers.length === 0 && 'No layers'}
              {template.layers.length === 1 && '1 layer'}
              {template.layers.length > 1 && `${template.layers.length} layers`}
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1">
            <CalendarIcon className="size-3" />
            <p>{format(template.lastModified, 'PP')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
