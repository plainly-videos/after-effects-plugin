import type { CompIssues, RendererTypeName } from 'plainly-types';
import { ProjectIssueType } from '.';

enum RendererType {
  CLASSIC_3D = 'ADBE Advanced 3d',
  ADVANCED_3D = 'ADBE Calder',
  CINEMA_4D = 'ADBE Ernst',
}

function getRendererName(renderer: string): RendererTypeName {
  if (renderer === RendererType.CLASSIC_3D) return 'Classic 3D';
  if (renderer === RendererType.ADVANCED_3D) return 'Advanced 3D';
  if (renderer === RendererType.CINEMA_4D) return 'Cinema 4D';
  return 'Unknown Renderer';
}

function checkComps(comps: CompItem[]): CompIssues[] {
  const compIssues: CompIssues[] = [];

  for (let i = 0; i < comps.length; i++) {
    const comp = comps[i];
    const renderer = comp.renderer;
    if (renderer !== RendererType.CLASSIC_3D) {
      compIssues.push({
        type: ProjectIssueType.Unsupported3DRenderer,
        compId: comp.id.toString(),
        compName: comp.name,
        renderer: getRendererName(renderer),
      });
    }
  }

  return compIssues;
}

function fixUnsupported3DRendererIssue(compId: string): void {
  const comp = app.project.itemByID(parseInt(compId, 10));
  if (!(comp && comp instanceof CompItem)) {
    return;
  }

  comp.renderer = RendererType.CLASSIC_3D;
}

function fixUnsupported3DRendererIssues(compIds: string[]) {
  app.beginUndoGroup('fix unsupported 3d renderer');

  // Build comp cache first to avoid repeated lookups
  const compsToFix: CompItem[] = [];
  for (const compId of compIds) {
    const comp = app.project.itemByID(parseInt(compId, 10));
    if (comp && comp instanceof CompItem) {
      compsToFix.push(comp);
    }
  }

  // Now fix all at once (fewer AE API calls)
  for (const comp of compsToFix) {
    comp.renderer = RendererType.CLASSIC_3D;
  }

  app.endUndoGroup();
}

export {
  checkComps,
  fixUnsupported3DRendererIssue,
  fixUnsupported3DRendererIssues,
};
