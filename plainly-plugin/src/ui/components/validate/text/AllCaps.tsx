import { AeScriptsApi } from '@src/node/bridge';
import { useNavigate, useNotifications, useProjectData } from '@src/ui/hooks';
import classNames from 'classnames';
import { isEqual } from 'lodash-es';
import {
  ChevronDownIcon,
  CircleQuestionMark,
  ExternalLinkIcon,
  TriangleAlertIcon,
  WrenchIcon,
} from 'lucide-react';
import {
  type AnyProjectIssue,
  ProjectIssueType,
  type TextAllCapsEnabledIssue,
} from 'plainly-types';
import type React from 'react';
import { useContext } from 'react';
import { Tooltip } from '../../common';
import { GlobalContext } from '../../context';

export function AllCaps({
  allCaps,
  isOpen,
  setIsOpen,
}: {
  allCaps: TextAllCapsEnabledIssue[];
  isOpen: ProjectIssueType | undefined;
  setIsOpen: React.Dispatch<React.SetStateAction<ProjectIssueType | undefined>>;
}) {
  const [, , , aeVersion] = useProjectData();

  const { projectIssues, setGlobalData } = useContext(GlobalContext);
  const { handleLinkClick } = useNavigate();
  const { notifyInfo, notifyError } = useNotifications();

  const onLayerNameClick = async (layerId: string) => {
    await AeScriptsApi.unselectAllLayers();
    await AeScriptsApi.selectLayer(layerId);
  };

  const onExpandClick = () => {
    setIsOpen((prev) =>
      prev === ProjectIssueType.AllCaps ? undefined : ProjectIssueType.AllCaps,
    );
  };

  const onFixClick = async () => {
    try {
      for (const issue of allCaps) {
        await AeScriptsApi.fixAllCapsIssue(issue.layerId);
      }
      const issues = await AeScriptsApi.validateProject();
      if (!issues) {
        setGlobalData((prev) => ({ ...prev, projectIssues: [] }));
      } else {
        const parsedIssues: AnyProjectIssue[] = JSON.parse(issues);
        if (!isEqual(parsedIssues, projectIssues)) {
          setGlobalData((prev) => ({ ...prev, projectIssues: parsedIssues }));
        }
      }
      notifyInfo(
        'Attempted to fix ALL CAPS issues.',
        'Please review the project again. Some issues may require manual intervention.',
      );
    } catch (error) {
      console.error('Error fixing ALL CAPS issues:', error);
      notifyError(
        'Error fixing ALL CAPS issues.',
        'An unexpected error occurred while attempting to fix the issues.',
      );
    }
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
            text="Using ALL CAPS text may result in poor font rendering. Auto-fixable in After Effects ≥ 24.3."
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
                  'https://help.plainlyvideos.com/docs/troubleshooting/rendering-issues#capital-letters-not-working',
                )}
                className="flex items-center justify-center"
              >
                <ExternalLinkIcon className="size-4 text-gray-400 group-hover:text-white duration-200" />
              </button>
            </div>
          </Tooltip>
          {aeVersion && aeVersion >= 24.3 ? null : (
            <Tooltip text="Auto-fix for this issue is available in After Effects version 24.3 and later.">
              <div className="flex items-center justify-center cursor-help size-4 group">
                <TriangleAlertIcon className="size-4 text-gray-400 group-hover:text-white duration-200" />
              </div>
            </Tooltip>
          )}
          <Tooltip text="Fix this issue">
            <div className="flex items-center justify-center cursor-pointer size-4 group">
              <button
                type="button"
                onClick={onFixClick.bind(null)}
                className="flex items-center justify-center"
              >
                <WrenchIcon className="size-4 text-gray-400 group-hover:text-white duration-200" />
              </button>
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
