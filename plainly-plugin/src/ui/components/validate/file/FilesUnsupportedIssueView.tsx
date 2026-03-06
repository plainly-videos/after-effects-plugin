import type { FileIssues } from 'plainly-types';
import { Issue } from '../Issue';

export const FilesUnsupportedIssueView = ({
  issues,
  isOpen,
  onExpandClick,
}: {
  issues: FileIssues[];
  isOpen: boolean;
  onExpandClick: () => void;
}) => {
  const warning =
    'No auto-fix is available. If your project uses AI/PSD files imported as layers, package it manually.';

  return (
    <Issue
      issues={issues}
      label="AI/PSD layered import risk"
      description="AI and PSD files are supported, but imports created as layered AI/PSD can break during plugin relinking. If your project uses those layered imports, package it manually."
      externalLink="https://help.plainlyvideos.com/docs/troubleshooting/analysis-issues#unsupported-files-in-a-project"
      isOpen={isOpen}
      warning={warning}
      onExpandClick={onExpandClick}
      onFixClick={() => {}}
    />
  );
};
