import type { FileIssues } from 'plainly-types';
import { ProjectIssueType } from '.';

function checkFiles(): FileIssues[] {
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

export { checkFiles };
