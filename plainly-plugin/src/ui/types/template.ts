export interface Template {
  id: string;
  name: string;
  renderingComposition: string;
  renderingCompositionId: string;
  layers: Layer[];
}

export interface Layer {
  internalId: string;
  layerName: string;
  parametrization?: Parametrization;
  scripting?: Scripting;
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

export enum ScriptType {
  CROP = 'CROP',
  MEDIA_AUTO_SCALE = 'MEDIA_AUTO_SCALE',
  TEXT_AUTO_SCALE = 'TEXT_AUTO_SCALE',
  SHIFT_IN = 'SHIFT_IN',
  SHIFT_OUT = 'SHIFT_OUT',
}

export type CropScript = {
  scriptType: ScriptType.CROP;
  compEndsAtOutPoint: boolean;
  compStartsAtInPoint: boolean;
};

export type TemplateUpdate = Omit<Template, 'id'>;
