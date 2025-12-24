import { AeScriptsApi } from '@src/node/bridge';
import { useNotifications } from '@src/ui/hooks';
import type {
  AnyProjectIssue,
  ProjectIssueType,
} from '@src/ui/types/validation';
import { isEqual } from 'lodash-es';
import { ShieldCheckIcon, WrenchIcon } from 'lucide-react';
import { useCallback, useContext, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { Alert, Button } from '../common';
import { GlobalContext } from '../context';
import { Description, PageHeading } from '../typography';
import { CompsList } from './CompsList';
import { TextLayersList } from './TextLayersList';
import { isCompIssue, isTextLayerIssue } from './utils';

export function Validations() {
  const { contextReady, projectIssues, setGlobalData } =
    useContext(GlobalContext);
  const { notifyInfo } = useNotifications();

  const [isOpen, setIsOpen] = useState<ProjectIssueType>();
  const [loading, setLoading] = useState(false);

  // Prevent re-entrancy while expensive operations are running
  const testInFlightRef = useRef(false);
  const fixInFlightRef = useRef(false);

  // Let the UI paint (e.g., disabled state) before starting heavy work
  const nextFrame = useCallback(
    () =>
      new Promise<void>((resolve) => requestAnimationFrame(() => resolve())),
    [],
  );

  const textLayers = projectIssues?.filter(isTextLayerIssue);
  const comps = projectIssues?.filter(isCompIssue);
  const totalCount = projectIssues?.length ?? undefined;

  const handleTestForIssues = useCallback(
    async (notify = true) => {
      if (testInFlightRef.current) {
        return;
      }

      testInFlightRef.current = true;
      flushSync(() => setLoading(true));
      await nextFrame();

      try {
        const issues = await AeScriptsApi.validateProject();
        if (!issues) {
          setGlobalData((prev) => ({ ...prev, projectIssues: [] }));
        } else {
          const parsedIssues: AnyProjectIssue[] = JSON.parse(issues);
          if (!isEqual(parsedIssues, projectIssues)) {
            setGlobalData((prev) => ({
              ...prev,
              projectIssues: parsedIssues,
            }));
          }
        }
        if (notify) {
          notifyInfo(
            'Project validation completed.',
            !issues
              ? 'No issues found.'
              : 'Please review the issues and consider fixing them, some may require manual intervention.',
          );
        }
      } finally {
        setLoading(false);
        testInFlightRef.current = false;
      }
    },
    [nextFrame, notifyInfo, projectIssues, setGlobalData],
  );

  const handleFixAll = async () => {
    if (!totalCount || fixInFlightRef.current) {
      return;
    }

    fixInFlightRef.current = true;
    flushSync(() => setLoading(true));
    await nextFrame();

    try {
      await AeScriptsApi.fixAllIssues(projectIssues || []);
      await handleTestForIssues(false);
      notifyInfo(
        'Attempted to fix all issues.',
        'Please review the project again. Some issues may require manual intervention.',
      );
    } finally {
      setLoading(false);
      fixInFlightRef.current = false;
    }
  };

  return (
    <div className="space-y-4 w-full text-white">
      <div>
        <PageHeading heading="Project validations" />
        <Description className="mt-1">
          Here you can see potential issues in your project that might cause
          problems on the Plainly platform.
        </Description>
      </div>
      {totalCount === 0 ? (
        <Alert title="There are no issues with your project." type="success" />
      ) : totalCount === undefined ? (
        <Alert title="Project validation has not been run yet." type="info" />
      ) : (
        <>
          <TextLayersList
            textLayers={textLayers}
            isOpen={isOpen}
            setIsOpen={setIsOpen}
          />
          <CompsList comps={comps} isOpen={isOpen} setIsOpen={setIsOpen} />
        </>
      )}
      <div className="flex items-center gap-2 float-right">
        <Button
          secondary
          onClick={() => handleTestForIssues(false)}
          loading={loading}
          disabled={loading || !contextReady}
          icon={ShieldCheckIcon}
        >
          Test for issues
        </Button>
        <Button
          disabled={!totalCount || loading || !contextReady}
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
