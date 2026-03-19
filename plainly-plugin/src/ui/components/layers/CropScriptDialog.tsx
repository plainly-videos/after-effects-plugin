import type { CropScript } from '@src/ui/types/template';
import { ScissorsIcon } from 'lucide-react';
import { useState } from 'react';
import { Checkbox } from '../common';
import { ScriptDialogShell } from './ScriptDialogShell';

export function CropScriptDialog({
  cropScript,
  open,
  setOpen,
  action,
}: {
  cropScript: CropScript;
  open: boolean;
  setOpen: (open: boolean) => void;
  action: (script: CropScript) => void;
}) {
  const { compEndsAtOutPoint, compStartsAtInPoint } = cropScript;

  const [beginning, setBeginning] = useState(compStartsAtInPoint);
  const [end, setEnd] = useState(compEndsAtOutPoint);

  const handleSave = () => {
    action({
      scriptType: cropScript.scriptType,
      compStartsAtInPoint: beginning,
      compEndsAtOutPoint: end,
    });
    setOpen(false);
  };

  return (
    <ScriptDialogShell
      open={open}
      setOpen={setOpen}
      icon={<ScissorsIcon className="size-4 text-white" />}
      title="Crop script"
      description="Crops parent composition based on this layer variable duration."
      onSave={handleSave}
      saveDisabled={!beginning && !end}
    >
      <Checkbox
        label="Beginning"
        description="Crops the beginning of a parent composition to the in-point (start) of this layer."
        defaultChecked={compStartsAtInPoint}
        onChange={setBeginning}
      />
      <Checkbox
        label="End"
        description="Crops the end of a parent composition to the out-point (end) of this layer."
        defaultChecked={compEndsAtOutPoint}
        onChange={setEnd}
      />
    </ScriptDialogShell>
  );
}
