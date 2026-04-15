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
import { SCRIPT_REGISTRY } from './scriptRegistry';

export const SCRIPT_PARAMETER_NAME_REGEX = /^[^.]+$/;

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
  return SCRIPT_REGISTRY[scriptType]?.defaults;
}

export function withUiIds(layers: Layer[]): Layer[] {
  return layers.map((layer, i) => ({
    ...layer,
    // Unconditionally overwrite any pre-existing _uiId (e.g. if the server
    // ever echoes back unknown fields). Index-based assignment here is the
    // single source of truth for this UI-only identifier.
    _uiId: `${layer.internalId}_${i}`,
  }));
}

export function reorderScripts(
  layers: Layer[],
  layerUiId: string,
  activeId: string,
  overId: string,
): Layer[] {
  if (activeId === overId) return layers;
  return layers.map((layer) => {
    if ((layer._uiId ?? layer.internalId) !== layerUiId) return layer;
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
