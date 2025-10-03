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

  useEffect(() => {
    const interval = setInterval(async () => {
      const data = await evalScriptAsync('getProjectData()');

      if (data) {
        const parsedData: {
          documentId?: string;
          id?: string;
          revisionCount?: number;
        } = JSON.parse(data);

        let newData: GlobalContextProps = {
          plainlyProject: parsedData.id
            ? {
                id: parsedData.id,
                revisionCount: parsedData.revisionCount || 0,
              }
            : undefined,
        };

        if (!projectData?.documentId && parsedData.documentId) {
          newData = { documentId: parsedData.documentId, ...newData };
          setProjectData(newData);
        } else if (
          projectData?.documentId &&
          parsedData.documentId !== projectData.documentId
        ) {
          notifyInfo("We've detected a new project.");
          newData = { documentId: parsedData.documentId, ...newData };
          setProjectData(newData);
        } else {
          // Update only the plainlyProject if documentId is the same
          newData = { ...projectData, ...newData };
          setProjectData(newData);
        }
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [notifyInfo, projectData]);

  useEffect(() => {
    const interval = setInterval(async () => {
      const data = await evalScriptAsync('validateProject()');

      if (data) {
        const parsedData: AnyProjectIssue[] | undefined = JSON.parse(data);

        if (
          JSON.stringify(parsedData) !==
          JSON.stringify(projectData?.projectIssues)
        ) {
          setProjectData((prev) => ({
            ...prev,
            projectIssues: parsedData,
          }));
        }
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [projectData?.projectIssues]);

  return (
    <GlobalContext.Provider value={projectData}>
      {children}
    </GlobalContext.Provider>
  );
};
