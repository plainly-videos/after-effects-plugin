import { evalScriptAsync } from '../../node/utils';
import type { ProjectData } from '../types';

export const useProjectData = (): [
  (data: Omit<ProjectData, 'documentId'>) => void,
  () => void,
  () => Promise<ProjectData | undefined>,
] => {
  const getData = async () => {
    try {
      const projectData = await evalScriptAsync('getProjectData()');
      const parsedData: ProjectData | undefined = projectData
        ? JSON.parse(projectData)
        : undefined;
      return parsedData;
    } catch (error) {
      console.error('Error getting project data:', error);
      return undefined;
    }
  };

  const setData = async (data: Omit<ProjectData, 'documentId'>) => {
    const { id, revisionCount } = data;

    await evalScriptAsync(`setProjectData("${id}", "${revisionCount}")`);
  };

  const removeData = async () => {
    await evalScriptAsync('removeProjectData()');
  };

  return [setData, removeData, getData];
};
