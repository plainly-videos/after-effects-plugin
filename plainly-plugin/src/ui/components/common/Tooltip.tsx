import { useCallback, useState } from 'react';
import { createPortal } from 'react-dom';

export function Tooltip({
  text,
  children,
  position = 'top',
  disabled,
}: {
  text: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  disabled?: boolean;
}) {
  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });

  const showTooltip = useCallback(
    (event: React.MouseEvent) => {
      const rect = event.currentTarget.getBoundingClientRect();
      let newCoords = { top: rect.top, left: rect.left };

      if (position === 'top') {
        newCoords = { top: rect.top - 30, left: rect.left + rect.width / 2 };
      } else if (position === 'bottom') {
        newCoords = { top: rect.bottom + 5, left: rect.left + rect.width / 2 };
      } else if (position === 'left') {
        newCoords = { top: rect.top + rect.height / 2, left: rect.left - 60 };
      } else if (position === 'right') {
        newCoords = { top: rect.top + rect.height / 2, left: rect.right + 10 };
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
            className="fixed z-50 bg-[rgb(43,43,43)] text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap border border-white/10"
            style={{
              top: `${coords.top}px`,
              left: `${coords.left}px`,
              transform:
                position === 'top' || position === 'bottom'
                  ? 'translateX(-50%)'
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
