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
import {
  type CropScript,
  type Layer,
  type LayerType,
  ScriptType,
  type Template,
  type TextAutoScaleScript,
} from '@src/ui/types/template';
import classNames from 'classnames';
import { CheckIcon, ChevronDownIcon, LoaderCircleIcon } from 'lucide-react';
import { useContext, useEffect, useState } from 'react';
import { Button } from '../common';
import { GlobalContext } from '../context';
import { Description, Label, PageHeading } from '../typography';
import { BulkScriptSelect } from './BulkScriptSelect';
import { CropScriptDialog } from './CropScriptDialog';
import { FilterLayers } from './FilterLayers';
import { ParametrizedLayers } from './ParametrizedLayers';
import { ScriptsDialog } from './ScriptsDialog';

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
  const [scriptsDialogLayerId, setScriptsDialogLayerId] = useState<
    string | null
  >(null);
  const [activeCropEdit, setActiveCropEdit] = useState<{
    layerInternalId: string;
    script: CropScript;
    isNew: boolean;
    isBulk: boolean;
  } | null>(null);

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

  const handleCropBadgeClick = (
    layerInternalId: string,
    script: CropScript,
  ) => {
    setActiveCropEdit({ layerInternalId, script, isNew: false, isBulk: false });
  };

  const handleScriptSelect = (type: ScriptType) => {
    if (!scriptsDialogLayerId) return;
    if (type === ScriptType.CROP) {
      setActiveCropEdit({
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
    if (type === ScriptType.TEXT_AUTO_SCALE) {
      // If the user selects auto scale text, we immediately add the script with default values, no need for a dialog
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
  };

  const handleScriptRemove = (layerInternalId: string, type: ScriptType) => {
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
  };

  const handleCropScriptSave = (updatedScript: CropScript) => {
    if (!activeCropEdit) return;
    if (activeCropEdit.isBulk) {
      setEditableLayers((prev) =>
        prev.map((layer) => {
          if (!selectedLayerIds.has(layer.internalId)) return layer;
          const existingScripts = layer.scripting?.scripts || [];
          const hasCrop = existingScripts.some(
            (s) => s.scriptType === ScriptType.CROP,
          );
          const scripts = hasCrop
            ? existingScripts.map((s) =>
                s.scriptType === ScriptType.CROP ? updatedScript : s,
              )
            : [...existingScripts, updatedScript];
          return { ...layer, scripting: { ...layer.scripting, scripts } };
        }),
      );
    } else {
      setEditableLayers((prev) =>
        prev.map((layer) => {
          if (layer.internalId !== activeCropEdit.layerInternalId) return layer;
          const existingScripts = layer.scripting?.scripts || [];
          const scripts = activeCropEdit.isNew
            ? [...existingScripts, updatedScript]
            : existingScripts.map((s) =>
                s.scriptType === ScriptType.CROP ? updatedScript : s,
              );
          return { ...layer, scripting: { ...layer.scripting, scripts } };
        }),
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!plainlyProject?.id || !selected) return;

    try {
      await editTemplate({
        projectId: plainlyProject.id,
        templateId: selected.id,
        data: {
          layers: editableLayers,
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
          setActiveCropEdit={setActiveCropEdit}
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
          parameterQuery={parameterQuery}
          layerType={layerType}
          selectedLayerIds={selectedLayerIds}
          setSelectedLayerIds={setSelectedLayerIds}
          setScriptsDialogLayerId={setScriptsDialogLayerId}
          handleCropBadgeClick={handleCropBadgeClick}
          handleScriptRemove={handleScriptRemove}
        />
      </div>
      <Button
        className="float-right"
        loading={isPending}
        disabled={isPending || isLoading}
      >
        Save changes
      </Button>
      <ScriptsDialog
        open={scriptsDialogLayerId !== null}
        setOpen={(open) => !open && setScriptsDialogLayerId(null)}
        onSelect={handleScriptSelect}
      />
      <CropScriptDialog
        key={activeCropEdit?.layerInternalId}
        cropScript={
          activeCropEdit?.script ?? {
            scriptType: ScriptType.CROP,
            compEndsAtOutPoint: false,
            compStartsAtInPoint: false,
          }
        }
        open={activeCropEdit !== null}
        setOpen={(open) => !open && setActiveCropEdit(null)}
        action={handleCropScriptSave}
      />
    </form>
  );
}
