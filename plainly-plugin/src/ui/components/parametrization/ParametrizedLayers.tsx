import { AeScriptsApi } from '@src/node/bridge';
import {
  type EditableScript,
  type Layer,
  type LayerType,
  ScriptType,
  type TextAutoScaleScript,
} from '@src/ui/types/template';
import { isEmpty } from '@src/ui/utils';
import classNames from 'classnames';
import {
  AudioLinesIcon,
  EditIcon,
  FolderIcon,
  ImageIcon,
  PlusIcon,
  SparklesIcon,
  SwatchBookIcon,
  TypeIcon,
  VideoIcon,
} from 'lucide-react';
import type React from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Badge } from '../common/Badge';
import { Tooltip } from '../common/Tooltip';
import { Label } from '../typography';
import { ScriptsDialog } from './ScriptsDialog';

const KNOWN_SCRIPT_TYPES = new Set<string>(Object.values(ScriptType));

const SCRIPT_NAMES: Record<string, string> = {
  CROP: 'Crop',
  EXTEND: 'Extend',
  SET_DURATION: 'Set duration',
  SHIFT_IN: 'Shift in',
  SHIFT_OUT: 'Shift out',
  SPREAD_LAYERS: 'Spread layers',
  STRETCH: 'Stretch',
  TRIM_IN: 'Trim in',
  TRIM_OUT: 'Trim out',
  MEDIA_AUTO_SCALE: 'Auto scale media',
  TEXT_AUTO_SCALE: 'Auto scale text',
  IMAGE_SEQUENCE_LOADER: 'Image sequence loader',
  LAYER_MANAGEMENT: 'Layer management',
  SCENE_MANAGEMENT: 'Scene management',
  COMPOSITION_SET_SIZE: 'Composition set size',
  COMPOSITION_REPLACE_SOURCE: 'Composition replace source',
};

const scriptName = (type: ScriptType) => {
  const raw = type as unknown as string;
  return (
    SCRIPT_NAMES[raw] ??
    raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase().replace(/_/g, ' ')
  );
};

const EDITABLE_SCRIPT_TYPES = new Set([
  ScriptType.CROP,
  // ScriptType.TEXT_AUTO_SCALE, text auto scale is editable but doesn't open the dialog, so we handle it separately
  ScriptType.MEDIA_AUTO_SCALE,
  ScriptType.SHIFT_IN,
  ScriptType.SHIFT_OUT,
  ScriptType.LAYER_MANAGEMENT,
]);

export function ParametrizedLayers({
  editableLayers,
  setEditableLayers,
  parameterQuery,
  layerType,
  selectedLayerIds,
  setSelectedLayerIds,
  onEditScript,
  disabled,
}: {
  editableLayers: Layer[];
  setEditableLayers: React.Dispatch<React.SetStateAction<Layer[]>>;
  parameterQuery: string;
  layerType: LayerType | 'All';
  selectedLayerIds: Set<string>;
  setSelectedLayerIds: React.Dispatch<React.SetStateAction<Set<string>>>;
  onEditScript: (params: {
    layerInternalId: string;
    script: EditableScript;
    isNew: boolean;
    isBulk: boolean;
  }) => void;
  disabled?: boolean;
}) {
  const [scriptsDialogLayerId, setScriptsDialogLayerId] = useState<string>('');

  const handleBadgeClick = useCallback(
    (layerInternalId: string, script: EditableScript) => {
      onEditScript({ layerInternalId, script, isNew: false, isBulk: false });
    },
    [onEditScript],
  );

  const handleScriptRemove = useCallback(
    (layerInternalId: string, type: ScriptType) => {
      setEditableLayers((prev) =>
        prev.map((layer) => {
          if (layer.internalId !== layerInternalId) return layer;
          return {
            ...layer,
            scripting: {
              ...layer.scripting,
              scripts: (layer.scripting?.scripts || []).filter(
                (s) => s.scriptType !== type,
              ),
            },
          };
        }),
      );
    },
    [setEditableLayers],
  );

  const handleScriptSelect = useCallback(
    (type: ScriptType) => {
      if (!scriptsDialogLayerId) return;
      if (type === ScriptType.CROP) {
        onEditScript({
          layerInternalId: scriptsDialogLayerId,
          script: {
            scriptType: ScriptType.CROP,
            compEndsAtOutPoint: false,
            compStartsAtInPoint: false,
          },
          isNew: true,
          isBulk: false,
        });
      }
      if (type === ScriptType.MEDIA_AUTO_SCALE) {
        onEditScript({
          layerInternalId: scriptsDialogLayerId,
          script: {
            scriptType: ScriptType.MEDIA_AUTO_SCALE,
            fill: true,
            fixedRatio: true,
          },
          isNew: true,
          isBulk: false,
        });
      }
      if (type === ScriptType.SHIFT_IN) {
        onEditScript({
          layerInternalId: scriptsDialogLayerId,
          script: {
            scriptType: ScriptType.SHIFT_IN,
            shiftTarget: '',
            shiftsTo: 'in-point',
            shiftOverlap: 0,
          },
          isNew: true,
          isBulk: false,
        });
      }
      if (type === ScriptType.SHIFT_OUT) {
        onEditScript({
          layerInternalId: scriptsDialogLayerId,
          script: {
            scriptType: ScriptType.SHIFT_OUT,
            shiftTarget: '',
            shiftsTo: 'in-point',
            shiftOverlap: 0,
          },
          isNew: true,
          isBulk: false,
        });
      }
      if (type === ScriptType.LAYER_MANAGEMENT) {
        onEditScript({
          layerInternalId: scriptsDialogLayerId,
          script: {
            scriptType: ScriptType.LAYER_MANAGEMENT,
            parameterName: '',
          },
          isNew: true,
          isBulk: false,
        });
      }
      if (type === ScriptType.TEXT_AUTO_SCALE) {
        const layer = editableLayers.find(
          (l) => l.internalId === scriptsDialogLayerId,
        );
        if (!layer) return;
        const existingScripts = layer.scripting?.scripts || [];
        const hasAutoScaleText = existingScripts.some(
          (s) => s.scriptType === ScriptType.TEXT_AUTO_SCALE,
        );
        if (hasAutoScaleText) return;
        const updatedScript: TextAutoScaleScript = {
          scriptType: ScriptType.TEXT_AUTO_SCALE,
        };
        setEditableLayers((prev) =>
          prev.map((l) => {
            if (l.internalId !== scriptsDialogLayerId) return l;
            return {
              ...l,
              scripting: {
                ...l.scripting,
                scripts: [...(l.scripting?.scripts || []), updatedScript],
              },
            };
          }),
        );
      }
    },
    [onEditScript, scriptsDialogLayerId, editableLayers, setEditableLayers],
  );

  const scriptsDialogLayerType = useMemo(
    () =>
      editableLayers.find((l) => l.internalId === scriptsDialogLayerId)
        ?.layerType,
    [editableLayers, scriptsDialogLayerId],
  );

  const layers = useMemo(
    () =>
      editableLayers.filter(
        (layer) =>
          layer.parametrization?.value
            .toLowerCase()
            .includes(parameterQuery.toLowerCase()) &&
          (layerType === 'All' || layer.layerType === layerType),
      ),
    [editableLayers, parameterQuery, layerType],
  );

  return (
    <>
      <div className={classNames('col-span-full', disabled && 'opacity-50')}>
        <Label label="Parametrized layers" />
        <ul className="divide-y divide-white/10 overflow-auto w-full rounded-md border border-white/5 bg-secondary max-h-64">
          <li className="grid grid-cols-[auto_1fr_1fr] w-full text-xs divide-x divide-white/10 divide-dashed sticky top-0 bg-secondary z-10 border-b border-white/10 -mb-px items-center">
            <SelectAllCheckbox
              layers={layers}
              selectedLayerIds={selectedLayerIds}
              setSelectedLayerIds={setSelectedLayerIds}
              disabled={disabled}
            />
            <Label label="Parameter" className="py-1 px-3" />
            <Label label="Scripts" className="py-1 px-3" />
          </li>
          {isEmpty(layers) && (
            <li>
              <div className="p-2 text-center">
                <p className="text-xs text-gray-400">No layers found</p>
              </div>
            </li>
          )}
          {layers.map((layer) => (
            <li
              key={layer.internalId}
              className="min-w-fit grid grid-cols-[auto_1fr_1fr] w-full divide-x divide-white/10 divide-dashed items-center"
            >
              <div className="flex items-center justify-center py-1 px-3">
                <input
                  type="checkbox"
                  className="appearance-none rounded border border-white/10 bg-white/5 checked:border-indigo-600 checked:bg-indigo-600 indeterminate:border-indigo-600 indeterminate:bg-indigo-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-white/10 disabled:bg-transparent forced-colors:appearance-auto col-span-1 flex items-center justify-center"
                  checked={selectedLayerIds.has(layer.internalId)}
                  onChange={(e) => {
                    setSelectedLayerIds((prev) => {
                      const next = new Set(prev);
                      if (e.target.checked) next.add(layer.internalId);
                      else next.delete(layer.internalId);
                      return next;
                    });
                  }}
                />
              </div>
              <div className="min-w-0 px-3 py-1 relative flex items-start gap-2 h-full">
                {/* TODO: Implement edit functionality for the parametrization */}
                <button
                  onClick={() => {}}
                  className="absolute right-1 top-1 size-5 flex items-center justify-center cursor-pointer disabled:cursor-not-allowed group rounded-sm bg-primary hover:bg-secondary hover:text-gray-400 disabled:pointer-events-none disabled:opacity-50"
                  type="button"
                  disabled={true}
                >
                  <EditIcon className="size-3" />
                </button>
                <div className="flex flex-col text-xs pr-3 min-w-0 h-full justify-center">
                  <button
                    type="button"
                    className="text-left underline truncate text-xs leading-4"
                    onClick={() => AeScriptsApi.selectLayer(layer.internalId)}
                  >
                    {layer.layerName}
                  </button>
                  <div className="flex items-center gap-1">
                    {layer.layerType === 'DATA' && (
                      <TypeIcon className="size-3 text-gray-400" />
                    )}
                    {layer.layerType === 'COMPOSITION' && (
                      <FolderIcon className="size-3 text-gray-400" />
                    )}
                    {layer.layerType === 'SOLID_COLOR' && (
                      <SwatchBookIcon className="size-3 text-gray-400" />
                    )}
                    {layer.layerType === 'DATA_EFFECT' && (
                      <SparklesIcon className="size-3 text-gray-400" />
                    )}
                    {layer.layerType === 'MEDIA' &&
                      layer.mediaType === 'image' && (
                        <ImageIcon className="size-3 text-gray-400" />
                      )}
                    {layer.layerType === 'MEDIA' &&
                      layer.mediaType === 'video' && (
                        <VideoIcon className="size-3 text-gray-400" />
                      )}
                    {layer.layerType === 'MEDIA' &&
                      layer.mediaType === 'audio' && (
                        <AudioLinesIcon className="size-3 text-gray-400" />
                      )}
                    <code className="truncate text-gray-400 text-2xs">
                      {layer.parametrization?.value}
                    </code>
                  </div>
                </div>
              </div>
              <div className="min-w-0 px-3 py-1 relative min-h-full">
                <button
                  onClick={() => setScriptsDialogLayerId(layer.internalId)}
                  className="absolute right-1 top-1 size-5 flex items-center justify-center cursor-pointer disabled:cursor-not-allowed group rounded-sm bg-primary hover:bg-secondary hover:text-gray-400"
                  type="button"
                >
                  <PlusIcon className="size-3" />
                </button>
                <div className="flex flex-wrap text-xs gap-1 pr-4">
                  {layer.scripting?.scripts.map((script) => {
                    const isKnown = KNOWN_SCRIPT_TYPES.has(script.scriptType);
                    const badge = (
                      <Badge
                        label={scriptName(script.scriptType)}
                        action={
                          isKnown &&
                          EDITABLE_SCRIPT_TYPES.has(script.scriptType)
                            ? () =>
                                handleBadgeClick(
                                  layer.internalId,
                                  script as EditableScript,
                                )
                            : undefined
                        }
                        onRemove={() =>
                          handleScriptRemove(
                            layer.internalId,
                            script.scriptType,
                          )
                        }
                        disabled={!isKnown}
                      />
                    );
                    return (
                      <div key={script.scriptType}>
                        {isKnown ? (
                          badge
                        ) : (
                          <Tooltip text="Not supported yet, edit via web interface">
                            {badge}
                          </Tooltip>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <ScriptsDialog
        open={scriptsDialogLayerId !== ''}
        setOpen={(open) => !open && setScriptsDialogLayerId('')}
        onSelect={handleScriptSelect}
        layerType={scriptsDialogLayerType}
      />
    </>
  );
}

function SelectAllCheckbox({
  layers,
  selectedLayerIds,
  setSelectedLayerIds,
  disabled,
}: {
  layers: Layer[];
  selectedLayerIds: Set<string>;
  setSelectedLayerIds: React.Dispatch<React.SetStateAction<Set<string>>>;
  disabled?: boolean;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const allSelected =
    !isEmpty(layers) && layers.every((l) => selectedLayerIds.has(l.internalId));
  const someSelected =
    !allSelected && layers.some((l) => selectedLayerIds.has(l.internalId));

  useEffect(() => {
    if (ref.current) ref.current.indeterminate = someSelected;
  }, [someSelected]);

  return (
    <div className="py-1 px-3 flex items-center justify-center">
      <input
        ref={ref}
        type="checkbox"
        className="appearance-none rounded border border-white/10 bg-white/5 checked:border-indigo-600 checked:bg-indigo-600 indeterminate:border-indigo-600 indeterminate:bg-indigo-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-white/10 disabled:bg-transparent forced-colors:appearance-auto"
        checked={allSelected}
        onChange={(e) => {
          setSelectedLayerIds(
            e.target.checked
              ? new Set(layers.map((l) => l.internalId))
              : new Set(),
          );
        }}
        disabled={disabled}
      />
    </div>
  );
}
