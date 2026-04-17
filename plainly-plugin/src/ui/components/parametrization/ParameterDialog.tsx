import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from '@headlessui/react';
import { State, useGlobalState } from '@src/ui/state/store';
import type { Layer, Parametrization } from '@src/ui/types/template';
import classNames from 'classnames';
import { useState } from 'react';
import { Button, Checkbox } from '../common';
import { Description, Label } from '../typography';
import { stripHashPrefix } from './utils';

export type ParameterDialogSaveValue = {
  label: string;
  parametrization: Parametrization;
};

const PARAM_NAME_REGEX = /^[A-Za-z][A-Za-z0-9_]*(\.[A-Za-z][A-Za-z0-9_]*)*$/;

export function ParameterDialog({
  open,
  setOpen,
  layer,
  onSave,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  layer?: Layer;
  onSave?: (value: ParameterDialogSaveValue) => void;
}) {
  const [settings] = useGlobalState(State.SETTINGS);
  const sidebarOpen = settings.sidebarOpen;

  const parametrization = layer?.parametrization;
  const { expression, value, defaultValue, mandatory } = parametrization ?? {};

  const [isExpression, setIsExpression] = useState(expression ?? false);
  const [staticValue, setStaticValue] = useState(
    value ? stripHashPrefix(value) : '',
  );
  const [displayName, setDisplayName] = useState(layer?.label ?? '');
  const [parameterName, setParameterName] = useState(
    expression ? (value ?? '') : '',
  );
  const [defaultV, setDefaultV] = useState(defaultValue ?? '');
  const [isMandatory, setIsMandatory] = useState(mandatory ?? false);

  const paramNameInvalid =
    parameterName.length > 0 && !PARAM_NAME_REGEX.test(parameterName);
  const saveDisabled = isExpression && !PARAM_NAME_REGEX.test(parameterName);

  const handleSave = () => {
    if (!layer || !onSave) {
      setOpen(false);
      return;
    }

    const currentParametrization: Parametrization = layer.parametrization ?? {
      expression: false,
      mandatory: false,
      value: '',
    };

    const nextParametrization: Parametrization = isExpression
      ? {
          ...currentParametrization,
          expression: true,
          value: parameterName,
          defaultValue: defaultV,
          mandatory: isMandatory,
        }
      : {
          ...currentParametrization,
          expression: false,
          value: staticValue,
        };

    onSave({
      label: isExpression ? displayName : layer.label,
      parametrization: nextParametrization,
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onClose={setOpen} className="relative">
      <DialogBackdrop className="fixed inset-0 z-20 backdrop-blur-md" />

      <div className="fixed inset-0 z-30 w-screen overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <DialogPanel
            className={classNames(
              'overflow-hidden rounded-lg bg-[rgb(29,29,30)] px-4 pb-4 pt-5 text-left sm:my-8 sm:w-full sm:max-w-lg sm:p-6 border border-white/10',
              sidebarOpen ? 'ml-[3.75rem] xs:ml-36' : 'ml-[3.75rem]',
            )}
          >
            <DialogTitle
              as="h3"
              className="text-sm font-semibold text-white mb-1"
            >
              Edit parameter
            </DialogTitle>
            <Description>Edit the parameter settings here.</Description>
            <div className="mt-4 space-y-4 xs:flex xs:items-center xs:space-x-10 xs:space-y-0">
              <div className="flex items-center">
                <input
                  id="static"
                  name="expression"
                  type="radio"
                  className="relative size-4 appearance-none rounded-full border border-gray-300 bg-[rgb(29,29,30)] before:absolute before:inset-1 before:rounded-full before:bg-white checked:border-indigo-600 checked:bg-indigo-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:before:bg-gray-400 forced-colors:appearance-auto forced-colors:before:hidden [&:not(:checked)]:before:hidden"
                  checked={!isExpression}
                  onChange={() => setIsExpression(false)}
                />
                <label
                  htmlFor="static"
                  className="ml-3 block text-xs text-white"
                >
                  Static
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="dynamic"
                  name="expression"
                  type="radio"
                  className="relative size-4 appearance-none rounded-full border border-gray-300 bg-[rgb(29,29,30)] before:absolute before:inset-1 before:rounded-full before:bg-white checked:border-indigo-600 checked:bg-indigo-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:before:bg-gray-400 forced-colors:appearance-auto forced-colors:before:hidden [&:not(:checked)]:before:hidden"
                  checked={isExpression}
                  onChange={() => setIsExpression(true)}
                />
                <label
                  htmlFor="dynamic"
                  className="ml-3 block text-xs text-white"
                >
                  Dynamic
                </label>
              </div>
            </div>
            {isExpression ? (
              <DynamicParameterSettings
                displayName={displayName}
                setDisplayName={setDisplayName}
                param={parameterName}
                setParam={setParameterName}
                paramInvalid={paramNameInvalid}
                defaultV={defaultV}
                setDefaultV={setDefaultV}
                isMandatory={isMandatory}
                setIsMandatory={setIsMandatory}
              />
            ) : (
              <StaticParameterSettings
                value={staticValue}
                setValue={setStaticValue}
              />
            )}
            <div className="mt-4 sm:mt-3 sm:flex sm:flex-row-reverse">
              <Button
                type="button"
                onClick={handleSave}
                disabled={saveDisabled}
                className="inline-flex w-full sm:w-auto justify-center"
              >
                Save
              </Button>
              <Button
                type="button"
                onClick={() => setOpen(false)}
                secondary
                className="inline-flex w-full sm:w-auto justify-center sm:mr-2"
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

function StaticParameterSettings({
  value,
  setValue,
}: {
  value: string;
  setValue: React.Dispatch<React.SetStateAction<string>>;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 mt-4">
      <div className="col-span-full">
        <Label label="New value" htmlFor="static_value" />
        <input
          id="static_value"
          name="static_value"
          type="text"
          className="col-start-1 row-start-1 block w-full rounded-md border-none bg-white/5 px-3 py-1 text-xs text-white outline outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
      </div>
    </div>
  );
}

function DynamicParameterSettings({
  displayName,
  setDisplayName,
  param,
  setParam,
  paramInvalid,
  defaultV,
  setDefaultV,
  isMandatory,
  setIsMandatory,
}: {
  displayName: string;
  setDisplayName: React.Dispatch<React.SetStateAction<string>>;
  param: string;
  setParam: React.Dispatch<React.SetStateAction<string>>;
  paramInvalid: boolean;
  defaultV: string;
  setDefaultV: React.Dispatch<React.SetStateAction<string>>;
  isMandatory: boolean;
  setIsMandatory: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const hasDefaultValue = defaultV.trim().length > 0;

  return (
    <div className="grid grid-cols-1 gap-4 mt-4">
      <div className="col-span-full">
        <Label label="Display name" htmlFor="display_name" />
        <Description className="mb-1">
          Human-friendly name to display in the auto-generated render forms.
        </Description>
        <input
          id="display_name"
          name="display_name"
          type="text"
          className="col-start-1 row-start-1 block w-full rounded-md border-none bg-white/5 px-3 py-1 text-xs text-white outline outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
        />
      </div>
      <div className="col-span-full">
        <Label label="Parameter name" htmlFor="parameter_name" />
        <Description className="mb-1">
          Technical name of the parameter to use when calling the render API.
        </Description>
        <input
          id="parameter_name"
          name="parameter_name"
          type="text"
          className={classNames(
            'col-start-1 row-start-1 block w-full rounded-md border-none bg-white/5 px-3 py-1 text-xs text-white outline outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline focus:outline-2 focus:-outline-offset-2',
            paramInvalid
              ? 'focus:outline-red-500 outline-red-500/50'
              : 'focus:outline-indigo-500',
          )}
          value={param}
          onChange={(e) => setParam(e.target.value)}
        />
        {paramInvalid && (
          <p className="mt-1 text-xs text-red-400">
            Must start with a letter and contain only letters, digits,
            underscores, and dots (e.g.{' '}
            <span className="font-mono">my.param_1</span>).
          </p>
        )}
      </div>
      <div className={classNames('col-span-full', isMandatory && 'opacity-50')}>
        <Label label="Default value" htmlFor="default_value" />
        <Description className="mb-1">
          Value to use as a default if the parameter is not passed as the render
          argument.
        </Description>
        <input
          id="default_value"
          name="default_value"
          type="text"
          className="col-start-1 row-start-1 block w-full rounded-md border-none bg-white/5 px-3 py-1 text-xs text-white outline outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500"
          value={defaultV}
          onChange={(e) => {
            const next = e.target.value;
            setDefaultV(next);
            if (next.trim()) setIsMandatory(false);
          }}
          disabled={isMandatory}
        />
      </div>
      <Checkbox
        id="mandatory"
        name="mandatory"
        label="Mandatory"
        description="Fail the render if the parameter is not passed as the render argument."
        checked={isMandatory}
        onChange={(checked) => {
          setIsMandatory(checked);
          if (checked) setDefaultV('');
        }}
        disabled={hasDefaultValue}
      />
    </div>
  );
}
