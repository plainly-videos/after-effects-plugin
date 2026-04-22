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

  // For every non-outro scene, resolve or synthesize its inner video layer.
  const nonOutro = scenes.slice(0, -1);
  const videoEntries = await Promise.all(
    nonOutro.map(async ({ sel, sceneLayer }) => {
      const sourceCompId = Number(sceneLayer.internalId);
      const video = await AeScriptsApi.getFirstVideoLayerInComp(sourceCompId);
      if (!video) return { sel, videoLayer: null, wasExisting: false };

      const existing = editableLayers.find(
        (l) =>
          l.layerType === 'MEDIA' &&
          l.mediaType === 'video' &&
          l.compositions[0]?.id === sourceCompId &&
          l.layerName === video.name,
      );
      const videoLayer: Layer = existing ?? {
        internalId: String(video.id),
        layerName: video.name,
        label: video.name,
        compositions: [
          { id: sourceCompId, name: sel.sourceCompName ?? sel.name },
        ],
        layerType: 'MEDIA',
        mediaType: 'video',
      };
      return { sel, videoLayer, wasExisting: !!existing };
    }),
  );

  const scenesWithoutVideo = videoEntries
    .filter((v) => !v.videoLayer)
    .map((v) => v.sel.name);
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

  const applyToScene = (layer: Layer, sceneIdx: number): Layer => {
    const isFirst = sceneIdx === 0;
    const isLast = sceneIdx === scenes.length - 1;
    let scripts = layer.scripting?.scripts ?? [];
    if (!isFirst) {
      const shift: ShiftInScript = {
        scriptType: ScriptType.SHIFT_IN,
        shiftTarget: scenes[sceneIdx - 1].sel.name,
        shiftsTo: 'out-point',
        shiftOverlap: 0,
      };
      scripts = upsertScript(scripts, shift);
    }
    if (isLast) {
      scripts = upsertScript(scripts, makeCrop());
    }
    return { ...layer, scripting: { ...(layer.scripting ?? {}), scripts } };
  };

  const applyToVideo = (layer: Layer): Layer => ({
    ...layer,
    scripting: {
      ...(layer.scripting ?? {}),
      scripts: upsertScript(layer.scripting?.scripts ?? [], makeCrop()),
    },
  });

  setEditableLayers((prev) => {
    // Update existing entries in place; collect new ones to append.
    const byId = new Map(prev.map((l) => [l.internalId, l]));
    const next: Layer[] = prev.slice();

    videoEntries.forEach(({ videoLayer }) => {
      if (!videoLayer) return;
      const existing = byId.get(videoLayer.internalId);
      const updated = applyToVideo(existing ?? videoLayer);
      if (existing) {
        const i = next.indexOf(existing);
        next[i] = updated;
        byId.set(updated.internalId, updated);
      } else {
        next.push(updated);
        byId.set(updated.internalId, updated);
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
