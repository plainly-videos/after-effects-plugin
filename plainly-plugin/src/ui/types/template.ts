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
  layerType: LayerType;
  parametrization?: Parametrization;
  scripting?: Scripting;
}

export type LayerType =
  | 'COMPOSITION'
  | 'DATA'
  | 'DATA_EFFECT'
  | 'MEDIA'
  | 'SOLID_COLOR';

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

export type MediaAutoScaleScript = {
  scriptType: ScriptType.MEDIA_AUTO_SCALE;
  fill: boolean;
  fixedRatio: boolean;
  transform?: {
    size?: { sizeX: number; sizeY: number };
    position?: { posX: number; posY: number };
  };
};

export type TextAutoScaleScript = {
  scriptType: ScriptType.TEXT_AUTO_SCALE;
};

type ShiftData = {
  shiftTarget: string;
  shiftsTo: 'in-point' | 'out-point';
  shiftOverlap: number;
};

export type ShiftInScript = {
  scriptType: ScriptType.SHIFT_IN;
} & ShiftData;

export type ShiftOutScript = {
  scriptType: ScriptType.SHIFT_OUT;
} & ShiftData;

export type EditableScript = CropScript | MediaAutoScaleScript | ShiftInScript;

export type ScriptEditState<S extends Script> = {
  layerInternalId: string;
  script: S;
  isNew: boolean;
  isBulk: boolean;
} | null;

export type TemplatePut = Omit<Template, 'id'>;
