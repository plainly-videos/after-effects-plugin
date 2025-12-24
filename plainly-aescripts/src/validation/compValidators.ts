import { getAllComps } from '../utils';
import { type CompIssues, ProjectIssueType } from './types';

enum RendererType {
  CLASSIC_3D = 'ADBE Advanced 3d',
  ADVANCED_3D = 'ADBE Calder',
  CINEMA_4D = 'ADBE Ernst',
}

function checkComps(): CompIssues[] {
  const comps: CompItem[] = getAllComps(app.project);
  const compIssues: CompIssues[] = [];

  for (let i = 0; i < comps.length; i++) {
    const comp = comps[i];
    const renderer = comp.renderer;
    if (renderer !== RendererType.CLASSIC_3D) {
      compIssues.push({
        type: ProjectIssueType.Dimensions,
        compId: comp.id.toString(),
        compName: comp.name,
        comp: true,
      });
    }
  }

  return compIssues;
}

export { checkComps };
