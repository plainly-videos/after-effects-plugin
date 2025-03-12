import type { Template } from '@src/ui/types/template';
import { TemplateListItem } from './TemplateListItem';

export default function TemplatesList({
  templates,
}: { templates: Template[] }) {
  return (
    <div>
      {templates.map((template: Template) => {
        return <TemplateListItem key={template.id} template={template} />;
      })}
    </div>
  );
}
