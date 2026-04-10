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
import {
  type EditableScript,
  type Layer,
  type LayerType,
  type MediaType,
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
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Tooltip } from '../common/Tooltip';
import { Label } from '../typography';
import { ScriptBadge } from './ScriptBadge';
import { ScriptsDialog } from './ScriptsDialog';
import { getScriptLabel, SCRIPT_REGISTRY } from './scriptRegistry';
import {
  addTextAutoScaleScript,
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
  disabled,
  unsavedChanges,
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
  unsavedChanges?: boolean;
}) {
  const [scriptsDialogLayerId, setScriptsDialogLayerId] = useState<string>('');

  const handleBadgeClick = useCallback(
    (layerInternalId: string, script: EditableScript) => {
      onEditScript({ layerInternalId, script, isNew: false, isBulk: false });
    },
    [onEditScript],
  );

  const handleDragEnd = useCallback(
    (layerInternalId: string, event: DragEndEvent) => {
      const { active, over } = event;
      if (!over) return;
      setEditableLayers((prev) =>
        reorderScripts(
          prev,
          layerInternalId,
          String(active.id),
          String(over.id),
        ),
      );
    },
    [setEditableLayers],
  );

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
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
      if (type === ScriptType.TEXT_AUTO_SCALE) {
        setEditableLayers((prev) =>
          prev.map((l) => {
            if (l.internalId !== scriptsDialogLayerId) return l;
            return addTextAutoScaleScript(l);
          }),
        );
        return;
      }
      const script = getDefaultScript(type);
      if (!script) return;
      onEditScript({
        layerInternalId: scriptsDialogLayerId,
        script,
        isNew: true,
        isBulk: false,
      });
    },
    [onEditScript, scriptsDialogLayerId, setEditableLayers],
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
                  onClick={() => setScriptsDialogLayerId(layer.internalId)}
                  className="absolute right-1 top-1 size-5 flex items-center justify-center cursor-pointer disabled:cursor-not-allowed group rounded-sm bg-primary hover:bg-secondary hover:text-gray-400"
                  type="button"
                >
                  <PlusIcon className="size-3" />
                </button>
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={(event) => handleDragEnd(layer.internalId, event)}
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
