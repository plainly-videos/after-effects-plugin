import {
  type EditableScript,
  type Layer,
  type ScriptEditState,
  ScriptType,
} from '@src/ui/types/template';
import { useCallback } from 'react';

import { AutoScaleMediaScriptDialog } from './AutoScaleMediaScriptDialog';
import { CropScriptDialog } from './CropScriptDialog';
import { LayerManagementScriptDialog } from './LayerManagementScriptDialog';
import { ShiftScriptDialog } from './ShiftScriptDialog';
import { SCRIPT_REGISTRY } from './scriptRegistry';
import { getDefaultScript } from './utils';

export function ScriptDialogs({
  activeScriptEdit,
  setActiveScriptEdit,
  selectedLayerIds,
  setEditableLayers,
  editableLayers,
  renderingCompositionId,
}: {
  activeScriptEdit: ScriptEditState<EditableScript>;
  setActiveScriptEdit: React.Dispatch<
    React.SetStateAction<ScriptEditState<EditableScript>>
  >;
  selectedLayerIds: Set<number>;
  setEditableLayers: React.Dispatch<React.SetStateAction<Layer[]>>;
  editableLayers: Layer[];
  renderingCompositionId?: number;
}) {
  const handleScriptSave = useCallback(
    (updatedScript: EditableScript) => {
      if (!activeScriptEdit) return;
      const { layerIndex, isNew, isBulk, targetLayerIndices } =
        activeScriptEdit;
      const { scriptType } = updatedScript;
      const bulkTargets = isBulk
        ? (targetLayerIndices ?? selectedLayerIds)
        : null;
      setEditableLayers((prev) =>
        prev.map((layer, index) => {
          if (bulkTargets ? !bulkTargets.has(index) : index !== layerIndex)
            return layer;
          const registryEntry = SCRIPT_REGISTRY[scriptType];
          const allowedLayerTypes = registryEntry?.layerTypes;
          if (
            isBulk &&
            allowedLayerTypes &&
            !allowedLayerTypes.includes(layer.layerType)
          ) {
            return layer;
          }
          if (
            isBulk &&
            registryEntry?.supportsRoot === false &&
            layer.layerType === 'COMPOSITION' &&
            renderingCompositionId !== undefined &&
            Number(layer.internalId) === renderingCompositionId
          ) {
            return layer;
          }
          const existingScripts = layer.scripting?.scripts || [];
          const hasScript = existingScripts.some(
            (s) => s.scriptType === scriptType,
          );
          const scripts =
            isBulk && hasScript
              ? existingScripts.map((s) =>
                  s.scriptType === scriptType ? updatedScript : s,
                )
              : isNew || (isBulk && !hasScript)
                ? [...existingScripts, updatedScript]
                : existingScripts.map((s) =>
                    s.scriptType === scriptType ? updatedScript : s,
                  );
          return { ...layer, scripting: { ...layer.scripting, scripts } };
        }),
      );
    },
    [
      activeScriptEdit,
      renderingCompositionId,
      selectedLayerIds,
      setEditableLayers,
    ],
  );

  const close = useCallback(
    () => setActiveScriptEdit(null),
    [setActiveScriptEdit],
  );

  const activeLayer =
    activeScriptEdit && !activeScriptEdit.isBulk
      ? editableLayers[activeScriptEdit.layerIndex]
      : undefined;

  // Assumes the first composition when a layer belongs to multiple; the type allows plural but current data treats layers as comp-specific.
  const compId = activeLayer?.compositions[0]?.id;
  const currentLayerName = activeLayer?.layerName;

  return (
    <>
      <CropScriptDialog
        key={
          activeScriptEdit?.script.scriptType === ScriptType.CROP
            ? activeScriptEdit.layerIndex
            : undefined
        }
        cropScript={
          activeScriptEdit?.script.scriptType === ScriptType.CROP
            ? activeScriptEdit.script
            : getDefaultScript(ScriptType.CROP)
        }
        open={activeScriptEdit?.script.scriptType === ScriptType.CROP}
        setOpen={(open) => !open && close()}
        action={handleScriptSave}
      />
      <AutoScaleMediaScriptDialog
        key={
          activeScriptEdit?.script.scriptType === ScriptType.MEDIA_AUTO_SCALE
            ? activeScriptEdit.layerIndex
            : undefined
        }
        mediaAutoScaleScript={
          activeScriptEdit?.script.scriptType === ScriptType.MEDIA_AUTO_SCALE
            ? activeScriptEdit.script
            : getDefaultScript(ScriptType.MEDIA_AUTO_SCALE)
        }
        open={
          activeScriptEdit?.script.scriptType === ScriptType.MEDIA_AUTO_SCALE
        }
        setOpen={(open) => !open && close()}
        action={handleScriptSave}
      />
      <ShiftScriptDialog
        key={
          activeScriptEdit?.script.scriptType === ScriptType.SHIFT_IN
            ? activeScriptEdit.layerIndex
            : undefined
        }
        script={
          activeScriptEdit?.script.scriptType === ScriptType.SHIFT_IN
            ? activeScriptEdit.script
            : getDefaultScript(ScriptType.SHIFT_IN)
        }
        compId={compId}
        currentLayerName={currentLayerName}
        open={activeScriptEdit?.script.scriptType === ScriptType.SHIFT_IN}
        setOpen={(open: boolean) => !open && close()}
        action={handleScriptSave}
      />
      <ShiftScriptDialog
        key={
          activeScriptEdit?.script.scriptType === ScriptType.SHIFT_OUT
            ? activeScriptEdit.layerIndex
            : undefined
        }
        script={
          activeScriptEdit?.script.scriptType === ScriptType.SHIFT_OUT
            ? activeScriptEdit.script
            : getDefaultScript(ScriptType.SHIFT_OUT)
        }
        compId={compId}
        currentLayerName={currentLayerName}
        open={activeScriptEdit?.script.scriptType === ScriptType.SHIFT_OUT}
        setOpen={(open: boolean) => !open && close()}
        action={handleScriptSave}
      />
      <LayerManagementScriptDialog
        key={
          activeScriptEdit?.script.scriptType === ScriptType.LAYER_MANAGEMENT
            ? activeScriptEdit.layerIndex
            : undefined
        }
        script={
          activeScriptEdit?.script.scriptType === ScriptType.LAYER_MANAGEMENT
            ? activeScriptEdit.script
            : getDefaultScript(ScriptType.LAYER_MANAGEMENT)
        }
        open={
          activeScriptEdit?.script.scriptType === ScriptType.LAYER_MANAGEMENT
        }
        setOpen={(open) => !open && close()}
        action={handleScriptSave}
      />
    </>
  );
}
