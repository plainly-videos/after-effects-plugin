import { AeScriptsApi } from '@src/node/bridge';
import { useNotifications } from '@src/ui/hooks';
import type { AnyProjectIssue, TextAllCapsEnabledIssue } from 'plainly-types';
import { useContext, useMemo } from 'react';
import semver from 'semver';
import { GlobalContext } from '../../context';
import { Issue } from '../Issue';

export function AllCapsIssueView({
  issues,
  isOpen,
  validateProject,
  onExpandClick,
}: {
  issues: TextAllCapsEnabledIssue[];
  isOpen: boolean;
  validateProject: () => Promise<AnyProjectIssue[]>;
  onExpandClick: () => void;
}) {
  const { aeVersion } = useContext(GlobalContext);
  const { notifyError, notifyInfo } = useNotifications();

  const handleFix = async () => {
    try {
      const allCapsLayerIds: string[] = [];
      for (const issue of issues) {
        allCapsLayerIds.push(issue.layerId);
      }

      await AeScriptsApi.fixAllCapsIssues(allCapsLayerIds);
      await validateProject();
      notifyInfo(
        'Attempted to fix issue.',
        'Please review the project again. Some issues may require manual intervention.',
      );
    } catch (error) {
      console.error('Error fixing issue:', error);
      notifyError(
        'Error fixing issue.',
        'An unexpected error occurred while attempting to fix the all caps issues, please try again.',
      );
    }
  };

  const warning = useMemo(() => {
    if (!aeVersion) return undefined;

    return semver.lt(aeVersion, '24.3.0')
      ? 'Auto-fix for this issue is available in After Effects version 24.3 and later.'
      : undefined;
  }, [aeVersion]);

  return (
    <Issue
      issues={issues}
      label="All Caps enabled"
      description="Using ALL CAPS text may result in poor font rendering. Auto-fixable in After Effects ≥ 24.3."
      externalLink="https://help.plainlyvideos.com/docs/troubleshooting/rendering-issues#capital-letters-not-working"
      isOpen={isOpen}
      warning={warning}
      onExpandClick={onExpandClick}
      onFixClick={handleFix}
    />
  );
}
