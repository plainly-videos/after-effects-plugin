import { useEffect, useState } from 'react';
import { evalScriptAsync } from '../../node/utils';
import type { ProjectData } from '../types';

export const useProjectData = (): [
  ProjectData | undefined,
  (data: ProjectData) => void,
] => {
  const [projectData, setProjectData] = useState<ProjectData | undefined>();

  useEffect(() => {
    const getProjectData = async () => {
      const data = await evalScriptAsync('getProjectData()');
      if (data) {
        const parsedData = JSON.parse(data) as ProjectData;
        setProjectData(parsedData);
      } else {
        setProjectData(undefined);
      }
    };

    getProjectData();
  }, []);

  const setData = async (data: ProjectData) => {
    const { id, revision, name } = data;

    await evalScriptAsync(`setProjectData("${id}", "${revision}", "${name}")`);
    setProjectData(data);
  };

  return [projectData, setData];
};
