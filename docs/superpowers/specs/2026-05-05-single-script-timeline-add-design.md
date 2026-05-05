# Single script add to timeline-selected layer(s) — Design

## Goal

Let the user pick any addable script from `SCRIPT_REGISTRY` (Crop, Shift in/out, Auto-scale media, Auto-scale text, Layer management) and apply it to one or more layers selected in the After Effects timeline. This complements the two existing flows:

- **Predefined scripts** — timeline-driven, but applies a fixed multi-script chain.
- **Bulk script add** — picks any script, but targets layers checked in the parametrized layers list inside the plugin.

The new flow combines both: pick any single script, target the AE timeline selection.

## Behavior

- **N == 1 selected in timeline** — picker shows all `isAddable` scripts. Mirrors the single-layer add already available from a row in the parametrized layers list.
- **N >= 2 selected** — picker shows only `isAddable && isBulkable` scripts (so Shift in/out are hidden, since they reference a single target layer in the same comp).
- After pick:
  - `addDirectly: true` (e.g. Auto-scale text) — applied immediately with defaults to all compatible selected layers.
  - Editable scripts — opens the existing per-script editor; saving applies the configured script.
- Compatibility filtering uses the registry's `layerTypes` and `supportsRoot` rules. If, after filtering, no selected layer is compatible, the user gets a `notifyInfo` listing the reason and nothing changes.
- A timeline-selected layer that is not yet parametrized is materialized into `editableLayers` (matching by `name + compId` first; otherwise synthesized using the detected `layerType`).

## Architecture

A new entry **"Timeline script add"** in the Actions menu in `FilterAndActions.tsx`, sitting alongside "Bulk script add" and "Predefined scripts". The existing single-script and bulk-script editor pipeline (`ScriptDialogs` + `handleScriptSave`) is reused unchanged for editing, with one minor extension to its bulk targeting source.

## Components

### 1. AE-side: extend layer-type detection

**Files:** `plainly-aescripts/src/utils.ts`, `plainly-types/src/utils.ts`

Add three optional flags to `SelectedLayerInfo`:

- `isText?: boolean` — set when `layer instanceof TextLayer` → `DATA`.
- `isSolid?: boolean` — set when the layer's source is a `SolidSource` → `SOLID_COLOR`.
- `isAVLayer?: boolean` — generic AV fallback for AVLayers that are none of comp/video/audio/text/solid.

Existing flags keep their meaning:

- `sourceCompId` → `COMPOSITION`.
- `isVideo` / `isAudio` → `MEDIA`.

`DATA_EFFECT` is intentionally not detected here — effect-property scripts don't correspond to a whole timeline layer in the parametrization model.

The aescripts `dist/` bundle must be rebuilt as part of the change.

### 2. Layer resolver

**New file:** `plainly-plugin/src/ui/components/parametrization/timelineScripts.ts`

- `resolveLayerType(sel: SelectedLayerInfo): LayerType` — maps a timeline selection to a `LayerType`. Priority: `sourceCompId` → COMPOSITION; `isVideo`/`isAudio` → MEDIA; `isText` → DATA; `isSolid` → SOLID_COLOR; `isAVLayer` → MEDIA fallback. If nothing matches, falls back to MEDIA (with a console warning) — the picker's compatibility filter will keep this from causing damage.
- `resolveTimelineLayer(sel, editableLayers)` — returns either the existing `editableLayers` entry matched by `(name, compId)` (preserving its known `layerType`) or a synthesized new `Layer` using the resolved type. Mirrors the `existing ?? synthesize` pattern already used in `shiftAndCrop.ts`.
- Materialization helper that takes the full timeline selection and the current `editableLayers`, computes the resulting next-state array synchronously, and returns `{ nextLayers, targetIndices }`. The caller uses `setEditableLayers(() => nextLayers)` once, then passes the synchronously-known `targetIndices` into the editor / direct-apply path. This avoids depending on a not-yet-flushed state update.

### 3. Picker dialog

**New file:** `plainly-plugin/src/ui/components/parametrization/TimelineScriptsDialog.tsx`

A sibling of `PremadeScriptsDialog` with the same visual treatment. Props:

- `open`, `setOpen` — standard.
- `selectionCount: number` — drives filter and copy.
- `onSelect: (type: ScriptType) => void`.

Filter rule:

- Always: `isAddable: true`.
- If `selectionCount >= 2`: also `isBulkable: true`.

Title/description copy adapts to the count ("Add script to selected layer" vs. "Add script to N selected layers").

### 4. State extension for bulk targeting

**File:** `plainly-plugin/src/ui/types/template.ts` (or wherever `ScriptEditState` lives)

Add an optional field:

```ts
targetLayerIndices?: Set<number>
```

**File:** `ScriptDialogs.tsx`

In `handleScriptSave`, when `isBulk` is true, prefer `activeScriptEdit.targetLayerIndices` over `selectedLayerIds` if present. Otherwise behavior is unchanged. This keeps the parametrized-list checkbox selection independent from the timeline-driven flow.

### 5. Action wiring

**File:** `Parametrization.tsx`

Add `handleTimelineScriptSelect(scriptType)`:

1. Fetch `AeScriptsApi.getSelectedLayers()`. Empty / throws → `notifyError` ("Open a composition and select one or more layers first." — same as premade).
2. For each selection, call `resolveTimelineLayer`, append synthesized entries to `editableLayers` so indices are stable. Compute `targetIndices`.
3. Branch:
   - **N == 1**:
     - `addDirectly` → call `addScriptDirectly(layer, type)` for the single layer and update state.
     - Editable → `setActiveScriptEdit({ layerIndex, script: defaults, isNew: true, isBulk: false })`.
   - **N >= 2**:
     - Filter `targetIndices` by the script's `layerTypes` and `supportsRoot` rule. If zero compatible → `notifyInfo` ("None of the selected layers are compatible with <script>.") and bail.
     - `addDirectly` → loop `addScriptDirectly` over compatible indices.
     - Editable → `setActiveScriptEdit({ script: defaults, isNew: true, isBulk: true, targetLayerIndices })`.

**File:** `FilterAndActions.tsx`

Add a third menu item "Timeline script add" that opens `TimelineScriptsDialog`. Because the dialog needs the selection count, the click handler fetches the timeline selection first; on success it stores the count and opens the dialog, on failure it surfaces the same error and does not open it.

## Data flow

### Single layer

```
click "Timeline script add"
  → getSelectedLayers() → 1 text layer "Title"
  → resolveLayerType → DATA
  → resolveTimelineLayer → existing index OR new Layer appended
  → TimelineScriptsDialog (count=1, all addable)
  → user picks "Auto scale text"
    → addDirectly applied to layer
  OR user picks "Crop"
    → setActiveScriptEdit({ layerIndex, ..., isBulk: false })
    → CropScriptDialog opens, save flows through handleScriptSave
```

### Multiple layers

```
click "Timeline script add"
  → getSelectedLayers() → 5 mixed layers
  → resolve each, append synthesized → 5 stable indices
  → TimelineScriptsDialog (count=5, only bulkable)
  → user picks "Auto scale text"
    → filter by layerTypes=['DATA'] → 3 indices
    → 0 compatible → notifyInfo, stop
    → addDirectly: applied to compatible indices
  OR user picks "Crop" (no layerTypes restriction)
    → setActiveScriptEdit({ ..., isBulk: true, targetLayerIndices })
    → CropScriptDialog opens, save uses targetLayerIndices
```

## Error handling

- No active comp / empty selection → `notifyError` (existing message used by premade flow).
- Picker filtered to zero options (shouldn't happen for N==1; possible for N>=2 if every script is non-bulkable — currently can't happen since several bulkable scripts exist).
- Compatibility filter eliminates all selected layers → `notifyInfo` with the script label and reason; no state change.
- Same upstream guards (template loaded, not loading, no unsaved-changes conflict) as existing FilterAndActions actions.

## Verification (manual)

Per project preference, no test files. Manual matrix:

- N=1 text layer + Auto-scale-text (addDirectly) → applied.
- N=1 media layer + Crop → editor opens, save persists.
- N=1 + Shift in → script visible in picker, editor opens.
- N=3 mixed (1 text, 2 media) + Auto-scale-text → 1 updated, 2 ignored with notice.
- N=2 + Shift in → not in picker.
- Already-parametrized layer → existing entry reused (no duplicate).
- Fresh timeline layer → new entry appended to parametrized list.
- Layer with `supportsRoot: false` script applied to rendering composition → skipped (existing rule).

## Out of scope

- `DATA_EFFECT` detection from the timeline.
- Script picker preview of which selected layers will be skipped before pick (could be a future UX improvement).
- Changing the existing premade flow.

## Branching

This work lands on a new branch off `premade-script-shift-and-crop`, so the PR can stack on the in-flight premade work.
