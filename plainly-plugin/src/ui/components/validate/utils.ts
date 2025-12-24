import type {
  AnyProjectIssue,
  CompIssues,
  TextLayerIssues,
} from '@src/ui/types/validation';

function isTextLayerIssue(issue: AnyProjectIssue): issue is TextLayerIssues {
  return 'text' in issue && issue.text === true;
}

function isCompIssue(issue: AnyProjectIssue): issue is CompIssues {
  return 'comp' in issue && issue.comp === true;
}

export { isTextLayerIssue, isCompIssue };
