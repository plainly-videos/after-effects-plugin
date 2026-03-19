import type { MediaAutoScaleScript } from '@src/ui/types/template';
import { ImageIcon } from 'lucide-react';
import { useState } from 'react';
import { Checkbox } from '../common';
import { ScriptDialogShell } from './ScriptDialogShell';

export function AutoScaleMediaScriptDialog({
  mediaAutoScaleScript,
  open,
  setOpen,
  action,
}: {
  mediaAutoScaleScript: MediaAutoScaleScript;
  open: boolean;
  setOpen: (open: boolean) => void;
  action: (script: MediaAutoScaleScript) => void;
}) {
  const { fill, fixedRatio } = mediaAutoScaleScript;

  const [fillState, setFillState] = useState(fill);
  const [fixedRatioState, setFixedRatioState] = useState(fixedRatio);

  const handleSave = () => {
    action({
      scriptType: mediaAutoScaleScript.scriptType,
      fill: fillState,
      fixedRatio: fixedRatioState,
    });
    setOpen(false);
  };

  return (
    <ScriptDialogShell
      open={open}
      setOpen={setOpen}
      icon={<ImageIcon className="size-4 text-white" />}
      title="Auto scale media"
      description="Automatically scale media layer to the composition size."
      onSave={handleSave}
    >
      <Checkbox
        label="Fill"
        description="Fill the composition with the media asset."
        defaultChecked={fillState}
        onChange={setFillState}
      />
      <Checkbox
        label="Fixed ratio"
        description="Keep the aspect ratio of the media asset."
        defaultChecked={fixedRatioState}
        onChange={setFixedRatioState}
      />
    </ScriptDialogShell>
  );
}
