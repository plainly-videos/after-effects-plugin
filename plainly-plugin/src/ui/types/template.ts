export interface Template {
  id: string;
  name: string;
  renderingComposition: string;
  renderingCompositionId: number;
  layers: Layer[];
}

type LayerBase = {
  internalId: string;
  _uiId?: string;
  layerName: string;
  compositions: { id: number; name: string }[];
  parametrization?: Parametrization;
  scripting?: Scripting;
};

export type MediaType = 'image' | 'video' | 'audio';

export type Layer =
  | (LayerBase & { layerType: 'MEDIA'; mediaType: MediaType })
  | (LayerBase & {
      layerType: 'COMPOSITION' | 'DATA' | 'DATA_EFFECT' | 'SOLID_COLOR';
    });

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
  LAYER_MANAGEMENT = 'LAYER_MANAGEMENT',
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

export type LayerManagementScript = {
  scriptType: ScriptType.LAYER_MANAGEMENT;
  parameterName: string;
};

export type EditableScript =
  | CropScript
  | MediaAutoScaleScript
  | ShiftInScript
  | ShiftOutScript
  | LayerManagementScript;

// Distributive omit: applies Omit to each member of a union individually,
// preserving the discriminated union structure.
type DistributiveOmit<T, K extends PropertyKey> = T extends unknown
  ? Omit<T, K>
  : never;

// Layer with _uiId stripped — the shape that is safe to send to the server.
export type ServerLayer = DistributiveOmit<Layer, '_uiId'>;

export type ScriptEditState<S extends Script> = {
  layerUiId: string;
  script: S;
  isNew: boolean;
  isBulk: boolean;
} | null;

export type TemplatePut = Omit<Template, 'id' | 'layers'> & {
  layers: ServerLayer[];
};
