import type { EditableScript, LayerType } from '@src/ui/types/template';
import { ScriptType } from '@src/ui/types/template';
import {
  ImageIcon,
  LayersIcon,
  LogInIcon,
  LogOutIcon,
  ScissorsIcon,
  TypeIcon,
} from 'lucide-react';
import type React from 'react';

export type ScriptRegistryEntry = {
  label: string;
  description: string;
  icon: React.ElementType;
  isEditable: boolean;
  isAddable: boolean;
  isBulkable: boolean;
  layerTypes?: LayerType[];
  defaults?: EditableScript;
  /** When false, this script cannot be added to a COMPOSITION layer that is the rendering composition. */
  supportsRoot?: boolean;
  addDirectly?: boolean;
};

export const SCRIPT_REGISTRY: Record<ScriptType, ScriptRegistryEntry> = {
  [ScriptType.CROP]: {
    label: 'Crop',
    description:
      'Crops parent composition based on this layer variable duration.',
    icon: ScissorsIcon,
    isEditable: true,
    isAddable: true,
    isBulkable: true,
    supportsRoot: false,
    defaults: {
      scriptType: ScriptType.CROP,
      compEndsAtOutPoint: false,
      compStartsAtInPoint: false,
    },
  },
  [ScriptType.MEDIA_AUTO_SCALE]: {
    label: 'Auto scale media',
    description: 'Automatically scale media layer to the composition size.',
    icon: ImageIcon,
    isEditable: true,
    isAddable: true,
    isBulkable: true,
    layerTypes: ['MEDIA'],
    defaults: {
      scriptType: ScriptType.MEDIA_AUTO_SCALE,
      fill: true,
      fixedRatio: true,
    },
  },
  [ScriptType.TEXT_AUTO_SCALE]: {
    label: 'Auto scale text',
    description: 'Automatically scale text layer to the original text size.',
    icon: TypeIcon,
    isEditable: false,
    isAddable: true,
    isBulkable: true,
    layerTypes: ['DATA'],
    addDirectly: true,
  },
  [ScriptType.SHIFT_IN]: {
    label: 'Shift in',
    description:
      'Shifts the start of a layer based on the duration of another layer in the same composition.',
    icon: LogInIcon,
    isEditable: true,
    isAddable: true,
    isBulkable: false,
    supportsRoot: false,
    defaults: {
      scriptType: ScriptType.SHIFT_IN,
      shiftTarget: '',
      shiftsTo: 'in-point',
      shiftOverlap: 0,
    },
  },
  [ScriptType.SHIFT_OUT]: {
    label: 'Shift out',
    description:
      'Shifts the end of a layer based on the duration of another layer in the same composition.',
    icon: LogOutIcon,
    isEditable: true,
    isAddable: true,
    isBulkable: false,
    supportsRoot: false,
    defaults: {
      scriptType: ScriptType.SHIFT_OUT,
      shiftTarget: '',
      shiftsTo: 'in-point',
      shiftOverlap: 0,
    },
  },
  [ScriptType.LAYER_MANAGEMENT]: {
    label: 'Layer management',
    description:
      'Manages layer visibility and order based on a parameter value.',
    icon: LayersIcon,
    isEditable: true,
    isAddable: true,
    isBulkable: true,
    defaults: {
      scriptType: ScriptType.LAYER_MANAGEMENT,
      parameterName: '',
    },
  },
};

export function getScriptLabel(type: ScriptType | string): string {
  const entry = (
    SCRIPT_REGISTRY as Partial<Record<string, ScriptRegistryEntry>>
  )[type];
  if (entry) return entry.label;
  return (
    type.charAt(0).toUpperCase() +
    type.slice(1).toLowerCase().replace(/_/g, ' ')
  );
}
