import { arrayMove } from '@dnd-kit/sortable';
import {
  type CropScript,
  type EditableScript,
  type Layer,
  type LayerManagementScript,
  type MediaAutoScaleScript,
  ScriptType,
  type ShiftInScript,
  type ShiftOutScript,
} from '@src/ui/types/template';

export function addTextAutoScaleScript(layer: Layer): Layer {
  const existingScripts = layer.scripting?.scripts || [];
  if (
    existingScripts.some((s) => s.scriptType === ScriptType.TEXT_AUTO_SCALE)
  ) {
    return layer;
  }
  return {
    ...layer,
    scripting: {
      ...layer.scripting,
      scripts: [...existingScripts, { scriptType: ScriptType.TEXT_AUTO_SCALE }],
    },
  };
}

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

type DefaultScriptMap = {
  [ScriptType.CROP]: CropScript;
  [ScriptType.MEDIA_AUTO_SCALE]: MediaAutoScaleScript;
  [ScriptType.SHIFT_IN]: ShiftInScript;
  [ScriptType.SHIFT_OUT]: ShiftOutScript;
  [ScriptType.LAYER_MANAGEMENT]: LayerManagementScript;
};

export function getDefaultScript<T extends keyof DefaultScriptMap>(
  scriptType: T,
): DefaultScriptMap[T];
export function getDefaultScript(
  scriptType: ScriptType,
): EditableScript | undefined;
export function getDefaultScript(
  scriptType: ScriptType,
): EditableScript | undefined {
  return scriptDefaults[scriptType];
}

export function reorderScripts(
  layers: Layer[],
  layerInternalId: string,
  activeId: string,
  overId: string,
): Layer[] {
  if (activeId === overId) return layers;
  return layers.map((layer) => {
    if (layer.internalId !== layerInternalId) return layer;
    const scripts = layer.scripting?.scripts || [];
    const oldIndex = scripts.findIndex((s) => s.scriptType === activeId);
    const newIndex = scripts.findIndex((s) => s.scriptType === overId);
    if (oldIndex === -1 || newIndex === -1) return layer;
    return {
      ...layer,
      scripting: {
        ...layer.scripting,
        scripts: arrayMove(scripts, oldIndex, newIndex),
      },
    };
  });
}
