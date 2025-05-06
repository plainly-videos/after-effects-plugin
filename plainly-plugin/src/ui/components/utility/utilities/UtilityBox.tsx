import classNames from 'classnames';
import { InfoIcon, PlayIcon, TrashIcon } from 'lucide-react';
import { Tooltip } from '../../common';

export const UtilityBox = ({
  handleApply,
  handleRemove,
  children,
  title,
  tooltip,
  className,
}: {
  handleApply?: () => void;
  handleRemove?: () => void;
  children: React.ReactNode;
  title: string;
  tooltip: string;
  className?: string;
}) => {
  return (
    <div
      className={classNames(
        'border border-white/10 bg-secondary rounded-sm break-inside-avoid w-full',
        className,
      )}
    >
      <div className="p-1 flex flex-wrap items-center border-b border-white/10 gap-1">
        <p className="text-xs ml-1 text-gray-300 flex-1 whitespace-nowrap">
          {title}
        </p>
        {handleApply && (
          <button
            type="button"
            onClick={handleApply}
            className="h-5 w-5 border border-white/10 rounded-sm hover:bg-white/10 flex items-center justify-center cursor-pointer text-gray-400 hover:text-white"
          >
            <PlayIcon className="size-3" />
          </button>
        )}
        {handleRemove && (
          <button
            type="button"
            onClick={handleRemove}
            className="h-5 w-5 border border-white/10 rounded-sm hover:bg-white/10 flex items-center justify-center cursor-pointer text-gray-400 hover:text-white"
          >
            <TrashIcon className="size-3" />
          </button>
        )}
        <div>
          <Tooltip text={tooltip} position="bottom">
            <div className="h-5 w-5 border border-white/10 rounded-sm hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white">
              <InfoIcon className="size-3" />
            </div>
          </Tooltip>
        </div>
      </div>
      <div className="p-1">{children}</div>
    </div>
  );
};
