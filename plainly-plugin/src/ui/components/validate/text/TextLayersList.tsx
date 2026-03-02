import { isEmpty } from '@src/ui/utils';
import type { TextLayerIssues } from 'plainly-types';
import { AllCapsIssueView, ProjectIssueType } from '..';

export function TextLayersList({
  textLayers,
  currentIssueType,
  onExpandClick,
  validateProject,
}: {
  textLayers?: TextLayerIssues[];
  currentIssueType?: ProjectIssueType;
  onExpandClick: (issueType: ProjectIssueType) => void;
  validateProject: () => Promise<string | undefined>;
}) {
  const allCaps = textLayers?.filter(
    (issue) => issue.type === ProjectIssueType.AllCaps,
  );

  return (
    <>
      {!isEmpty(allCaps) && (
        <AllCapsIssueView
          issues={allCaps}
          isOpen={currentIssueType === ProjectIssueType.AllCaps}
          validateProject={validateProject}
          onExpandClick={() => onExpandClick(ProjectIssueType.AllCaps)}
        />
      )}
    </>
  );
}
