import {
  type CropScript,
  type EditableScript,
  type LayerManagementScript,
  type MediaAutoScaleScript,
  ScriptType,
  type ShiftInScript,
  type ShiftOutScript,
} from '@src/ui/types/template';

const scriptDefaults: Partial<Record<ScriptType, EditableScript>> = {
  [ScriptType.CROP]: {
    scriptType: ScriptType.CROP,
    compEndsAtOutPoint: false,
    compStartsAtInPoint: false,
  },
  [ScriptType.MEDIA_AUTO_SCALE]: {
    scriptType: ScriptType.MEDIA_AUTO_SCALE,
    fill: true,
    fixedRatio: true,
  },
  [ScriptType.SHIFT_IN]: {
    scriptType: ScriptType.SHIFT_IN,
    shiftTarget: '',
    shiftsTo: 'in-point',
    shiftOverlap: 0,
  },
  [ScriptType.SHIFT_OUT]: {
    scriptType: ScriptType.SHIFT_OUT,
    shiftTarget: '',
    shiftsTo: 'in-point',
    shiftOverlap: 0,
  },
  [ScriptType.LAYER_MANAGEMENT]: {
    scriptType: ScriptType.LAYER_MANAGEMENT,
    parameterName: '',
  },
};

export function getDefaultScript(scriptType: ScriptType.CROP): CropScript;
export function getDefaultScript(scriptType: ScriptType.MEDIA_AUTO_SCALE): MediaAutoScaleScript;
export function getDefaultScript(scriptType: ScriptType.SHIFT_IN): ShiftInScript;
export function getDefaultScript(scriptType: ScriptType.SHIFT_OUT): ShiftOutScript;
export function getDefaultScript(scriptType: ScriptType.LAYER_MANAGEMENT): LayerManagementScript;
export function getDefaultScript(scriptType: ScriptType): EditableScript | undefined;
export function getDefaultScript(scriptType: ScriptType): EditableScript | undefined {
  return scriptDefaults[scriptType];
}
