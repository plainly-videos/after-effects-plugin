import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from '@headlessui/react';
import { useAutoGenerateProjectTemplates, useNavigate } from '@src/ui/hooks';
import {
  type AnyAutoCreateTemplateDto,
  AutoCreateTemplateType,
} from '@src/ui/types/template';
import classNames from 'classnames';
import { useCallback, useContext, useState } from 'react';
import { AllAutoGenerateForm, PrefixAutoGenerateForm } from '.';
import { Button } from '../../common';
import { AuthContext } from '../../settings';
import { Description, Label } from '../../typography';

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
