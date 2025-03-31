import { evalScriptAsync } from '@src/node/utils';
import { useCallback, useState } from 'react';
import { Button, Checkbox } from '../../common';
import { Description, Label } from '../../typography';

export const ImageAutoScale = () => {
  const [applyToAll, setApplyToAll] = useState(false);

  const handleApply = useCallback(async () => {
    await evalScriptAsync(`applyAssetAutoScale("${applyToAll}")`);
  }, [applyToAll]);

  return (
    <div className="border border-white/10 bg-secondary p-2 rounded-md">
      <div className="flex items-center justify-between gap-2 mb-2">
        <div>
          <Label label="Asset auto scale" />
          <Description>
            Applies automatic image scaling to all selected image layers.
          </Description>
        </div>
        <Button type="button" onClick={handleApply}>
          Apply
        </Button>
      </div>
      <Checkbox label="Apply to all asset layers" onChange={setApplyToAll} />
    </div>
  );
};
