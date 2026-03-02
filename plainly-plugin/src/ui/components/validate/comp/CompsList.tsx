import { isEmpty } from '@src/ui/utils';
import type { CompIssues } from 'plainly-types';
import { ProjectIssueType, UnsupportedRendererIssueView } from '..';

export function CompsList({
  comps,
  currentIssueType,
  onExpandClick,
  validateProject,
}: {
  comps?: CompIssues[];
  currentIssueType?: ProjectIssueType;
  onExpandClick: (issueType: ProjectIssueType) => void;
  validateProject: () => Promise<string | undefined>;
}) {
  const renderers = comps?.filter(
    (issue) => issue.type === ProjectIssueType.Unsupported3DRenderer,
  );

  return (
    <>
      {!isEmpty(renderers) && (
        <UnsupportedRendererIssueView
          issues={renderers}
          isOpen={currentIssueType === ProjectIssueType.Unsupported3DRenderer}
          validateProject={validateProject}
          onExpandClick={() =>
            onExpandClick(ProjectIssueType.Unsupported3DRenderer)
          }
        />
      )}
    </>
  );
}
