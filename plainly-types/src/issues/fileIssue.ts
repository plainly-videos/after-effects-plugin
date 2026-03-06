import type { ProjectIssue, ProjectIssueType } from '../validation';

interface ProjectFileIssue<T extends ProjectIssueType>
  extends ProjectIssue<T> {}

interface FileProblemIssue
  extends ProjectFileIssue<ProjectIssueType.FileProblem> {
  fileId: string;
  fileName: string;
  fileType: string;
}

type FileIssues = FileProblemIssue;

export type { FileProblemIssue, FileIssues };
