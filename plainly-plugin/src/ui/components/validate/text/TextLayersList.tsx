import { useProjectData } from '@src/ui/hooks';
import type { TextLayerIssues } from 'plainly-types';
import { useMemo } from 'react';
import { Issue, ProjectIssueType } from '..';

export function TextLayersList({
  textLayers,
  currentIssueType,
  onExpandClick,
  undoNames,
  setUndoNames,
  validateProject,
}: {
  textLayers?: TextLayerIssues[];
  currentIssueType?: ProjectIssueType;
  onExpandClick: (issueType: ProjectIssueType) => void;
  undoNames: Record<string, string>;
  setUndoNames: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  validateProject: () => Promise<string | undefined>;
}) {
  const [, , , aeVersion] = useProjectData();

  const allCaps = textLayers?.filter(
    (issue) => issue.type === ProjectIssueType.AllCaps,
  );

  const warnings = useMemo(() => {
    return {
      [ProjectIssueType.AllCaps]:
        aeVersion && aeVersion < 24.3
          ? 'Auto-fix for this issue is available in After Effects version 24.3 and later.'
          : undefined,
    };
  }, [aeVersion]);

  return (
    <Issue
      issueType={ProjectIssueType.AllCaps}
      issues={allCaps}
      label="All Caps enabled"
      description="Using ALL CAPS text may result in poor font rendering. Auto-fixable in After Effects ≥ 24.3."
      externalLink="https://help.plainlyvideos.com/docs/troubleshooting/rendering-issues#capital-letters-not-working"
      onExpandClick={onExpandClick}
      isOpen={currentIssueType === ProjectIssueType.AllCaps}
      warning={warnings[ProjectIssueType.AllCaps]}
      undo={undoNames[ProjectIssueType.AllCaps]}
      setUndoNames={setUndoNames}
      validateProject={validateProject}
    />
  );
}
