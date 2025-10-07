import {
  ProjectIssueType,
  type TextAllCapsEnabledIssue,
  type TextLayerIssues,
} from '@src/ui/types/validation';
import { isEmpty } from '@src/ui/utils';
import { useState } from 'react';
import { Alert } from '../common';
import { AllCaps } from './text/AllCaps';

export function TextLayersList({
  textLayers,
}: {
  textLayers?: TextLayerIssues[];
}) {
  const [isOpen, setIsOpen] = useState<ProjectIssueType | undefined>();

  const allCaps: TextAllCapsEnabledIssue[] | undefined = textLayers?.filter(
    (issue) => issue.type === ProjectIssueType.AllCaps,
  );

  const totalCount = textLayers?.length ?? 0;

  return (
    <>
      {totalCount === 0 ? (
        <Alert title="There are no issues with your layers." type="success" />
      ) : (
        <div className="grid grid-cols-3 border border-white/10 text-xs divide-y divide-white/10 rounded-md">
          {!isEmpty(allCaps) && (
            <AllCaps allCaps={allCaps} isOpen={isOpen} setIsOpen={setIsOpen} />
          )}
        </div>
      )}
    </>
  );
}
