import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from '@headlessui/react';
import { State, useGlobalState } from '@src/ui/state/store';
import type { ScriptType } from '@src/ui/types/template';
import classNames from 'classnames';
import { Button } from '../common';
import { Description } from '../typography';
import { SCRIPT_REGISTRY } from './scriptRegistry';

export function TimelineScriptsDialog({
  open,
  setOpen,
  selectionCount,
  onSelect,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  selectionCount: number;
  onSelect: (scriptType: ScriptType) => void;
}) {
  const [settings] = useGlobalState(State.SETTINGS);
  const sidebarOpen = settings.sidebarOpen;

  const visibleOptions = (Object.keys(SCRIPT_REGISTRY) as ScriptType[])
    .map((type) => ({ type, ...SCRIPT_REGISTRY[type] }))
    .filter((entry) => entry.isAddable)
    .filter((entry) => (selectionCount >= 2 ? entry.isBulkable : true));

  const title =
    selectionCount > 1
      ? `Add script to ${selectionCount} selected layers`
      : 'Add script to selected layer';
  const description =
    selectionCount > 1
      ? 'Select a script to add to the timeline-selected layers. Layers whose type is not compatible with the chosen script will be skipped.'
      : 'Select a script to add to the timeline-selected layer.';

  return (
    <Dialog open={open} onClose={setOpen} className="relative">
      <DialogBackdrop className="fixed inset-0 z-20 backdrop-blur-md" />

      <div className="fixed inset-0 z-30 w-screen overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <DialogPanel
            className={classNames(
              'overflow-hidden rounded-lg bg-[rgb(29,29,30)] px-4 pb-4 pt-5 text-left sm:my-8 sm:w-full sm:max-w-lg sm:p-6 border border-white/10',
              sidebarOpen
                ? 'ml-[3.75rem] xs:ml-[var(--sidebar-width)]'
                : 'ml-[3.75rem]',
            )}
          >
            <DialogTitle
              as="h3"
              className="text-sm font-semibold text-white mb-1"
            >
              {title}
            </DialogTitle>
            <Description>{description}</Description>
            <ul className="mt-4 flex flex-col gap-1">
              {visibleOptions.map(
                ({ type, label, description: desc, icon: Icon }) => (
                  <li key={type}>
                    <button
                      type="button"
                      onClick={() => {
                        onSelect(type);
                        setOpen(false);
                      }}
                      className="w-full flex items-start gap-3 rounded-md px-3 py-2 text-left hover:bg-white/5"
                    >
                      <div className="size-8 bg-indigo-500 rounded-md flex shrink-0 items-center justify-center">
                        <Icon className="size-4 text-white" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-white">
                          {label}
                        </p>
                        <p className="text-2xs text-gray-400">{desc}</p>
                      </div>
                    </button>
                  </li>
                ),
              )}
            </ul>
            <div className="mt-4 sm:mt-3 sm:flex sm:flex-row-reverse">
              <Button
                type="button"
                onClick={() => setOpen(false)}
                secondary
                className="inline-flex w-full sm:w-auto justify-center"
              >
                Cancel
              </Button>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}
