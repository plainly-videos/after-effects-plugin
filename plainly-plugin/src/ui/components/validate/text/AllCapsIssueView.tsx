import type { TextAllCapsEnabledIssue } from 'plainly-types';
import { Issue } from '../Issue';

export function AllCapsIssueView({
  issues,
  isOpen,
  onExpandClick,
}: {
  issues: TextAllCapsEnabledIssue[];
  isOpen: boolean;
  onExpandClick: () => void;
}) {
  const warning =
    'Turn of ALL CAPS in text layers, and use uppercase letters manually instead. Read more about this issue in our documentation.';

  return (
    <Issue
      issues={issues}
      label="All Caps enabled"
      description="Using ALL CAPS text may result in poor font rendering."
      externalLink="https://help.plainlyvideos.com/docs/troubleshooting/rendering-issues#capital-letters-not-working"
      isOpen={isOpen}
      warning={warning}
      onExpandClick={onExpandClick}
      onFixClick={() => {}}
    />
  );
}
