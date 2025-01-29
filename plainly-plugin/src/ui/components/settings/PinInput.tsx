import classNames from 'classnames';
import {
  type Dispatch,
  type SetStateAction,
  useCallback,
  useEffect,
  useRef,
} from 'react';
import { Pin } from '../../types';

export default function PinInput({
  pin,
  className,
  onChange,
  type = 'password',
  overlay = false,
}: {
  pin: Pin | undefined;
  onChange: Dispatch<SetStateAction<Pin | undefined>>;
  className?: string;
  type?: 'text' | 'password';
  overlay?: boolean;
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
            nextInputRef = secondInputRef;
            break;
          case 'second':
            nextInputRef = thirdInputRef;
            break;
          case 'third':
            nextInputRef = fourthInputRef;
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

  useEffect(() => {
    if (overlay) {
      firstInputRef.current?.focus();
    }
  }, [overlay]);

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
        onInput={(e) => changeDigit('first', e.currentTarget.value)}
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
        onInput={(e) => changeDigit('second', e.currentTarget.value)}
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
        onInput={(e) => changeDigit('third', e.currentTarget.value)}
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
        onInput={(e) => changeDigit('fourth', e.currentTarget.value)}
      />
    </div>
  );
}
