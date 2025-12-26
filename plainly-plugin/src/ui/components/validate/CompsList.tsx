import {
  type CompIssues,
  type CompUnsupported3DRendererIssue,
  ProjectIssueType,
} from '@src/ui/types/validation';
import { isEmpty } from '@src/ui/utils';
import { Dimensions } from './comp/Unsupported3DRenderer';

export function CompsList({
  comps,
  isOpen,
  setIsOpen,
}: {
  comps?: CompIssues[];
  isOpen?: ProjectIssueType;
  setIsOpen: React.Dispatch<React.SetStateAction<ProjectIssueType | undefined>>;
}) {
  const dimensions: CompUnsupported3DRendererIssue[] | undefined =
    comps?.filter(
      (issue) => issue.type === ProjectIssueType.Unsupported3DRenderer,
    );

  return (
    <>
      {!isEmpty(dimensions) && (
        <Dimensions
          dimensions={dimensions}
          isOpen={isOpen}
          setIsOpen={setIsOpen}
        />
      )}
    </>
  );
}
