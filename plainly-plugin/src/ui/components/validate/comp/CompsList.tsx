import type { CompIssues } from 'plainly-types';
import { Issue, ProjectIssueType } from '..';

export function CompsList({
  comps,
  currentIssueType,
  onExpandClick,
  undoNames,
  setUndoNames,
  validateProject,
}: {
  comps?: CompIssues[];
  currentIssueType?: ProjectIssueType;
  onExpandClick: (issueType: ProjectIssueType) => void;
  undoNames: Record<string, string>;
  setUndoNames: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  validateProject: () => Promise<string | undefined>;
}) {
  const renderers = comps?.filter(
    (issue) => issue.type === ProjectIssueType.Unsupported3DRenderer,
  );

  return (
    <Issue
      issueType={ProjectIssueType.Unsupported3DRenderer}
      issues={renderers}
      label="Unsupported 3D Renderer"
      description="Compositions that do not use the Classic 3D renderer are not supported on the Plainly platform."
      externalLink="https://help.plainlyvideos.com/docs/faq/projects-faq#is-it-possible-that-cinema-4d-rendered-engine-in-after-effects-doesnt-work-on-the-plainly-platform"
      onExpandClick={onExpandClick}
      isOpen={currentIssueType === ProjectIssueType.Unsupported3DRenderer}
      undo={undoNames[ProjectIssueType.Unsupported3DRenderer]}
      setUndoNames={setUndoNames}
      validateProject={validateProject}
    />
  );
}
