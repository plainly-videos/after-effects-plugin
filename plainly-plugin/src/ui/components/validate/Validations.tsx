import { AeScriptsApi } from '@src/node/bridge';
import { useNotifications } from '@src/ui/hooks';
import type {
  AnyProjectIssue,
  ProjectIssueType,
} from '@src/ui/types/validation';
import { ShieldCheckIcon, WrenchIcon } from 'lucide-react';
import { useContext, useState } from 'react';
import { Alert, Button } from '../common';
import { GlobalContext } from '../context';
import { Description, PageHeading } from '../typography';
import { TextLayersList } from './TextLayersList';

export function Validations() {
  const { contextReady, projectIssues, setGlobalData } =
    useContext(GlobalContext);
  const { notifyInfo } = useNotifications();

  const [isOpen, setIsOpen] = useState<ProjectIssueType>();
  const [loading, setLoading] = useState(false);

  const textLayers = projectIssues?.filter((issue) => issue.text === true);
  const totalCount = projectIssues?.length ?? 0;

  const handleTestForIssues = async (notify = true) => {
    setLoading(true);
    const issues = await AeScriptsApi.validateProject();

    if (!issues) {
      setGlobalData((prev) => ({ ...prev, projectIssues: [] }));
    } else {
      const parsedIssues: AnyProjectIssue[] = JSON.parse(issues);
      if (JSON.stringify(parsedIssues) !== JSON.stringify(projectIssues)) {
        setGlobalData((prev) => ({ ...prev, projectIssues: parsedIssues }));
      }
    }
    setLoading(false);
    if (notify) {
      notifyInfo(
        'Project validation completed.',
        !issues
          ? 'No issues found.'
          : 'Please review the issues and consider fixing them, some may require manual intervention.',
      );
    }
  };

  const handleFixAll = async () => {
    if (totalCount === 0) return;

    setLoading(true);
    await AeScriptsApi.fixAllIssues(projectIssues || []);
    await handleTestForIssues(false);
    setLoading(false);
    notifyInfo(
      'Attempted to fix all issues.',
      'Please review the project again. Some issues may require manual intervention.',
    );
  };

  return (
    <div className="space-y-4 w-full text-white">
      <div>
        <PageHeading heading="Project validations" />
        <Description className="mt-1">
          Here you can see potential issues in your project that might cause problems on the Plainly platform.
        </Description>
      </div>
      {totalCount === 0 ? (
        <Alert title="There are no issues with your project." type="success" />
      ) : (
        <TextLayersList
          textLayers={textLayers}
          isOpen={isOpen}
          setIsOpen={setIsOpen}
        />
      )}
      <div className="flex items-center gap-2 float-right">
        <Button
          secondary
          onClick={handleTestForIssues.bind(null, true)}
          loading={loading}
          disabled={loading || !contextReady}
          icon={ShieldCheckIcon}
        >
          Test for issues
        </Button>
        <Button
          disabled={totalCount === 0 || loading || !contextReady}
          onClick={handleFixAll}
          loading={loading}
          icon={WrenchIcon}
        >
          Fix all
        </Button>
      </div>
    </div>
  );
}
