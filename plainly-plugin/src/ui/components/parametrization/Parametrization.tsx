import {
  Combobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
} from '@headlessui/react';
import { platformBaseUrl } from '@src/env';
import { AeScriptsApi } from '@src/node/bridge';
import {
  useEditTemplate,
  useGetProjectDetails,
  useNotifications,
} from '@src/ui/hooks';
import { Routes } from '@src/ui/types';
import type {
  EditableScript,
  Layer,
  LayerType,
  ScriptEditState,
  ScriptType,
  Template,
} from '@src/ui/types/template';
import { isEmpty } from '@src/ui/utils';
import classNames from 'classnames';
import { isEqual } from 'lodash-es';
import {
  CheckIcon,
  ChevronDownIcon,
  LoaderCircleIcon,
  RotateCcwIcon,
} from 'lucide-react';
import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Alert,
  Button,
  ChoiceDialog,
  ConfirmationDialog,
  ExternalLink,
  InternalLink,
} from '../common';
import { GlobalContext } from '../context';
import { Description, Label, PageHeading } from '../typography';
import { FilterAndActions } from './FilterAndActions';
import { ParametrizedLayers } from './ParametrizedLayers';
import { ScriptDialogs } from './ScriptDialogs';
import {
  PREMADE_SCRIPT_REGISTRY,
  type PromptChoiceOptions,
  SCRIPT_REGISTRY,
} from './scriptRegistry';
import { materializeTimelineSelection, previewLayer } from './timelineScripts';
import { addScriptDirectly, getDefaultScript, normalizeLayers } from './utils';

export function Parametrization() {
  const { plainlyProject, contextReady } = useContext(GlobalContext) || {};
  const { isLoading, data, refetch, isRefetching } = useGetProjectDetails(
    plainlyProject?.id,
  );
  const { notifyError, notifyInfo, notifySuccess } = useNotifications();

  const [templateQuery, setTemplateQuery] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
    null,
  );

  const [parameterQuery, setParameterQuery] = useState('');
  const [layerType, setLayerType] = useState<LayerType | 'All'>('All');

  const [editableLayers, setEditableLayers] = useState<Layer[]>([]);
  const [selectedLayerIds, setSelectedLayerIds] = useState<Set<number>>(
    new Set(),
  );
  const [activeScriptEdit, setActiveScriptEdit] =
    useState<ScriptEditState<EditableScript>>(null);
  const [showReloadConfirm, setShowReloadConfirm] = useState(false);
  const [scriptsDialogLayerIndex, setScriptsDialogLayerIndex] = useState(-1);
  const [choicePrompt, setChoicePrompt] = useState<
    (PromptChoiceOptions & { resolve: (choice: string | null) => void }) | null
  >(null);

  const promptChoice = useCallback(
    (options: PromptChoiceOptions) =>
      new Promise<string | null>((resolve) => {
        setChoicePrompt({ ...options, resolve });
      }),
    [],
  );
  // Prevents the selectedTemplate effect from overwriting editableLayers on
  // the save path, where we set both states atomically in handleSubmit.
  const skipLayerResetRef = useRef(false);

  const handleReload = useCallback(async () => {
    const result = await refetch();
    const freshTemplate =
      result.data?.templates?.find((t) => t.id === selectedTemplate?.id) ??
      null;
    setSelectedTemplate(freshTemplate);
    setEditableLayers(normalizeLayers(freshTemplate?.layers || []));
    setSelectedLayerIds(new Set());
    setLayerType('All');
    setParameterQuery('');
    setScriptsDialogLayerIndex(-1);
  }, [refetch, selectedTemplate?.id]);

  useEffect(() => {
    if (skipLayerResetRef.current) {
      skipLayerResetRef.current = false;
      return;
    }
    setEditableLayers(normalizeLayers(selectedTemplate?.layers || []));
    setSelectedLayerIds(new Set());
    setLayerType('All');
    setParameterQuery('');
    setScriptsDialogLayerIndex(-1);
  }, [selectedTemplate]);

  const handleBulkScriptSelect = useCallback(
    (type: ScriptType) => {
      if (SCRIPT_REGISTRY[type]?.addDirectly) {
        const { layerTypes } = SCRIPT_REGISTRY[type];
        setEditableLayers((prev) =>
          prev.map((layer, index) => {
            if (!selectedLayerIds.has(index)) return layer;
            if (layerTypes && !layerTypes.includes(layer.layerType))
              return layer;
            return addScriptDirectly(layer, type);
          }),
        );
        return;
      }

      const script = getDefaultScript(type);
      if (!script) return;

      setActiveScriptEdit({
        layerIndex: -1,
        script,
        isNew: true,
        isBulk: true,
      });
    },
    [selectedLayerIds],
  );

  const handlePremadeScriptSelect = useCallback(
    async (scriptId: string) => {
      const entry = PREMADE_SCRIPT_REGISTRY[scriptId];
      if (!entry) return;
      await entry.handler({
        editableLayers,
        setEditableLayers,
        notifyError,
        notifyInfo,
        notifySuccess,
        promptChoice,
      });
    },
    [editableLayers, notifyError, notifyInfo, notifySuccess, promptChoice],
  );

  const renderingCompositionId = selectedTemplate?.renderingCompositionId;

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

      const registryEntry = SCRIPT_REGISTRY[scriptType];
      if (!registryEntry) return;
      const allowedLayerTypes = registryEntry.layerTypes;
      const supportsRoot = registryEntry.supportsRoot;

      // Filter for compatibility BEFORE materializing so we never append
      // synthesized layers that wouldn't receive the script (avoids orphan
      // empty layers in editableLayers).
      const compatibleSelected = selected.filter((sel) => {
        const layer = previewLayer(sel, editableLayers);
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

      if (compatibleSelected.length === 0) {
        notifyInfo(
          `None of the selected layers are compatible with "${registryEntry.label}".`,
        );
        return;
      }

      const { nextLayers, targetIndices } = materializeTimelineSelection(
        compatibleSelected,
        editableLayers,
      );

      setEditableLayers(() => nextLayers);

      // Only count "single" against the user's intent (raw selection),
      // not against post-compat count: selecting one layer always lands
      // in single-mode UI, even after filtering.
      const isSingle = selected.length === 1;
      const synthesizedStartIdx = editableLayers.length;
      const newlySynthesizedIndices = targetIndices.filter(
        (i) => i >= synthesizedStartIdx,
      );

      if (registryEntry.addDirectly) {
        const targetSet = new Set(targetIndices);
        setEditableLayers((prev) =>
          prev.map((layer, index) =>
            targetSet.has(index) ? addScriptDirectly(layer, scriptType) : layer,
          ),
        );
        return;
      }

      const defaults = getDefaultScript(scriptType);
      if (!defaults) return;

      if (isSingle) {
        setActiveScriptEdit({
          layerIndex: targetIndices[0],
          script: defaults,
          isNew: true,
          isBulk: false,
          newlySynthesizedIndices,
        });
        return;
      }

      setActiveScriptEdit({
        layerIndex: -1,
        script: defaults,
        isNew: true,
        isBulk: true,
        targetLayerIndices: new Set(targetIndices),
        newlySynthesizedIndices,
      });
    },
    [editableLayers, notifyError, notifyInfo, renderingCompositionId],
  );

  const hasUnsavedChanges =
    !!selectedTemplate &&
    !isEqual(editableLayers, normalizeLayers(selectedTemplate.layers || []));

  const { isPending, mutateAsync: editTemplate } = useEditTemplate();

  const templates = data?.templates || [];
  const filteredTemplates = useMemo(
    () =>
      templateQuery === ''
        ? templates
        : templates.filter((template) =>
            template.name.toLowerCase().includes(templateQuery.toLowerCase()),
          ),
    [templateQuery, templates],
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!plainlyProject?.id || !selectedTemplate) return;

    try {
      const cleanedLayers = editableLayers.map((layer) => {
        const { scripting, ...rest } = layer;
        if (!scripting?.scripts?.length) return rest;
        return { ...rest, scripting };
      });

      const savedProject = await editTemplate({
        projectId: plainlyProject.id,
        templateId: selectedTemplate.id,
        data: {
          layers: cleanedLayers,
          name: selectedTemplate.name,
          renderingComposition: selectedTemplate.renderingComposition,
          renderingCompositionId: selectedTemplate.renderingCompositionId,
        },
      });
      const savedTemplate =
        savedProject.templates?.find((t) => t.id === selectedTemplate.id) ??
        null;
      // Set editableLayers atomically with selectedTemplate so hasUnsavedChanges
      // is false in the same render. skipLayerResetRef prevents the
      // selectedTemplate effect from overwriting us.
      skipLayerResetRef.current = true;
      setEditableLayers(normalizeLayers(savedTemplate?.layers || []));
      setScriptsDialogLayerIndex(-1);
      setSelectedTemplate(savedTemplate);
      notifySuccess('Template changes saved successfully');
    } catch (error) {
      notifyError('Failed to save template changes', error);
    }
  };

  const loading = isLoading || isRefetching || !contextReady;
  const disabledTemplates = loading || (data && isEmpty(templates));

  return (
    <form className="space-y-4 w-full text-white" onSubmit={handleSubmit}>
      <div>
        <div className="flex items-center gap-2">
          <PageHeading heading="Parametrization" />
          {isRefetching && (
            <LoaderCircleIcon className="animate-spin shrink-0 size-4 text-white" />
          )}
        </div>
        <Description className="mt-1">
          Here you can find the list of parametrized layers used in your
          templates. Choose a template to edit its layers, filter them by name
          or type, and select multiple layers to edit their scripts in bulk.
        </Description>
      </div>

      {isLoading || !contextReady ? (
        <LoaderCircleIcon className="animate-spin shrink-0 mx-auto size-6 text-white my-auto" />
      ) : (
        <>
          {!data ? (
            <Alert
              title={
                <p>
                  Working project is not linked to any project on the Plainly
                  platform. If a matching project exists on the platform, go to
                  the <InternalLink to={Routes.PROJECTS} text="Projects" /> tab
                  to link it.
                </p>
              }
              type="info"
              className="mb-1"
            />
          ) : (
            <>
              {isEmpty(templates) && (
                <Alert
                  title={
                    <p>
                      No templates found in the project. Please create a
                      template first to be able to edit layers. You can create
                      templates in the{' '}
                      <ExternalLink
                        to={`${platformBaseUrl}/dashboard/projects/${data?.id}`}
                        text="Plainly platform"
                      />
                      . Then reload the templates list using the Reload button.
                    </p>
                  }
                  type="info"
                  className="mb-1"
                />
              )}
              <div className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-6">
                <div className="col-span-full">
                  <Label
                    label="Template"
                    required
                    className={classNames(disabledTemplates && 'opacity-50')}
                  />
                  <div className="flex items-center">
                    <div
                      className={classNames(
                        'pr-2 flex-1 border-r border-white/10',
                        disabledTemplates && 'opacity-50',
                      )}
                    >
                      <Combobox
                        disabled={disabledTemplates}
                        value={selectedTemplate}
                        onChange={(value) => setSelectedTemplate(value)}
                        onClose={() => setTemplateQuery('')}
                      >
                        <div className="relative w-full">
                          <ComboboxInput
                            className="w-full rounded-md border-none bg-white/5 py-1 pr-8 pl-3 text-xs text-white outline outline-1 -outline-offset-1 outline-white/10 focus:outline focus:-outline-offset-2 focus:outline-indigo-500 disabled:cursor-not-allowed"
                            displayValue={(t: Template | null) => t?.name || ''}
                            onChange={(e) => setTemplateQuery(e.target.value)}
                            disabled={disabledTemplates}
                          />
                          <ComboboxButton
                            className="group absolute inset-y-0 right-0 px-2.5 disabled:pointer-events-none"
                            disabled={disabledTemplates}
                          >
                            <ChevronDownIcon className="size-4 shrink-0 text-gray-400 group-hover:text-white duration-200" />
                          </ComboboxButton>
                        </div>

                        <ComboboxOptions
                          anchor="bottom"
                          transition
                          className={classNames(
                            'min-w-[--input-width] rounded-md border border-white/5 bg-secondary p-1 mt-1 empty:invisible',
                            'transition duration-100 ease-in',
                          )}
                        >
                          {filteredTemplates.map((template) => (
                            <ComboboxOption
                              key={template.id}
                              value={template}
                              className="flex cursor-default items-center gap-1 rounded-md px-3 py-1 select-none focus:bg-white/10 hover:bg-white/10 text-xs"
                            >
                              <CheckIcon
                                className={classNames(
                                  'size-3 shrink-0 text-white',
                                  template.id === selectedTemplate?.id
                                    ? 'visible'
                                    : 'invisible',
                                )}
                              />
                              <div className="text-xs text-white">
                                {template.name}
                              </div>
                            </ComboboxOption>
                          ))}
                        </ComboboxOptions>
                      </Combobox>
                    </div>
                    <div className="pl-2">
                      <Button
                        secondary
                        onClick={() =>
                          hasUnsavedChanges
                            ? setShowReloadConfirm(true)
                            : handleReload()
                        }
                        loading={loading}
                        disabled={loading}
                        type="button"
                        className="w-[88px] justify-between min-h-[32px] bg-white/5 hover:bg-white/10"
                        iconRight={RotateCcwIcon}
                        iconClassName="text-gray-400"
                      >
                        Reload
                      </Button>
                    </div>
                  </div>
                </div>
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
                <ParametrizedLayers
                  editableLayers={editableLayers}
                  setEditableLayers={setEditableLayers}
                  parameterQuery={parameterQuery}
                  layerType={layerType}
                  selectedLayerIds={selectedLayerIds}
                  setSelectedLayerIds={setSelectedLayerIds}
                  onEditScript={setActiveScriptEdit}
                  scriptsDialogLayerIndex={scriptsDialogLayerIndex}
                  setScriptsDialogLayerIndex={setScriptsDialogLayerIndex}
                  disabled={disabledTemplates || !selectedTemplate}
                  unsavedChanges={hasUnsavedChanges}
                  renderingCompositionId={renderingCompositionId}
                />
              </div>
              <Button
                loading={isPending}
                disabled={loading || isEmpty(templates) || !selectedTemplate}
                className="float-right"
              >
                Save changes
              </Button>
            </>
          )}
          <ConfirmationDialog
            open={showReloadConfirm}
            setOpen={setShowReloadConfirm}
            title="Reload templates?"
            description="You have unsaved changes, are you sure you want to reload? All unsaved changes will be lost."
            buttonText="Reload"
            action={handleReload}
          />
          <ChoiceDialog
            open={choicePrompt !== null}
            title={choicePrompt?.title ?? ''}
            description={choicePrompt?.description}
            options={choicePrompt?.options ?? []}
            onSelect={(id) => {
              choicePrompt?.resolve(id);
              setChoicePrompt(null);
            }}
            onCancel={() => {
              choicePrompt?.resolve(null);
              setChoicePrompt(null);
            }}
          />
          <ScriptDialogs
            activeScriptEdit={activeScriptEdit}
            setActiveScriptEdit={setActiveScriptEdit}
            selectedLayerIds={selectedLayerIds}
            setEditableLayers={setEditableLayers}
            editableLayers={editableLayers}
            renderingCompositionId={renderingCompositionId}
          />
        </>
      )}
    </form>
  );
}
