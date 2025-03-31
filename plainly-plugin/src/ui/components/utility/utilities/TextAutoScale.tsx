import { evalScriptAsync } from '@src/node/utils';
import { useState } from 'react';
import { Button, Checkbox } from '../../common';
import { Description, Label } from '../../typography';

export const TextAutoScale = () => {
  const [applyToAll, setApplyToAll] = useState(false);
  const handleApply = async () => {
    await evalScriptAsync(`applyTextAutoscale("${applyToAll}")`);
  };

  return (
    <div className="border border-white/10 bg-secondary p-2 rounded-md">
      <div className="flex items-center justify-between gap-2 mb-2">
        <div>
          <Label label="Text auto scale" />
          <Description>
            Applies automatic text scaling to all selected text layers.
          </Description>
        </div>
        <Button onClick={handleApply}>Apply</Button>
      </div>
      <Checkbox label="Apply to all text layers" onChange={setApplyToAll} />
    </div>
  );
};
