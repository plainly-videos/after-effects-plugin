import path from 'path';

import { evalScriptAsync } from '../utils';
import { collectProjectFiles, zip } from './collect';

export * from './collect';

export const makeProjectZip = async (targetPath: string) => {
  try {
    const collectFilesDir = await collectProjectFiles(targetPath);
    const projectPath = await evalScriptAsync('getProjectPath()');
    const projectName = path.basename(projectPath, '.aep');
    const zipPath = await zip(collectFilesDir, projectName);
    return { collectFilesDir, zipPath };
  } catch (error) {
    throw new Error(`Failed to collect files: ${(error as Error).message}`);
  }
};
