import type { Layer, LayerType, MediaType } from '@src/ui/types/template';
import type { SelectedLayerInfo } from 'plainly-types';

/**
 * Map a timeline selection to a LayerType.
 *
 * Priority is deliberate:
 *   1. precomp (sourceCompId)        → COMPOSITION
 *   2. video / audio / image          → MEDIA
 *   3. text                           → DATA
 *   4. solid                          → SOLID_COLOR
 *   5. generic AV                     → MEDIA (best-effort fallback)
 *
 * Anything that matches none of the above falls through to MEDIA. The
 * picker's compatibility filter prevents this fallback from causing harm:
 * scripts with explicit `layerTypes` will simply skip mis-detected layers.
 */
export function resolveLayerType(sel: SelectedLayerInfo): LayerType {
  if (sel.sourceCompId !== undefined) return 'COMPOSITION';
  if (sel.isVideo || sel.isAudio || sel.isImage) return 'MEDIA';
  if (sel.isText) return 'DATA';
  if (sel.isSolid) return 'SOLID_COLOR';
  if (sel.isAVLayer) return 'MEDIA';
  return 'MEDIA';
}

/**
 * For a MEDIA layer, derive the MediaType from the selection flags.
 * Returns 'video' as a safe default (consistent with how shiftAndCrop
 * synthesizes direct-video MEDIA entries).
 */
function resolveMediaType(sel: SelectedLayerInfo): MediaType {
  if (sel.isAudio) return 'audio';
  if (sel.isImage) return 'image';
  return 'video';
}

/**
 * Resolve a timeline selection to the Layer it would correspond to in
 * editableLayers — either an existing entry matched by (layerName, compId)
 * or a freshly synthesized one. Does not mutate editableLayers; intended
 * for compatibility checks before deciding whether to materialize.
 */
export function previewLayer(
  sel: SelectedLayerInfo,
  editableLayers: Layer[],
): Layer {
  const existing = editableLayers.find(
    (l) => l.layerName === sel.name && l.compositions[0]?.id === sel.compId,
  );
  return existing ?? synthesizeLayer(sel);
}

/**
 * Build a Layer object from a timeline selection. Used when no existing
 * editableLayer matches by (layerName, compId).
 */
function synthesizeLayer(sel: SelectedLayerInfo): Layer {
  const layerType = resolveLayerType(sel);
  const internalId =
    sel.sourceCompId !== undefined ? String(sel.sourceCompId) : String(sel.id);
  const base = {
    internalId,
    layerName: sel.name,
    label: sel.name,
    compositions: [{ id: sel.compId, name: sel.compName }],
  };
  if (layerType === 'MEDIA') {
    return { ...base, layerType: 'MEDIA', mediaType: resolveMediaType(sel) };
  }
  return { ...base, layerType };
}

/**
 * Resolve every timeline selection to an index in editableLayers,
 * appending synthesized entries for any selection that does not already
 * have a matching parametrized layer.
 *
 * Returns the would-be next state of editableLayers and the indices that
 * correspond to the timeline selection (in selection order). The caller
 * uses these synchronously — `setEditableLayers(() => nextLayers)` once,
 * and the returned indices for editor / direct-apply targeting.
 */
export function materializeTimelineSelection(
  selected: SelectedLayerInfo[],
  editableLayers: Layer[],
): { nextLayers: Layer[]; targetIndices: number[] } {
  const nextLayers = editableLayers.slice();
  const targetIndices: number[] = [];

  for (const sel of selected) {
    const existingIdx = nextLayers.findIndex(
      (l) => l.layerName === sel.name && l.compositions[0]?.id === sel.compId,
    );
    if (existingIdx !== -1) {
      targetIndices.push(existingIdx);
      continue;
    }
    const synthesized = synthesizeLayer(sel);
    nextLayers.push(synthesized);
    targetIndices.push(nextLayers.length - 1);
  }

  return { nextLayers, targetIndices };
}
