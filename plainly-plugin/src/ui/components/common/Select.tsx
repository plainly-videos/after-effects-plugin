import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from '@headlessui/react';
import type { CompositionAeItem } from '@src/ui/types/metadata';
import { CheckIcon, ChevronsUpDownIcon } from 'lucide-react';

export function Select({
  data,
  onChange,
}: {
  data: {
    id: number;
    name: string;
    item: CompositionAeItem;
    label: string;
    selected: boolean;
  }[];
  onChange: React.Dispatch<React.SetStateAction<string | undefined>>;
}) {
  const selected = data.find((d) => d.selected)?.name || '-';

  return (
    <Listbox value={selected} onChange={onChange}>
      <div className="relative mt-1">
        <ListboxButton className="grid w-full cursor-default grid-cols-1 rounded-md bg-white/5 py-2 pr-2 pl-3 text-left text-white outline outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 text-xs">
          <span className="col-start-1 row-start-1 truncate pr-6">
            {selected}
          </span>
          <ChevronsUpDownIcon
            aria-hidden="true"
            className="col-start-1 row-start-1 size-4 self-center justify-self-end text-gray-400 sm:size-4"
          />
        </ListboxButton>

        <ListboxOptions
          transition
          className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-md bg-secondary py-2 text-xs ring-1 shadow-lg ring-black/5 focus:outline-hidden data-leave:transition data-leave:duration-100 data-leave:ease-in data-closed:data-leave:opacity-0"
        >
          {data.map((d) => (
            <ListboxOption
              key="1"
              value={d.name}
              className="group relative cursor-default py-1 pr-9 pl-3 text-white select-none data-focus:bg-indigo-500 data-focus:text-white data-focus:outline-hidden"
            >
              <span className="block truncate font-normal group-data-selected:font-semibold">
                {d.name}
              </span>

              {d.selected && (
                <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-indigo-500 group-not-data-selected:hidden group-data-focus:text-white">
                  <CheckIcon aria-hidden="true" className="size-5" />
                </span>
              )}
            </ListboxOption>
          ))}
        </ListboxOptions>
      </div>
    </Listbox>
  );
}
