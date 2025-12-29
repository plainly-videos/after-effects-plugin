import type { CompIssues } from 'plainly-types';
import { useCallback } from 'react';
import { Issue, ProjectIssueType } from '..';

export function CompsList({
  comps,
  isOpen,
  setIsOpen,
}: {
  comps?: CompIssues[];
  isOpen?: ProjectIssueType;
  setIsOpen: React.Dispatch<React.SetStateAction<ProjectIssueType | undefined>>;
}) {
  const renderers = comps?.filter(
    (issue) => issue.type === ProjectIssueType.Unsupported3DRenderer,
  );

  const onExpandClick = useCallback(
    (issueType: ProjectIssueType) => {
      setIsOpen((prev) => (prev === issueType ? undefined : issueType));
    },
    [setIsOpen],
  );

  return (
    <Issue
      issueType={ProjectIssueType.Unsupported3DRenderer}
      issues={renderers}
      label="Unsupported 3D Renderer"
      description="Compositions that do not use the Classic 3D renderer are not supported on the Plainly platform."
      externalLink="https://help.plainlyvideos.com/docs/faq/projects-faq#is-it-possible-that-cinema-4d-rendered-engine-in-after-effects-doesnt-work-on-the-plainly-platform"
      onExpandClick={onExpandClick}
      isOpen={isOpen === ProjectIssueType.Unsupported3DRenderer}
    />
  );
}
