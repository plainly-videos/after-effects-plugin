import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import type { LayerType, ScriptType } from '@src/ui/types/template';
import classNames from 'classnames';
import { ChevronDownIcon, CirclePileIcon, FunnelXIcon } from 'lucide-react';
import { useState } from 'react';
import { Tooltip } from '../common';
import { Label } from '../typography';
import { ScriptsDialog } from './ScriptsDialog';

const filterOptions: [LayerType | 'All', string][] = [
  ['All', 'All'],
  ['COMPOSITION', 'Composition'],
  ['DATA', 'Text'],
  ['DATA_EFFECT', 'Effect'],
  ['MEDIA', 'Media'],
  ['SOLID_COLOR', 'Solid'],
];

export function FilterAndActions({
  parameterQuery,
  setParameterQuery,
  layerType,
  setLayerType,
  onBulkScriptSelectAction,
  bulkScriptDisabled,
  disabled,
}: {
  parameterQuery: string;
  setParameterQuery: React.Dispatch<React.SetStateAction<string>>;
  layerType: LayerType | 'All';
  setLayerType: React.Dispatch<React.SetStateAction<LayerType | 'All'>>;
  onBulkScriptSelectAction: (type: ScriptType) => void;
  bulkScriptDisabled?: boolean;
  disabled?: boolean;
}) {
  const [openScriptsDialog, setOpenScriptsDialog] = useState(false);

  const clearFiltersAction = () => {
    setParameterQuery('');
    setLayerType('All');
  };

  return (
    <>
      <div className={classNames('col-span-full', disabled && 'opacity-50')}>
        <Label label="Filters and actions" />
        <div className="flex items-center divide-x divide-white/10">
          <div className="pr-2 flex-1">
            <input
              id="parameter-search"
              name="parameter-search"
              type="text"
              className="col-start-1 row-start-1 block w-full rounded-md border-none bg-white/5 px-3 py-1 text-xs text-white outline outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 disabled:cursor-not-allowed"
              placeholder="Type parameter or layer name..."
              value={parameterQuery}
              onChange={(e) => setParameterQuery(e.target.value)}
              disabled={disabled}
            />
          </div>
          <div className="pl-2">
            <Menu>
              <MenuButton
                className="group inline-flex items-center justify-between rounded-md bg-white/5 px-3 py-1 text-xs text-white hover:bg-white/10 focus:outline-none disabled:cursor-not-allowed border-none outline outline-1 -outline-offset-1 outline-white/10 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 min-h-[32px] w-[88px]"
                disabled={disabled}
              >
                Actions
                <ChevronDownIcon className="size-4 shrink-0 text-gray-400" />
              </MenuButton>
              <MenuItems
                anchor="bottom end"
                transition
                className="origin-top-right rounded-md border border-white/5 bg-secondary p-1 focus:outline-none mt-1 z-10"
              >
                <MenuItem>
                  <button
                    type="button"
                    className="group flex items-center gap-2 rounded-md px-3 py-1.5 text-xs text-gray-400 hover:bg-indigo-600 hover:text-white w-full"
                    onClick={clearFiltersAction}
                  >
                    <FunnelXIcon className="size-4 shrink-0 text-gray-400" />
                    Clear filters
                  </button>
                </MenuItem>
                <MenuItem>
                  <Tooltip
                    text="Select layers first"
                    disabled={!bulkScriptDisabled}
                  >
                    <button
                      type="button"
                      className="group flex items-center gap-2 rounded-md px-3 py-1.5 text-xs text-gray-400 hover:bg-indigo-600 hover:text-white w-full disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-gray-400"
                      onClick={() => setOpenScriptsDialog(true)}
                      disabled={bulkScriptDisabled}
                    >
                      <CirclePileIcon className="size-4 shrink-0 text-gray-400" />
                      Bulk script add
                    </button>
                  </Tooltip>
                </MenuItem>
              </MenuItems>
            </Menu>
          </div>
        </div>
        <div className="flex flex-wrap gap-1 mt-1 w-full">
          {filterOptions.map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setLayerType(value)}
              className={classNames(
                'rounded px-2 py-0.5 text-xs transition-colors duration-150 disabled:cursor-not-allowed',
                layerType === value
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white',
              )}
              disabled={disabled}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <ScriptsDialog
        open={openScriptsDialog}
        setOpen={setOpenScriptsDialog}
        onSelect={onBulkScriptSelectAction}
        bulk
      />
    </>
  );
}
