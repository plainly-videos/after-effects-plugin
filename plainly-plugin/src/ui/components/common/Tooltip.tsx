import classNames from 'classnames';
import { useCallback, useState } from 'react';
import { createPortal } from 'react-dom';

export function Tooltip({
  text,
  children,
  position = 'top',
  disabled,
  className,
}: {
  text: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  disabled?: boolean;
  className?: string;
}) {
  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });

  const showTooltip = useCallback(
    (event: React.MouseEvent) => {
      const rect = event.currentTarget.getBoundingClientRect();
      let newCoords = { top: rect.top, left: rect.left };

      if (position === 'top') {
        newCoords = { top: rect.top - 8, left: rect.left + rect.width / 2 };
      } else if (position === 'bottom') {
        newCoords = { top: rect.bottom + 8, left: rect.left + rect.width / 2 };
      } else if (position === 'left') {
        newCoords = { top: rect.top + rect.height / 2, left: rect.left - 8 };
      } else if (position === 'right') {
        newCoords = { top: rect.top + rect.height / 2, left: rect.right + 8 };
      }

      setCoords(newCoords);
      setVisible(true);
    },
    [position],
  );

  if (disabled) {
    return <>{children}</>;
  }

  return (
    <>
      <div
        className="relative inline-block"
        onMouseEnter={showTooltip}
        onMouseLeave={() => setVisible(false)}
      >
        {children}
      </div>
      {visible &&
        createPortal(
          <div
            className={classNames(
              'fixed z-50 bg-[rgb(43,43,43)] text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap border border-white/10',
              className,
            )}
            style={{
              top: `${coords.top}px`,
              left: `${coords.left}px`,
              transform:
                position === 'top'
                  ? 'translate(-50%, -100%)'
                  : position === 'bottom'
                    ? 'translateX(-50%)'
                    : position === 'left'
                      ? 'translate(-100%, -50%)'
                      : 'translateY(-50%)',
            }}
          >
            {text}
          </div>,
          document.body,
        )}
    </>
  );
}
