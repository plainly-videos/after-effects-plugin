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
  ScriptType,
  type Template,
} from '@src/ui/types/template';
import classNames from 'classnames';
import {
  CheckIcon,
  ChevronDownIcon,
  EditIcon,
  LoaderCircleIcon,
  PlusIcon,
} from 'lucide-react';
import { useContext, useEffect, useRef, useState } from 'react';
import { Badge, Button } from '../common';
import { GlobalContext } from '../context';
import { Description, Label, PageHeading } from '../typography';
import { CropScriptDialog } from './CropScriptDialog';
import { ScriptsDialog } from './ScriptsDialog';

const scriptName = (type: ScriptType) => {
  if (type === ScriptType.CROP) return 'Crop';
  if (type === ScriptType.MEDIA_AUTO_SCALE) return 'Media auto scale';
  if (type === ScriptType.TEXT_AUTO_SCALE) return 'Text auto scale';
  if (type === ScriptType.SHIFT_IN) return 'Shift in';
  if (type === ScriptType.SHIFT_OUT) return 'Shift out';
  return type;
};

function SelectAllCheckbox({
  layers,
  selectedLayerIds,
  setSelectedLayerIds,
}: {
  layers: Layer[];
  selectedLayerIds: Set<string>;
  setSelectedLayerIds: React.Dispatch<React.SetStateAction<Set<string>>>;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const allSelected =
    layers.length > 0 &&
    layers.every((l) => selectedLayerIds.has(l.internalId));
  const someSelected =
    !allSelected && layers.some((l) => selectedLayerIds.has(l.internalId));

  useEffect(() => {
    if (ref.current) ref.current.indeterminate = someSelected;
  }, [someSelected]);

  return (
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
    />
  );
}

export function Parameters() {
  const { plainlyProject } = useContext(GlobalContext) || {};
  const { isLoading, data } = useGetProjectDetails(plainlyProject?.id);
  const { notifyError, notifySuccess } = useNotifications();

  const [query, setQuery] = useState('');
  const [layerTypeFilter, setLayerTypeFilter] = useState<
    Layer['layerType'] | ''
  >('');
  const [selected, setSelected] = useState<Template | null>(null);
  const [parameterQuery, setParameterQuery] = useState('');
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
    setLayerTypeFilter('');
  }, [selected]);

  const { isPending, mutateAsync: editTemplate } = useEditTemplate();

  const templates = data?.templates || [];
  const filteredTemplates =
    query === ''
      ? templates
      : templates.filter((template) =>
          template.name.toLowerCase().includes(query.toLowerCase()),
        );

  const layers = editableLayers.filter(
    (layer) =>
      layer.parametrization?.value
        .toLowerCase()
        .includes(parameterQuery.toLowerCase()) &&
      (layerTypeFilter === '' || layer.layerType === layerTypeFilter),
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

        <div className="col-span-full">
          <Label label="Bulk add new scripts" />
          <Description className="mt-1">
            Select multiple layers from the parametrized layers list and add
            scripts to them in bulk.
          </Description>
          <Badge
            label="Crop"
            action={() =>
              setActiveCropEdit({
                layerInternalId: '',
                script: {
                  scriptType: ScriptType.CROP,
                  compEndsAtOutPoint: false,
                  compStartsAtInPoint: false,
                },
                isNew: true,
                isBulk: true,
              })
            }
            disabled={selectedLayerIds.size === 0}
          />
        </div>

        <div className="col-span-full">
          <Label label="Filter layers" />
          <input
            id="parameter-search"
            name="parameter-search"
            type="text"
            className="col-start-1 row-start-1 block w-full rounded-md border-none bg-white/5 px-3 py-1 text-xs text-white outline outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500"
            placeholder="Type parameter name..."
            value={parameterQuery}
            onChange={(e) => setParameterQuery(e.target.value)}
          />
          <div className="flex flex-wrap gap-1 mt-1">
            {(
              [
                ['', 'All'],
                ['COMPOSITION', 'Composition'],
                ['DATA', 'Data'],
                ['DATA_EFFECT', 'Data effect'],
                ['MEDIA', 'Media'],
                ['SOLID_COLOR', 'Solid color'],
              ] as [Layer['layerType'] | '', string][]
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setLayerTypeFilter(value)}
                className={classNames(
                  'rounded px-2 py-0.5 text-xs transition-colors duration-150',
                  layerTypeFilter === value
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white',
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="col-span-full">
          <Label label="Parametrized layers" />
          <ul className="divide-y divide-white/10 overflow-auto w-full rounded-md border border-white/5 bg-secondary">
            <li className="grid grid-cols-2 w-full text-xs divide-x divide-white/10 divide-dashed">
              <div className="py-1 px-3 flex items-center gap-2">
                <SelectAllCheckbox
                  layers={layers}
                  selectedLayerIds={selectedLayerIds}
                  setSelectedLayerIds={setSelectedLayerIds}
                />
                <Label label="Parametrization" />
              </div>
              <Label label="Scripting" className="py-1 px-3" />
            </li>
            {layers.map((layer) => (
              <div key={layer.internalId} className="min-w-fit w-full">
                <div className="grid grid-cols-2 w-full divide-x divide-white/10 divide-dashed">
                  <div className="min-w-0 px-3 py-1 relative flex items-start gap-2">
                    <input
                      type="checkbox"
                      className="appearance-none rounded border border-white/10 bg-white/5 checked:border-indigo-600 checked:bg-indigo-600 indeterminate:border-indigo-600 indeterminate:bg-indigo-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-white/10 disabled:bg-transparent forced-colors:appearance-auto"
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
                    <button
                      onClick={() => {}}
                      className="absolute right-3 top-1 size-5 flex items-center justify-center cursor-pointer disabled:cursor-not-allowed group rounded-sm bg-primary hover:bg-secondary hover:text-gray-400 disabled:opacity-50 disabled:pointer-events-none"
                      type="button"
                      disabled={true}
                    >
                      <EditIcon className="size-3" />
                    </button>
                    <div className="flex flex-col text-xs pr-5 min-w-0">
                      <Label
                        label={layer.layerName}
                        className="truncate text-xs leading-4"
                      />
                      <code className="truncate text-gray-400 text-2xs">
                        {layer.parametrization?.value}
                      </code>
                    </div>
                  </div>
                  <div className="min-w-0 px-3 py-1 relative">
                    <button
                      onClick={() => setScriptsDialogLayerId(layer.internalId)}
                      className="absolute right-3 top-1 size-5 flex items-center justify-center cursor-pointer disabled:cursor-not-allowed group rounded-sm bg-primary hover:bg-secondary hover:text-gray-400"
                      type="button"
                    >
                      <PlusIcon className="size-3" />
                    </button>
                    <div className="flex flex-wrap text-xs gap-1 pr-5">
                      {layer.scripting?.scripts.map((script) => (
                        <div key={script.scriptType}>
                          <Badge
                            label={scriptName(script.scriptType)}
                            action={
                              script.scriptType === ScriptType.CROP
                                ? () =>
                                    handleCropBadgeClick(
                                      layer.internalId,
                                      script as CropScript,
                                    )
                                : () => {}
                            }
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </ul>
        </div>
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
