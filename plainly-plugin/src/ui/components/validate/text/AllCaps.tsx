import { AeScriptsApi } from '@src/node/bridge';
import {
  ProjectIssueType,
  type TextAllCapsEnabledIssue,
} from '@src/ui/types/validation';
import classNames from 'classnames';
import { ChevronDownIcon, CircleQuestionMark } from 'lucide-react';
import type React from 'react';
import { Tooltip } from '../../common';

export function AllCaps({
  allCaps,
  isOpen,
  setIsOpen,
}: {
  allCaps: TextAllCapsEnabledIssue[];
  isOpen: ProjectIssueType | undefined;
  setIsOpen: React.Dispatch<React.SetStateAction<ProjectIssueType | undefined>>;
}) {
  const onLayerNameClick = async (layerId: string) => {
    await AeScriptsApi.unselectAllLayers();
    await AeScriptsApi.selectLayer(layerId);
  };

  const onExpandClick = () => {
    setIsOpen((prev) =>
      prev === ProjectIssueType.AllCaps ? undefined : ProjectIssueType.AllCaps,
    );
  };

  return (
    <div className="col-span-3 grid grid-cols-3 border border-white/10 text-xs divide-y divide-white/10 rounded-md">
      <button
        type="button"
        onClick={onExpandClick}
        className="col-span-3 font-medium flex justify-between items-center px-3 py-2 bg-[rgb(43,43,43)]"
      >
        <div className="flex items-center gap-2">
          <p>All Caps enabled</p>
          <Tooltip
            text="Using ALL CAPS text may result in poor font rendering. Auto-fixable in After Effects >= 24.3."
            className="max-w-40 whitespace-break-spaces"
          >
            <div className="flex items-center justify-center cursor-help size-4 group">
              <CircleQuestionMark className="size-4 text-gray-400 group-hover:text-white duration-200" />
            </div>
          </Tooltip>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-white/10 flex items-center justify-center rounded-full size-4">
            <p className="leading-tight text-red-400">{allCaps.length}</p>
          </div>
          <div className="size-4 text-gray-400 hover:text-white hover:bg-[rgb(29,29,30)] rounded-full cursor-pointer flex items-center justify-center">
            <ChevronDownIcon
              className={classNames('size-4 duration-200', {
                'rotate-180': isOpen === ProjectIssueType.AllCaps,
              })}
            />
          </div>
        </div>
      </button>
      {isOpen === ProjectIssueType.AllCaps && (
        <div className="divide-y divide-white/10 col-span-3">
          {allCaps.map((details) => (
            <div key={details.layerId} className="px-3 py-1 w-full">
              <button
                type="button"
                className="text-left underline truncate max-w-full"
                onClick={onLayerNameClick.bind(null, details.layerId)}
              >
                {details.layerName}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
