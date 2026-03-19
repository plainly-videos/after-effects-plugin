import {
  Combobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
} from '@headlessui/react';
import {
  useEditTemplate,
  useGetProjectDetails,
  useNotifications,
} from '@src/ui/hooks';
import type {
  EditableScript,
  Layer,
  LayerType,
  ScriptEditState,
  Template,
} from '@src/ui/types/template';
import classNames from 'classnames';
import { CheckIcon, ChevronDownIcon, LoaderCircleIcon } from 'lucide-react';
import { useContext, useEffect, useState } from 'react';
import { Button } from '../common';
import { GlobalContext } from '../context';
import { Description, Label, PageHeading } from '../typography';
import { BulkScriptSelect } from './BulkScriptSelect';
import { FilterLayers } from './FilterLayers';
import { ParametrizedLayers } from './ParametrizedLayers';
import { ScriptDialogs } from './ScriptDialogs';

export function Layers() {
  const { plainlyProject } = useContext(GlobalContext) || {};
  const { isLoading, data } = useGetProjectDetails(plainlyProject?.id);
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
  const filteredTemplates =
    query === ''
      ? templates
      : templates.filter((template) =>
          template.name.toLowerCase().includes(query.toLowerCase()),
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

  return (
    <form className="space-y-4 w-full text-white" onSubmit={handleSubmit}>
      <div>
        <div className="flex items-center gap-2">
          <PageHeading heading="Parameters" />
          {isLoading && (
            <LoaderCircleIcon className="animate-spin shrink-0 size-4 text-white" />
          )}
        </div>
        <Description className="mt-1">
          Here you can find the list of parameters used in your templates. You
          can edit them and their values here, scripts are editable also.
        </Description>
      </div>

      <div className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-6">
        <div className="col-span-full">
          <Label label="Template" required />
          <Combobox
            disabled={isLoading || !data}
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
                disabled={isLoading || !data}
              />
              <ComboboxButton
                className="group absolute inset-y-0 right-0 px-2.5 disabled:pointer-events-none"
                disabled={isLoading || !data}
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
          onEditScript={(params) => setActiveScriptEdit(params)}
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
          onEditScript={(params) => setActiveScriptEdit(params)}
        />
      </div>
      <Button
        className="float-right"
        loading={isPending}
        disabled={isPending || isLoading}
      >
        Save changes
      </Button>
      <ScriptDialogs
        activeScriptEdit={activeScriptEdit}
        setActiveScriptEdit={setActiveScriptEdit}
        selectedLayerIds={selectedLayerIds}
        setEditableLayers={setEditableLayers}
      />
    </form>
  );
}
