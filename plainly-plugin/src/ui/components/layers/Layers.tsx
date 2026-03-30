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
import { isEmpty } from '@src/ui/utils';
import classNames from 'classnames';
import { CheckIcon, ChevronDownIcon, LoaderCircleIcon } from 'lucide-react';
import { useContext, useEffect, useMemo, useState } from 'react';
import { Alert, Button, ExternalLink, InternalLink } from '../common';
import { GlobalContext } from '../context';
import { Description, Label, PageHeading } from '../typography';
import { BulkScriptSelect } from './BulkScriptSelect';
import { FilterLayers } from './FilterLayers';
import { ParametrizedLayers } from './ParametrizedLayers';
import { ScriptDialogs } from './ScriptDialogs';

export function Layers() {
  const { plainlyProject, contextReady } = useContext(GlobalContext) || {};
  const { isLoading, data, refetch, isRefetching } = useGetProjectDetails(
    plainlyProject?.id,
  );
  const { notifyError, notifySuccess } = useNotifications();

  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Template | null>(null);

  const [parameterQuery, setParameterQuery] = useState('');
  const [layerType, setLayerType] = useState<LayerType | 'All'>('All');

  const [editableLayers, setEditableLayers] = useState<Layer[]>([]);
  const [selectedLayerIds, setSelectedLayerIds] = useState<Set<string>>(
    new Set(),
  );
  const [activeScriptEdit, setActiveScriptEdit] =
    useState<ScriptEditState<EditableScript>>(null);

  useEffect(() => {
    setEditableLayers(selected?.layers || []);
    setSelectedLayerIds(new Set());
    setLayerType('All');
  }, [selected]);

  const { isPending, mutateAsync: editTemplate } = useEditTemplate();

  const templates = data?.templates || [];
  const filteredTemplates = useMemo(
    () =>
      query === ''
        ? templates
        : templates.filter((template) =>
            template.name.toLowerCase().includes(query.toLowerCase()),
          ),
    [query, templates],
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!plainlyProject?.id || !selected) return;

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
        templateId: selected.id,
        data: {
          layers: cleanedLayers,
          name: selected.name,
          renderingComposition: selected.renderingComposition,
          renderingCompositionId: selected.renderingCompositionId,
        },
      });
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
          <PageHeading heading="Layers" />
          {loading && (
            <LoaderCircleIcon className="animate-spin shrink-0 size-4 text-white" />
          )}
        </div>
        <Description className="mt-1">
          Here you can find the list of layers used in your templates. You can
          edit them and their values here, scripts are editable also.
        </Description>
      </div>

      {!data && !loading && (
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
      )}

      {data && isEmpty(templates) && !loading && (
        <Alert
          title={
            <p>
              No templates found in the project. Please create a template first
              to be able to edit layers. You can create templates in the{' '}
              <ExternalLink
                to={`${platformBaseUrl}/dashboard/projects/${data?.id}`}
                text="Plainly platform"
              />
              .
            </p>
          }
          type="info"
          className="mb-1"
        />
      )}

      <div className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-6">
        <div className="col-span-full">
          <Label label="Template" required />
          <Description className="mb-1">
            Select a template to view and edit its layers. You can only edit
            layers of one template at a time. Changes are not saved until you
            hit the <strong>Save changes</strong> button.
          </Description>
          <Combobox
            disabled={disabledTemplates}
            value={selected}
            onChange={(value) => setSelected(value)}
            onClose={() => setQuery('')}
          >
            <div className="relative w-full">
              <ComboboxInput
                className="w-full rounded-md border-none bg-white/5 py-1 pr-8 pl-3 text-xs text-white outline outline-1 -outline-offset-1 outline-white/10 focus:outline focus:-outline-offset-2 focus:outline-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                displayValue={(template: Template | null) =>
                  template?.name || ''
                }
                onChange={(event) => setQuery(event.target.value)}
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
                      template.id === selected?.id ? 'visible' : 'invisible',
                    )}
                  />
                  <div className="text-xs text-white">{template.name}</div>
                </ComboboxOption>
              ))}
            </ComboboxOptions>
          </Combobox>
        </div>
        <BulkScriptSelect
          selectedLayerIds={selectedLayerIds}
          onEditScript={setActiveScriptEdit}
          setEditableLayers={setEditableLayers}
        />
        <FilterLayers
          parameterQuery={parameterQuery}
          setParameterQuery={setParameterQuery}
          layerType={layerType}
          setLayerType={setLayerType}
        />
        <ParametrizedLayers
          editableLayers={editableLayers}
          setEditableLayers={setEditableLayers}
          parameterQuery={parameterQuery}
          layerType={layerType}
          selectedLayerIds={selectedLayerIds}
          setSelectedLayerIds={setSelectedLayerIds}
          onEditScript={setActiveScriptEdit}
        />
      </div>
      <div className="float-right flex gap-2">
        <Button
          secondary
          onClick={() => refetch()}
          disabled={loading}
          type="button"
        >
          Reload templates
        </Button>
        <Button loading={isPending} disabled={loading}>
          Save changes
        </Button>
      </div>
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
