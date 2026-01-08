import type { ProjectIssue, ProjectIssueType } from '../validation';

interface ProjectFileIssue<T extends ProjectIssueType>
  extends ProjectIssue<T> {}

interface FileUnsupportedIssue
  extends ProjectFileIssue<ProjectIssueType.FileUnsupported> {
  fileId: string;
  fileName: string;
  fileType: string;
}

type FileIssues = FileUnsupportedIssue;

export type { FileUnsupportedIssue, FileIssues };
