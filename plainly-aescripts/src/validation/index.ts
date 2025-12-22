import { checkTextLayers, fixAllCapsIssue } from './textValidators';
import { type AnyProjectIssue, ProjectIssueType } from './types';

function validateProject(): string {
  const textIssues = checkTextLayers();
  let issues: AnyProjectIssue[] = [];

  if (textIssues.length > 0) {
    issues = issues.concat(textIssues);
  }

  if (issues.length > 0) {
    return JSON.stringify(issues);
  }

  return 'undefined';
}

function fixAllIssues(issues: AnyProjectIssue[]) {
  for (let i = 0; i < issues.length; i++) {
    const issue = issues[i];
    if (issue.type === ProjectIssueType.AllCaps) {
      fixAllCapsIssue(issue.layerId);
    }
  }

  validateProject();
}

export { validateProject, fixAllIssues };
