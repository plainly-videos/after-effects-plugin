import type { AnyProjectIssue } from 'plainly-types';
import { getAllComps } from '../utils';
import { fixUnsupported3DRendererIssue, validateComps } from './compValidators';
import {
  fixAllCapsIssue,
  fixAllCapsIssues,
  validateTextLayers,
} from './textValidators';

enum ProjectIssueType {
  AllCaps = 'AllCaps',
  Unsupported3DRenderer = 'Unsupported3DRenderer',
}

function validateProject(): string {
  const comps = getAllComps(app.project);

  const textIssues = validateTextLayers(comps);
  const compIssues = validateComps(comps);
  const issues: AnyProjectIssue[] = [...textIssues, ...compIssues];

  if (issues.length > 0) {
    return JSON.stringify(issues);
  }

  return 'undefined';
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
