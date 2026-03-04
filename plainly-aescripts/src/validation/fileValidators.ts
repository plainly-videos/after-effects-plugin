import type { FileIssues } from 'plainly-types';
import { ProjectIssueType } from '.';

/**
 * Scans all project items and flags AI/PSD imports as packaging-risk issues.
 *
 * AI/PSD files are generally supported, but projects that rely on layered
 * AI/PSD imports can break during plugin relinking. This validator surfaces
 * those files so users can package such projects manually.
 *
 * @returns A list of file issues for `.psd` and `.ai` sources.
 */
function validateFiles(): FileIssues[] {
  const files: FileIssues[] = [];

  for (let i = 1; i <= app.project.numItems; i++) {
    const item = app.project.item(i);
    if (!(item instanceof FootageItem)) {
      continue;
    }

    if (!(item.mainSource instanceof FileSource)) {
      continue;
    }

    const originalFile = item.mainSource.file;
    if (!originalFile) {
      continue;
    }

    const fsName = originalFile.fsName.toLowerCase();
    if (
      fsName.substring(fsName.length - 4) === '.psd' ||
      fsName.substring(fsName.length - 3) === '.ai'
    ) {
      files.push({
        type: ProjectIssueType.FileUnsupported,
        fileId: item.id.toString(),
        fileName: item.name,
        fileType: fsName.split('.').pop() || 'unknown',
      });
    }
  }

  return files;
}

export { validateFiles };
