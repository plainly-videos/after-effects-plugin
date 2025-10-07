import { evalScriptAsync } from '@src/node/utils';
import type { TextAllCapsEnabledIssue } from '@src/ui/types/validation';
import { CircleQuestionMark } from 'lucide-react';
import React from 'react';
import { Tooltip } from '../../common';

export function AllCaps({ allCaps }: { allCaps: TextAllCapsEnabledIssue[] }) {
  const onLayerNameClick = async (layerId: string) => {
    await evalScriptAsync('unselectAllLayers()');
    await evalScriptAsync(`selectLayer(${layerId})`);
  };

  return (
    <div className="col-span-3 grid grid-cols-3">
      {allCaps.map((details) => (
        <React.Fragment key={details.layerId}>
          <div className="col-span-1 border-r border-white/10 px-1 py-1 flex items-center justify-between">
            <p>All Caps enabled</p>
            <Tooltip
              text='Using "All Caps" may lead to unexpected results in renders.'
              className="max-w-40 whitespace-break-spaces"
            >
              <CircleQuestionMark className="size-3 cursor-help" />
            </Tooltip>
          </div>
          <div className="col-span-2 px-1 py-1 w-full">
            <button
              type="button"
              className="text-left underline truncate max-w-full"
              onClick={() => onLayerNameClick(details.layerId)}
            >
              {details.layerName}
            </button>
          </div>
        </React.Fragment>
      ))}
    </div>
  );
}
