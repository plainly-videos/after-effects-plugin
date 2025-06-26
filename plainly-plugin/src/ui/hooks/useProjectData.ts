import { evalScriptAsync } from '../../node/utils';
import type { ProjectData } from '../types';

export const useProjectData = (): [
  (data: ProjectData) => void,
  () => void,
  () => Promise<string | undefined>,
] => {
  const getData = async () => {
    const projectData = await evalScriptAsync('getProjectData()');
    return projectData;
  };

  const setData = async (data: ProjectData) => {
    const { id, revisionCount } = data;

    await evalScriptAsync(`setProjectData("${id}", "${revisionCount}")`);
  };

  const removeData = async () => {
    await evalScriptAsync('removeProjectData()');
  };

  return [setData, removeData, getData];
};
