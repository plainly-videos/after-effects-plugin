import type { ModelBaseWithDates } from '.';

export interface Project extends ModelBaseWithDates {
  analysis: ProjectAnalysis;
  uploaded: boolean;
  name: string;
  description?: string;
  attributes?: Record<string, unknown> & {
    tags?: string[];
  };
  revisionHistory?: ProjectRevision[];
  analyzed: boolean;
  size: number;
  templates: Template[]; // extend when more is needed
}

interface ProjectAnalysis {
  done: boolean;
  pending: boolean;
  failed: boolean;
  error?: Record<string, string | object>;
  upgradeError?: Record<string, string | object>;
}

interface ProjectRevision {
  id: string;
  createdDate: string;
  expiredDate?: string;
  expired: boolean;
}

export interface Template {
  id: string;
  name: string;
  layers: Layer[];
}

export interface Layer {
  internalId: string;
  layerName: string;
  parametrization: Parametrization;
  scripting: Scripting;
}

export interface Parametrization {
  defaultValue?: string;
  expression: boolean;
  mandatory: boolean;
  value: string;
}

export interface Scripting {
  scripts: Script[];
}

export interface Script {
  scriptType: ScriptType;
}

enum ScriptType {
  CROP = 'CROP',
  MEDIA_AUTO_SCALE = 'MEDIA_AUTO_SCALE',
  TEXT_AUTO_SCALE = 'TEXT_AUTO_SCALE',
  SHIFT_IN = 'SHIFT_IN',
  SHIFT_OUT = 'SHIFT_OUT',
}
