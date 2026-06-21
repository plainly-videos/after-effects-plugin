import type { LayerManagementScript } from '@src/ui/types/template';
import { ScriptType } from '@src/ui/types/template';
import { LayersIcon } from 'lucide-react';
import { useState } from 'react';
import { Description, Label } from '../typography';
import { ScriptDialogShell } from './ScriptDialogShell';
import { SCRIPT_PARAMETER_NAME_REGEX } from './utils';

export function LayerManagementScriptDialog({
  script,
  open,
  setOpen,
  action,
}: {
  script: LayerManagementScript;
  open: boolean;
  setOpen: (open: boolean) => void;
  action: (script: LayerManagementScript) => void;
}) {
  const [parameterName, setParameterName] = useState(script.parameterName);

  const isValid = SCRIPT_PARAMETER_NAME_REGEX.test(parameterName);

  const handleSave = () => {
    action({
      scriptType: ScriptType.LAYER_MANAGEMENT,
      parameterName,
    });
    setOpen(false);
  };

  return (
    <ScriptDialogShell
      open={open}
      setOpen={setOpen}
      icon={<LayersIcon className="size-4 text-white" />}
      title="Layer management"
      description="Manages layer visibility and order based on a parameter value."
      onSave={handleSave}
      saveDisabled={!parameterName || !isValid}
    >
      <div>
        <Label
          htmlFor="layer-management-parameter-name"
          label="Parameter name"
        />
        <Description className="mb-1">
          Name of the parameter that will be used to pass data.
        </Description>
        <input
          id="layer-management-parameter-name"
          type="text"
          value={parameterName}
          onChange={(e) => setParameterName(e.target.value)}
          className="w-full rounded-md border-none bg-white/5 py-1 px-3 text-xs text-white outline outline-1 -outline-offset-1 outline-white/10 focus:outline focus:-outline-offset-2 focus:outline-indigo-500"
          placeholder="Enter parameter name…"
        />
      </div>
    </ScriptDialogShell>
  );
}
