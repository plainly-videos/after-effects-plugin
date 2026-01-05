import { AeScriptsApi } from '@src/node/bridge';
import { useNavigate, useNotifications } from '@src/ui/hooks';
import { isEmpty } from '@src/ui/utils';
import classNames from 'classnames';
import {
  ChevronDownIcon,
  CircleQuestionMark,
  ExternalLinkIcon,
  TriangleAlertIcon,
  WrenchIcon,
} from 'lucide-react';
import type { AnyProjectIssue } from 'plainly-types';
import { useState } from 'react';
import { Tooltip } from '../common';
import { ConfirmationModal, ProjectIssueType } from '.';
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
  validateProject,
}: {
  issueType: ProjectIssueType;
  issues: AnyProjectIssue[] | undefined;
  label: string;
  description: string;
  externalLink: string;
  onExpandClick: (issueType: ProjectIssueType) => void;
  isOpen: boolean;
  warning?: string;
  validateProject: () => Promise<string | undefined>;
}) {
  const { handleLinkClick } = useNavigate();
  const { notifyError, notifyInfo } = useNotifications();
  const [showRendererConfirmation, setShowRendererConfirmation] =
    useState(false);

  const onIssueClick = async (id: string, type: 'comp' | 'layer') => {
    if (type === 'comp') await AeScriptsApi.selectComp(id);
    if (type === 'layer') await AeScriptsApi.selectLayer(id);
  };

  const handleFix = async () => {
    if (isEmpty(issues)) return;

    try {
      // Collect all AllCaps layer IDs
      const allCapsLayerIds: string[] = [];
      const unsupported3DRendererCompIds: string[] = [];
      for (const issue of issues) {
        if (isTextLayerIssue(issue)) {
          if (issue.type === ProjectIssueType.AllCaps) {
            allCapsLayerIds.push(issue.layerId);
          }
          // Future text layer issues can be handled here
        }

        if (isCompIssue(issue)) {
          if (issue.type === ProjectIssueType.Unsupported3DRenderer) {
            unsupported3DRendererCompIds.push(issue.compId);
          }
          // Future comp issues can be handled here
        }
      }

      // Fix all AllCaps issues in one undo group
      if (allCapsLayerIds.length > 0) {
        await AeScriptsApi.fixAllCapsIssues(allCapsLayerIds);
      }

      // Fix all Unsupported3DRenderer issues in one undo group
      if (unsupported3DRendererCompIds.length > 0) {
        await AeScriptsApi.fixUnsupported3DRendererIssues(
          unsupported3DRendererCompIds,
        );
      }

      await validateProject();
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

  const onFixClick = async () => {
    if (issueType === ProjectIssueType.Unsupported3DRenderer) {
      setShowRendererConfirmation(true);
      return;
    }

    await handleFix();
    onExpandClick(issueType);
  };

  // Don't render if there are no issues
  if (isEmpty(issues)) {
    return null;
  }

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
                onClick={onFixClick}
                className="flex items-center justify-center disabled:cursor-not-allowed disabled:opacity-50"
                disabled={Boolean(warning) || isEmpty(issues)}
              >
                <WrenchIcon className="size-4 text-gray-400 group-hover:text-white duration-200" />
              </button>
            </div>
          </Tooltip>
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
          <div className="cursor-pointer flex items-center justify-center group">
            <ChevronDownIcon
              className={classNames(
                'size-4 text-gray-400 group-hover:text-white duration-200',
                {
                  'rotate-180': isOpen,
                },
              )}
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
                    {details.type === ProjectIssueType.Unsupported3DRenderer &&
                      ` (${details.renderer})`}
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
      {issueType === ProjectIssueType.Unsupported3DRenderer && (
        <ConfirmationModal
          title="Fix unsupported 3D renderer"
          description={`This will switch ${(issues ?? []).length} ${(issues ?? []).length === 1 ? 'composition' : 'compositions'} to Classic 3D. Certain 3D effects may look different or stop working.`}
          buttonText="Switch to Classic 3D"
          open={showRendererConfirmation}
          setOpen={setShowRendererConfirmation}
          onConfirm={() => void handleFix()}
          readMoreLink="https://help.plainlyvideos.com/docs/faq/projects-faq#does-plainly-support-cinema-4d-and-advanced-3d-renderers"
        />
      )}
    </div>
  );
}
