import { AeScriptsApi } from '@src/node/bridge';
import { useNavigate } from '@src/ui/hooks';
import classNames from 'classnames';
import {
  ChevronDownIcon,
  CircleQuestionMark,
  ExternalLinkIcon,
  TriangleAlertIcon,
  WrenchIcon,
} from 'lucide-react';
import type { AnyProjectIssue } from 'plainly-types';
import { useCallback } from 'react';
import { Tooltip } from '../common';
import { ProjectIssueType } from '.';

export function Issue({
  issues,
  label,
  description,
  externalLink,
  isOpen,
  warning,
  onExpandClick,
  onFixClick,
}: {
  issues: AnyProjectIssue[];
  label: string;
  description: string;
  externalLink: string;
  isOpen: boolean;
  warning?: string;
  onExpandClick: () => void;
  onFixClick: () => void;
}) {
  const { handleLinkClick } = useNavigate();

  return (
    <div className="col-span-3 grid grid-cols-3 border border-white/10 text-xs divide-y divide-white/10 rounded-md">
      <button
        type="button"
        onClick={onExpandClick}
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
                onClick={() => handleLinkClick(externalLink)}
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
                disabled={Boolean(warning)}
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
      {isOpen && (
        <div className="divide-y divide-white/10 col-span-3">
          {issues.map((details) => (
            <IssueItem key={details.type} issue={details} />
          ))}
        </div>
      )}
    </div>
  );
}

function IssueItem({ issue }: { issue: AnyProjectIssue }) {
  const onIssueClick = useCallback(
    async (id: string, type: 'comp' | 'layer') => {
      if (type === 'comp') await AeScriptsApi.selectComp(id);
      if (type === 'layer') await AeScriptsApi.selectLayer(id);
    },
    [],
  );

  switch (issue.type) {
    case ProjectIssueType.Unsupported3DRenderer:
      return (
        <IssueItemContent
          key={issue.compId}
          name={issue.compName}
          onClick={() => onIssueClick(issue.compId, 'comp')}
        >
          {` (${issue.renderer})`}
        </IssueItemContent>
      );
    case ProjectIssueType.AllCaps:
      return (
        <IssueItemContent
          key={issue.layerId}
          name={issue.layerName}
          onClick={() => onIssueClick(issue.layerId, 'layer')}
        />
      );
    default:
      return null;
  }
}

function IssueItemContent({
  name,
  onClick,
  children,
}: {
  name: string;
  onClick: () => void;
  children?: React.ReactNode;
}) {
  return (
    <div className="px-3 py-1 w-full">
      <button
        type="button"
        className="text-left underline truncate max-w-full"
        onClick={onClick}
      >
        {name}
        {children}
      </button>
    </div>
  );
}
