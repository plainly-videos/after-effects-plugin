import type {
  AnyProjectIssue,
  CompIssues,
  TextLayerIssues,
} from 'plainly-types';
import { ProjectIssueType } from '.';

function isTextLayerIssue(issue: AnyProjectIssue): issue is TextLayerIssues {
  return issue.type === ProjectIssueType.AllCaps;
}

function isCompIssue(issue: AnyProjectIssue): issue is CompIssues {
  return issue.type === ProjectIssueType.Unsupported3DRenderer;
}

export { isTextLayerIssue, isCompIssue };
