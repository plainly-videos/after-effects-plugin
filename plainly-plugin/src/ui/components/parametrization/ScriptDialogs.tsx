import {
  type EditableScript,
  type Layer,
  type LayerType,
  type ScriptEditState,
  ScriptType,
} from '@src/ui/types/template';
import { useCallback, useMemo } from 'react';

import { AutoScaleMediaScriptDialog } from './AutoScaleMediaScriptDialog';
import { CropScriptDialog } from './CropScriptDialog';
import { LayerManagementScriptDialog } from './LayerManagementScriptDialog';
import { ShiftScriptDialog } from './ShiftScriptDialog';
import { getDefaultScript } from './utils';

const SCRIPT_LAYER_TYPE_RESTRICTIONS: Partial<Record<ScriptType, LayerType[]>> =
  {
    [ScriptType.MEDIA_AUTO_SCALE]: ['MEDIA'],
    [ScriptType.TEXT_AUTO_SCALE]: ['DATA'],
  };

export function ScriptDialogs({
  activeScriptEdit,
  setActiveScriptEdit,
  selectedLayerIds,
  setEditableLayers,
  editableLayers,
}: {
  activeScriptEdit: ScriptEditState<EditableScript>;
  setActiveScriptEdit: React.Dispatch<
    React.SetStateAction<ScriptEditState<EditableScript>>
  >;
  selectedLayerIds: Set<string>;
  setEditableLayers: React.Dispatch<React.SetStateAction<Layer[]>>;
  editableLayers: Layer[];
}) {
  const handleScriptSave = useCallback(
    (updatedScript: EditableScript) => {
      if (!activeScriptEdit) return;
      const { layerInternalId, isNew, isBulk } = activeScriptEdit;
      const { scriptType } = updatedScript;
      setEditableLayers((prev) =>
        prev.map((layer) => {
          if (
            isBulk
              ? !selectedLayerIds.has(layer.internalId)
              : layer.internalId !== layerInternalId
          )
            return layer;
          const allowedLayerTypes = SCRIPT_LAYER_TYPE_RESTRICTIONS[scriptType];
          if (
            isBulk &&
            allowedLayerTypes &&
            !allowedLayerTypes.includes(layer.layerType)
          )
            return layer;
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
    [activeScriptEdit, selectedLayerIds, setEditableLayers],
  );

  const close = useCallback(
    () => setActiveScriptEdit(null),
    [setActiveScriptEdit],
  );

  const activeLayer = useMemo(
    () =>
      activeScriptEdit
        ? editableLayers.find(
            (l) => l.internalId === activeScriptEdit.layerInternalId,
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
            ? activeScriptEdit.layerInternalId
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
            ? activeScriptEdit.layerInternalId
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
            ? activeScriptEdit.layerInternalId
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
            ? activeScriptEdit.layerInternalId
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
            ? activeScriptEdit.layerInternalId
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
