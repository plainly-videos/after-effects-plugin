import type { ProjectData } from '../../ui/types';
import type { ProjectInfo, RelinkData } from '../types';
import { evalScriptAsync } from '../utils';

/**
 * Typed API bridge for communicating with After Effects ExtendScript.
 * Wraps the PlainlyAE namespace exposed by the aescripts bundle.
 */
class AeScriptsApiClass {
  /**
   * Opens a folder selection dialog in After Effects.
   * @returns The selected folder path, or undefined if cancelled
   */
  async selectFolder(): Promise<string | undefined> {
    const result = await evalScriptAsync('selectFolder()');
    return result;
  }

  /**
   * Collects all fonts and footage from the current After Effects project.
   * @returns Project information including fonts and footage arrays
   */
  async collectFiles(): Promise<ProjectInfo> {
    const result = await evalScriptAsync('collectFiles()');
    if (!result) throw new Error('Failed to collect files');

    try {
      return JSON.parse(result);
    } catch {
      throw new Error('Failed to parse collected files data.');
    }
  }

  /**
   * Sets Plainly project metadata in the After Effects project XMP.
   * @param id - The Plainly project ID
   * @param revisionCount - The project revision count
   */
  async setProjectData(id: string, revisionCount: number): Promise<void> {
    await evalScriptAsync(`setProjectData("${id}", "${revisionCount}")`);
  }

  /**
   * Retrieves Plainly project metadata from the After Effects project XMP.
   * @returns Project data including documentId, id, and revisionCount
   */
  async getProjectData(): Promise<ProjectData | undefined> {
    const result = await evalScriptAsync('getProjectData()');
    if (!result) return undefined;

    try {
      return JSON.parse(result);
    } catch {
      throw new Error('Failed to parse project data.');
    }
  }

  /**
   * Removes Plainly project metadata from the After Effects project XMP.
   */
  async removeProjectData(): Promise<void> {
    await evalScriptAsync('removeProjectData()');
  }

  /**
   * Gets the file system path of the current After Effects project.
   * @returns The project file path, or undefined if project is not saved
   */
  async getProjectPath(): Promise<string | undefined> {
    const result = await evalScriptAsync('getProjectPath()');
    return result;
  }

  /**
   * Saves the current After Effects project.
   */
  async saveProject(): Promise<void> {
    await evalScriptAsync('saveProject()');
  }

  /**
   * Relinks footage items in the After Effects project to new file paths.
   * @param relinkData - Object mapping item IDs to new file paths
   */
  async relinkFootage(relinkData: RelinkData): Promise<void> {
    const serialized = JSON.stringify(relinkData);
    await evalScriptAsync(`relinkFootage(${serialized})`);
  }
}

/**
 * Singleton instance of the AeScriptsApi.
 * Use this to make typed calls to After Effects ExtendScript functions.
 *
 * @example
 * ```typescript
 * import { AeScriptsApi } from './bridge/AeScriptsApi';
 *
 * // Save project
 * await AeScriptsApi.saveProject();
 *
 * // Get project data
 * const projectData = await AeScriptsApi.getProjectData();
 * console.log(projectData.id);
 * ```
 */
export const AeScriptsApi = new AeScriptsApiClass();
