import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from '@headlessui/react';
import { State, useGlobalState } from '@src/ui/state/store';
import classNames from 'classnames';
import { Button } from '../common';
import { Description } from '../typography';
import { PREMADE_SCRIPT_REGISTRY } from './scriptRegistry';

export function PremadeScriptsDialog({
  open,
  setOpen,
  onSelect,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  onSelect: (scriptId: string) => void;
}) {
  const [settings] = useGlobalState(State.SETTINGS);
  const sidebarOpen = settings.sidebarOpen;

  const visibleOptions = Object.keys(PREMADE_SCRIPT_REGISTRY).map((id) => ({
    id,
    ...PREMADE_SCRIPT_REGISTRY[id],
  }));

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
              Add script
            </DialogTitle>
            <Description>Select a script to add to this layer.</Description>
            <ul className="mt-4 flex flex-col gap-1">
              {visibleOptions.map(({ id, label, description, icon: Icon }) => (
                <li key={id}>
                  <button
                    type="button"
                    onClick={() => {
                      onSelect(id);
                      setOpen(false);
                    }}
                    className="w-full flex items-start gap-3 rounded-md px-3 py-2 text-left hover:bg-white/5"
                  >
                    <div className="size-8 bg-indigo-500 rounded-md flex shrink-0 items-center justify-center">
                      <Icon className="size-4 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-white">{label}</p>
                      <p className="text-2xs text-gray-400">{description}</p>
                    </div>
                  </button>
                </li>
              ))}
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
