import type { Template } from '@src/ui/types/template';

export function TemplateListItem({ template }: { template: Template }) {
  return <div>{template.name}</div>;
}
