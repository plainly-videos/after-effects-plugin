import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  MouseSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { AeScriptsApi } from '@src/node/bridge';
import type {
  EditableScript,
  Layer,
  LayerType,
  MediaType,
  ScriptType,
} from '@src/ui/types/template';
import { isEmpty } from '@src/ui/utils';
import classNames from 'classnames';
import {
  AudioLinesIcon,
  FolderIcon,
  ImageIcon,
  InfoIcon,
  PlusIcon,
  SparklesIcon,
  SwatchBookIcon,
  TypeIcon,
  VideoIcon,
} from 'lucide-react';
import type React from 'react';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { Tooltip } from '../common/Tooltip';
import { Label } from '../typography';
import { ScriptBadge } from './ScriptBadge';
import { ScriptsDialog } from './ScriptsDialog';
import { getScriptLabel, SCRIPT_REGISTRY } from './scriptRegistry';
import { addScriptDirectly, getDefaultScript, reorderScripts } from './utils';

function LayerTypeIcon({
  layerType,
  mediaType,
}: {
  layerType: LayerType;
  mediaType?: MediaType;
}) {
  const cs = 'size-3 text-gray-400';

  if (layerType === 'DATA') return <TypeIcon className={cs} />;
  if (layerType === 'COMPOSITION') return <FolderIcon className={cs} />;
  if (layerType === 'SOLID_COLOR') return <SwatchBookIcon className={cs} />;
  if (layerType === 'DATA_EFFECT') return <SparklesIcon className={cs} />;
  if (layerType === 'MEDIA') {
    if (mediaType === 'image') return <ImageIcon className={cs} />;
    if (mediaType === 'video') return <VideoIcon className={cs} />;
    if (mediaType === 'audio') return <AudioLinesIcon className={cs} />;
  }
  return null;
}

function SortableScriptItem({
  script,
  index,
  isKnown,
  onBadgeClick,
  onRemove,
}: {
  script: { scriptType: ScriptType };
  index: number;
  isKnown: boolean;
  onBadgeClick?: () => void;
  onRemove: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: script.scriptType });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const badge = (
    <ScriptBadge
      label={getScriptLabel(script.scriptType)}
      action={
        isKnown && SCRIPT_REGISTRY[script.scriptType]?.isEditable
          ? onBadgeClick
          : undefined
      }
      onRemove={onRemove}
      disabled={!isKnown}
      index={index}
      dragListeners={listeners}
      dragAttributes={attributes}
    />
  );

  return (
    <div ref={setNodeRef} style={style}>
      {isKnown ? (
        badge
      ) : (
        <Tooltip text="Not supported yet, edit via web interface">
          {badge}
        </Tooltip>
      )}
    </div>
  );
}

export function ParametrizedLayers({
  editableLayers,
  setEditableLayers,
  parameterQuery,
  layerType,
  selectedLayerIds,
  setSelectedLayerIds,
  onEditScript,
  scriptsDialogLayerIndex,
  setScriptsDialogLayerIndex,
  disabled,
  unsavedChanges,
  renderingCompositionId,
}: {
  editableLayers: Layer[];
  setEditableLayers: React.Dispatch<React.SetStateAction<Layer[]>>;
  parameterQuery: string;
  layerType: LayerType | 'All';
  selectedLayerIds: Set<number>;
  setSelectedLayerIds: React.Dispatch<React.SetStateAction<Set<number>>>;
  onEditScript: (params: {
    layerIndex: number;
    script: EditableScript;
    isNew: boolean;
    isBulk: boolean;
  }) => void;
  scriptsDialogLayerIndex: number;
  setScriptsDialogLayerIndex: React.Dispatch<React.SetStateAction<number>>;
  disabled?: boolean;
  unsavedChanges?: boolean;
  renderingCompositionId?: number;
}) {
  const handleBadgeClick = useCallback(
    (layerIndex: number, script: EditableScript) => {
      onEditScript({ layerIndex, script, isNew: false, isBulk: false });
    },
    [onEditScript],
  );

  const handleDragEnd = useCallback(
    (layerIndex: number, event: DragEndEvent) => {
      const { active, over } = event;
      if (!over) return;
      setEditableLayers((prev) =>
        reorderScripts(prev, layerIndex, String(active.id), String(over.id)),
      );
    },
    [setEditableLayers],
  );

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
  );

  const handleScriptRemove = useCallback(
    (layerIndex: number, type: ScriptType) => {
      setEditableLayers((prev) =>
        prev.map((layer, index) => {
          if (index !== layerIndex) return layer;
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
      if (scriptsDialogLayerIndex === -1) return;
      if (SCRIPT_REGISTRY[type]?.addDirectly) {
        setEditableLayers((prev) =>
          prev.map((l, index) => {
            if (index !== scriptsDialogLayerIndex) return l;
            return addScriptDirectly(l, type);
          }),
        );
        return;
      }
      const script = getDefaultScript(type);
      if (!script) return;
      onEditScript({
        layerIndex: scriptsDialogLayerIndex,
        script,
        isNew: true,
        isBulk: false,
      });
    },
    [onEditScript, scriptsDialogLayerIndex, setEditableLayers],
  );

  const scriptsDialogLayer = editableLayers[scriptsDialogLayerIndex];

  const scriptsDialogIsRenderingComp = useMemo(
    () =>
      scriptsDialogLayer?.layerType === 'COMPOSITION' &&
      Number(scriptsDialogLayer.internalId) === renderingCompositionId,
    [
      scriptsDialogLayer?.layerType,
      renderingCompositionId,
      scriptsDialogLayer?.internalId,
    ],
  );

  const layers = useMemo(
    () =>
      editableLayers
        .map((layer, index) => ({ layer, index }))
        .filter(
          ({ layer }) =>
            (layer.layerName
              .toLowerCase()
              .includes(parameterQuery.toLowerCase()) ||
              layer.parametrization?.value
                .toLowerCase()
                .includes(parameterQuery.toLowerCase())) &&
            (layerType === 'All' || layer.layerType === layerType),
        ),
    [editableLayers, parameterQuery, layerType],
  );

  return (
    <>
      <div className={classNames('col-span-full', disabled && 'opacity-50')}>
        <div className="flex items-center gap-2">
          <Label label="Parametrized layers" />
          {unsavedChanges && (
            <div className="flex items-center gap-1">
              <div className="text-yellow-400 bg-yellow-400/10 flex-none rounded-full p-1">
                <div className="size-1 rounded-full bg-current" />
              </div>
              <span className="text-xs text-yellow-400">Unsaved changes</span>
            </div>
          )}
        </div>
        <ul className="divide-y divide-white/10 overflow-auto w-full rounded-md border border-white/5 bg-secondary max-h-64">
          <li className="grid grid-cols-[auto_1fr_1fr] w-full text-xs divide-x divide-white/10 divide-dashed sticky top-0 bg-secondary z-10 border-b border-white/10 -mb-px items-center">
            <SelectAllCheckbox
              layers={layers}
              selectedLayerIds={selectedLayerIds}
              setSelectedLayerIds={setSelectedLayerIds}
              disabled={disabled}
            />
            <Label label="Parameter" className="py-1 px-3" />
            <div className="py-1 px-3 flex items-center gap-1">
              <Label label="Scripts" />
              <Tooltip text="Script order is important">
                <InfoIcon className="size-4 text-gray-400" />
              </Tooltip>
            </div>
          </li>
          {isEmpty(layers) && (
            <li>
              <div className="p-2 text-center">
                <p className="text-xs text-gray-400">No layers found</p>
              </div>
            </li>
          )}
          {layers.map(({ layer, index }) => (
            <li
              key={`${layer.internalId}_${index}`}
              className="min-w-fit grid grid-cols-[auto_1fr_1fr] w-full divide-x divide-white/10 divide-dashed items-center"
            >
              <div className="flex items-center justify-center py-1 px-3">
                <input
                  type="checkbox"
                  className="appearance-none rounded border border-white/10 bg-white/5 checked:border-indigo-600 checked:bg-indigo-600 indeterminate:border-indigo-600 indeterminate:bg-indigo-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-white/10 disabled:bg-transparent forced-colors:appearance-auto col-span-1 flex items-center justify-center"
                  checked={selectedLayerIds.has(index)}
                  onChange={(e) => {
                    setSelectedLayerIds((prev) => {
                      const next = new Set(prev);
                      if (e.target.checked) next.add(index);
                      else next.delete(index);
                      return next;
                    });
                  }}
                />
              </div>
              <div className="min-w-0 px-3 py-1 relative flex items-start gap-2 h-full">
                {/* TODO: Implement edit functionality for the parametrization */}
                {/* <button
                  onClick={() => {}}
                  className="absolute right-1 top-1 size-5 flex items-center justify-center cursor-pointer disabled:cursor-not-allowed group rounded-sm bg-primary hover:bg-secondary hover:text-gray-400 disabled:pointer-events-none disabled:opacity-50"
                  type="button"
                  disabled={true}
                >
                  <EditIcon className="size-3" />
                </button> */}
                <div className="flex flex-col text-xs pr-3 min-w-0 h-full justify-center">
                  <div className="flex items-center gap-1">
                    <LayerTypeIcon
                      layerType={layer.layerType}
                      mediaType={
                        layer.layerType === 'MEDIA'
                          ? layer.mediaType
                          : undefined
                      }
                    />
                    <button
                      type="button"
                      className="text-left underline truncate text-xs leading-4"
                      onClick={() => AeScriptsApi.selectLayer(layer.internalId)}
                    >
                      {layer.layerName}
                    </button>
                  </div>
                  <code className="truncate text-gray-400 text-2xs">
                    {layer.parametrization?.value}
                  </code>
                </div>
              </div>
              <div className="min-w-0 px-3 py-1 relative min-h-full">
                <button
                  onClick={() => setScriptsDialogLayerIndex(index)}
                  className="absolute right-1 top-1 size-5 flex items-center justify-center cursor-pointer disabled:cursor-not-allowed group rounded-sm bg-primary hover:bg-secondary hover:text-gray-400"
                  type="button"
                >
                  <PlusIcon className="size-3" />
                </button>
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={(event) => handleDragEnd(index, event)}
                >
                  <SortableContext
                    items={
                      layer.scripting?.scripts.map((s) => s.scriptType) ?? []
                    }
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="flex flex-col text-xs gap-1 pr-4">
                      {layer.scripting?.scripts.map((script, scriptIndex) => {
                        const isKnown = script.scriptType in SCRIPT_REGISTRY;
                        return (
                          <SortableScriptItem
                            key={script.scriptType}
                            script={script}
                            index={scriptIndex}
                            isKnown={isKnown}
                            onBadgeClick={
                              isKnown &&
                              SCRIPT_REGISTRY[script.scriptType]?.isEditable
                                ? () =>
                                    handleBadgeClick(
                                      index,
                                      script as EditableScript,
                                    )
                                : undefined
                            }
                            onRemove={() =>
                              handleScriptRemove(index, script.scriptType)
                            }
                          />
                        );
                      })}
                    </div>
                  </SortableContext>
                </DndContext>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <ScriptsDialog
        open={scriptsDialogLayerIndex !== -1}
        setOpen={(open) => !open && setScriptsDialogLayerIndex(-1)}
        onSelect={handleScriptSelect}
        layerType={scriptsDialogLayer?.layerType}
        isRenderingComp={scriptsDialogIsRenderingComp}
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
  layers: { index: number }[];
  selectedLayerIds: Set<number>;
  setSelectedLayerIds: React.Dispatch<React.SetStateAction<Set<number>>>;
  disabled?: boolean;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const allSelected =
    !isEmpty(layers) &&
    layers.every(({ index }) => selectedLayerIds.has(index));
  const someSelected =
    !allSelected && layers.some(({ index }) => selectedLayerIds.has(index));

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
              ? new Set(layers.map(({ index }) => index))
              : new Set(),
          );
        }}
        disabled={disabled}
      />
    </div>
  );
}
