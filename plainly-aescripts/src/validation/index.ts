import type { AnyProjectIssue } from 'plainly-types';
import { getAllComps } from '../utils';
import { checkComps } from './compValidators';
import {
  checkTextLayers,
  fixAllCapsIssue,
  fixAllCapsIssues,
} from './textValidators';

enum ProjectIssueType {
  AllCaps = 'AllCaps',
  Unsupported3DRenderer = 'Unsupported3DRenderer',
}

function validateProject(): string {
  const comps = getAllComps(app.project);

  const textIssues = checkTextLayers(comps);
  const compIssues = checkComps(comps);
  let issues: AnyProjectIssue[] = [];

  if (textIssues.length > 0) {
    issues = issues.concat(textIssues);
  }

  if (compIssues.length > 0) {
    issues = issues.concat(compIssues);
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

export { validateProject, fixAllIssues, fixAllCapsIssues, ProjectIssueType };
