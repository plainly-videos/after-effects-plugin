import { evalScriptAsync } from '@src/node/utils';
import { useCallback, useState } from 'react';
import { Checkbox } from '../../common';
import { UtilityBox } from './UtilityBox';

export const TextAutoScale = () => {
  const [applyToAll, setApplyToAll] = useState(false);
  const [width, setWidth] = useState<number>();

  const handleApply = useCallback(async () => {
    await evalScriptAsync(`applyTextAutoScale("${applyToAll}", "${width}")`);
  }, [applyToAll, width]);

  const handleRemove = useCallback(async () => {
    await evalScriptAsync(`removeTextAutoScale("${applyToAll}")`);
  }, [applyToAll]);

  return (
    <UtilityBox
      handleApply={handleApply}
      handleRemove={handleRemove}
      title="Text auto scale"
      tooltip="Applies automatic text scaling to all selected text layers. If width is set, it will be used as the maximum with for the text layers. If not set, the current width of text will be used for all future text changes."
    >
      <input
        type="number"
        value={width}
        onChange={(e) => setWidth(Number(e.target.value) || undefined)}
        placeholder="width"
        className="border-white/10 bg-secondary rounded-sm w-full text-xs outline-none px-1 py-0"
        min={0}
        max={1000}
        step={1}
      />
      <Checkbox label="Apply to all text layers" onChange={setApplyToAll} />
    </UtilityBox>
  );
};
