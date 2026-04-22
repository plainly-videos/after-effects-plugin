import { arrayMove } from '@dnd-kit/sortable';
import {
  type CropScript,
  type EditableScript,
  type Layer,
  type LayerManagementScript,
  type MediaAutoScaleScript,
  type Script,
  ScriptType,
  type ShiftInScript,
  type ShiftOutScript,
} from '@src/ui/types/template';
import { SCRIPT_REGISTRY } from './scriptRegistry';

export const SCRIPT_PARAMETER_NAME_REGEX = /^[^.]+$/;

export function addScriptDirectly(layer: Layer, scriptType: ScriptType): Layer {
  const existingScripts = layer.scripting?.scripts || [];
  if (existingScripts.some((s) => s.scriptType === scriptType)) {
    return layer;
  }
  return {
    ...layer,
    scripting: {
      ...layer.scripting,
      scripts: [...existingScripts, { scriptType }],
    },
  };
}

export function upsertScript(
  scripts: Script[],
  next: EditableScript,
): Script[] {
  const idx = scripts.findIndex((s) => s.scriptType === next.scriptType);
  if (idx === -1) return [...scripts, next];
  const copy = scripts.slice();
  copy[idx] = next;
  return copy;
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

export function reorderScripts(
  layers: Layer[],
  layerIndex: number,
  activeId: string,
  overId: string,
): Layer[] {
  if (activeId === overId) return layers;
  return layers.map((layer, index) => {
    if (index !== layerIndex) return layer;
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
