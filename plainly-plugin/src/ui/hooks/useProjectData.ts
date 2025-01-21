import { useEffect, useState } from 'react';
import { evalScriptAsync } from '../../node/utils';
import type { ProjectData } from '../types';

export const useProjectData = () => {
  const [projectData, setProjectData] = useState<ProjectData | undefined>();

  useEffect(() => {
    const getProjectData = async () => {
      const data = await evalScriptAsync('getProjectData()');
      if (data) {
        const parsedData = JSON.parse(data) as ProjectData;
        setProjectData(parsedData);
      }
    };

    getProjectData();
  }, []);

  // try {
  //   const data = await evalScriptAsync('getProjectData()');
  //   const parsedData = JSON.parse(data);
  //   return parsedData;
  // } catch (error) {
  //   throw new Error((error as Error).message);
  // }

  return { projectData };
};
