import classNames from 'classnames';
import { type Dispatch, type SetStateAction, useCallback, useRef } from 'react';
import { Pin } from '../../types';

export default function PinInput({
  pin,
  className,
  onChange,
  type = 'password',
}: {
  pin: Pin | undefined;
  onChange: Dispatch<SetStateAction<Pin | undefined>>;
  className?: string;
  type?: 'text' | 'password';
}) {
  // Create refs for each input
  const firstInputRef = useRef<HTMLInputElement>(null);
  const secondInputRef = useRef<HTMLInputElement>(null);
  const thirdInputRef = useRef<HTMLInputElement>(null);
  const fourthInputRef = useRef<HTMLInputElement>(null);

  const changeDigit = useCallback(
    (
      digit: 'first' | 'second' | 'third' | 'fourth',
      value: string | undefined,
    ) => {
      const parsedValue = value ? Number.parseInt(value) : undefined;

      onChange(
        new Pin(
          digit === 'first' ? parsedValue : pin?.first,
          digit === 'second' ? parsedValue : pin?.second,
          digit === 'third' ? parsedValue : pin?.third,
          digit === 'fourth' ? parsedValue : pin?.fourth,
        ),
      );

      if (value && value.length === 1) {
        // Move focus to the next input if a valid digit is entered
        let nextInputRef: React.RefObject<HTMLInputElement> | null = null;
        switch (digit) {
          case 'first':
            if (secondInputRef.current) {
              secondInputRef.current.focus();
              nextInputRef = secondInputRef;
            }
            break;
          case 'second':
            if (thirdInputRef.current) {
              thirdInputRef.current.focus();
              nextInputRef = thirdInputRef;
            }
            break;
          case 'third':
            if (fourthInputRef.current) {
              fourthInputRef.current.focus();
              nextInputRef = fourthInputRef;
            }
            break;
          default:
            break;
        }

        if (nextInputRef?.current) {
          nextInputRef.current.focus();
          nextInputRef.current.setSelectionRange(
            0,
            nextInputRef.current.value.length,
          );
        }
      }
    },
    [pin, onChange],
  );

  return (
    <div
      className={classNames('w-full flex gap-x-2 justify-center', className)}
    >
      <input
        ref={firstInputRef}
        id="pin-first"
        name="pin"
        type={type}
        pattern="[0-9]{1}"
        className="block w-8 text-center rounded-md bg-white/5 px-3 py-1 text-xs text-white outline outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500"
        maxLength={1}
        value={pin?.first || ''}
        onChange={(e) => changeDigit('first', e.target.value)}
      />
      <input
        ref={secondInputRef}
        id="pin-second"
        name="pin"
        type={type}
        pattern="[0-9]{1}"
        maxLength={1}
        className="block w-8 text-center rounded-md bg-white/5 px-3 py-1 text-xs text-white outline outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500"
        value={pin?.second || ''}
        onChange={(e) => changeDigit('second', e.target.value)}
      />
      <input
        ref={thirdInputRef}
        id="pin-third"
        name="pin"
        type={type}
        pattern="[0-9]{1}"
        maxLength={1}
        className="block w-8 text-center rounded-md bg-white/5 px-3 py-1 text-xs text-white outline outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500"
        value={pin?.third || ''}
        onChange={(e) => changeDigit('third', e.target.value)}
      />
      <input
        ref={fourthInputRef}
        id="pin-fourth"
        name="pin"
        type={type}
        pattern="[0-9]{1}"
        maxLength={1}
        className="block w-8 text-center rounded-md bg-white/5 px-3 py-1 text-xs text-white outline outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500"
        value={pin?.fourth || ''}
        onChange={(e) => changeDigit('fourth', e.target.value)}
      />
    </div>
  );
}
