import { useEffect, useState } from 'react';
import { evalScriptAsync } from '../../node/utils';
import type { ProjectData } from '../types';

export const useProjectData = (): [
  ProjectData | undefined,
  (data: ProjectData) => void,
  () => void,
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
    const { id, revisionCount } = data;

    await evalScriptAsync(`setProjectData("${id}", "${revisionCount}")`);
    setProjectData(data);
  };

  const removeData = async () => {
    await evalScriptAsync('removeProjectData()');
    setProjectData(undefined);
  };

  return [projectData, setData, removeData];
};
