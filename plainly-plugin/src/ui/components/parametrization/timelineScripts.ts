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
 *
 * Returns null for generic AV layers we can't classify (e.g. footage with
 * an unrecognized extension). Those would otherwise default to MEDIA/video
 * and get persisted with a wrong mediaType — better to skip them and let
 * the caller tally the skip.
 */
export function resolveLayerType(sel: SelectedLayerInfo): LayerType | null {
  if (sel.sourceCompId !== undefined) return 'COMPOSITION';
  if (sel.isVideo || sel.isAudio || sel.isImage) return 'MEDIA';
  if (sel.isText) return 'DATA';
  if (sel.isSolid) return 'SOLID_COLOR';
  return null;
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
 * or a freshly synthesized one. Returns null when neither path applies
 * (no existing match and the selection's type can't be resolved). Does
 * not mutate editableLayers; intended for compatibility checks before
 * deciding whether to materialize.
 */
export function previewLayer(
  sel: SelectedLayerInfo,
  editableLayers: Layer[],
): Layer | null {
  const existing = editableLayers.find(
    (l) => l.layerName === sel.name && l.compositions[0]?.id === sel.compId,
  );
  if (existing) return existing;
  return synthesizeLayer(sel);
}

/**
 * Build a Layer object from a timeline selection. Used when no existing
 * editableLayer matches by (layerName, compId). Returns null when the
 * selection's LayerType can't be resolved.
 */
function synthesizeLayer(sel: SelectedLayerInfo): Layer | null {
  const layerType = resolveLayerType(sel);
  if (layerType === null) return null;
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
    // Caller is expected to pre-filter via previewLayer so synthesize
    // succeeds here; defensively skip if it doesn't.
    if (!synthesized) continue;
    nextLayers.push(synthesized);
    targetIndices.push(nextLayers.length - 1);
  }

  return { nextLayers, targetIndices };
}
