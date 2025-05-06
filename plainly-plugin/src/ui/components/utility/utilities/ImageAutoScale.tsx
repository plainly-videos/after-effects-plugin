import { evalScriptAsync } from '@src/node/utils';
import { useCallback, useState } from 'react';
import { Checkbox } from '../../common';
import { UtilityBox } from './UtilityBox';

export const ImageAutoScale = () => {
  const [applyToAll, setApplyToAll] = useState(false);

  const handleApply = useCallback(async () => {
    await evalScriptAsync(`applyAssetAutoScale("${applyToAll}")`);
  }, [applyToAll]);

  const handleRemove = useCallback(async () => {
    await evalScriptAsync(`removeAssetAutoScale("${applyToAll}")`);
  }, [applyToAll]);

  return (
    <UtilityBox
      handleApply={handleApply}
      handleRemove={handleRemove}
      title="Asset auto scale"
      tooltip="Applies automatic image/video scaling to all selected image/video layers."
      className="mt-2"
    >
      <Checkbox label="Apply to all asset layers" onChange={setApplyToAll} />
    </UtilityBox>
  );
};
