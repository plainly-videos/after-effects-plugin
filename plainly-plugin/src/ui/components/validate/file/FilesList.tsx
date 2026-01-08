import type { FileIssues } from 'plainly-types';
import { useMemo } from 'react';
import { Issue, ProjectIssueType } from '..';

export function FilesList({
  files,
  currentIssueType,
  onExpandClick,
  validateProject,
}: {
  files?: FileIssues[];
  currentIssueType?: ProjectIssueType;
  onExpandClick: (issueType: ProjectIssueType) => void;
  validateProject: () => Promise<string | undefined>;
}) {
  const filesUnsupported = files?.filter(
    (issue) => issue.type === ProjectIssueType.FileUnsupported,
  );

  const warnings = useMemo(() => {
    return {
      [ProjectIssueType.FileUnsupported]:
        'No auto-fix is available for this issue.',
    };
  }, []);

  return (
    <Issue
      issueType={ProjectIssueType.FileUnsupported}
      issues={filesUnsupported}
      label="Unsupported file types"
      description="Some files in the project use unsupported formats that may not render correctly on the Plainly platform."
      externalLink="https://help.plainlyvideos.com/docs/troubleshooting/analysis-issues#unsupported-files-in-a-project"
      onExpandClick={onExpandClick}
      isOpen={currentIssueType === ProjectIssueType.FileUnsupported}
      warning={warnings[ProjectIssueType.FileUnsupported]}
      validateProject={validateProject}
    />
  );
}
