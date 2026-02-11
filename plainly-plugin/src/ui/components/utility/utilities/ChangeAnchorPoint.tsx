import { evalScriptAsync } from '@src/node/utils';
import { useCallback } from 'react';
import { UtilityBox } from './UtilityBox';

type AnchorPointLocation =
  | 'topLeft'
  | 'topCenter'
  | 'topRight'
  | 'centerLeft'
  | 'center'
  | 'centerRight'
  | 'bottomLeft'
  | 'bottomCenter'
  | 'bottomRight';

const anchorPointLocations: AnchorPointLocation[] = [
  'topLeft',
  'topCenter',
  'topRight',
  'centerLeft',
  'center',
  'centerRight',
  'bottomLeft',
  'bottomCenter',
  'bottomRight',
];

export const ChangeAnchorPoint = () => {
  const handleApply = useCallback(async (location: AnchorPointLocation) => {
    await evalScriptAsync(`changeAnchorPoint("${location}")`);
  }, []);

  const handleRemove = useCallback(async () => {
    await evalScriptAsync('removeAnchorPoint()');
  }, []);

  return (
    <UtilityBox
      handleRemove={handleRemove}
      title="Set anchor point"
      tooltip="Sets the anchor point of the selected layers to a specific location."
    >
      <div className="grid grid-cols-3 justify-items-center gap-2">
        {anchorPointLocations.map((location) => (
          <button
            key={location}
            type="button"
            className="w-5 h-5 border border-white/10 rounded-full hover:bg-white/10 flex items-center justify-center text-gray-400"
            onClick={() => handleApply(location)}
          >
            +
          </button>
        ))}
      </div>
    </UtilityBox>
  );
};
