import type { Template } from '@src/ui/types/template';

// TODO: Finish looks in next PR
export function TemplateListItem({ template }: { template: Template }) {
  return <div>{template.name}</div>;
}
