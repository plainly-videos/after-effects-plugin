import type { AnyProjectIssue } from 'plainly-types';
import { getAllComps } from '../utils';
import { checkComps, fixUnsupported3DRendererIssue } from './compValidators';
import { checkFiles } from './fileValidators';
import {
  checkTextLayers,
  fixAllCapsIssue,
  fixAllCapsIssues,
} from './textValidators';

enum ProjectIssueType {
  AllCaps = 'AllCaps',
  Unsupported3DRenderer = 'Unsupported3DRenderer',
  FileUnsupported = 'FileUnsupported',
}

function validateProject(): string {
  const comps = getAllComps(app.project);

  const textIssues = checkTextLayers(comps);
  const compIssues = checkComps(comps);
  const fileIssues = checkFiles();

  let issues: AnyProjectIssue[] = [];

  if (textIssues.length > 0) issues = issues.concat(textIssues);
  if (compIssues.length > 0) issues = issues.concat(compIssues);
  if (fileIssues.length > 0) issues = issues.concat(fileIssues);

  return issues.length > 0 ? JSON.stringify(issues) : 'undefined';
}

function fixAllIssues(issues: AnyProjectIssue[]) {
  app.beginUndoGroup('fix all');

  for (let i = 0; i < issues.length; i++) {
    const issue = issues[i];
    if (issue.type === ProjectIssueType.AllCaps) {
      fixAllCapsIssue(issue.layerId);
    }
    if (issue.type === ProjectIssueType.Unsupported3DRenderer) {
      fixUnsupported3DRendererIssue(issue.compId);
    }
  }

  app.endUndoGroup();
}

export { validateProject, fixAllIssues, fixAllCapsIssues, ProjectIssueType };
