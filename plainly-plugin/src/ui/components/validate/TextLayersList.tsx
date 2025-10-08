import {
  ProjectIssueType,
  type TextAllCapsEnabledIssue,
  type TextLayerIssues,
} from '@src/ui/types/validation';
import { isEmpty } from '@src/ui/utils';
import { AllCaps } from './text/AllCaps';

export function TextLayersList({
  textLayers,
  isOpen,
  setIsOpen,
}: {
  textLayers?: TextLayerIssues[];
  isOpen?: ProjectIssueType;
  setIsOpen: React.Dispatch<React.SetStateAction<ProjectIssueType | undefined>>;
}) {
  const allCaps: TextAllCapsEnabledIssue[] | undefined = textLayers?.filter(
    (issue) => issue.type === ProjectIssueType.AllCaps,
  );

  return (
    <>
      {!isEmpty(allCaps) && (
        <AllCaps allCaps={allCaps} isOpen={isOpen} setIsOpen={setIsOpen} />
      )}
    </>
  );
}
