import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from '@headlessui/react';
import { State, useGlobalState } from '@src/ui/state/store';
import type { ShiftInScript } from '@src/ui/types/template';
import classNames from 'classnames';
import { LogInIcon } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../common';
import { Description } from '../typography';

export function ShiftInScriptDialog({
  shiftInScript,
  open,
  setOpen,
  action,
}: {
  shiftInScript: ShiftInScript;
  open: boolean;
  setOpen: (open: boolean) => void;
  action: (script: ShiftInScript) => void;
}) {
  const [settings] = useGlobalState(State.SETTINGS);
  const sidebarOpen = settings.sidebarOpen;

  const { shiftTarget, shiftsTo, shiftOverlap } = shiftInScript;

  const [target, _setTarget] = useState(shiftTarget);
  const [to, _setTo] = useState(shiftsTo);
  const [overlap, _setOverlap] = useState(shiftOverlap);

  const handleSave = () => {
    action({
      scriptType: shiftInScript.scriptType,
      shiftTarget: target,
      shiftsTo: to,
      shiftOverlap: overlap,
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onClose={setOpen} className="relative">
      <DialogBackdrop className="fixed inset-0 backdrop-blur-md" />

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <DialogPanel
            className={classNames(
              'overflow-hidden rounded-lg bg-[rgb(29,29,30)] px-4 pb-4 pt-5 text-left sm:my-8 sm:w-full sm:max-w-lg sm:p-6 border border-white/10',
              sidebarOpen ? 'ml-[3.75rem] xs:ml-36' : 'ml-[3.75rem]',
            )}
          >
            <div className="flex flex-col gap-4">
              <div className="flex items-start gap-2">
                <div className="size-8 bg-indigo-500 rounded-md flex items-center justify-center">
                  <LogInIcon className="size-4 text-white" />
                </div>
                <div>
                  <DialogTitle
                    as="h3"
                    className="text-sm font-semibold text-white"
                  >
                    Shift in script
                  </DialogTitle>
                  <Description>
                    Shifts the start of a layer based on the duration of another
                    layer in the same composition.
                  </Description>
                </div>
              </div>
            </div>
            <div className="mt-4 sm:mt-3 sm:flex sm:flex-row-reverse">
              <Button
                type="button"
                onClick={handleSave}
                disabled={false}
                className="inline-flex w-full sm:w-auto justify-center sm:ml-2"
              >
                Save
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
