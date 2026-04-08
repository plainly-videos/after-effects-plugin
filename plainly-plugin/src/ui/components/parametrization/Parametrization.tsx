import {
  Combobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
} from '@headlessui/react';
import { platformBaseUrl } from '@src/env';
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
  Template,
} from '@src/ui/types/template';
import { ScriptType } from '@src/ui/types/template';
import { isEmpty } from '@src/ui/utils';
import classNames from 'classnames';
import { isEqual } from 'lodash-es';
import {
  CheckIcon,
  ChevronDownIcon,
  LoaderCircleIcon,
  RotateCcwIcon,
} from 'lucide-react';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Button,
  ConfirmationDialog,
  ExternalLink,
  InternalLink,
} from '../common';
import { GlobalContext } from '../context';
import { Description, Label, PageHeading } from '../typography';
import { FilterAndActions } from './FilterAndActions';
import { ParametrizedLayers } from './ParametrizedLayers';
import { ScriptDialogs } from './ScriptDialogs';
import { addTextAutoScaleScript, getDefaultScript } from './utils';

export function Parametrization() {
  const { plainlyProject, contextReady } = useContext(GlobalContext) || {};
  const { isLoading, data, refetch, isRefetching } = useGetProjectDetails(
    plainlyProject?.id,
  );
  const { notifyError, notifySuccess } = useNotifications();

  const [templateQuery, setTemplateQuery] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>();

  const [parameterQuery, setParameterQuery] = useState('');
  const [layerType, setLayerType] = useState<LayerType | 'All'>('All');

  const [editableLayers, setEditableLayers] = useState<Layer[]>([]);
  const [selectedLayerIds, setSelectedLayerIds] = useState<Set<string>>(
    new Set(),
  );
  const [activeScriptEdit, setActiveScriptEdit] =
    useState<ScriptEditState<EditableScript>>(null);
  const [showReloadConfirm, setShowReloadConfirm] = useState(false);

  const handleReload = useCallback(async () => {
    const result = await refetch();
    const freshTemplate =
      result.data?.templates?.find((t) => t.id === selectedTemplate?.id) ??
      null;
    setSelectedTemplate(freshTemplate);
    setEditableLayers(freshTemplate?.layers || []);
    setSelectedLayerIds(new Set());
    setLayerType('All');
    setParameterQuery('');
  }, [refetch, selectedTemplate?.id]);

  useEffect(() => {
    setEditableLayers(selectedTemplate?.layers || []);
    setSelectedLayerIds(new Set());
    setLayerType('All');
  }, [selectedTemplate]);

  const handleBulkScriptSelect = useCallback(
    (type: ScriptType) => {
      if (type === ScriptType.TEXT_AUTO_SCALE) {
        setEditableLayers((prev) =>
          prev.map((layer) => {
            if (!selectedLayerIds.has(layer.internalId)) return layer;
            if (layer.layerType !== 'DATA') return layer;
            return addTextAutoScaleScript(layer);
          }),
        );
        return;
      }

      const script = getDefaultScript(type);
      if (!script) return;

      setActiveScriptEdit({
        layerInternalId: '',
        script,
        isNew: true,
        isBulk: true,
      });
    },
    [selectedLayerIds],
  );

  const hasUnsavedChanges =
    !!selectedTemplate &&
    !isEqual(editableLayers, selectedTemplate.layers || []);

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
        if (!layer.scripting?.scripts?.length) {
          const { scripting: _scripting, ...rest } = layer;
          return rest;
        }
        return layer;
      });

      await editTemplate({
        projectId: plainlyProject.id,
        templateId: selectedTemplate.id,
        data: {
          layers: cleanedLayers,
          name: selectedTemplate.name,
          renderingComposition: selectedTemplate.renderingComposition,
          renderingCompositionId: selectedTemplate.renderingCompositionId,
        },
      });
      notifySuccess('Template changes saved successfully');
    } catch (error) {
      notifyError('Failed to save template changes', error);
    }
  };

  const loading = isLoading || isRefetching || !contextReady;
  const disabledTemplates = loading || (data && isEmpty(templates));

  if (isLoading || !contextReady) {
    return (
      <LoaderCircleIcon className="animate-spin shrink-0 mx-auto size-6 text-white my-auto" />
    );
  }

  return (
    <form className="space-y-4 w-full text-white" onSubmit={handleSubmit}>
      <div>
        <div className="flex items-center gap-2">
          <PageHeading heading="Parametrization" />
          {loading && (
            <LoaderCircleIcon className="animate-spin shrink-0 size-4 text-white" />
          )}
        </div>
        <Description className="mt-1">
          Here you can find the list of parametrized layers used in your
          templates. Choose a template to edit its layers, filter them by name
          or type, and select multiple layers to edit their scripts in bulk.
        </Description>
      </div>

      {!data ? (
        <Alert
          title={
            <p>
              Working project is not linked to any project on the Plainly
              platform. If a matching project exists on the platform, go to the{' '}
              <InternalLink to={Routes.PROJECTS} text="Projects" /> tab to link
              it.
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
                  No templates found in the project. Please create a template
                  first to be able to edit layers. You can create templates in
                  the{' '}
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
                        displayValue={(template: Template | null) =>
                          template?.name || ''
                        }
                        onChange={(event) =>
                          setTemplateQuery(event.target.value)
                        }
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
              disabled={disabledTemplates || !selectedTemplate}
              unsavedChanges={hasUnsavedChanges}
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
      <ScriptDialogs
        activeScriptEdit={activeScriptEdit}
        setActiveScriptEdit={setActiveScriptEdit}
        selectedLayerIds={selectedLayerIds}
        setEditableLayers={setEditableLayers}
        editableLayers={editableLayers}
      />
    </form>
  );
}
