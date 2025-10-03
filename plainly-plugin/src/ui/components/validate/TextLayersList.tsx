import {
  ProjectIssueType,
  type TextLayerIssues,
} from '@src/ui/types/validation';
import { isEmpty } from '@src/ui/utils';
import classNames from 'classnames';
import { ChevronDownIcon } from 'lucide-react';
import { useState } from 'react';
import { AllCaps } from './text/AllCaps';

export function TextLayersList({
  textLayers,
}: {
  textLayers?: TextLayerIssues[];
}) {
  const [isOpen, setIsOpen] = useState(false);

  const allCaps = textLayers?.filter(
    (issue) => issue.type === ProjectIssueType.AllCaps,
  );

  const issueCount = allCaps?.length || 0;

  return (
    <div className="grid grid-cols-3 border border-white/10 text-xs divide-y divide-white/10">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="col-span-3 font-medium flex justify-between items-center px-3 py-2 bg-[rgb(43,43,43)]"
      >
        <p>Text layer issues</p>
        <div className="flex items-center gap-2">
          <div className="bg-white/10 flex items-center justify-center rounded-full size-5">
            <p
              className={classNames(
                'leading-tight',
                issueCount > 0 ? 'text-red-400' : 'text-green-400',
              )}
            >
              {issueCount}
            </p>
          </div>
          <div className="size-5 text-gray-400 hover:text-white hover:bg-[rgb(29,29,30)] rounded-full cursor-pointer flex items-center justify-center">
            <ChevronDownIcon
              className={classNames('size-4 duration-200', {
                'rotate-180': isOpen,
              })}
            />
          </div>
        </div>
      </button>
      {isOpen && (
        <>
          <div className="col-span-3 grid grid-cols-3">
            <div className="col-span-1 font-medium border-r border-white/10 px-1 py-1 bg-[rgb(43,43,43)]">
              <p>Issue</p>
            </div>
            <div className="col-span-2 bg-[rgb(43,43,43)] px-1 py-1">
              <p>Layer name</p>
            </div>
          </div>
          {!isEmpty(allCaps) && <AllCaps allCaps={allCaps} />}
        </>
      )}
    </div>
  );
}
