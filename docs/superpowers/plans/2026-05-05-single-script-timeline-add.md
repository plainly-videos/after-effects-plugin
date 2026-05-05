# Single Script Add to Timeline-Selected Layer(s) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a new "Timeline script add" entry to the parametrization Actions menu that lets the user pick any addable script from `SCRIPT_REGISTRY` and apply it to compatible layers selected in the After Effects timeline (single or multiple).

**Architecture:** Extend `getSelectedLayers` AE-side to detect text/solid/generic-AV layer types. Add a layer-type resolver and a synchronous materialization helper that maps the timeline selection to indices in `editableLayers` (creating new entries when needed). Add a new picker dialog that mirrors `PremadeScriptsDialog`. Reuse the existing single/bulk editor pipeline; extend `ScriptEditState` with an optional `targetLayerIndices` so the bulk path can target timeline-derived indices without disturbing the parametrized-list checkbox selection.

**Tech Stack:** TypeScript, React, ExtendScript (After Effects), Tailwind, Headless UI. Repo is a yarn workspaces monorepo with three packages: `plainly-types`, `plainly-aescripts`, `plainly-plugin`.

**Constraints (per project preferences):**

- Do **not** write tests or run `yarn test`.
- Do **not** run `tsc` / `tsc --noEmit`.
- Always **ask** before running `git`/`gh` commands. Tasks that commit do so by asking the user first.

---

## File Structure

**Create:**

- `plainly-plugin/src/ui/components/parametrization/timelineScripts.ts` — layer-type resolver + materialization helper.
- `plainly-plugin/src/ui/components/parametrization/TimelineScriptsDialog.tsx` — picker dialog.

**Modify:**

- `plainly-types/src/utils.ts` — add three optional flags to `SelectedLayerInfo`.
- `plainly-aescripts/src/utils.ts` — populate the new flags inside `getSelectedLayers`.
- `plainly-plugin/src/ui/types/template.ts` — add `targetLayerIndices?: Set<number>` to `ScriptEditState`.
- `plainly-plugin/src/ui/components/parametrization/ScriptDialogs.tsx` — make `handleScriptSave` honor `targetLayerIndices` over `selectedLayerIds` when present.
- `plainly-plugin/src/ui/components/parametrization/Parametrization.tsx` — add `handleTimelineScriptSelect`, pass through to `FilterAndActions`.
- `plainly-plugin/src/ui/components/parametrization/FilterAndActions.tsx` — add the third menu item, render the new dialog, pre-fetch timeline selection on click.

**Build artifacts (regenerated, committed):**

- `plainly-types/dist/**` — rebuilt by `yarn build:types`.
- `plainly-aescripts/dist/**` — rebuilt by `yarn build:aescripts`.

---

## Task 1: Extend `SelectedLayerInfo` with new optional flags

**Files:**

- Modify: `plainly-types/src/utils.ts`

- [ ] **Step 1: Edit `plainly-types/src/utils.ts`, replace the `SelectedLayerInfo` interface body**

Replace the existing interface (lines 6–26) with:

```ts
interface SelectedLayerInfo {
  id: number;
  name: string;
  index: number;
  compId: number;
  compName: string;
  /** Layer in-point in the parent comp's timeline, in seconds. */
  inPoint: number;
  /** Layer out-point in the parent comp's timeline, in seconds. */
  outPoint: number;
  /** Frame rate of the parent (active) comp. */
  compFrameRate: number;
  /** Set when the layer's source is a CompItem (precomp layer). */
  sourceCompId?: number;
  /** Set when the layer's source is a CompItem (precomp layer). */
  sourceCompName?: string;
  /** True when the layer is an AVLayer whose source is a video footage file. */
  isVideo?: boolean;
  /** True when the layer is an AVLayer whose source is an audio footage file. */
  isAudio?: boolean;
  /** True when the layer is a TextLayer. */
  isText?: boolean;
  /** True when the layer's source is a SolidSource. */
  isSolid?: boolean;
  /** True when the layer is a generic AVLayer that did not match video/audio/solid. */
  isAVLayer?: boolean;
}
```

- [ ] **Step 2: Rebuild types package**

Run: `cd /Users/vox/Desktop/after-effects-plugin && yarn build:types`
Expected: completes without errors. `plainly-types/dist/utils.d.ts` should now include `isText`, `isSolid`, `isAVLayer`.

- [ ] **Step 3: Verify dist content**

Run: `grep -n 'isText\|isSolid\|isAVLayer' /Users/vox/Desktop/after-effects-plugin/plainly-types/dist/utils.d.ts`
Expected: three matches, one per flag.

- [ ] **Step 4: Ask the user to commit**

Suggested commit message:

```
types: add isText, isSolid, isAVLayer to SelectedLayerInfo
```

Files to stage: `plainly-types/src/utils.ts`, `plainly-types/dist/`.

---

## Task 2: Populate new flags in AE-side `getSelectedLayers`

**Files:**

- Modify: `plainly-aescripts/src/utils.ts:324-360`

- [ ] **Step 1: Replace the `if (layer instanceof AVLayer)` block**

In `plainly-aescripts/src/utils.ts`, find the block inside the loop that currently sets `sourceCompId`/`isVideo`/`isAudio` (around lines 343–355). Replace the entire `if (layer instanceof AVLayer) { ... }` body so the new logic also detects text, solid, and generic AV. The full replacement loop body (everything that builds `info` for one layer and pushes it):

```ts
const layer = selected[i];
const info: SelectedLayerInfo = {
  id: layer.id,
  name: layer.name,
  index: layer.index,
  compId: active.id,
  compName: active.name,
  inPoint: layer.inPoint,
  outPoint: layer.outPoint,
  compFrameRate: active.frameRate,
};
if (layer instanceof TextLayer) {
  info.isText = true;
} else if (layer instanceof AVLayer) {
  const src = layer.source;
  if (src instanceof CompItem) {
    info.sourceCompId = src.id;
    info.sourceCompName = src.name;
  } else if (src instanceof FootageItem) {
    if (src.mainSource instanceof SolidSource) {
      info.isSolid = true;
    } else if (src.file != null) {
      const fsName = src.file.fsName;
      if (hasVideoExtension(fsName)) {
        info.isVideo = true;
      } else if (hasAudioExtension(fsName)) {
        info.isAudio = true;
      } else {
        info.isAVLayer = true;
      }
    } else {
      info.isAVLayer = true;
    }
  } else {
    info.isAVLayer = true;
  }
}
result.push(info);
```

Note the ordering: `TextLayer` is checked first because in ExtendScript `TextLayer` extends `AVLayer`, so `layer instanceof AVLayer` is also true for text layers. We want text detection to win.

- [ ] **Step 2: Rebuild aescripts**

Run: `cd /Users/vox/Desktop/after-effects-plugin && yarn build:aescripts`
Expected: completes without errors.

- [ ] **Step 3: Verify dist contains the new flags**

Run: `grep -n 'isText\|isSolid\|isAVLayer' /Users/vox/Desktop/after-effects-plugin/plainly-aescripts/dist/plainly.index.jsx | head -10`
Expected: at least three matches per flag (assignments inside the bundled `getSelectedLayers`).

- [ ] **Step 4: Ask the user to commit**

Suggested commit message:

```
aescripts: detect text, solid, and generic AV layers in getSelectedLayers
```

Files to stage: `plainly-aescripts/src/utils.ts`, `plainly-aescripts/dist/`.

---

## Task 3: Extend `ScriptEditState` with optional `targetLayerIndices`

**Files:**

- Modify: `plainly-plugin/src/ui/types/template.ts:103-108`

- [ ] **Step 1: Replace the `ScriptEditState` type**

Replace lines 103–108 with:

```ts
export type ScriptEditState<S extends Script> = {
  layerIndex: number;
  script: S;
  isNew: boolean;
  isBulk: boolean;
  /**
   * When set in bulk mode, the save handler applies the script to these
   * layer indices in editableLayers instead of using selectedLayerIds.
   * Used by the timeline-driven script-add flow so it does not have to
   * mutate the parametrized-list checkbox selection.
   */
  targetLayerIndices?: Set<number>;
} | null;
```

- [ ] **Step 2: Verify no consumers break**

Run: `grep -rn 'targetLayerIndices' /Users/vox/Desktop/after-effects-plugin/plainly-plugin/src 2>/dev/null`
Expected: matches only in the file you just edited (no other code references this field yet).

Run: `grep -rn 'ScriptEditState' /Users/vox/Desktop/after-effects-plugin/plainly-plugin/src 2>/dev/null`
Expected: a small number of usage sites, all of which still type-check because the new field is optional.

- [ ] **Step 3: Ask the user to commit**

Suggested commit message:

```
types: add optional targetLayerIndices to ScriptEditState
```

Files to stage: `plainly-plugin/src/ui/types/template.ts`.

---

## Task 4: Honor `targetLayerIndices` in `handleScriptSave`

**Files:**

- Modify: `plainly-plugin/src/ui/components/parametrization/ScriptDialogs.tsx:33-84`

- [ ] **Step 1: Replace the `handleScriptSave` callback**

Replace the existing `handleScriptSave` definition (lines 33–84) with:

```tsx
const handleScriptSave = useCallback(
  (updatedScript: EditableScript) => {
    if (!activeScriptEdit) return;
    const { layerIndex, isNew, isBulk, targetLayerIndices } = activeScriptEdit;
    const { scriptType } = updatedScript;
    const bulkTargets = isBulk
      ? (targetLayerIndices ?? selectedLayerIds)
      : null;
    setEditableLayers((prev) =>
      prev.map((layer, index) => {
        if (bulkTargets ? !bulkTargets.has(index) : index !== layerIndex)
          return layer;
        const registryEntry = SCRIPT_REGISTRY[scriptType];
        const allowedLayerTypes = registryEntry?.layerTypes;
        if (
          isBulk &&
          allowedLayerTypes &&
          !allowedLayerTypes.includes(layer.layerType)
        ) {
          return layer;
        }
        if (
          isBulk &&
          registryEntry?.supportsRoot === false &&
          layer.layerType === 'COMPOSITION' &&
          renderingCompositionId !== undefined &&
          Number(layer.internalId) === renderingCompositionId
        ) {
          return layer;
        }
        const existingScripts = layer.scripting?.scripts || [];
        const hasScript = existingScripts.some(
          (s) => s.scriptType === scriptType,
        );
        const scripts =
          isBulk && hasScript
            ? existingScripts.map((s) =>
                s.scriptType === scriptType ? updatedScript : s,
              )
            : isNew || (isBulk && !hasScript)
              ? [...existingScripts, updatedScript]
              : existingScripts.map((s) =>
                  s.scriptType === scriptType ? updatedScript : s,
                );
        return { ...layer, scripting: { ...layer.scripting, scripts } };
      }),
    );
  },
  [
    activeScriptEdit,
    renderingCompositionId,
    selectedLayerIds,
    setEditableLayers,
  ],
);
```

Notable changes vs. the original:

- Reads `targetLayerIndices` out of `activeScriptEdit`.
- Computes `bulkTargets = isBulk ? (targetLayerIndices ?? selectedLayerIds) : null` so the bulk membership check has a single source of truth.
- The dependency on `selectedLayerIds.has` (a method reference, brittle) is replaced with `selectedLayerIds` itself.

- [ ] **Step 2: Ask the user to commit**

Suggested commit message:

```
parametrization: support targetLayerIndices in bulk script save
```

Files to stage: `plainly-plugin/src/ui/components/parametrization/ScriptDialogs.tsx`.

---

## Task 5: Create `timelineScripts.ts` (resolver + materialization helper)

**Files:**

- Create: `plainly-plugin/src/ui/components/parametrization/timelineScripts.ts`

- [ ] **Step 1: Create the file with full contents**

Path: `/Users/vox/Desktop/after-effects-plugin/plainly-plugin/src/ui/components/parametrization/timelineScripts.ts`

```ts
import type { SelectedLayerInfo } from '@plainly/types';
import type { Layer, LayerType, MediaType } from '@src/ui/types/template';

/**
 * Map a timeline selection to a LayerType.
 *
 * Priority is deliberate:
 *   1. precomp (sourceCompId)        → COMPOSITION
 *   2. video / audio                  → MEDIA
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
  if (sel.isVideo || sel.isAudio) return 'MEDIA';
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
  return 'video';
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
      (l) =>
        l.layerName === sel.name && l.compositions[0]?.id === sel.compId,
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
```

Notes:

- `@plainly/types` is the package alias used elsewhere in the plugin for `plainly-types`. Verify by `grep -rn '@plainly/types' /Users/vox/Desktop/after-effects-plugin/plainly-plugin/src | head -3` — if the alias is different, adjust the import.
- The `(layerName, compId)` match mirrors `shiftAndCrop.ts` lines 100–106 / 118–123.

- [ ] **Step 2: Verify the import alias**

Run: `grep -rn 'from .@plainly/types\|from .plainly-types' /Users/vox/Desktop/after-effects-plugin/plainly-plugin/src | head -5`
Expected: at least one import using the alias. If a different form is used (for example a relative path or different name), adjust the `import type { SelectedLayerInfo }` line accordingly. If `SelectedLayerInfo` isn't directly importable, define a structural duplicate in this file that matches the type.

- [ ] **Step 3: Ask the user to commit**

Suggested commit message:

```
parametrization: add timelineScripts resolver and materializer
```

Files to stage: `plainly-plugin/src/ui/components/parametrization/timelineScripts.ts`.

---

## Task 6: Create `TimelineScriptsDialog.tsx`

**Files:**

- Create: `plainly-plugin/src/ui/components/parametrization/TimelineScriptsDialog.tsx`

- [ ] **Step 1: Create the file with full contents**

Path: `/Users/vox/Desktop/after-effects-plugin/plainly-plugin/src/ui/components/parametrization/TimelineScriptsDialog.tsx`

This dialog is a near-clone of `PremadeScriptsDialog.tsx` (read it for the visual baseline) but iterates `SCRIPT_REGISTRY` and applies a count-based filter.

```tsx
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from '@headlessui/react';
import { State, useGlobalState } from '@src/ui/state/store';
import type { ScriptType } from '@src/ui/types/template';
import classNames from 'classnames';
import { Button } from '../common';
import { Description } from '../typography';
import { SCRIPT_REGISTRY } from './scriptRegistry';

export function TimelineScriptsDialog({
  open,
  setOpen,
  selectionCount,
  onSelect,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  selectionCount: number;
  onSelect: (scriptType: ScriptType) => void;
}) {
  const [settings] = useGlobalState(State.SETTINGS);
  const sidebarOpen = settings.sidebarOpen;

  const visibleOptions = (
    Object.keys(SCRIPT_REGISTRY) as ScriptType[]
  )
    .map((type) => ({ type, ...SCRIPT_REGISTRY[type] }))
    .filter((entry) => entry.isAddable)
    .filter((entry) => (selectionCount >= 2 ? entry.isBulkable : true));

  const title =
    selectionCount > 1
      ? `Add script to ${selectionCount} selected layers`
      : 'Add script to selected layer';
  const description =
    selectionCount > 1
      ? 'Select a script to add to the timeline-selected layers. Layers whose type is not compatible with the chosen script will be skipped.'
      : 'Select a script to add to the timeline-selected layer.';

  return (
    <Dialog open={open} onClose={setOpen} className="relative">
      <DialogBackdrop className="fixed inset-0 z-20 backdrop-blur-md" />

      <div className="fixed inset-0 z-30 w-screen overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <DialogPanel
            className={classNames(
              'overflow-hidden rounded-lg bg-[rgb(29,29,30)] px-4 pb-4 pt-5 text-left sm:my-8 sm:w-full sm:max-w-lg sm:p-6 border border-white/10',
              sidebarOpen
                ? 'ml-[3.75rem] xs:ml-[var(--sidebar-width)]'
                : 'ml-[3.75rem]',
            )}
          >
            <DialogTitle
              as="h3"
              className="text-sm font-semibold text-white mb-1"
            >
              {title}
            </DialogTitle>
            <Description>{description}</Description>
            <ul className="mt-4 flex flex-col gap-1">
              {visibleOptions.map(
                ({ type, label, description: desc, icon: Icon }) => (
                  <li key={type}>
                    <button
                      type="button"
                      onClick={() => {
                        onSelect(type);
                        setOpen(false);
                      }}
                      className="w-full flex items-start gap-3 rounded-md px-3 py-2 text-left hover:bg-white/5"
                    >
                      <div className="size-8 bg-indigo-500 rounded-md flex shrink-0 items-center justify-center">
                        <Icon className="size-4 text-white" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-white">
                          {label}
                        </p>
                        <p className="text-2xs text-gray-400">{desc}</p>
                      </div>
                    </button>
                  </li>
                ),
              )}
            </ul>
            <div className="mt-4 sm:mt-3 sm:flex sm:flex-row-reverse">
              <Button
                type="button"
                onClick={() => setOpen(false)}
                secondary
                className="inline-flex w-full sm:w-auto justify-center"
              >
                Cancel
              </Button>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}
```

- [ ] **Step 2: Ask the user to commit**

Suggested commit message:

```
parametrization: add TimelineScriptsDialog picker
```

Files to stage: `plainly-plugin/src/ui/components/parametrization/TimelineScriptsDialog.tsx`.

---

## Task 7: Wire `handleTimelineScriptSelect` into `Parametrization.tsx`

**Files:**

- Modify: `plainly-plugin/src/ui/components/parametrization/Parametrization.tsx`

This task adds:

1. The new handler `handleTimelineScriptSelect`.
2. Passing it into `FilterAndActions`.

- [ ] **Step 1: Add the import for `AeScriptsApi` and `materializeTimelineSelection`**

Near the existing imports in `Parametrization.tsx`, add:

```ts
import { AeScriptsApi } from '@src/node/bridge';
import { materializeTimelineSelection } from './timelineScripts';
```

(Place them grouped with other parametrization-folder imports.)

- [ ] **Step 2: Add the handler immediately below `handlePremadeScriptSelect`**

Insert the following after the closing `)` of `handlePremadeScriptSelect` (currently around line 165):

```tsx
const handleTimelineScriptSelect = useCallback(
  async (scriptType: ScriptType) => {
    let selected: Awaited<ReturnType<typeof AeScriptsApi.getSelectedLayers>>;
    try {
      selected = await AeScriptsApi.getSelectedLayers();
    } catch {
      notifyError('Open a composition and select one or more layers first.');
      return;
    }
    if (selected.length === 0) {
      notifyError(
        'Select one or more layers in the active composition first.',
      );
      return;
    }

    const { nextLayers, targetIndices } = materializeTimelineSelection(
      selected,
      editableLayers,
    );

    const registryEntry = SCRIPT_REGISTRY[scriptType];
    if (!registryEntry) return;
    const allowedLayerTypes = registryEntry.layerTypes;
    const supportsRoot = registryEntry.supportsRoot;

    const compatibleIndices = targetIndices.filter((idx) => {
      const layer = nextLayers[idx];
      if (allowedLayerTypes && !allowedLayerTypes.includes(layer.layerType)) {
        return false;
      }
      if (
        supportsRoot === false &&
        layer.layerType === 'COMPOSITION' &&
        renderingCompositionId !== undefined &&
        Number(layer.internalId) === renderingCompositionId
      ) {
        return false;
      }
      return true;
    });

    if (compatibleIndices.length === 0) {
      notifyInfo(
        `None of the selected layers are compatible with "${registryEntry.label}".`,
      );
      return;
    }

    setEditableLayers(() => nextLayers);

    const isSingle = targetIndices.length === 1;

    if (registryEntry.addDirectly) {
      setEditableLayers((prev) =>
        prev.map((layer, index) =>
          compatibleIndices.includes(index)
            ? addScriptDirectly(layer, scriptType)
            : layer,
        ),
      );
      return;
    }

    const defaults = getDefaultScript(scriptType);
    if (!defaults) return;

    if (isSingle) {
      setActiveScriptEdit({
        layerIndex: compatibleIndices[0],
        script: defaults,
        isNew: true,
        isBulk: false,
      });
      return;
    }

    setActiveScriptEdit({
      layerIndex: -1,
      script: defaults,
      isNew: true,
      isBulk: true,
      targetLayerIndices: new Set(compatibleIndices),
    });
  },
  [
    editableLayers,
    notifyError,
    notifyInfo,
    renderingCompositionId,
  ],
);
```

Notes:

- `AeScriptsApi.getSelectedLayers` throws when no comp is active and returns `[]` for "comp active, nothing selected" — same contract as `shiftAndCrop.ts`.
- `setEditableLayers(() => nextLayers)` is called before the `addDirectly` branch so that, when we then update again via `setEditableLayers((prev) => …)`, React batches both updates and `prev` reflects `nextLayers`.

- [ ] **Step 3: Pass the new handler into `FilterAndActions`**

In the JSX where `FilterAndActions` is rendered (currently around line 364–373), add the `onTimelineScriptAction` prop:

```tsx
<FilterAndActions
  parameterQuery={parameterQuery}
  setParameterQuery={setParameterQuery}
  layerType={layerType}
  setLayerType={setLayerType}
  onBulkScriptSelectAction={handleBulkScriptSelect}
  onPremadeScriptAction={handlePremadeScriptSelect}
  onTimelineScriptAction={handleTimelineScriptSelect}
  bulkScriptDisabled={selectedLayerIds.size === 0}
  disabled={disabledTemplates || !selectedTemplate}
/>
```

- [ ] **Step 4: Ask the user to commit**

Suggested commit message:

```
parametrization: add timeline-driven single/bulk script add handler
```

Files to stage: `plainly-plugin/src/ui/components/parametrization/Parametrization.tsx`.

---

## Task 8: Add the menu item and dialog wiring in `FilterAndActions.tsx`

**Files:**

- Modify: `plainly-plugin/src/ui/components/parametrization/FilterAndActions.tsx`

This task:

1. Adds the new `onTimelineScriptAction` prop and a `TimelineSquareIcon`-style icon.
2. Adds a third `MenuItem` that pre-fetches the selection count, then opens `TimelineScriptsDialog`.
3. Renders the new dialog.

- [ ] **Step 1: Add imports**

In `FilterAndActions.tsx`, add `MousePointerSquareIcon` to the existing `lucide-react` import and the new dialog + bridge imports:

```tsx
import {
  ChevronDownIcon,
  CirclePileIcon,
  FunnelXIcon,
  MousePointerSquareIcon,
  ScrollTextIcon,
} from 'lucide-react';
import { AeScriptsApi } from '@src/node/bridge';
import { useNotifications } from '@src/ui/hooks';
import { TimelineScriptsDialog } from './TimelineScriptsDialog';
```

- [ ] **Step 2: Extend the props type and destructure the new prop**

Update the props type and destructuring in `FilterAndActions`:

```tsx
export function FilterAndActions({
  parameterQuery,
  setParameterQuery,
  layerType,
  setLayerType,
  onBulkScriptSelectAction,
  onPremadeScriptAction,
  onTimelineScriptAction,
  bulkScriptDisabled,
  disabled,
}: {
  parameterQuery: string;
  setParameterQuery: React.Dispatch<React.SetStateAction<string>>;
  layerType: LayerType | 'All';
  setLayerType: React.Dispatch<React.SetStateAction<LayerType | 'All'>>;
  onBulkScriptSelectAction: (type: ScriptType) => void;
  onPremadeScriptAction: (scriptId: string) => void;
  onTimelineScriptAction: (type: ScriptType) => void;
  bulkScriptDisabled?: boolean;
  disabled?: boolean;
}) {
```

- [ ] **Step 3: Add local state, notifications hook, and the open handler**

After the existing `useState` calls:

```tsx
const [openTimelineScriptsDialog, setOpenTimelineScriptsDialog] =
  useState(false);
const [timelineSelectionCount, setTimelineSelectionCount] = useState(0);
const { notifyError } = useNotifications();

const openTimelineScriptsAction = async () => {
  let selected: Awaited<ReturnType<typeof AeScriptsApi.getSelectedLayers>>;
  try {
    selected = await AeScriptsApi.getSelectedLayers();
  } catch {
    notifyError('Open a composition and select one or more layers first.');
    return;
  }
  if (selected.length === 0) {
    notifyError(
      'Select one or more layers in the active composition first.',
    );
    return;
  }
  setTimelineSelectionCount(selected.length);
  setOpenTimelineScriptsDialog(true);
};
```

- [ ] **Step 4: Insert the new `MenuItem` after the "Bulk script add" tooltip and before "Predefined scripts"**

Find the `MenuItem` containing `ScrollTextIcon` ("Predefined scripts", currently lines 111–119) and insert *before* it:

```tsx
<MenuItem>
  <span
    className="group flex items-center gap-2 rounded-md px-3 py-1.5 text-xs text-gray-400 hover:bg-indigo-600 hover:text-white w-full"
    onClick={openTimelineScriptsAction}
  >
    <MousePointerSquareIcon className="size-4 shrink-0 text-gray-400" />
    Timeline script add
  </span>
</MenuItem>
```

- [ ] **Step 5: Render the new dialog alongside the existing two**

At the bottom of the returned JSX, after `<PremadeScriptsDialog … />`, add:

```tsx
<TimelineScriptsDialog
  open={openTimelineScriptsDialog}
  setOpen={setOpenTimelineScriptsDialog}
  selectionCount={timelineSelectionCount}
  onSelect={onTimelineScriptAction}
/>
```

- [ ] **Step 6: Ask the user to commit**

Suggested commit message:

```
parametrization: wire Timeline script add menu item and dialog
```

Files to stage: `plainly-plugin/src/ui/components/parametrization/FilterAndActions.tsx`.

---

## Task 9: Manual verification

- [ ] **Step 1: Build and load the plugin in After Effects**

Run: `cd /Users/vox/Desktop/after-effects-plugin && yarn build:plugin`
Expected: completes without errors.

Then load the plugin in After Effects (Window → Extensions → Plainly Videos), open a parametrization-enabled project, and pick a template.

- [ ] **Step 2: Walk the verification matrix**

For each row, perform the action and confirm the expected outcome.

| # | Setup in AE | Action | Expected |
|---|-------------|--------|----------|
| 1 | Select 1 text layer in timeline | Actions → Timeline script add → Auto scale text | Layer appears in parametrized list with the script applied. No editor opens. |
| 2 | Select 1 video footage layer | Actions → Timeline script add → Crop | CropScriptDialog opens. Save → script added to that layer. |
| 3 | Select 1 layer | Actions → Timeline script add → Shift in | ShiftScriptDialog opens (Shift in is shown because N=1 even though `isBulkable: false`). |
| 4 | Select 1 text + 2 media layers | Actions → Timeline script add → Auto scale text | Notice "Auto scale text" applied to text layer only; media layers untouched. |
| 5 | Select 2 layers | Actions → Timeline script add | Picker shown without Shift in / Shift out (filtered by `isBulkable`). |
| 6 | Select an already-parametrized layer | Actions → Timeline script add → any script | The existing entry receives the script (no duplicate row appears). |
| 7 | Select an unparametrized text layer | Actions → Timeline script add → Auto scale text | A new entry is appended to the parametrized list with the script applied. |
| 8 | Select the rendering composition layer | Actions → Timeline script add → Crop | `notifyInfo` reports no compatible layers (Crop has `supportsRoot: false`). |
| 9 | No active comp | Actions → Timeline script add | `notifyError` matches the predefined-scripts wording. |
| 10 | Active comp, nothing selected | Actions → Timeline script add | `notifyError` reports nothing selected. |
| 11 | Use parametrized-list checkboxes to select layers, then run Timeline script add | After timeline-add completes | Original parametrized-list checkbox selection is unchanged. |

- [ ] **Step 3: Save and reload the template**

After timeline-driven changes, click Save changes in the plugin, then click Reload. The applied scripts should round-trip via the platform unchanged.

- [ ] **Step 4: Ask the user about a final commit / PR**

If everything passes, ask the user whether to push the branch and open a PR. Do not push or open a PR without confirmation.

---

## Out of scope

- DATA_EFFECT detection from the timeline (effect-property scripts don't correspond to a whole timeline layer).
- Pre-pick preview of compatibility-skipped layers in the dialog (could be a follow-up).
- Any change to the existing Predefined scripts or Bulk script add flows.
