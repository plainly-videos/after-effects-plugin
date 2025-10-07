import { evalScriptAsync } from '@src/node/utils';
import type { AnyProjectIssue } from '@src/ui/types/validation';
import { createContext, useEffect, useState } from 'react';
import { useNotifications } from '../../hooks';

interface GlobalContextProps {
  documentId?: string;
  plainlyProject?: {
    id: string;
    revisionCount: number;
  };
  projectIssues?: AnyProjectIssue[];
}

export const GlobalContext = createContext<GlobalContextProps | undefined>(
  {} as GlobalContextProps,
);

export const GlobalProvider = ({ children }: { children: React.ReactNode }) => {
  const { notifyInfo } = useNotifications();
  const [projectData, setProjectData] = useState<
    GlobalContextProps | undefined
  >();
  const [validating, setValidating] = useState(false);

  useEffect(() => {
    const interval = setInterval(async () => {
      let newData: GlobalContextProps = {};
      const data = await evalScriptAsync('getProjectData()');

      if (data) {
        const parsedData: {
          documentId?: string;
          id?: string;
          revisionCount?: number;
        } = JSON.parse(data);

        newData = {
          plainlyProject: parsedData.id
            ? {
                id: parsedData.id,
                revisionCount: parsedData.revisionCount || 0,
              }
            : undefined,
        };

        if (!projectData?.documentId && parsedData.documentId) {
          newData = { documentId: parsedData.documentId, ...newData };
        } else if (
          projectData?.documentId &&
          parsedData.documentId !== projectData.documentId
        ) {
          notifyInfo("We've detected a new project.");
          newData = { documentId: parsedData.documentId, ...newData };
        } else {
          // Update only the plainlyProject if documentId is the same
          newData = { ...projectData, ...newData };
        }
      }

      let issues: string | undefined;
      if (!validating) {
        setValidating(true);
        issues = await evalScriptAsync('validateProject()');
        setValidating(false);
      }
      if (!issues) {
        setProjectData({ ...newData, projectIssues: [] });
      } else {
        const parsedIssues: AnyProjectIssue[] | undefined = JSON.parse(issues);
        if (
          JSON.stringify(parsedIssues) !==
          JSON.stringify(projectData?.projectIssues)
        ) {
          setProjectData({ ...newData, projectIssues: parsedIssues });
        }
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [notifyInfo, projectData, validating]);

  return (
    <GlobalContext.Provider value={projectData}>
      {children}
    </GlobalContext.Provider>
  );
};
