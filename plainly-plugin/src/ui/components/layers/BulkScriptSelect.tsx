import {
  Combobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
} from '@headlessui/react';
import {
  type EditableScript,
  type Layer,
  ScriptType,
  type TextAutoScaleScript,
} from '@src/ui/types/template';
import classNames from 'classnames';
import { ChevronDownIcon } from 'lucide-react';
import { useCallback, useState } from 'react';
import { Badge } from '../common/Badge';
import { Description, Label } from '../typography';

const SCRIPT_OPTIONS = [
  { label: 'Crop' },
  { label: 'Auto scale text' },
  { label: 'Auto scale media' },
  { label: 'Layer management' },
] as const;

type ScriptOption = (typeof SCRIPT_OPTIONS)[number];

export function BulkScriptSelect({
  selectedLayerIds,
  onEditScript,
  setEditableLayers,
}: {
  selectedLayerIds: Set<string>;
  onEditScript: (params: {
    layerInternalId: string;
    script: EditableScript;
    isNew: boolean;
    isBulk: boolean;
  }) => void;
  setEditableLayers: React.Dispatch<React.SetStateAction<Layer[]>>;
}) {
  const [query, setQuery] = useState('');

  const handleCrop = useCallback(() => {
    onEditScript({
      layerInternalId: '',
      script: {
        scriptType: ScriptType.CROP,
        compEndsAtOutPoint: false,
        compStartsAtInPoint: false,
      },
      isNew: true,
      isBulk: true,
    });
  }, [onEditScript]);

  const handleAutoScaleText = useCallback(() => {
    setEditableLayers((prev) =>
      prev.map((layer) => {
        if (!selectedLayerIds.has(layer.internalId)) return layer;
        if (layer.layerType !== 'DATA') return layer;
        const existingScripts = layer.scripting?.scripts || [];
        const hasAutoScaleText = existingScripts.some(
          (s) => s.scriptType === ScriptType.TEXT_AUTO_SCALE,
        );
        if (hasAutoScaleText) return layer;
        const updatedScript: TextAutoScaleScript = {
          scriptType: ScriptType.TEXT_AUTO_SCALE,
        };
        return {
          ...layer,
          scripting: {
            ...layer.scripting,
            scripts: [...existingScripts, updatedScript],
          },
        };
      }),
    );
  }, [selectedLayerIds, setEditableLayers]);

  const handleAutoScaleMedia = useCallback(() => {
    onEditScript({
      layerInternalId: '',
      script: {
        scriptType: ScriptType.MEDIA_AUTO_SCALE,
        fill: true,
        fixedRatio: true,
      },
      isNew: true,
      isBulk: true,
    });
  }, [onEditScript]);

  const handleLayerManagement = useCallback(() => {
    onEditScript({
      layerInternalId: '',
      script: {
        scriptType: ScriptType.LAYER_MANAGEMENT,
        parameterName: '',
      },
      isNew: true,
      isBulk: true,
    });
  }, [onEditScript]);

  const handleSelect = useCallback(
    (option: ScriptOption | null) => {
      if (!option) return;
      const actions: Record<ScriptOption['label'], () => void> = {
        Crop: handleCrop,
        'Auto scale text': handleAutoScaleText,
        'Auto scale media': handleAutoScaleMedia,
        'Layer management': handleLayerManagement,
      };
      actions[option.label]();
      setQuery('');
    },
    [
      handleCrop,
      handleAutoScaleText,
      handleAutoScaleMedia,
      handleLayerManagement,
    ],
  );

  const disabled = selectedLayerIds.size === 0;

  return (
    <div className="col-span-full">
      <Label label="Bulk add new scripts" />
      <Description>
        Select multiple layers from the parametrized layers list and add scripts
        to them in bulk.
      </Description>

      {/* Badge row — visible on xs and above */}
      <div className="xs:flex flex-wrap gap-1 mt-1 hidden">
        <Badge label="Crop" action={handleCrop} disabled={disabled} />
        <Badge
          label="Auto scale text"
          action={handleAutoScaleText}
          disabled={disabled}
        />
        <Badge
          label="Auto scale media"
          action={handleAutoScaleMedia}
          disabled={disabled}
        />
        <Badge
          label="Layer management"
          action={handleLayerManagement}
          disabled={disabled}
        />
      </div>

      {/* Combobox dropdown — visible below xs */}
      <div className="xs:hidden mt-1">
        <Combobox value={null} onChange={handleSelect} disabled={disabled}>
          <div className="relative w-full">
            <ComboboxInput
              className="w-full rounded-md border-none bg-white/5 py-1 pr-8 pl-3 text-xs text-white outline outline-1 -outline-offset-1 outline-white/10 focus:outline focus:-outline-offset-2 focus:outline-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              displayValue={(option: ScriptOption | null) =>
                option?.label || ''
              }
              onChange={(event) => setQuery(event.target.value)}
              disabled={disabled}
              placeholder="Select a script to add in bulk..."
            />
            <ComboboxButton
              className="group absolute inset-y-0 right-0 px-2.5 disabled:pointer-events-none"
              disabled={disabled}
            >
              <ChevronDownIcon className="size-4 shrink-0 text-gray-400 group-hover:text-white duration-200" />
            </ComboboxButton>
          </div>
          <ComboboxOptions
            anchor="bottom"
            transition
            className={classNames(
              'min-w-[--input-width] rounded-md border border-white/5 bg-secondary p-1 mt-1 empty:invisible',
              'transition duration-100 ease-in',
            )}
          >
            {SCRIPT_OPTIONS.filter((option) =>
              option.label.toLowerCase().includes(query.toLowerCase()),
            ).map((option) => (
              <ComboboxOption
                key={option.label}
                value={option}
                className="flex cursor-default items-center rounded-md px-3 py-1 select-none focus:bg-white/10 hover:bg-white/10 text-xs text-white"
              >
                {option.label}
              </ComboboxOption>
            ))}
          </ComboboxOptions>
        </Combobox>
      </div>
    </div>
  );
}
