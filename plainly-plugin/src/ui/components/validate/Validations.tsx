import { evalScriptAsync } from '@src/node/utils';
import type { ProjectIssueType } from '@src/ui/types/validation';
import { useContext, useState } from 'react';
import { Alert, Button } from '../common';
import { GlobalContext } from '../context';
import { Description, PageHeading } from '../typography';
import { TextLayersList } from './TextLayersList';

export function Validations() {
  const { projectIssues } = useContext(GlobalContext) || {};
  const [isOpen, setIsOpen] = useState<ProjectIssueType>();
  const [loading, setLoading] = useState(false);

  const textLayers = projectIssues?.filter((issue) => issue.text === true);
  const totalCount = projectIssues?.length ?? 0;

  const handleFixAll = async () => {
    if (totalCount === 0) return;

    setLoading(true);
    await evalScriptAsync(`fixAllIssues(${JSON.stringify(projectIssues)})`);
    setLoading(false);
  };

  return (
    <div className="space-y-4 w-full text-white">
      <div>
        <PageHeading heading="Project validations" />
        <Description className="mt-1">
          Here you can see potential issues with your project that might cause
          problems when used on the Plainly platform.
        </Description>
      </div>
      {totalCount === 0 ? (
        <Alert title="There are no issues with your layers." type="success" />
      ) : (
        <TextLayersList
          textLayers={textLayers}
          isOpen={isOpen}
          setIsOpen={setIsOpen}
        />
      )}
      <Button
        className="float-right"
        disabled={totalCount === 0 || loading}
        onClick={handleFixAll}
        loading={loading}
      >
        Fix all
      </Button>
    </div>
  );
}
