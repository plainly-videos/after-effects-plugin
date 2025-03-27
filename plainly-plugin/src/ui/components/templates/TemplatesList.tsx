import type { Template } from '@src/ui/types/template';
import { TemplatesListItem } from './TemplatesListItem';

export function TemplatesList({
  templates,
  projectId,
}: { templates: Template[]; projectId: string }) {
  return (
    <ul className="divide-y divide-white/10 overflow-auto w-full">
      {templates.map((template) => (
        <TemplatesListItem
          key={template.id}
          template={template}
          projectId={projectId}
        />
      ))}
    </ul>
  );
}
