import { AeScriptsApi } from '@src/node/bridge';
import {
  type CropScript,
  type Layer,
  ScriptType,
  type ShiftInScript,
} from '@src/ui/types/template';
import { isEmpty } from '@src/ui/utils';
import type { PremadeScriptHandler } from '../scriptRegistry';
import { upsertScript } from '../utils';

type VideoInfo = { id: number; name: string };

type SceneVideoPlan =
  | { kind: 'none' }
  | { kind: 'single'; video: VideoInfo }
  | { kind: 'multi'; videos: VideoInfo[] };

export const shiftAndCropHandler: PremadeScriptHandler = async ({
  editableLayers,
  setEditableLayers,
  notifyError,
  notifyInfo,
  notifySuccess,
}) => {
  const selected = await AeScriptsApi.getSelectedLayers();
  if (isEmpty(selected)) {
    notifyError(
      'Select one or more composition layers in the active composition first.',
    );
    return;
  }

  const nonCompSel = selected.filter((s) => s.sourceCompId === undefined);
  if (nonCompSel.length > 0) {
    notifyError(
      `Only composition layers are supported. These selected layers are not compositions: ${nonCompSel
        .map((s) => s.name)
        .join(', ')}.`,
    );
    return;
  }

  const sorted = [...selected].sort((a, b) => a.index - b.index);

  // Resolve or synthesize the scene COMPOSITION layer for each selected item.
  const scenes = sorted.map((sel) => {
    const existing = editableLayers.find(
      (l) =>
        l.layerType === 'COMPOSITION' &&
        l.compositions[0]?.id === sel.compId &&
        l.layerName === sel.name,
    );
    const sceneLayer: Layer = existing ?? {
      internalId: String(sel.sourceCompId),
      layerName: sel.name,
      label: sel.name,
      compositions: [{ id: sel.compId, name: sel.compName }],
      layerType: 'COMPOSITION',
    };
    return { sel, sceneLayer, wasExisting: !!existing };
  });

  // For every non-outro scene, resolve all videos inside and decide the plan:
  //   - 'multi' when the scene contains more than one video (e.g. a "Videos"
  //     comp holding intro/body/outro videos): we shift each video to the
  //     previous one and crop the last.
  //   - 'single' when the scene contains exactly one video: we crop that video
  //     (existing behavior).
  //   - 'none' when the scene has no videos: we skip and notify.
  const nonOutro = scenes.slice(0, -1);
  const videoPlans = await Promise.all(
    nonOutro.map(async ({ sceneLayer }): Promise<SceneVideoPlan> => {
      const sourceCompId = Number(sceneLayer.internalId);
      const videos = await AeScriptsApi.getAllVideoLayersInComp(sourceCompId);
      if (videos.length === 0) return { kind: 'none' };
      if (videos.length === 1) return { kind: 'single', video: videos[0] };
      return { kind: 'multi', videos };
    }),
  );

  const scenesWithoutVideo = videoPlans
    .map((plan, i) => (plan.kind === 'none' ? nonOutro[i].sel.name : null))
    .filter((name): name is string => name !== null);
  if (scenesWithoutVideo.length > 0) {
    notifyInfo(
      `No video layer found in: ${scenesWithoutVideo.join(
        ', ',
      )}. Crop was not applied there.`,
    );
  }

  const makeCrop = (): CropScript => ({
    scriptType: ScriptType.CROP,
    compEndsAtOutPoint: true,
    compStartsAtInPoint: false,
  });

  const makeShift = (targetName: string): ShiftInScript => ({
    scriptType: ScriptType.SHIFT_IN,
    shiftTarget: targetName,
    shiftsTo: 'out-point',
    shiftOverlap: 0,
  });

  const applyToScene = (layer: Layer, sceneIdx: number): Layer => {
    const isFirst = sceneIdx === 0;
    const isLast = sceneIdx === scenes.length - 1;
    let scripts = layer.scripting?.scripts ?? [];
    if (!isFirst) {
      scripts = upsertScript(scripts, makeShift(scenes[sceneIdx - 1].sel.name));
    }
    if (isLast) {
      scripts = upsertScript(scripts, makeCrop());
    }
    return { ...layer, scripting: { ...(layer.scripting ?? {}), scripts } };
  };

  // Build inner-video Layer entries for each non-outro scene based on its plan.
  // Returns a flat list preserving timeline order within each scene.
  const buildInnerVideoLayers = (): Layer[] => {
    const out: Layer[] = [];
    nonOutro.forEach(({ sel, sceneLayer }, i) => {
      const plan = videoPlans[i];
      if (plan.kind === 'none') return;
      const sourceCompId = Number(sceneLayer.internalId);
      const compositions = [
        { id: sourceCompId, name: sel.sourceCompName ?? sel.name },
      ];

      if (plan.kind === 'single') {
        const v = plan.video;
        const existing = editableLayers.find(
          (l) =>
            l.layerType === 'MEDIA' &&
            l.mediaType === 'video' &&
            l.compositions[0]?.id === sourceCompId &&
            l.layerName === v.name,
        );
        const base: Layer = existing ?? {
          internalId: String(v.id),
          layerName: v.name,
          label: v.name,
          compositions,
          layerType: 'MEDIA',
          mediaType: 'video',
        };
        const scripts = upsertScript(base.scripting?.scripts ?? [], makeCrop());
        out.push({
          ...base,
          scripting: { ...(base.scripting ?? {}), scripts },
        });
        return;
      }

      // 'multi': shift each video to the previous, crop the last.
      plan.videos.forEach((v, vIdx) => {
        const isFirstVideo = vIdx === 0;
        const isLastVideo = vIdx === plan.videos.length - 1;
        const existing = editableLayers.find(
          (l) =>
            l.layerType === 'MEDIA' &&
            l.mediaType === 'video' &&
            l.compositions[0]?.id === sourceCompId &&
            l.layerName === v.name,
        );
        const base: Layer = existing ?? {
          internalId: String(v.id),
          layerName: v.name,
          label: v.name,
          compositions,
          layerType: 'MEDIA',
          mediaType: 'video',
        };
        let scripts = base.scripting?.scripts ?? [];
        if (!isFirstVideo) {
          scripts = upsertScript(
            scripts,
            makeShift(plan.videos[vIdx - 1].name),
          );
        }
        if (isLastVideo) {
          scripts = upsertScript(scripts, makeCrop());
        }
        out.push({
          ...base,
          scripting: { ...(base.scripting ?? {}), scripts },
        });
      });
    });
    return out;
  };

  const innerVideoLayers = buildInnerVideoLayers();

  setEditableLayers((prev) => {
    // Update existing entries in place; collect new ones to append.
    const byId = new Map(prev.map((l) => [l.internalId, l]));
    const next: Layer[] = prev.slice();

    innerVideoLayers.forEach((videoLayer) => {
      const existing = byId.get(videoLayer.internalId);
      if (existing) {
        const i = next.indexOf(existing);
        next[i] = videoLayer;
        byId.set(videoLayer.internalId, videoLayer);
      } else {
        next.push(videoLayer);
        byId.set(videoLayer.internalId, videoLayer);
      }
    });

    scenes.forEach(({ sceneLayer }, sceneIdx) => {
      const existing = byId.get(sceneLayer.internalId);
      const updated = applyToScene(existing ?? sceneLayer, sceneIdx);
      if (existing) {
        const i = next.indexOf(existing);
        next[i] = updated;
        byId.set(updated.internalId, updated);
      } else {
        next.push(updated);
        byId.set(updated.internalId, updated);
      }
    });

    return next;
  });

  notifySuccess('Applied shift and crop scripts.');
};
