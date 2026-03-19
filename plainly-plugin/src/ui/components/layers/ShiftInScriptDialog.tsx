import type { ShiftInScript } from '@src/ui/types/template';
import { LogInIcon } from 'lucide-react';
import { useState } from 'react';
import { ScriptDialogShell } from './ScriptDialogShell';

export function ShiftInScriptDialog({
  shiftInScript,
  open,
  setOpen,
  action,
}: {
  shiftInScript: ShiftInScript;
  open: boolean;
  setOpen: (open: boolean) => void;
  action: (script: ShiftInScript) => void;
}) {
  const { shiftTarget, shiftsTo, shiftOverlap } = shiftInScript;

  const [target, _setTarget] = useState(shiftTarget);
  const [to, _setTo] = useState(shiftsTo);
  const [overlap, _setOverlap] = useState(shiftOverlap);

  const handleSave = () => {
    action({
      scriptType: shiftInScript.scriptType,
      shiftTarget: target,
      shiftsTo: to,
      shiftOverlap: overlap,
    });
    setOpen(false);
  };

  return (
    <ScriptDialogShell
      open={open}
      setOpen={setOpen}
      icon={<LogInIcon className="size-4 text-white" />}
      title="Shift in script"
      description="Shifts the start of a layer based on the duration of another layer in the same composition."
      onSave={handleSave}
    />
  );
}
