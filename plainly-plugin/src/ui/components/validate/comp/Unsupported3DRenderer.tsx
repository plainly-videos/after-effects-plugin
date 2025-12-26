import { AeScriptsApi } from '@src/node/bridge';
import { useNavigate } from '@src/ui/hooks';
import {
  type CompUnsupported3DRendererIssue,
  ProjectIssueType,
} from '@src/ui/types/validation';
import classNames from 'classnames';
import {
  ChevronDownIcon,
  CircleQuestionMark,
  ExternalLinkIcon,
} from 'lucide-react';
import type React from 'react';
import { Tooltip } from '../../common';

export function Dimensions({
  dimensions,
  isOpen,
  setIsOpen,
}: {
  dimensions: CompUnsupported3DRendererIssue[];
  isOpen: ProjectIssueType | undefined;
  setIsOpen: React.Dispatch<React.SetStateAction<ProjectIssueType | undefined>>;
}) {
  const { handleLinkClick } = useNavigate();

  const onCompNameClick = async (compId: string) => {
    await AeScriptsApi.selectComp(compId);
  };

  const onExpandClick = () => {
    setIsOpen((prev) =>
      prev === ProjectIssueType.Unsupported3DRenderer
        ? undefined
        : ProjectIssueType.Unsupported3DRenderer,
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
          <p>Unsupported 3D Renderer</p>
          <Tooltip
            text="Compositions that do not use the Classic 3D renderer are not supported on the Plainly platform."
            className="max-w-40 whitespace-break-spaces"
          >
            <div className="flex items-center justify-center cursor-help size-4 group">
              <CircleQuestionMark className="size-4 text-gray-400 group-hover:text-white duration-200" />
            </div>
          </Tooltip>
          <Tooltip text="Read more">
            <div className="flex items-center justify-center cursor-pointer size-4 group">
              <button
                type="button"
                onClick={handleLinkClick.bind(
                  null,
                  'https://help.plainlyvideos.com/docs/faq/projects-faq#is-it-possible-that-cinema-4d-rendered-engine-in-after-effects-doesnt-work-on-the-plainly-platform',
                )}
                className="flex items-center justify-center"
              >
                <ExternalLinkIcon className="size-4 text-gray-400 group-hover:text-white duration-200" />
              </button>
            </div>
          </Tooltip>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-white/10 flex items-center justify-center rounded-full size-4">
            <p className="leading-tight text-red-400">{dimensions.length}</p>
          </div>
          <div className="size-4 text-gray-400 hover:text-white hover:bg-[rgb(29,29,30)] rounded-full cursor-pointer flex items-center justify-center">
            <ChevronDownIcon
              className={classNames('size-4 duration-200', {
                'rotate-180': isOpen === ProjectIssueType.Unsupported3DRenderer,
              })}
            />
          </div>
        </div>
      </button>
      {isOpen === ProjectIssueType.Unsupported3DRenderer && (
        <div className="divide-y divide-white/10 col-span-3">
          {dimensions.map((details) => (
            <div key={details.compId} className="px-3 py-1 w-full">
              <button
                type="button"
                className="text-left underline truncate max-w-full"
                onClick={onCompNameClick.bind(null, details.compId)}
              >
                {details.compName} ({details.renderer})
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
