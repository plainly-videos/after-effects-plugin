import type { AnyAutoCreateTemplateDto } from '@src/ui/types/template.js';

export * from './AutoGenerateTemplatesDialog';
export * from './AllAutoGenerateForm';
export * from './PrefixAutoGenerateForm';
export * from './TargetCompositionName';
export * from './Excludes';

export interface FormProps {
  setData: (data: AnyAutoCreateTemplateDto | undefined) => void;
  projectId: string;
}
