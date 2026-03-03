import { AeScriptsApi } from '@src/node/bridge';
import { useNotifications } from '@src/ui/hooks';
import type { CompUnsupported3DRendererIssue } from 'plainly-types';
import { useState } from 'react';
import { ConfirmationModal } from '../ConfirmationModal';
import { Issue } from '../Issue';

export function UnsupportedRendererIssueView({
  issues,
  isOpen,
  onExpandClick,
  validateProject,
}: {
  issues: CompUnsupported3DRendererIssue[];
  isOpen: boolean;
  onExpandClick: () => void;
  validateProject: () => Promise<string | undefined>;
}) {
  const { notifyError, notifyInfo } = useNotifications();

  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleFix = async () => {
    try {
      const compIds: string[] = [];
      for (const issue of issues) {
        compIds.push(issue.compId);
      }

      await AeScriptsApi.fixUnsupported3DRendererIssues(compIds);
      await validateProject();
      notifyInfo(
        'Attempted to fix issue.',
        'Please review the project again. Some issues may require manual intervention.',
      );
    } catch (error) {
      console.error('Error fixing issue:', error);
      notifyError(
        'Error fixing issue.',
        'An unexpected error occurred while attempting to fix the unsupported 3D renderer issues, please try again.',
      );
    }
  };

  return (
    <>
      <Issue
        issues={issues}
        label="Unsupported 3D Renderer"
        description="Compositions that do not use the Classic 3D renderer are not supported on the Plainly platform."
        externalLink="https://help.plainlyvideos.com/docs/faq/projects-faq#does-plainly-support-cinema-4d-and-advanced-3d-renderers"
        isOpen={isOpen}
        onExpandClick={onExpandClick}
        onFixClick={() => setShowConfirmation(true)}
      />
      {showConfirmation && (
        <ConfirmationModal
          title="Fix unsupported 3D renderer"
          description={`This will change ${issues.length} composition(s) to Classic 3D. Certain 3D effects may look different or stop working.`}
          buttonText="Switch to Classic 3D"
          open={showConfirmation}
          setOpen={setShowConfirmation}
          onConfirm={() => void handleFix()}
          readMoreLink="https://help.plainlyvideos.com/docs/faq/projects-faq#does-plainly-support-cinema-4d-and-advanced-3d-renderers"
        />
      )}
    </>
  );
}
