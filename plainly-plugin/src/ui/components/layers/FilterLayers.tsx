import type { LayerType } from '@src/ui/types/template';
import classNames from 'classnames';
import { Label } from '../typography';

const filterOptions: [LayerType | 'All', string][] = [
  ['All', 'All'],
  ['COMPOSITION', 'Composition'],
  ['DATA', 'Text'],
  ['DATA_EFFECT', 'Effect'],
  ['MEDIA', 'Media'],
  ['SOLID_COLOR', 'Solid'],
];

export function FilterLayers({
  parameterQuery,
  setParameterQuery,
  layerType,
  setLayerType,
}: {
  parameterQuery: string;
  setParameterQuery: React.Dispatch<React.SetStateAction<string>>;
  layerType: LayerType | 'All';
  setLayerType: React.Dispatch<React.SetStateAction<LayerType | 'All'>>;
}) {
  return (
    <div className="col-span-full">
      <Label label="Filter layers" />
      <input
        id="parameter-search"
        name="parameter-search"
        type="text"
        className="col-start-1 row-start-1 block w-full rounded-md border-none bg-white/5 px-3 py-1 text-xs text-white outline outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500"
        placeholder="Type parameter name..."
        value={parameterQuery}
        onChange={(e) => setParameterQuery(e.target.value)}
      />
      <div className="flex flex-wrap gap-1 mt-1">
        {filterOptions.map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setLayerType(value)}
            className={classNames(
              'rounded px-2 py-0.5 text-xs transition-colors duration-150',
              layerType === value
                ? 'bg-indigo-600 text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white',
            )}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
