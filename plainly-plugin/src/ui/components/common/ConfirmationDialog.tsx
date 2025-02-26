import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from '@headlessui/react';
import { State, useGlobalState } from '@src/ui/state/store';
import classNames from 'classnames';
import { TriangleAlertIcon } from 'lucide-react';
import Description from '../typography/Description';
import Button from './Button';

export function ConfirmationDialog({
  open,
  setOpen,
  action,
}: { open: boolean; setOpen: (open: boolean) => void; action: () => void }) {
  const [settings] = useGlobalState(State.SETTINGS);
  const sidebarOpen = settings.sidebarOpen;

  return (
    <Dialog open={open} onClose={setOpen} className="relative">
      <DialogBackdrop
        transition
        className="fixed inset-0 backdrop-blur-md transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
      />

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <DialogPanel
            transition
            className={classNames(
              'relative transform overflow-hidden rounded-lg bg-[rgb(29,29,30)] px-4 pb-4 pt-5 text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-lg sm:p-6 data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95 border border-white/10',
              sidebarOpen ? 'ml-[3.75rem] xs:ml-48' : 'ml-[3.75rem]',
            )}
          >
            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex size-10 shrink-0 items-center justify-center sm:mx-0 sm:size-8">
                <TriangleAlertIcon
                  aria-hidden="true"
                  className="size-6 text-red-400"
                />
              </div>
              <div className="mt-2 text-center sm:ml-4 sm:mt-0 sm:text-left">
                <DialogTitle
                  as="h3"
                  className="text-sm font-semibold text-white"
                >
                  Relinking local project
                </DialogTitle>
                <div className="mt-1">
                  <Description>
                    Working project is already linked to a project on the
                    platform. Are you sure you want to relink this project to
                    another project?
                  </Description>
                </div>
              </div>
            </div>
            <div className="mt-4 sm:mt-3 sm:flex sm:flex-row-reverse">
              <Button
                type="button"
                onClick={() => {
                  action();
                  setOpen(false);
                }}
                className="inline-flex w-full sm:w-auto justify-center sm:ml-2"
              >
                Link
              </Button>
              <Button
                type="button"
                onClick={() => setOpen(false)}
                secondary
                className="inline-flex mt-2 sm:mt-0 w-full sm:w-auto justify-center"
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
