import type { ModelBaseWithDates } from '.';

// extend when more is needed
export interface Template extends ModelBaseWithDates {
  createdBy?: string;
  name: string;
  renderingComposition: string;
  renderingCompositionId: number;
  duration?: number;
  resolution?: Resolution;
  layers: Partial<Record<string, unknown>>[];
}

export interface Resolution {
  width: number;
  height: number;
}

export enum AutoCreateTemplateType {
  all = 'all',
  prefix = 'prefix',
}

export interface AutoCreateTemplateDto<T extends AutoCreateTemplateType> {
  type: T;
}

interface CommonAutoCreate {
  targetCompositionName?: string;
  excludeAdjustmentLayers?: boolean;
  excludeGuideLayers?: boolean;
  excludeDisabledLayers?: boolean;
  excludeShyLayers?: boolean;
}

export interface AllAutoCreateTemplateDto
  extends AutoCreateTemplateDto<AutoCreateTemplateType.all>,
    CommonAutoCreate {
  allLayers: boolean;
  greedy: boolean;
}

export interface PrefixAutoCreateTemplateDto
  extends AutoCreateTemplateDto<AutoCreateTemplateType.prefix>,
    CommonAutoCreate {
  prefixes?: string[];
  stripPrefix: boolean;
}

export type AnyAutoCreateTemplateDto =
  | AllAutoCreateTemplateDto
  | PrefixAutoCreateTemplateDto;
