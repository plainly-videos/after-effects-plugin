import {
  type CompIssues,
  ProjectIssueType,
  type RendererTypeName,
} from './types';

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
        comp: true,
      });
    }
  }

  return compIssues;
}

export { checkComps };
