import type {
  AnyProjectIssue,
  CompIssues,
  FileIssues,
  TextLayerIssues,
} from 'plainly-types';
import { ProjectIssueType } from '.';

function isTextLayerIssue(issue: AnyProjectIssue): issue is TextLayerIssues {
  return issue.type === ProjectIssueType.AllCaps;
}

function isCompIssue(issue: AnyProjectIssue): issue is CompIssues {
  return issue.type === ProjectIssueType.Unsupported3DRenderer;
}

function isFileIssue(issue: AnyProjectIssue): issue is FileIssues {
  return 'file' in issue && issue.file === true;
}

export { isTextLayerIssue, isCompIssue, isFileIssue };
