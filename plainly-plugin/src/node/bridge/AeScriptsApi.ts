import { isEmpty } from '@src/ui/utils';
import type { ProjectData, ProjectInfo, RelinkData } from 'plainly-types';
import { csInterface } from '../constants';

interface GetFontsResult {
  isSubstitute: boolean;
  fontLocation: string;
}

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
   * Collects font objects by PostScript name from After Effects.
   * @param postScriptName The PostScript name of the font to look up
   * @returns An array of font objects, or undefined if not found
   */
  async getFontsByPostScriptName(
    postScriptName: string,
  ): Promise<GetFontsResult[] | undefined> {
    const result = await evalScriptAsync(
      `getFontsByPostScriptName("${postScriptName}")`,
    );
    if (!result) return undefined;

    try {
      return JSON.parse(result);
    } catch {
      throw new Error('Failed to parse fonts data.');
    }
  }

  /**
   * Collects font objects by family name and style name from After Effects.
   * @param familyName The family name of the font to look up
   * @param styleName The style name of the font to look up
   * @returns A postScriptName string if found, otherwise undefined
   */
  async getFontsByFamilyNameAndStyleName(
    familyName: string,
    styleName: string,
  ): Promise<GetFontsResult[] | undefined> {
    const result = await evalScriptAsync(
      `getFontsByFamilyNameAndStyleName("${familyName}", "${styleName}")`,
    );

    if (!result) return undefined;

    try {
      return JSON.parse(result);
    } catch {
      throw new Error('Failed to parse fonts data.');
    }
  }

  /**
   * Checks if a font is installed in After Effects by PostScript name, family name, and style name.
   * @param postScriptName The PostScript name of the font to check
   * @param familyName The family name of the font to check
   * @param styleName The style name of the font to check
   * @returns True if the font is installed, false otherwise
   */
  async isFontInstalled(
    postScriptName: string,
    familyName: string,
    styleName: string,
  ): Promise<boolean> {
    let fonts = await this.getFontsByPostScriptName(postScriptName);

    if (isEmpty(fonts)) {
      fonts = await this.getFontsByFamilyNameAndStyleName(
        familyName,
        styleName,
      );

      if (isEmpty(fonts)) {
        return false;
      }
    }

    for (const font of fonts) {
      if (font.isSubstitute) {
        return false;
      }
    }

    return true;
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
   * Relinks footage items in the After Effects project to new file paths.
   * @param relinkData - Object mapping item IDs to new file paths
   */
  async relinkFootage(relinkData: RelinkData): Promise<void> {
    await evalScriptAsync(`relinkFootage(${JSON.stringify(relinkData)})`);
  }

  /**
   * Gets the After Effects application version.
   * @returns After Effects version as a string, e.g. "25.6", or undefined if not available
   */
  async getAfterEffectsVersion(): Promise<string | undefined> {
    const version = await evalScriptAsync('getAfterEffectsVersion()');
    if (!version) return undefined;

    // got the version string like "25.6x101"
    return version.split('x')[0];
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
