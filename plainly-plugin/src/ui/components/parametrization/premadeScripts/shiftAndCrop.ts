import { AeScriptsApi } from '@src/node/bridge';
import {
  type CropScript,
  type Layer,
  type MediaType,
  ScriptType,
  type ShiftInScript,
} from '@src/ui/types/template';
import { isEmpty } from '@src/ui/utils';
import type { PremadeScriptHandler } from '../scriptRegistry';
import { upsertScript } from '../utils';

type MediaInfo = { id: number; name: string };

type SceneMediaPlan =
  | { kind: 'none' }
  | { kind: 'single'; mediaType: MediaType; item: MediaInfo }
  | { kind: 'multi'; mediaType: MediaType; items: MediaInfo[] };

export const shiftAndCropHandler: PremadeScriptHandler = async ({
  editableLayers,
  setEditableLayers,
  notifyError,
  notifyInfo,
  notifySuccess,
  promptChoice,
}) => {
  const selected = await AeScriptsApi.getSelectedLayers();
  if (isEmpty(selected)) {
    notifyError(
      'Select one or more composition, video, or audio layers in the active composition first.',
    );
    return;
  }

  const invalidSel = selected.filter(
    (s) => s.sourceCompId === undefined && !s.isVideo && !s.isAudio,
  );
  if (invalidSel.length > 0) {
    notifyError(
      `Only composition, video, or audio layers are supported. These selected layers are none of those: ${invalidSel
        .map((s) => s.name)
        .join(', ')}.`,
    );
    return;
  }

  const compIds = new Set(selected.map((s) => s.compId));
  if (compIds.size > 1) {
    notifyError('Selected layers must all be in the same composition.');
    return;
  }

  const sorted = [...selected].sort((a, b) => a.index - b.index);

  // Resolve or synthesize a scene Layer for each selected item. A scene may be:
  //   - A COMPOSITION layer (intro/outro, or scenes in cases 1 & 2)
  //   - A direct MEDIA/video layer sitting in the render comp (case 3, video)
  //   - A direct MEDIA/audio layer sitting in the render comp (case 3, audio)
  const scenes = sorted.map((sel) => {
    const isDirectVideo =
      sel.sourceCompId === undefined && sel.isVideo === true;
    const isDirectAudio =
      sel.sourceCompId === undefined && sel.isAudio === true;

    if (isDirectVideo || isDirectAudio) {
      const mediaType: MediaType = isDirectVideo ? 'video' : 'audio';
      const existing = editableLayers.find(
        (l) =>
          l.layerType === 'MEDIA' &&
          l.mediaType === mediaType &&
          l.compositions[0]?.id === sel.compId &&
          l.layerName === sel.name,
      );
      const sceneLayer: Layer = existing ?? {
        internalId: String(sel.id),
        layerName: sel.name,
        label: sel.name,
        compositions: [{ id: sel.compId, name: sel.compName }],
        layerType: 'MEDIA',
        mediaType,
      };
      return { sel, sceneLayer, directMediaType: mediaType };
    }

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
    return { sel, sceneLayer, directMediaType: null as MediaType | null };
  });

  // Probe inner media for each non-outro COMP scene. Direct-media scenes
  // short-circuit — their scripts live on the scene layer itself, not on
  // inner layers.
  const nonOutro = scenes.slice(0, -1);
  const sceneInnerMedia = await Promise.all(
    nonOutro.map(async ({ sceneLayer, directMediaType }) => {
      if (directMediaType !== null)
        return { video: [] as MediaInfo[], audio: [] as MediaInfo[] };
      const sourceCompId = Number(sceneLayer.internalId);
      const [video, audio] = await Promise.all([
        AeScriptsApi.getAllVideoLayersInComp(sourceCompId),
        AeScriptsApi.getAllAudioLayersInComp(sourceCompId),
      ]);
      return { video, audio };
    }),
  );

  // If any non-outro comp scene has BOTH video and audio inner layers, prompt
  // once — the choice applies to every ambiguous scene in this operation.
  const ambiguousSceneIdxs = sceneInnerMedia
    .map((m, i) => (m.video.length > 0 && m.audio.length > 0 ? i : -1))
    .filter((i) => i !== -1);
  let ambiguousKind: MediaType | null = null;
  if (ambiguousSceneIdxs.length > 0) {
    const names = ambiguousSceneIdxs
      .map((i) => nonOutro[i].sel.name)
      .join(', ');
    const chosen = await promptChoice({
      title: 'Video or audio?',
      description: `These compositions contain both video and audio layers: ${names}. Choose which media type the shift-and-crop chain should use.`,
      options: [
        {
          id: 'video',
          label: 'Video',
          description: 'Chain video layers inside each ambiguous composition.',
        },
        {
          id: 'audio',
          label: 'Audio',
          description: 'Chain audio layers inside each ambiguous composition.',
        },
      ],
    });
    if (chosen === null) return;
    ambiguousKind = chosen === 'audio' ? 'audio' : 'video';
  }

  // For each non-outro comp scene, decide its media plan.
  //   - only video → chain videos
  //   - only audio → chain audios
  //   - both → use prompt result
  //   - neither → 'none' (skipped with a notice)
  const mediaPlans: SceneMediaPlan[] = sceneInnerMedia.map((m) => {
    const { video, audio } = m;
    let items: MediaInfo[];
    let mediaType: MediaType;
    if (video.length > 0 && audio.length > 0) {
      mediaType = ambiguousKind as MediaType;
      items = mediaType === 'video' ? video : audio;
    } else if (video.length > 0) {
      mediaType = 'video';
      items = video;
    } else if (audio.length > 0) {
      mediaType = 'audio';
      items = audio;
    } else {
      return { kind: 'none' };
    }
    if (items.length === 1) {
      return { kind: 'single', mediaType, item: items[0] };
    }
    return { kind: 'multi', mediaType, items };
  });

  const scenesWithoutMedia = mediaPlans
    .map((plan, i) => {
      if (plan.kind !== 'none') return null;
      if (nonOutro[i].directMediaType !== null) return null;
      return nonOutro[i].sel.name;
    })
    .filter((name): name is string => name !== null);
  if (scenesWithoutMedia.length > 0) {
    notifyInfo(
      `No video or audio layer found in: ${scenesWithoutMedia.join(
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

  // Build inner-media Layer entries for each non-outro comp scene.
  const buildInnerMediaLayers = (): Layer[] => {
    const out: Layer[] = [];
    nonOutro.forEach(({ sel, sceneLayer }, i) => {
      const plan = mediaPlans[i];
      if (plan.kind === 'none') return;
      const sourceCompId = Number(sceneLayer.internalId);
      const compositions = [
        { id: sourceCompId, name: sel.sourceCompName ?? sel.name },
      ];

      if (plan.kind === 'single') {
        const v = plan.item;
        const existing = editableLayers.find(
          (l) =>
            l.layerType === 'MEDIA' &&
            l.mediaType === plan.mediaType &&
            l.compositions[0]?.id === sourceCompId &&
            l.layerName === v.name,
        );
        const base: Layer = existing ?? {
          internalId: String(v.id),
          layerName: v.name,
          label: v.name,
          compositions,
          layerType: 'MEDIA',
          mediaType: plan.mediaType,
        };
        const scripts = upsertScript(base.scripting?.scripts ?? [], makeCrop());
        out.push({
          ...base,
          scripting: { ...(base.scripting ?? {}), scripts },
        });
        return;
      }

      // 'multi': shift each item to the previous, crop the last.
      plan.items.forEach((v, vIdx) => {
        const isFirstItem = vIdx === 0;
        const isLastItem = vIdx === plan.items.length - 1;
        const existing = editableLayers.find(
          (l) =>
            l.layerType === 'MEDIA' &&
            l.mediaType === plan.mediaType &&
            l.compositions[0]?.id === sourceCompId &&
            l.layerName === v.name,
        );
        const base: Layer = existing ?? {
          internalId: String(v.id),
          layerName: v.name,
          label: v.name,
          compositions,
          layerType: 'MEDIA',
          mediaType: plan.mediaType,
        };
        let scripts = base.scripting?.scripts ?? [];
        if (!isFirstItem) {
          scripts = upsertScript(scripts, makeShift(plan.items[vIdx - 1].name));
        }
        if (isLastItem) {
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

  const innerMediaLayers = buildInnerMediaLayers();

  setEditableLayers((prev) => {
    const byId = new Map(prev.map((l) => [l.internalId, l]));
    const next: Layer[] = prev.slice();

    innerMediaLayers.forEach((mediaLayer) => {
      const existing = byId.get(mediaLayer.internalId);
      if (existing) {
        const i = next.indexOf(existing);
        next[i] = mediaLayer;
        byId.set(mediaLayer.internalId, mediaLayer);
      } else {
        next.push(mediaLayer);
        byId.set(mediaLayer.internalId, mediaLayer);
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
