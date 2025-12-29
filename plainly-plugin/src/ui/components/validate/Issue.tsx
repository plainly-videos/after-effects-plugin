import { AeScriptsApi } from '@src/node/bridge';
import { useNavigate, useNotifications } from '@src/ui/hooks';
import classNames from 'classnames';
import { isEqual } from 'lodash-es';
import {
  ChevronDownIcon,
  CircleQuestionMark,
  ExternalLinkIcon,
  TriangleAlertIcon,
  WrenchIcon,
} from 'lucide-react';
import type { AnyProjectIssue } from 'plainly-types';
import { useContext } from 'react';
import { Tooltip } from '../common';
import { GlobalContext } from '../context';
import { ProjectIssueType } from '.';
import { isCompIssue, isTextLayerIssue } from './utils';

export function Issue({
  issueType,
  issues,
  label,
  description,
  externalLink,
  onExpandClick,
  isOpen,
  warning,
}: {
  issueType: ProjectIssueType;
  issues: AnyProjectIssue[];
  label: string;
  description: string;
  externalLink: string;
  onExpandClick: (issueType: ProjectIssueType) => void;
  isOpen: boolean;
  warning?: string;
}) {
  const { handleLinkClick } = useNavigate();
  const { notifyError, notifyInfo } = useNotifications();
  const { projectIssues, setGlobalData } = useContext(GlobalContext);

  const onIssueClick = async (id: string, type: 'comp' | 'layer') => {
    if (type === 'comp') {
      await AeScriptsApi.selectComp(id);
    }

    if (type === 'layer') {
      await AeScriptsApi.unselectAllLayers();
      await AeScriptsApi.selectLayer(id);
    }
  };

  const onFixClick = async () => {
    try {
      for (const issue of issues) {
        if (isTextLayerIssue(issue)) {
          if (issue.type === ProjectIssueType.AllCaps) {
            await AeScriptsApi.fixAllCapsIssue(issue.layerId);
          }
        }

        if (isCompIssue(issue)) {
          if (issue.type === ProjectIssueType.Unsupported3DRenderer) {
          }
          // Add comp issue fixes here in the future
        }
      }

      const vIssues = await AeScriptsApi.validateProject();
      if (!vIssues) {
        setGlobalData((prev) => ({ ...prev, projectIssues: [] }));
      } else {
        const parsedIssues: AnyProjectIssue[] = JSON.parse(vIssues);
        if (!isEqual(parsedIssues, projectIssues)) {
          setGlobalData((prev) => ({ ...prev, projectIssues: parsedIssues }));
        }
      }
      notifyInfo(
        'Attempted to fix issue.',
        'Please review the project again. Some issues may require manual intervention.',
      );
    } catch (error) {
      console.error('Error fixing issue:', error);
      notifyError(
        'Error fixing issue.',
        'An unexpected error occurred while attempting to fix the issues, please try again.',
      );
    }
  };

  return (
    <div className="col-span-3 grid grid-cols-3 border border-white/10 text-xs divide-y divide-white/10 rounded-md">
      <button
        type="button"
        onClick={() => onExpandClick(issueType)}
        className="col-span-3 font-medium flex justify-between items-center px-3 py-2 bg-[rgb(43,43,43)]"
      >
        <div className="flex items-center gap-2">
          <p>{label}</p>
          <Tooltip
            text={description}
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
                onClick={handleLinkClick.bind(null, externalLink)}
                className="flex items-center justify-center"
              >
                <ExternalLinkIcon className="size-4 text-gray-400 group-hover:text-white duration-200" />
              </button>
            </div>
          </Tooltip>
          {warning && (
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
            <p className="leading-tight text-red-400">{issues.length}</p>
          </div>
          <div className="size-4 text-gray-400 hover:text-white hover:bg-[rgb(29,29,30)] rounded-full cursor-pointer flex items-center justify-center">
            <ChevronDownIcon
              className={classNames('size-4 duration-200', {
                'rotate-180': isOpen,
              })}
            />
          </div>
        </div>
      </button>
      {isOpen && (
        <div className="divide-y divide-white/10 col-span-3">
          {issues.map((details) => (
            <>
              {isCompIssue(details) ? (
                <div key={details.compId} className="px-3 py-1 w-full">
                  <button
                    type="button"
                    className="text-left underline truncate max-w-full"
                    onClick={onIssueClick.bind(null, details.compId, 'comp')}
                  >
                    {details.compName}
                  </button>
                </div>
              ) : (
                <div key={details.layerId} className="px-3 py-1 w-full">
                  <button
                    type="button"
                    className="text-left underline truncate max-w-full"
                    onClick={onIssueClick.bind(null, details.layerId, 'layer')}
                  >
                    {details.layerName}
                  </button>
                </div>
              )}
            </>
          ))}
        </div>
      )}
    </div>
  );
}
