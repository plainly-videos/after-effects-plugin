import {
  Combobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
} from '@headlessui/react';
import { useEditTemplate, useGetProjectDetails } from '@src/ui/hooks';
import { ScriptType, type Template } from '@src/ui/types/project';
import classNames from 'classnames';
import {
  CheckIcon,
  ChevronDownIcon,
  EditIcon,
  LoaderCircleIcon,
  PlusIcon,
} from 'lucide-react';
import { useContext, useState } from 'react';
import { Badge, Button } from '../common';
import { GlobalContext } from '../context';
import { Description, Label, PageHeading } from '../typography';

const scriptName = (type: ScriptType) => {
  if (type === ScriptType.CROP) return 'Crop';
  if (type === ScriptType.MEDIA_AUTO_SCALE) return 'Media auto scale';
  if (type === ScriptType.TEXT_AUTO_SCALE) return 'Text auto scale';
  if (type === ScriptType.SHIFT_IN) return 'Shift in';
  if (type === ScriptType.SHIFT_OUT) return 'Shift out';
  return type;
};

export function Parameters() {
  const { plainlyProject } = useContext(GlobalContext) || {};
  const { isLoading, data } = useGetProjectDetails(plainlyProject?.id);

  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Template | null>(null);

  const { isPending, mutateAsync: _editTemplate } = useEditTemplate();

  const templates = data?.templates || [];
  const filteredTemplates =
    query === ''
      ? templates
      : templates.filter((template) =>
          template.name.toLowerCase().includes(query.toLowerCase()),
        );

  const layers = selected?.layers || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
    } catch (_error) {}
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
                'min-w-[--input-width] rounded-xl border border-white/5 bg-secondary p-1 mt-1 empty:invisible',
                'transition duration-100 ease-in',
              )}
            >
              {filteredTemplates.map((template) => (
                <ComboboxOption
                  key={template.id}
                  value={template}
                  className="flex cursor-default items-center gap-2 rounded-md px-3 py-1 select-none focus:bg-white/10 hover:bg-white/10 text-xs"
                >
                  <CheckIcon
                    className={classNames(
                      'size-4 shrink-0 text-white',
                      template.id === selected?.id ? 'visible' : 'invisible',
                    )}
                  />
                  <div className="text-sm/6 text-white">{template.name}</div>
                </ComboboxOption>
              ))}
            </ComboboxOptions>
          </Combobox>
        </div>

        <div className="col-span-full">
          <Label label="Parametrized layers" />
          <ul className="divide-y divide-white/10 overflow-auto w-full rounded-md border border-white/5 bg-secondary">
            <li className="grid grid-cols-2 w-full text-xs divide-x divide-white/10 divide-dashed">
              <Label label="Parametrization" className="py-1 px-3" />
              <Label label="Scripting" className="py-1 px-3" />
            </li>
            {layers.map((layer) => (
              <div key={layer.internalId} className="min-w-fit w-full">
                <div className="grid grid-cols-2 w-full divide-x divide-white/10 divide-dashed">
                  <div className="min-w-0 px-3 py-1 relative">
                    <button
                      onClick={() => {}}
                      className="absolute right-3 top-1 size-5 flex items-center justify-center cursor-pointer disabled:cursor-not-allowed group rounded-sm bg-primary hover:bg-secondary hover:text-gray-400"
                      type="button"
                    >
                      <EditIcon className="size-3" />
                    </button>
                    <div className="flex flex-col text-xs pr-5">
                      <Label label={layer.layerName} className="truncate" />
                      <span className="prose prose-xs text-gray-400 truncate">
                        <code>{layer.parametrization?.value}</code>
                      </span>
                    </div>
                  </div>
                  <div className="min-w-0 px-3 py-1 relative">
                    <button
                      onClick={() => {}}
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
                            action={() => console.log('nothing')}
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
    </form>
  );
}
