import type { Template } from '@src/ui/types/template';
import { TemplatesListItem } from './TemplatesListItem';

export function TemplatesList({
  templates,
  projectId,
}: { templates: Template[]; projectId: string }) {
  return (
    <div className="overflow-hidden rounded-md bg-secondary shadow w-full flex flex-col divide-y divide-white/10">
      {templates.map((template) => (
        <TemplatesListItem
          key={template.id}
          template={template}
          projectId={projectId}
        />
      ))}
    </div>
  );
}
