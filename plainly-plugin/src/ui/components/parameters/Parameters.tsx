import {
  Combobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
} from '@headlessui/react';
import { useGetProjectDetails } from '@src/ui/hooks';
import type { Template } from '@src/ui/types/project';
import classNames from 'classnames';
import { CheckIcon, ChevronDownIcon, LoaderCircleIcon } from 'lucide-react';
import { useContext, useState } from 'react';
import { GlobalContext } from '../context';
import { Description, Label, PageHeading } from '../typography';

export function Parameters() {
  const { plainlyProject } = useContext(GlobalContext) || {};
  const { isLoading, data } = useGetProjectDetails(plainlyProject?.id);

  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Template | null>(null);

  const templates = data?.templates || [];
  const filteredTemplates =
    query === ''
      ? templates
      : templates.filter((template) =>
          template.name.toLowerCase().includes(query.toLowerCase()),
        );

  const layers = selected?.layers || [];

  return (
    <div className="space-y-4 w-full text-white">
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
        <Combobox
          value={selected}
          onChange={(value) => setSelected(value)}
          onClose={() => setQuery('')}
        >
          <div className="relative col-span-full">
            <ComboboxInput
              className="w-full rounded-md border-none bg-white/5 py-1 pr-8 pl-3 text-xs text-white outline outline-1 -outline-offset-1 outline-white/10 focus:outline focus:-outline-offset-2 focus:outline-indigo-500"
              displayValue={(template: Template | null) => template?.name || ''}
              onChange={(event) => setQuery(event.target.value)}
            />
            <ComboboxButton className="group absolute inset-y-0 right-0 px-2.5">
              <ChevronDownIcon className="size-4 shrink-0 text-gray-400 group-hover:text-white duration-200" />
            </ComboboxButton>
          </div>

          <ComboboxOptions
            anchor="bottom"
            transition
            className={classNames(
              'w-(--input-width) rounded-xl border border-white/5 bg-secondary p-1 mt-1 empty:invisible',
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

        <div className="col-span-full">
          <Label label="Parameters" />
          <ul className="divide-y divide-white/10 overflow-auto w-full rounded-md border border-white/5 bg-secondary">
            {layers.map((layer) => (
              <div key={layer.internalId} className="min-w-fit w-full">
                <div className="flex w-full divide-x divide-white/10">
                  <div className="flex-1 p-2">
                    <Label label="Parametrization" />
                    <div className="flex flex-col text-xs">
                      <Label label={layer.layerName} />
                      <span className="prose prose-xs text-gray-400">
                        <code>{layer.parametrization.value}</code>
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 p-2">
                    <Label label="Scripts" />
                  </div>
                </div>
              </div>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
