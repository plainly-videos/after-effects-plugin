import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from '@headlessui/react';
import { State, useGlobalState } from '@src/ui/state/store';
import classNames from 'classnames';
import { Description } from '../typography';
import { Button } from './Button';

export type ChoiceDialogOption = {
  id: string;
  label: string;
  description?: string;
};

export function ChoiceDialog({
  title,
  description,
  options,
  open,
  onSelect,
  onCancel,
}: {
  title: string;
  description?: string;
  options: ChoiceDialogOption[];
  open: boolean;
  onSelect: (id: string) => void;
  onCancel: () => void;
}) {
  const [settings] = useGlobalState(State.SETTINGS);
  const sidebarOpen = settings.sidebarOpen;

  return (
    <Dialog open={open} onClose={onCancel} className="relative">
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
            {description && <Description>{description}</Description>}
            <ul className="mt-4 flex flex-col gap-1">
              {options.map((opt) => (
                <li key={opt.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(opt.id)}
                    className="w-full flex items-start gap-3 rounded-md px-3 py-2 text-left hover:bg-white/5"
                  >
                    <div>
                      <p className="text-xs font-medium text-white">
                        {opt.label}
                      </p>
                      {opt.description && (
                        <p className="text-2xs text-gray-400">
                          {opt.description}
                        </p>
                      )}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
            <div className="mt-4 sm:mt-3 sm:flex sm:flex-row-reverse">
              <Button
                type="button"
                onClick={onCancel}
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
