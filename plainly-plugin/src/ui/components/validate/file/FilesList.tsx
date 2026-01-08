import type { FileIssues } from 'plainly-types';
import { useMemo } from 'react';
import { Issue, itFileUns, type ProjectIssueType } from '..';

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
  const filesUnsupported = files?.filter((issue) => issue.type === itFileUns);

  const warnings = useMemo(() => {
    return {
      [itFileUns]: 'No auto-fix is available for this issue.',
    };
  }, []);

  return (
    <Issue
      issueType={itFileUns}
      issues={filesUnsupported}
      label="Unsupported file types"
      description="Some files in the project use unsupported formats that may not render correctly on the Plainly platform."
      externalLink="https://help.plainlyvideos.com/docs/troubleshooting/analysis-issues#unsupported-files-in-a-project"
      onExpandClick={onExpandClick}
      isOpen={currentIssueType === itFileUns}
      warning={warnings[itFileUns]}
      validateProject={validateProject}
    />
  );
}
