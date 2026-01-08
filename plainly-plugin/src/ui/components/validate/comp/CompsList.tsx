import type { CompIssues } from 'plainly-types';
import { Issue, itUns3DRenderer, type ProjectIssueType } from '..';

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
  const renderers = comps?.filter((issue) => issue.type === itUns3DRenderer);

  return (
    <Issue
      issueType={itUns3DRenderer}
      issues={renderers}
      label="Unsupported 3D Renderer"
      description="Compositions that do not use the Classic 3D renderer are not supported on the Plainly platform."
      externalLink="https://help.plainlyvideos.com/docs/faq/projects-faq#does-plainly-support-cinema-4d-and-advanced-3d-renderers"
      onExpandClick={onExpandClick}
      isOpen={currentIssueType === itUns3DRenderer}
      validateProject={validateProject}
    />
  );
}
