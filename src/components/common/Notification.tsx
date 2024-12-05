import { Transition } from '@headlessui/react';
import { CircleCheckBigIcon, XIcon } from 'lucide-react';
import { useState } from 'react';

export default function Notification({
  title,
  type,
  description,
}: { title: string; type: 'success' | 'error'; description?: string }) {
  const [show, setShow] = useState(true);

  return (
    <>
      {/* Global notification live region, render this permanently at the end of the document */}
      <div
        aria-live="assertive"
        className="pointer-events-none fixed inset-0 flex items-end px-4 py-6 sm:items-start sm:p-6"
      >
        <div className="flex w-full flex-col items-center space-y-4 sm:items-end">
          {/* Notification panel, dynamically insert this into the live region when it needs to be displayed */}
          <Transition show={show}>
            <div className="pointer-events-auto w-full bg-[rgb(29,29,30)] max-w-sm overflow-hidden rounded-lg shadow-lg ring-1 ring-white/20 transition data-[closed]:data-[enter]:translate-y-2 data-[enter]:transform data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-100 data-[enter]:ease-out data-[leave]:ease-in data-[closed]:data-[enter]:sm:translate-x-2 data-[closed]:data-[enter]:sm:translate-y-0">
              <div className="p-4">
                <div className="flex items-start">
                  <div className="shrink-0">
                    {type === 'success' && (
                      <CircleCheckBigIcon
                        aria-hidden="true"
                        className="size-6 text-green-400"
                      />
                    )}
                    {type === 'error' && (
                      <XIcon
                        aria-hidden="true"
                        className="size-6 text-red-400"
                      />
                    )}
                  </div>
                  <div className="ml-3 w-0 flex-1 pt-0.5">
                    <p className="text-sm font-medium text-white">{title}</p>
                    {description && (
                      <p className="mt-1 text-sm text-gray-400">
                        {description}
                      </p>
                    )}
                  </div>
                  <div className="ml-4 flex shrink-0">
                    <button
                      type="button"
                      onClick={() => setShow(false)}
                      className="inline-flex rounded-md bg-white/10 text-white hover:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                      <span className="sr-only">Close</span>
                      <XIcon aria-hidden="true" className="size-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </>
  );
}
