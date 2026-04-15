import {
  type EditableScript,
  type Layer,
  type ScriptEditState,
  ScriptType,
} from '@src/ui/types/template';
import { useCallback, useMemo } from 'react';

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
  selectedLayerIds: Set<string>;
  setEditableLayers: React.Dispatch<React.SetStateAction<Layer[]>>;
  editableLayers: Layer[];
  renderingCompositionId?: number;
}) {
  const handleScriptSave = useCallback(
    (updatedScript: EditableScript) => {
      if (!activeScriptEdit) return;
      const { layerUiId: layerInternalId, isNew, isBulk } = activeScriptEdit;
      const { scriptType } = updatedScript;
      setEditableLayers((prev) =>
        prev.map((layer) => {
          if (
            isBulk
              ? !selectedLayerIds.has(layer._uiId ?? layer.internalId)
              : (layer._uiId ?? layer.internalId) !== layerInternalId
          )
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
      selectedLayerIds.has,
      setEditableLayers,
    ],
  );

  const close = useCallback(
    () => setActiveScriptEdit(null),
    [setActiveScriptEdit],
  );

  const activeLayer = useMemo(
    () =>
      activeScriptEdit && !activeScriptEdit.isBulk
        ? editableLayers.find(
            (l) => (l._uiId ?? l.internalId) === activeScriptEdit.layerUiId,
          )
        : undefined,
    [activeScriptEdit, editableLayers],
  );

  // Assumes the first composition when a layer belongs to multiple; the type allows plural but current data treats layers as comp-specific.
  const compId = activeLayer?.compositions[0]?.id;
  const currentLayerName = activeLayer?.layerName;

  return (
    <>
      <CropScriptDialog
        key={
          activeScriptEdit?.script.scriptType === ScriptType.CROP
            ? activeScriptEdit.layerUiId
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
            ? activeScriptEdit.layerUiId
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
            ? activeScriptEdit.layerUiId
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
            ? activeScriptEdit.layerUiId
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
            ? activeScriptEdit.layerUiId
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
