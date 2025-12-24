import {
  type CompDimensionsIssue,
  type CompIssues,
  ProjectIssueType,
} from '@src/ui/types/validation';
import { isEmpty } from '@src/ui/utils';
import { Dimensions } from './comp/Dimensions';

export function CompsList({
  comps,
  isOpen,
  setIsOpen,
}: {
  comps?: CompIssues[];
  isOpen?: ProjectIssueType;
  setIsOpen: React.Dispatch<React.SetStateAction<ProjectIssueType | undefined>>;
}) {
  const dimensions: CompDimensionsIssue[] | undefined = comps?.filter(
    (issue) => issue.type === ProjectIssueType.Dimensions,
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
