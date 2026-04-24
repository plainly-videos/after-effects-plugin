import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  MouseSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
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
  EditIcon,
  FolderIcon,
  GripVerticalIcon,
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
import { Tooltip, TooltipContent, TooltipTrigger } from '../common/Tooltip';
import { Label } from '../typography';
import {
  ParameterDialog,
  type ParameterDialogSaveValue,
} from './ParameterDialog';
import { ScriptBadge } from './ScriptBadge';
import { ScriptsDialog } from './ScriptsDialog';
import { getScriptLabel, SCRIPT_REGISTRY } from './scriptRegistry';
import {
  addScriptDirectly,
  ensureHashPrefix,
  getDefaultScript,
  reorderScripts,
} from './utils';

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
        <Tooltip>
          <TooltipTrigger>{badge}</TooltipTrigger>
          <TooltipContent>
            Not supported yet, edit via web interface
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}

function SortableLayerItem({
  layer,
  index,
  isFilterActive,
  selectedLayerIds,
  setSelectedLayerIds,
  setParamDialogLayerIndex,
  setScriptsDialogLayerIndex,
  sensors,
  handleDragEnd,
  handleBadgeClick,
  handleScriptRemove,
}: {
  layer: Layer;
  index: number;
  isFilterActive: boolean;
  selectedLayerIds: Set<number>;
  setSelectedLayerIds: React.Dispatch<React.SetStateAction<Set<number>>>;
  setParamDialogLayerIndex: React.Dispatch<React.SetStateAction<number>>;
  setScriptsDialogLayerIndex: React.Dispatch<React.SetStateAction<number>>;
  sensors: ReturnType<typeof useSensors>;
  handleDragEnd: (layerIndex: number, event: DragEndEvent) => void;
  handleBadgeClick: (layerIndex: number, script: EditableScript) => void;
  handleScriptRemove: (layerIndex: number, type: ScriptType) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: String(layer.internalId) });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className="min-w-fit grid grid-cols-[auto_auto_1fr_1fr] w-full divide-x divide-white/10 divide-dashed items-center"
    >
      <div className="flex items-center justify-center py-1 px-2 h-full">
        <GripVerticalIcon
          className={classNames(
            'size-3',
            isFilterActive
              ? 'text-gray-600 cursor-not-allowed'
              : 'text-gray-400 cursor-grab',
          )}
          {...(!isFilterActive ? listeners : {})}
          {...(!isFilterActive ? attributes : {})}
        />
      </div>
      <div className="flex items-center justify-center py-1 px-2 h-full">
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
        {layer.layerType !== 'COMPOSITION' && (
          <button
            onClick={() => setParamDialogLayerIndex(index)}
            className="absolute right-1 top-1 size-5 flex items-center justify-center cursor-pointer disabled:cursor-not-allowed group rounded-sm bg-primary hover:bg-secondary hover:text-gray-400 disabled:pointer-events-none disabled:opacity-50"
            type="button"
          >
            <EditIcon className="size-3" />
          </button>
        )}
        <div className="flex flex-col text-xs pr-3 min-w-0 h-full justify-center">
          <div className="flex items-center gap-1">
            <LayerTypeIcon
              layerType={layer.layerType}
              mediaType={
                layer.layerType === 'MEDIA' ? layer.mediaType : undefined
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
          {layer.parametrization?.value != null && (
            <code className="truncate text-gray-400 text-2xs">
              {ensureHashPrefix(layer.parametrization.value)}
            </code>
          )}
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
            items={layer.scripting?.scripts.map((s) => s.scriptType) ?? []}
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
                      isKnown && SCRIPT_REGISTRY[script.scriptType]?.isEditable
                        ? () =>
                            handleBadgeClick(index, script as EditableScript)
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
  paramDialogLayerIndex,
  setParamDialogLayerIndex,
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
  paramDialogLayerIndex: number;
  setParamDialogLayerIndex: React.Dispatch<React.SetStateAction<number>>;
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

  const handleLayerDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;
      setEditableLayers((prev) => {
        const ai = prev.findIndex(
          (l) => String(l.internalId) === String(active.id),
        );
        const oi = prev.findIndex(
          (l) => String(l.internalId) === String(over.id),
        );
        if (ai === -1 || oi === -1) return prev;
        return arrayMove(prev, ai, oi);
      });
      setSelectedLayerIds(new Set());
    },
    [setEditableLayers, setSelectedLayerIds],
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

  const handleParameterSave = useCallback(
    (value: ParameterDialogSaveValue) => {
      if (paramDialogLayerIndex === -1) return;

      setEditableLayers((prev) =>
        prev.map((layer, index) => {
          if (index !== paramDialogLayerIndex) return layer;
          return {
            ...layer,
            label: value.label,
            parametrization: value.parametrization,
          };
        }),
      );
    },
    [paramDialogLayerIndex, setEditableLayers],
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

  const isFilterActive =
    parameterQuery !== '' || layerType !== 'All' || !!disabled;

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
              <Tooltip>
                <TooltipTrigger>
                  <InfoIcon className="size-4 text-gray-400" />
                </TooltipTrigger>
                <TooltipContent>Script order is important</TooltipContent>
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
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleLayerDragEnd}
          >
            <SortableContext
              items={layers.map(({ layer }) => String(layer.internalId))}
              strategy={verticalListSortingStrategy}
            >
              {layers.map(({ layer, index }) => (
                <SortableLayerItem
                  key={String(layer.internalId)}
                  layer={layer}
                  index={index}
                  isFilterActive={isFilterActive}
                  selectedLayerIds={selectedLayerIds}
                  setSelectedLayerIds={setSelectedLayerIds}
                  setParamDialogLayerIndex={setParamDialogLayerIndex}
                  setScriptsDialogLayerIndex={setScriptsDialogLayerIndex}
                  sensors={sensors}
                  handleDragEnd={handleDragEnd}
                  handleBadgeClick={handleBadgeClick}
                  handleScriptRemove={handleScriptRemove}
                />
              ))}
            </SortableContext>
          </DndContext>
        </ul>
      </div>
      <ScriptsDialog
        open={scriptsDialogLayerIndex !== -1}
        setOpen={(open) => !open && setScriptsDialogLayerIndex(-1)}
        onSelect={handleScriptSelect}
        layerType={scriptsDialogLayer?.layerType}
        isRenderingComp={scriptsDialogIsRenderingComp}
      />
      <ParameterDialog
        key={paramDialogLayerIndex === -1 ? 'closed' : paramDialogLayerIndex}
        open={paramDialogLayerIndex !== -1}
        setOpen={(open) => !open && setParamDialogLayerIndex(-1)}
        layer={editableLayers[paramDialogLayerIndex]}
        onSave={handleParameterSave}
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
    <div className="py-1 px-2 flex items-center justify-center h-full ml-[29px]">
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
