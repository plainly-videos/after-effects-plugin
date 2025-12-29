import { useProjectData } from '@src/ui/hooks';
import { isEmpty } from '@src/ui/utils';
import type { TextLayerIssues } from 'plainly-types';
import { useCallback, useMemo } from 'react';
import { Issue, ProjectIssueType } from '..';

export function TextLayersList({
  textLayers,
  isOpen,
  setIsOpen,
}: {
  textLayers?: TextLayerIssues[];
  isOpen?: ProjectIssueType;
  setIsOpen: React.Dispatch<React.SetStateAction<ProjectIssueType | undefined>>;
}) {
  const [, , , aeVersion] = useProjectData();

  const allCaps = textLayers?.filter(
    (issue) => issue.type === ProjectIssueType.AllCaps,
  );

  const onExpandClick = useCallback(
    (issueType: ProjectIssueType) => {
      setIsOpen((prev) => (prev === issueType ? undefined : issueType));
    },
    [setIsOpen],
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
    <>
      {!isEmpty(allCaps) && (
        <Issue
          issueType={ProjectIssueType.AllCaps}
          issues={allCaps}
          label="All Caps enabled"
          description="Using ALL CAPS text may result in poor font rendering. Auto-fixable in After Effects ≥ 24.3."
          externalLink="https://help.plainlyvideos.com/docs/troubleshooting/rendering-issues#capital-letters-not-working"
          onExpandClick={onExpandClick}
          isOpen={isOpen === ProjectIssueType.AllCaps}
          warning={warnings[ProjectIssueType.AllCaps]}
        />
      )}
    </>
  );
}
