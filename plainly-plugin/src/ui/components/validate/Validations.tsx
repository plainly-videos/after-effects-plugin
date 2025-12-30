import { AeScriptsApi } from '@src/node/bridge';
import { useNotifications } from '@src/ui/hooks';
import { ShieldCheckIcon, Undo2Icon, WrenchIcon } from 'lucide-react';
import { useCallback, useContext, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { Alert, Button } from '../common';
import { GlobalContext } from '../context';
import { Description, PageHeading } from '../typography';
import { CompsList, type ProjectIssueType, TextLayersList } from '.';
import { isCompIssue, isTextLayerIssue } from './utils';

export function Validations() {
  const { contextReady, projectIssues, validateProject } =
    useContext(GlobalContext);
  const { notifyInfo, notifyError } = useNotifications();

  const [currentIssueType, setCurrentIssueType] = useState<ProjectIssueType>();
  const [loading, setLoading] = useState(false);
  const [undoNames, setUndoNames] = useState<Record<string, string>>({});

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
        const issues = await validateProject();
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
    [nextFrame, notifyInfo, validateProject],
  );

  const handleFixAll = async () => {
    if (!totalCount || fixInFlightRef.current) {
      return;
    }

    fixInFlightRef.current = true;
    flushSync(() => setLoading(true));
    await nextFrame();

    try {
      const undoName = await AeScriptsApi.fixAllIssues(projectIssues || []);
      if (undoName) {
        flushSync(() =>
          setUndoNames((prev) => ({
            ...prev,
            all: undoName,
          })),
        );
      }

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

  const onUndoClick = async () => {
    try {
      await AeScriptsApi.undo();
      flushSync(() =>
        setUndoNames((prev) => {
          const newUndoNames = { ...prev };
          delete newUndoNames.all;
          return newUndoNames;
        }),
      );

      await validateProject();
      notifyInfo('Undo successful.', 'The last fix has been reverted.');
    } catch (error) {
      console.error('Error undoing fix:', error);
      notifyError(
        'Error undoing fix.',
        'An unexpected error occurred while attempting to undo the fix, please try again.',
      );
    }
  };

  const onExpandClick = useCallback((type: ProjectIssueType) => {
    setCurrentIssueType((prev) => (prev === type ? undefined : type));
  }, []);

  const hasNonAllUndo = Object.keys(undoNames).some((key) => key !== 'all');

  return (
    <div className="space-y-4 w-full text-white">
      <div>
        <PageHeading heading="Project validations" />
        <Description className="mt-1">
          Here you can see potential issues in your project that might cause
          problems on the Plainly platform.
        </Description>
      </div>
      {totalCount === 0 && !hasNonAllUndo ? (
        <Alert title="There are no issues with your project." type="success" />
      ) : totalCount === undefined && !hasNonAllUndo ? (
        <Alert title="Project validation has not been run yet." type="info" />
      ) : (
        <div className="space-y-2 w-full">
          <TextLayersList
            textLayers={textLayers}
            currentIssueType={currentIssueType}
            onExpandClick={onExpandClick}
            undoNames={undoNames}
            setUndoNames={setUndoNames}
            validateProject={validateProject}
          />
          <CompsList
            comps={comps}
            currentIssueType={currentIssueType}
            onExpandClick={onExpandClick}
            undoNames={undoNames}
            setUndoNames={setUndoNames}
            validateProject={validateProject}
          />
        </div>
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
          disabled={(!totalCount && !undoNames.all) || loading || !contextReady}
          onClick={undoNames.all ? onUndoClick : handleFixAll}
          loading={loading}
          icon={undoNames.all ? Undo2Icon : WrenchIcon}
        >
          {undoNames.all ? 'Undo' : 'Fix all'}
        </Button>
      </div>
    </div>
  );
}
