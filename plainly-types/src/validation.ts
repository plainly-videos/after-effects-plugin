import type { CompIssues, FileIssues, TextLayerIssues } from './issues';

enum ProjectIssueType {
  AllCaps = 'AllCaps',
  Unsupported3DRenderer = 'Unsupported3DRenderer',
  FileUnsupported = 'FileUnsupported',
}

interface ProjectIssue<T extends ProjectIssueType> {
  type: T;
}

type AnyProjectIssue = TextLayerIssues | CompIssues | FileIssues;

export type { ProjectIssueType, ProjectIssue, AnyProjectIssue };
