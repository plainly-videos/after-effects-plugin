import type { AnyProjectIssue } from '@src/ui/types/validation';
import type { ProjectData, ProjectInfo, RelinkData } from 'plainly-types';
import { csInterface } from '../constants';

async function evalScriptAsync(func: string): Promise<string | undefined> {
  return new Promise((resolve, reject) => {
    try {
      const finalFunc = `$['com.plainlyvideos.after-effects-plugin.Panel'].${func};`;
      csInterface.evalScript(finalFunc, (result: string) => {
        if (result.includes('Error: ')) {
          reject(new Error(result));
        }

        resolve(result === 'undefined' ? undefined : result);
      });
    } catch (error) {
      reject(error);
    }
  });
}

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
    return await evalScriptAsync('selectFolder()');
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
    return await evalScriptAsync('getProjectPath()');
  }

  /**
   * Saves the current After Effects project.
   */
  async saveProject(): Promise<void> {
    await evalScriptAsync('saveProject()');
  }

  /**
   * Gets the version of After Effects.
   * @returns The version of After Effects as a string
   */
  async getAfterEffectsVersion(): Promise<string> {
    const result = await evalScriptAsync('getAfterEffectsVersion()');
    if (!result) throw new Error('Failed to get After Effects version');
    return result;
  }

  /**
   * Re-links footage items in the After Effects project to new file paths.
   * @param relinkData - Object mapping item IDs to new file paths
   */
  async relinkFootage(relinkData: RelinkData): Promise<void> {
    await evalScriptAsync(`relinkFootage(${JSON.stringify(relinkData)})`);
  }

  /**
   * Unselects all layers in the current After Effects composition.
   */
  async unselectAllLayers(): Promise<void> {
    await evalScriptAsync('unselectAllLayers()');
  }

  /**
   * Selects a layer in the current After Effects composition by its ID.
   * @param layerId - The ID of the layer to select
   */
  async selectLayer(layerId: string): Promise<void> {
    await evalScriptAsync(`selectLayer(${layerId})`);
  }

  /**
   *  Selects a composition in After Effects by its ID.
   * @param compId - The ID of the composition to select
   */
  async selectComp(compId: string): Promise<void> {
    await evalScriptAsync(`selectComp(${compId})`);
  }

  /**
   * Validates the current After Effects project for Plainly issues.
   * @returns A JSON string of validation results, or undefined if no issues found
   */
  async validateProject(): Promise<string | undefined> {
    return await evalScriptAsync('validateProject()');
  }

  /**
   * Fixes all provided Plainly issues in the After Effects project.
   * @param issues - Array of project issues to fix
   */
  async fixAllIssues(issues: AnyProjectIssue[]): Promise<void> {
    await evalScriptAsync(`fixAllIssues(${JSON.stringify(issues)})`);
  }

  /**
   * Fixes the all-caps text issue for a specific layer.
   * @param layerId - The ID of the layer to fix
   */
  async fixAllCapsIssue(layerId: string): Promise<void> {
    await evalScriptAsync(`fixAllCapsIssue(${layerId})`);
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
