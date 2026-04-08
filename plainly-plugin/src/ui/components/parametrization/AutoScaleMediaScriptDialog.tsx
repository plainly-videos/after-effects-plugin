import type { MediaAutoScaleScript } from '@src/ui/types/template';
import classNames from 'classnames';
import { ImageIcon } from 'lucide-react';
import { useState } from 'react';
import { Checkbox } from '../common';
import { Description, Label } from '../typography';
import { ScriptDialogShell } from './ScriptDialogShell';

export function AutoScaleMediaScriptDialog({
  mediaAutoScaleScript,
  open,
  setOpen,
  action,
}: {
  mediaAutoScaleScript: MediaAutoScaleScript;
  open: boolean;
  setOpen: (open: boolean) => void;
  action: (script: MediaAutoScaleScript) => void;
}) {
  const { fill, fixedRatio, transform } = mediaAutoScaleScript;

  const [fillState, setFillState] = useState(fill);
  const [fixedRatioState, setFixedRatioState] = useState(fixedRatio);
  const [transformState, setTransformState] = useState(transform);

  const { size, position } = transformState || {};

  const [sizeXInput, setSizeXInput] = useState(size?.sizeX?.toString() ?? '');
  const [sizeYInput, setSizeYInput] = useState(size?.sizeY?.toString() ?? '');
  const [posXInput, setPosXInput] = useState(position?.posX?.toString() ?? '');
  const [posYInput, setPosYInput] = useState(position?.posY?.toString() ?? '');

  const sizeValid = size && size.sizeX !== 0 && size.sizeY !== 0;
  const posNotZero = position && (position.posX !== 0 || position.posY !== 0);
  const valid = fillState || fixedRatioState || sizeValid;

  const handleSave = () => {
    action({
      scriptType: mediaAutoScaleScript.scriptType,
      fill: fillState,
      fixedRatio: fixedRatioState,
      transform: {
        size: sizeValid ? transformState?.size : undefined,
        position: posNotZero ? transformState?.position : undefined,
      },
    });
    setOpen(false);
  };

  return (
    <ScriptDialogShell
      open={open}
      setOpen={setOpen}
      icon={<ImageIcon className="size-4 text-white" />}
      title="Auto scale media"
      description="Automatically scale media layer to the composition size."
      onSave={handleSave}
      saveDisabled={!valid}
    >
      <Checkbox
        id="fill"
        name="fill"
        label="Fill"
        description="Fill the composition with the media asset."
        defaultChecked={fillState}
        onChange={setFillState}
        disabled={sizeXInput !== '' || sizeYInput !== ''}
      />
      <Checkbox
        id="fixedRatio"
        name="fixedRatio"
        label="Fixed ratio"
        description="Keep the aspect ratio of the media asset."
        defaultChecked={fixedRatioState}
        onChange={setFixedRatioState}
        disabled={sizeXInput !== '' || sizeYInput !== ''}
      />
      <div>
        <Label label="Size" />
        <Description>Custom size of the media asset.</Description>
        <div className="flex flex-col sm:flex-row gap-2 mt-1">
          <div
            className={classNames(
              'flex items-center w-full',
              (fillState || fixedRatioState) && 'opacity-50',
            )}
          >
            <span className="w-12 h-[32px] rounded-l-md border border-r-0 border-white/10 bg-white/5 px-3 py-1 text-xs text-gray-500 flex items-center justify-center">
              px
            </span>
            <input
              id="transform.size.sizeX"
              name="transform.size.sizeX"
              type="number"
              className="block rounded-r-md border-none bg-white/5 px-3 py-1 text-xs text-white outline outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 disabled:cursor-not-allowed w-full"
              value={sizeXInput}
              placeholder="1920"
              disabled={fillState || fixedRatioState}
              min={0}
              onChange={(e) => {
                setSizeXInput(e.target.value);
                const num = Number(e.target.value);
                setTransformState((prev) => ({
                  ...prev,
                  size: {
                    sizeX: Number.isNaN(num) ? 0 : num,
                    sizeY: prev?.size?.sizeY ?? 0,
                  },
                }));
              }}
            />
          </div>
          <div
            className={classNames(
              'flex items-center w-full',
              (fillState || fixedRatioState) && 'opacity-50',
            )}
          >
            <span className="w-12 h-[32px] rounded-l-md border border-r-0 border-white/10 bg-white/5 px-3 py-1 text-xs text-gray-500 flex items-center justify-center">
              px
            </span>
            <input
              id="transform.size.sizeY"
              name="transform.size.sizeY"
              type="number"
              className="block rounded-r-md border-none bg-white/5 px-3 py-1 text-xs text-white outline outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 disabled:cursor-not-allowed w-full"
              value={sizeYInput}
              placeholder="1080"
              disabled={fillState || fixedRatioState}
              min={0}
              onChange={(e) => {
                setSizeYInput(e.target.value);
                const num = Number(e.target.value);
                setTransformState((prev) => ({
                  ...prev,
                  size: {
                    sizeX: prev?.size?.sizeX ?? 0,
                    sizeY: Number.isNaN(num) ? 0 : num,
                  },
                }));
              }}
            />
          </div>
        </div>
      </div>
      <div>
        <Label label="Position" />
        <Description>Custom position of the media asset.</Description>
        <div className="flex flex-col sm:flex-row gap-2 mt-1">
          <div className="flex items-center w-full">
            <span className="w-12 h-[32px] rounded-l-md border border-r-0 border-white/10 bg-white/5 px-3 py-1 text-xs text-gray-500 flex items-center justify-center">
              x
            </span>
            <input
              id="transform.position.posX"
              name="transform.position.posX"
              type="number"
              className="block rounded-r-md border-none bg-white/5 px-3 py-1 text-xs text-white outline outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 w-full"
              value={posXInput}
              placeholder="0"
              onChange={(e) => {
                setPosXInput(e.target.value);
                const num = Number(e.target.value);
                setTransformState((prev) => ({
                  ...prev,
                  position: {
                    posX: Number.isNaN(num) ? 0 : num,
                    posY: prev?.position?.posY ?? 0,
                  },
                }));
              }}
            />
          </div>
          <div className="flex items-center w-full">
            <span className="w-12 h-[32px] rounded-l-md border border-r-0 border-white/10 bg-white/5 px-3 py-1 text-xs text-gray-500 flex items-center justify-center">
              y
            </span>
            <input
              id="transform.position.posY"
              name="transform.position.posY"
              type="number"
              className="block rounded-r-md border-none bg-white/5 px-3 py-1 text-xs text-white outline outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 w-full"
              value={posYInput}
              placeholder="0"
              onChange={(e) => {
                setPosYInput(e.target.value);
                const num = Number(e.target.value);
                setTransformState((prev) => ({
                  ...prev,
                  position: {
                    posX: prev?.position?.posX ?? 0,
                    posY: Number.isNaN(num) ? 0 : num,
                  },
                }));
              }}
            />
          </div>
        </div>
      </div>
    </ScriptDialogShell>
  );
}
