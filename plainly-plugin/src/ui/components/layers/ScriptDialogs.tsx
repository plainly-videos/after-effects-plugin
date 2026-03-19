import {
  type EditableScript,
  type Layer,
  type LayerType,
  type ScriptEditState,
  ScriptType,
} from '@src/ui/types/template';

const SCRIPT_LAYER_TYPE_RESTRICTIONS: Partial<Record<ScriptType, LayerType[]>> =
  {
    [ScriptType.MEDIA_AUTO_SCALE]: ['MEDIA'],
    [ScriptType.TEXT_AUTO_SCALE]: ['DATA'],
  };

import { AutoScaleMediaScriptDialog } from './AutoScaleMediaScriptDialog';
import { CropScriptDialog } from './CropScriptDialog';
import { ShiftInScriptDialog } from './ShiftInScriptDialog';

export function ScriptDialogs({
  activeScriptEdit,
  setActiveScriptEdit,
  selectedLayerIds,
  setEditableLayers,
}: {
  activeScriptEdit: ScriptEditState<EditableScript>;
  setActiveScriptEdit: React.Dispatch<
    React.SetStateAction<ScriptEditState<EditableScript>>
  >;
  selectedLayerIds: Set<string>;
  setEditableLayers: React.Dispatch<React.SetStateAction<Layer[]>>;
}) {
  const handleScriptSave = (updatedScript: EditableScript) => {
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
  };

  const close = () => setActiveScriptEdit(null);

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
            : {
                scriptType: ScriptType.CROP,
                compEndsAtOutPoint: false,
                compStartsAtInPoint: false,
              }
        }
        open={activeScriptEdit?.script.scriptType === ScriptType.CROP}
        setOpen={(open) => !open && close()}
        action={(script) => handleScriptSave(script)}
      />
      <AutoScaleMediaScriptDialog
        mediaAutoScaleScript={
          activeScriptEdit?.script.scriptType === ScriptType.MEDIA_AUTO_SCALE
            ? activeScriptEdit.script
            : {
                scriptType: ScriptType.MEDIA_AUTO_SCALE,
                fill: true,
                fixedRatio: true,
              }
        }
        open={
          activeScriptEdit?.script.scriptType === ScriptType.MEDIA_AUTO_SCALE
        }
        setOpen={(open) => !open && close()}
        action={(script) => handleScriptSave(script)}
      />
      <ShiftInScriptDialog
        shiftInScript={
          activeScriptEdit?.script.scriptType === ScriptType.SHIFT_IN
            ? activeScriptEdit.script
            : {
                scriptType: ScriptType.SHIFT_IN,
                shiftTarget: '',
                shiftsTo: 'in-point',
                shiftOverlap: 0,
              }
        }
        open={activeScriptEdit?.script.scriptType === ScriptType.SHIFT_IN}
        setOpen={(open) => !open && close()}
        action={(script) => handleScriptSave(script)}
      />
    </>
  );
}
