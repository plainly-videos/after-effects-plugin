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
  const warning = 'No auto-fix is available for this issue.';

  return (
    <Issue
      issues={issues}
      label="Unsupported file types"
      description="Some files in the project use unsupported formats that may not render correctly on the Plainly platform."
      externalLink="https://help.plainlyvideos.com/docs/troubleshooting/analysis-issues#unsupported-files-in-a-project"
      isOpen={isOpen}
      warning={warning}
      onExpandClick={onExpandClick}
      onFixClick={() => {}}
    />
  );
};
