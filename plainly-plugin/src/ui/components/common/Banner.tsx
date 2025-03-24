import { useNavigate } from '@src/ui/hooks';
import classNames from 'classnames';

export function Banner({
  show,
  children,
}: { show: boolean; children: React.ReactNode }) {
  const { sidebarOpen } = useNavigate();

  return (
    <div
      className={classNames(
        show ? 'flex' : 'hidden',
        'h-6 bg-indigo-500 opacity-70 bg-opacity-60 justify-center items-center',
        sidebarOpen
          ? 'ml-[3.75rem] xs:ml-36 mr-[3.75rem] w-[calc(100%-3.75rem)] xs:w-[calc(100%-9rem)]'
          : 'ml-[3.75rem] w-[calc(100%-3.75rem)]',
      )}
    >
      {children}
    </div>
  );
}
