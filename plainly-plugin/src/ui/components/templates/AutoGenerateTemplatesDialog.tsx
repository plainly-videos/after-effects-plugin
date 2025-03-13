import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from '@headlessui/react';
import {
  useAutoGenerateProjectTemplates,
  useGetProjectMetadata,
  useNavigate,
} from '@src/ui/hooks';
import type { CompositionAeItem } from '@src/ui/types/metadata';
import {
  type AnyAutoCreateTemplateDto,
  AutoCreateTemplateType,
} from '@src/ui/types/template';
import { collectCompositions, compositionSorter } from '@src/ui/utils';
import classNames from 'classnames';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Button, Checkbox, Select } from '../common';
import { AuthContext } from '../settings';
import { Description, Label } from '../typography';

const getAutoGenerateIcon = (type: AutoCreateTemplateType) => {
  const className = 'text-base text-white';

  switch (type) {
    case AutoCreateTemplateType.all:
      return <p className={className}>A</p>;
    case AutoCreateTemplateType.prefix:
      return <p className={className}>P</p>;
  }
};

export function AutoGenerateTemplatesDialog({
  id,
  title,
  buttonText,
  open,
  setOpen,
}: {
  id: string;
  title: string;
  buttonText: string;
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  const [type, setType] = useState<AutoCreateTemplateType>();
  const [data, setData] = useState<AnyAutoCreateTemplateDto>();

  const { apiKey } = useContext(AuthContext);
  const { sidebarOpen } = useNavigate();
  const { isPending, mutateAsync: generateTemplates } =
    useAutoGenerateProjectTemplates();

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!data) return;

      try {
        await generateTemplates({
          apiKey,
          projectId: id,
          autoCreateTemplateDto: data,
        });
      } catch (error) {
        setOpen(false);
      } finally {
        setOpen(false);
      }
    },
    [apiKey, generateTemplates, data, id, setOpen],
  );

  const types = Object.values(AutoCreateTemplateType);

  const formComponents = {
    [AutoCreateTemplateType.all]: AllAutoGenerateForm,
    [AutoCreateTemplateType.prefix]: PrefixAutoGenerateForm,
  };
  const FormComponent = type ? formComponents[type] : null;

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
              'relative transform overflow-y-auto max-h-96 rounded-lg bg-[rgb(29,29,30)] px-4 pb-4 pt-5 text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-lg sm:p-6 data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95 border border-white/10',
              sidebarOpen ? 'ml-[3.75rem] xs:ml-48' : 'ml-[3.75rem]',
            )}
          >
            {!type ? (
              <div>
                <div>
                  <DialogTitle
                    as="h3"
                    className="text-sm font-medium text-white"
                  >
                    {title}
                  </DialogTitle>
                  <Description className="mt-1">
                    Auto-generate templates for your project and automatically
                    parametrize text and media layers. Choose the type of
                    auto-generation you would like to perform.
                  </Description>
                </div>
                <ul className="my-4" id="options">
                  {types.map((tt) => (
                    <li
                      className="group flex cursor-pointer select-none rounded-xl p-2 hover:bg-secondary"
                      key={tt}
                      id={tt}
                      tabIndex={-1}
                      aria-selected={type === tt}
                      onClick={() => setType(tt)}
                      onKeyDown={() => setType(tt)}
                    >
                      <div className="flex h-8 w-8 flex-none items-center justify-center rounded-lg bg-indigo-500 group-hover:bg-indigo-400">
                        {getAutoGenerateIcon(tt)}
                      </div>
                      <div className="ml-2 flex-auto">
                        <Label
                          label={
                            tt === AutoCreateTemplateType.all ? 'All' : 'Prefix'
                          }
                          className="leading-3"
                        />
                        <Description className="mt-1">
                          {tt === AutoCreateTemplateType.all &&
                            'Automatically generate templates for all root compositions and parametrize all text and media layers in the composition tree.'}
                          {tt === AutoCreateTemplateType.prefix &&
                            'Automatically generate templates for compositions and layers that contain a specific prefix.'}
                        </Description>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <div className="flex">
                    <div className="flex h-8 w-8 flex-none items-center justify-center rounded-lg bg-indigo-500 group-hover:bg-indigo-400">
                      {getAutoGenerateIcon(type)}
                    </div>
                    <div className="ml-2 flex-auto">
                      <DialogTitle
                        as="h3"
                        className="text-sm font-medium text-white"
                      >
                        {type === AutoCreateTemplateType.all && 'All'}
                        {type === AutoCreateTemplateType.prefix && 'Prefix'}
                      </DialogTitle>
                      <Description className="mt-1">
                        {type === AutoCreateTemplateType.all &&
                          'Automatically generate templates for all root compositions and parametrize all text and media layers in the composition tree.'}
                        {type === AutoCreateTemplateType.prefix &&
                          'Automatically generate templates for compositions and layers that contain a specific prefix.'}
                      </Description>
                    </div>
                  </div>
                </div>

                {FormComponent && (
                  <FormComponent setData={setData} projectId={id} />
                )}

                <div className="mt-4 sm:mt-3 sm:flex sm:flex-row-reverse">
                  <Button
                    className="inline-flex w-full sm:w-auto justify-center sm:ml-2"
                    disabled={isPending}
                    loading={isPending}
                  >
                    {buttonText}
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setType(undefined)}
                    secondary
                    className="inline-flex mt-2 sm:mt-0 w-full sm:w-auto justify-center"
                    disabled={isPending}
                  >
                    Back
                  </Button>
                </div>
              </form>
            )}
            {!type && (
              <div className="sm:flex sm:flex-row-reverse">
                <Button
                  type="button"
                  onClick={() => setOpen(false)}
                  secondary
                  className="inline-flex mt-2 sm:mt-0 w-full sm:w-auto justify-center"
                >
                  Cancel
                </Button>
              </div>
            )}
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}

interface FormProps {
  setData: (data: AnyAutoCreateTemplateDto | undefined) => void;
  projectId: string;
}

function AllAutoGenerateForm({ setData, projectId }: FormProps) {
  const [allLayers, setAllLayers] = useState(false);
  const [greedy, setGreedy] = useState(false);
  const [targetCompositionName, setTargetCompositionName] = useState<string>();
  const [exclude, setExclude] = useState({
    excludeAdjustmentLayers: false,
    excludeDisabledLayers: false,
    excludeGuideLayers: false,
    excludeShyLayers: false,
  });

  useEffect(() => {
    setData({
      type: AutoCreateTemplateType.all,
      allLayers,
      greedy,
      targetCompositionName: targetCompositionName || undefined,
      excludeAdjustmentLayers: exclude.excludeAdjustmentLayers,
      excludeDisabledLayers: exclude.excludeDisabledLayers,
      excludeGuideLayers: exclude.excludeGuideLayers,
      excludeShyLayers: exclude.excludeShyLayers,
    });
  }, [
    allLayers,
    exclude.excludeAdjustmentLayers,
    exclude.excludeDisabledLayers,
    exclude.excludeGuideLayers,
    exclude.excludeShyLayers,
    greedy,
    setData,
    targetCompositionName,
  ]);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-6">
      <TargetCompositionName
        targetCompositionName={targetCompositionName}
        setTargetCompositionName={setTargetCompositionName}
        projectId={projectId}
      />

      <div className="col-span-full">
        <Checkbox
          id="greedy"
          checked={greedy}
          label="Greedy"
          description="Creates a single template for all root compositions, or only for the one with the most sub-layers if multiple exist. Ignored if a specific target composition is selected."
          onChange={setGreedy}
        />
      </div>

      <div className="col-span-full">
        <Checkbox
          id="allLayers"
          checked={allLayers}
          label="All layers"
          description="Includes all text and media layers in the composition tree for auto-parametrization. Otherwise, no layers will be parametrized."
          onChange={setAllLayers}
        />
      </div>

      <Excludes
        exclude={exclude}
        setExclude={setExclude}
        disabled={!allLayers}
      />
    </div>
  );
}

function PrefixAutoGenerateForm({ setData, projectId }: FormProps) {
  const [prefixes, setPrefixes] = useState<string[]>();
  const [stripPrefix, setStripPrefix] = useState(false);
  const [targetCompositionName, setTargetCompositionName] = useState<string>();
  const [exclude, setExclude] = useState({
    excludeAdjustmentLayers: false,
    excludeDisabledLayers: false,
    excludeGuideLayers: false,
    excludeShyLayers: false,
  });

  useEffect(() => {
    setData({
      type: AutoCreateTemplateType.prefix,
      prefixes: prefixes?.map((prefix) => prefix.trim()),
      stripPrefix,
      targetCompositionName: targetCompositionName || undefined,
      excludeAdjustmentLayers: exclude.excludeAdjustmentLayers,
      excludeDisabledLayers: exclude.excludeDisabledLayers,
      excludeGuideLayers: exclude.excludeGuideLayers,
      excludeShyLayers: exclude.excludeShyLayers,
    });
  }, [
    prefixes,
    stripPrefix,
    setData,
    targetCompositionName,
    exclude.excludeAdjustmentLayers,
    exclude.excludeDisabledLayers,
    exclude.excludeGuideLayers,
    exclude.excludeShyLayers,
  ]);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-6">
      <TargetCompositionName
        targetCompositionName={targetCompositionName}
        setTargetCompositionName={setTargetCompositionName}
        projectId={projectId}
      />

      <div className="col-span-full">
        <Label label="Prefixes" htmlFor="prefixes" />
        <Description className="mb-1">
          Comma separated list of prefixes that will be used to filter
          compositions and layers for auto parametrization. If not provided, we
          will look for <code className="text-xs text-white">plainly</code>
          prefix in your project.
        </Description>
        <input
          id="prefixes"
          name="prefixes"
          type="text"
          className="col-start-1 row-start-1 block w-full rounded-md bg-white/5 px-3 py-1 text-xs text-white outline outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500"
          defaultValue={prefixes?.join(',')}
          onChange={(e) => setPrefixes(e.target.value.split(','))}
          placeholder="Enter prefixes"
        />
      </div>

      <div className="col-span-full">
        <Checkbox
          id="stripPrefix"
          checked={stripPrefix}
          label="Strip prefix"
          description="Prefix will be stripped from the composition and layer names when templates are created and auto parametrization is done."
          onChange={setStripPrefix}
        />
      </div>

      <Excludes exclude={exclude} setExclude={setExclude} />
    </div>
  );
}

function TargetCompositionName({
  targetCompositionName,
  setTargetCompositionName,
  projectId,
}: {
  targetCompositionName: string | undefined;
  setTargetCompositionName: React.Dispatch<
    React.SetStateAction<string | undefined>
  >;
  projectId: string;
}) {
  const { apiKey } = useContext(AuthContext);
  const { isLoading, data: meta } = useGetProjectMetadata(
    apiKey,
    projectId,
    true,
    true,
  );
  const compositions = useMemo(() => {
    const result: CompositionAeItem[] = [];

    if (meta) {
      for (const comp of meta.sort(compositionSorter)) {
        for (const c of collectCompositions(comp)) {
          if (result.findIndex((existing) => existing.id === c.id) < 0) {
            result.push(c);
          }
        }
      }
    }

    return result;
  }, [meta]);

  const data = useMemo(
    () =>
      compositions.map((c) => ({
        id: c.id,
        name: c.name,
        item: c,
        label: c.name,
        selected: c.name === targetCompositionName,
      })),
    [compositions, targetCompositionName],
  );

  return (
    <div className="col-span-full">
      <Label label="Target composition" htmlFor="targetCompositionName" />
      <Select data={data} onChange={setTargetCompositionName} />
    </div>
  );
}

function Excludes({
  exclude,
  setExclude,
  disabled,
}: {
  exclude: {
    excludeAdjustmentLayers: boolean;
    excludeDisabledLayers: boolean;
    excludeGuideLayers: boolean;
    excludeShyLayers: boolean;
  };
  setExclude: React.Dispatch<
    React.SetStateAction<{
      excludeAdjustmentLayers: boolean;
      excludeDisabledLayers: boolean;
      excludeGuideLayers: boolean;
      excludeShyLayers: boolean;
    }>
  >;
  disabled?: boolean;
}) {
  const handleChange = useCallback(
    (key: keyof typeof exclude) => {
      setExclude((prev) => ({
        ...prev,
        [key]: !prev[key],
      }));
    },
    [setExclude],
  );

  return (
    <>
      <div className="col-span-full">
        <Checkbox
          id="excludeAdjustmentLayers"
          checked={exclude.excludeAdjustmentLayers}
          label="Exclude adjustment layers"
          description="Adjustment layers will not be parametrized."
          onChange={() => handleChange('excludeAdjustmentLayers')}
          disabled={disabled}
        />
      </div>

      <div className="col-span-full">
        <Checkbox
          id="excludeDisabledLayers"
          checked={exclude.excludeDisabledLayers}
          label="Exclude disabled layers"
          description="Disabled layers will not be parametrized."
          onChange={() => handleChange('excludeDisabledLayers')}
          disabled={disabled}
        />
      </div>

      <div className="col-span-full">
        <Checkbox
          id="excludeGuideLayers"
          checked={exclude.excludeGuideLayers}
          label="Exclude guide layers"
          description="Guide layers will not be parametrized."
          onChange={() => handleChange('excludeGuideLayers')}
          disabled={disabled}
        />
      </div>

      <div className="col-span-full">
        <Checkbox
          id="excludeShyLayers"
          checked={exclude.excludeShyLayers}
          label="Exclude shy layers"
          description="Shy layers will not be parametrized."
          onChange={() => handleChange('excludeShyLayers')}
          disabled={disabled}
        />
      </div>
    </>
  );
}
