import { AeScriptsApi } from '@src/node/bridge';
import { useNavigate, useNotifications } from '@src/ui/hooks';
import { isEmpty } from '@src/ui/utils';
import classNames from 'classnames';
import { isEqual } from 'lodash-es';
import {
  ChevronDownIcon,
  CircleQuestionMark,
  ExternalLinkIcon,
  TriangleAlertIcon,
  Undo2Icon,
  WrenchIcon,
} from 'lucide-react';
import type { AnyProjectIssue } from 'plainly-types';
import { useContext, useState } from 'react';
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
  issues: AnyProjectIssue[] | undefined;
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
  const [lastUndoName, setLastUndoName] = useState<string | undefined>(
    undefined,
  );

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
    if (isEmpty(issues)) return;

    try {
      let undoName: string | undefined;

      // Collect all AllCaps layer IDs
      const allCapsLayerIds: string[] = [];
      for (const issue of issues) {
        if (isTextLayerIssue(issue)) {
          if (issue.type === ProjectIssueType.AllCaps) {
            allCapsLayerIds.push(issue.layerId);
          }
        }

        if (isCompIssue(issue)) {
          if (issue.type === ProjectIssueType.Unsupported3DRenderer) {
          }
          // Add comp issue fixes here in the future
        }
      }

      // Fix all AllCaps issues in one undo group
      if (allCapsLayerIds.length > 0) {
        undoName = await AeScriptsApi.fixAllCapsIssues(allCapsLayerIds);
      }

      // Store the undo name if we got one
      if (undoName) {
        setLastUndoName(undoName);
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

  const onUndoClick = async () => {
    try {
      await AeScriptsApi.undo();
      setLastUndoName(undefined);

      const vIssues = await AeScriptsApi.validateProject();
      if (!vIssues) {
        setGlobalData((prev) => ({ ...prev, projectIssues: [] }));
      } else {
        const parsedIssues: AnyProjectIssue[] = JSON.parse(vIssues);
        if (!isEqual(parsedIssues, projectIssues)) {
          setGlobalData((prev) => ({ ...prev, projectIssues: parsedIssues }));
        }
      }
      notifyInfo('Undo successful.', 'The last fix has been reverted.');
    } catch (error) {
      console.error('Error undoing fix:', error);
      notifyError(
        'Error undoing fix.',
        'An unexpected error occurred while attempting to undo the fix, please try again.',
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
                className="flex items-center justify-center disabled:cursor-not-allowed disabled:opacity-50"
                disabled={Boolean(warning) || isEmpty(issues)}
              >
                <WrenchIcon className="size-4 text-gray-400 group-hover:text-white duration-200" />
              </button>
            </div>
          </Tooltip>
          {lastUndoName && (
            <Tooltip text={`Undo: ${lastUndoName}`}>
              <div className="flex items-center justify-center cursor-pointer size-4 group">
                <button
                  type="button"
                  onClick={onUndoClick.bind(null)}
                  className="flex items-center justify-center"
                >
                  <Undo2Icon className="size-4 text-blue-400 group-hover:text-blue-300 duration-200" />
                </button>
              </div>
            </Tooltip>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-white/10 flex items-center justify-center rounded-full size-4">
            <p
              className={classNames(
                'leading-tight',
                (issues ?? []).length > 0 ? 'text-red-400' : 'text-green-400',
              )}
            >
              {(issues ?? []).length}
            </p>
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
      {isOpen && !isEmpty(issues) && (
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
