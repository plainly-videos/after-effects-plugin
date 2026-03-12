import {
  type CropScript,
  type Layer,
  type LayerType,
  ScriptType,
} from '@src/ui/types/template';
import { isEmpty } from '@src/ui/utils';
import { EditIcon, PlusIcon } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { Badge } from '../common/Badge';
import { Label } from '../typography';

const scriptName = (type: ScriptType) => {
  if (type === ScriptType.CROP) return 'Crop';
  if (type === ScriptType.MEDIA_AUTO_SCALE) return 'Auto scale media';
  if (type === ScriptType.TEXT_AUTO_SCALE) return 'Auto scale text';
  if (type === ScriptType.SHIFT_IN) return 'Shift in';
  if (type === ScriptType.SHIFT_OUT) return 'Shift out';
  return type;
};

export function ParametrizedLayers({
  editableLayers,
  parameterQuery,
  layerType,
  selectedLayerIds,
  setSelectedLayerIds,
  setScriptsDialogLayerId,
  handleCropBadgeClick,
  handleScriptRemove,
}: {
  editableLayers: Layer[];
  parameterQuery: string;
  layerType: LayerType | 'All';
  selectedLayerIds: Set<string>;
  setSelectedLayerIds: React.Dispatch<React.SetStateAction<Set<string>>>;
  setScriptsDialogLayerId: React.Dispatch<React.SetStateAction<string | null>>;
  handleCropBadgeClick: (layerInternalId: string, script: CropScript) => void;
  handleScriptRemove: (layerInternalId: string, type: ScriptType) => void;
}) {
  const layers = editableLayers.filter(
    (layer) =>
      layer.parametrization?.value
        .toLowerCase()
        .includes(parameterQuery.toLowerCase()) &&
      (layerType === 'All' || layer.layerType === layerType),
  );

  return (
    <div className="col-span-full">
      <Label label="Parametrized layers" />
      <ul className="divide-y divide-white/10 overflow-auto w-full rounded-md border border-white/5 bg-secondary">
        <li className="grid grid-cols-2 w-full text-xs divide-x divide-white/10 divide-dashed">
          <div className="py-1 px-3 flex items-center gap-2">
            <SelectAllCheckbox
              layers={layers}
              selectedLayerIds={selectedLayerIds}
              setSelectedLayerIds={setSelectedLayerIds}
            />
            <Label label="Parametrization" />
          </div>
          <Label label="Scripting" className="py-1 px-3" />
        </li>
        {layers.map((layer) => (
          <div key={layer.internalId} className="min-w-fit w-full">
            <div className="grid grid-cols-2 w-full divide-x divide-white/10 divide-dashed">
              <div className="min-w-0 px-3 py-1 relative flex items-start gap-2">
                <input
                  type="checkbox"
                  className="appearance-none rounded border border-white/10 bg-white/5 checked:border-indigo-600 checked:bg-indigo-600 indeterminate:border-indigo-600 indeterminate:bg-indigo-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-white/10 disabled:bg-transparent forced-colors:appearance-auto"
                  checked={selectedLayerIds.has(layer.internalId)}
                  onChange={(e) => {
                    setSelectedLayerIds((prev) => {
                      const next = new Set(prev);
                      if (e.target.checked) next.add(layer.internalId);
                      else next.delete(layer.internalId);
                      return next;
                    });
                  }}
                />
                <button
                  onClick={() => {}}
                  className="absolute right-3 top-1 size-5 flex items-center justify-center cursor-pointer disabled:cursor-not-allowed group rounded-sm bg-primary hover:bg-secondary hover:text-gray-400 disabled:opacity-50 disabled:pointer-events-none"
                  type="button"
                  disabled={true}
                >
                  <EditIcon className="size-3" />
                </button>
                <div className="flex flex-col text-xs pr-5 min-w-0">
                  <Label
                    label={layer.layerName}
                    className="truncate text-xs leading-4"
                  />
                  <code className="truncate text-gray-400 text-2xs">
                    {layer.parametrization?.value}
                  </code>
                </div>
              </div>
              <div className="min-w-0 px-3 py-1 relative">
                <button
                  onClick={() => setScriptsDialogLayerId(layer.internalId)}
                  className="absolute right-3 top-1 size-5 flex items-center justify-center cursor-pointer disabled:cursor-not-allowed group rounded-sm bg-primary hover:bg-secondary hover:text-gray-400"
                  type="button"
                >
                  <PlusIcon className="size-3" />
                </button>
                <div className="flex flex-wrap text-xs gap-1 pr-5">
                  {layer.scripting?.scripts.map((script) => (
                    <div key={script.scriptType}>
                      <Badge
                        label={scriptName(script.scriptType)}
                        action={
                          script.scriptType === ScriptType.CROP
                            ? () =>
                                handleCropBadgeClick(
                                  layer.internalId,
                                  script as CropScript,
                                )
                            : () => {}
                        }
                        onRemove={() =>
                          handleScriptRemove(
                            layer.internalId,
                            script.scriptType,
                          )
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </ul>
    </div>
  );
}

function SelectAllCheckbox({
  layers,
  selectedLayerIds,
  setSelectedLayerIds,
}: {
  layers: Layer[];
  selectedLayerIds: Set<string>;
  setSelectedLayerIds: React.Dispatch<React.SetStateAction<Set<string>>>;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const allSelected =
    !isEmpty(layers) && layers.every((l) => selectedLayerIds.has(l.internalId));
  const someSelected =
    !allSelected && layers.some((l) => selectedLayerIds.has(l.internalId));

  useEffect(() => {
    if (ref.current) ref.current.indeterminate = someSelected;
  }, [someSelected]);

  return (
    <input
      ref={ref}
      type="checkbox"
      className="appearance-none rounded border border-white/10 bg-white/5 checked:border-indigo-600 checked:bg-indigo-600 indeterminate:border-indigo-600 indeterminate:bg-indigo-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-white/10 disabled:bg-transparent forced-colors:appearance-auto"
      checked={allSelected}
      onChange={(e) => {
        setSelectedLayerIds(
          e.target.checked
            ? new Set(layers.map((l) => l.internalId))
            : new Set(),
        );
      }}
    />
  );
}
