import {
  Combobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
} from '@headlessui/react';
import { AeScriptsApi } from '@src/node/bridge/AeScriptsApi';
import { useNotifications } from '@src/ui/hooks';
import type { ShiftInScript, ShiftOutScript } from '@src/ui/types/template';
import { ScriptType } from '@src/ui/types/template';
import classNames from 'classnames';
import {
  CheckIcon,
  ChevronDownIcon,
  LogInIcon,
  LogOutIcon,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Description, Label } from '../typography';
import { ScriptDialogShell } from './ScriptDialogShell';

type ShiftScript = ShiftInScript | ShiftOutScript;

export function ShiftScriptDialog({
  script,
  compId,
  currentLayerName,
  open,
  setOpen,
  action,
}: {
  script: ShiftScript;
  compId: number | undefined;
  currentLayerName: string | undefined;
  open: boolean;
  setOpen: (open: boolean) => void;
  action: (script: ShiftScript) => void;
}) {
  const { notifyError } = useNotifications();
  const isShiftIn = script.scriptType === ScriptType.SHIFT_IN;

  const { shiftTarget, shiftsTo, shiftOverlap } = script;

  const [target, setTarget] = useState(shiftTarget);
  const [to, setTo] = useState(shiftsTo);
  const [overlap, setOverlap] = useState(shiftOverlap);
  const [query, setQuery] = useState('');
  const [layerNames, setLayerNames] = useState<string[]>([]);

  useEffect(() => {
    if (!open || !compId) return;

    const fetchLayerNames = async () => {
      try {
        const names = await AeScriptsApi.getLayerNamesByComp(compId);
        setLayerNames(names.filter((n) => n !== currentLayerName));
      } catch (error) {
        console.error('Failed to fetch layer names:', error);
        notifyError('Failed to fetch layer names.');
      }
    };

    fetchLayerNames();
  }, [open, compId, currentLayerName, notifyError]);

  const filteredNames = useMemo(
    () =>
      query === ''
        ? layerNames
        : layerNames.filter((n) =>
            n.toLowerCase().includes(query.toLowerCase()),
          ),
    [query, layerNames],
  );

  const idPrefix = isShiftIn ? 'shift-in' : 'shift-out';

  const handleSave = () => {
    action({
      scriptType: script.scriptType,
      shiftTarget: target,
      shiftsTo: to,
      shiftOverlap: overlap,
    } as ShiftScript);
    setOpen(false);
  };

  return (
    <ScriptDialogShell
      open={open}
      setOpen={setOpen}
      icon={
        isShiftIn ? (
          <LogInIcon className="size-4 text-white" />
        ) : (
          <LogOutIcon className="size-4 text-white" />
        )
      }
      title={isShiftIn ? 'Shift in' : 'Shift out'}
      description={
        isShiftIn
          ? 'Shifts the start of a layer based on the duration of another layer in the same composition.'
          : 'Shifts the end of a layer based on the duration of another layer in the same composition.'
      }
      onSave={handleSave}
      saveDisabled={!target}
    >
      <div>
        <Label htmlFor={`${idPrefix}-target`} label="Shift target" />
        <Description className="mb-1">
          Name of the layer that is a shift target.
        </Description>
        <Combobox
          value={target}
          onChange={(v) => setTarget(v ?? '')}
          onClose={() => setQuery('')}
        >
          <div className="relative w-full">
            <ComboboxInput
              id={`${idPrefix}-target`}
              className="w-full rounded-md border-none bg-white/5 py-1 pr-8 pl-3 text-xs text-white outline outline-1 -outline-offset-1 outline-white/10 focus:outline focus:-outline-offset-2 focus:outline-indigo-500"
              displayValue={(v: string) => v}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Select a layer…"
            />
            <ComboboxButton className="absolute inset-y-0 right-0 px-2.5">
              <ChevronDownIcon className="size-4 shrink-0 text-gray-400" />
            </ComboboxButton>
          </div>
          <ComboboxOptions
            anchor="bottom"
            transition
            className={classNames(
              'min-w-[--input-width] rounded-md border border-white/5 bg-secondary p-1 mt-1 empty:invisible z-50',
              'transition duration-100 ease-in',
            )}
          >
            {filteredNames.map((name) => (
              <ComboboxOption
                key={name}
                value={name}
                className="flex cursor-default items-center gap-1 rounded-md px-3 py-1 select-none focus:bg-white/10 hover:bg-white/10 text-xs"
              >
                <CheckIcon
                  className={classNames(
                    'size-3 shrink-0 text-white',
                    name === target ? 'visible' : 'invisible',
                  )}
                />
                <span className="text-xs text-white">{name}</span>
              </ComboboxOption>
            ))}
          </ComboboxOptions>
        </Combobox>
      </div>
      <div>
        <Label label="Shifts to" htmlFor={`${idPrefix}-to`} />
        <Description className="mb-1">
          {isShiftIn
            ? 'Where to shift this layer in-point (start).'
            : 'Where to shift this layer out-point (end).'}
        </Description>
        <Combobox
          value={to}
          onChange={(v) => setTo(v ?? 'in-point')}
          onClose={() => setQuery('')}
        >
          <div className="relative w-full">
            <ComboboxInput
              id={`${idPrefix}-to`}
              className="w-full rounded-md border-none bg-white/5 py-1 pr-8 pl-3 text-xs text-white outline outline-1 -outline-offset-1 outline-white/10 focus:outline focus:-outline-offset-2 focus:outline-indigo-500"
              displayValue={(v: string) =>
                v === 'in-point'
                  ? 'Target layer start (in-point)'
                  : v === 'out-point'
                    ? 'Target layer end (out-point)'
                    : v
              }
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Select option…"
            />
            <ComboboxButton className="absolute inset-y-0 right-0 px-2.5">
              <ChevronDownIcon className="size-4 shrink-0 text-gray-400" />
            </ComboboxButton>
          </div>
          <ComboboxOptions
            anchor="bottom"
            transition
            className={classNames(
              'min-w-[--input-width] rounded-md border border-white/5 bg-secondary p-1 mt-1 empty:invisible z-50',
              'transition duration-100 ease-in',
            )}
          >
            {['in-point', 'out-point'].map((option) => (
              <ComboboxOption
                key={option}
                value={option}
                className="flex cursor-default items-center gap-1 rounded-md px-3 py-1 select-none focus:bg-white/10 hover:bg-white/10 text-xs"
              >
                <CheckIcon
                  className={classNames(
                    'size-3 shrink-0 text-white',
                    option === to ? 'visible' : 'invisible',
                  )}
                />
                <span className="text-xs text-white">
                  {option === 'in-point'
                    ? 'Target layer start (in-point)'
                    : 'Target layer end (out-point)'}
                </span>
              </ComboboxOption>
            ))}
          </ComboboxOptions>
        </Combobox>
      </div>
      <div>
        <Label htmlFor={`${idPrefix}-overlap`} label="Shift overlap" />
        <Description className="mb-1">
          The overlap of this layer and the target layer in frames.
        </Description>
        <input
          id={`${idPrefix}-overlap`}
          type="number"
          value={overlap}
          onChange={(e) => setOverlap(Number(e.target.value))}
          className="w-full rounded-md border-none bg-white/5 py-1 px-3 text-xs text-white outline outline-1 -outline-offset-1 outline-white/10 focus:outline focus:-outline-offset-2 focus:outline-indigo-500"
        />
      </div>
    </ScriptDialogShell>
  );
}
