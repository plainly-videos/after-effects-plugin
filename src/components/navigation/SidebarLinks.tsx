import { Link } from '@tanstack/react-router';
import classNames from 'classnames';
import type { LucideProps } from 'lucide-react';
import type { ForwardRefExoticComponent, RefAttributes } from 'react';
import { State, setGlobalState, useGlobalState } from '../../state/store';

export default function SidebarLinks({
	links,
	sidebarOpen,
}: {
	links: {
		name: string;
		to: string;
		icon: ForwardRefExoticComponent<
			Omit<LucideProps, 'ref'> & RefAttributes<SVGSVGElement>
		>;
		current: boolean;
	}[];
	sidebarOpen: boolean;
}) {
	const [settings] = useGlobalState(State.SETTINGS);

	return (
		<ul className="flex flex-1 flex-col gap-y-7">
			<li>
				<ul className="-mx-3 space-y-1">
					{links.map((link) => (
						<li key={link.name}>
							<Link
								to={link.to}
								onClick={() => {
									setGlobalState(State.SETTINGS, {
										...settings,
										currentPage: link.to,
									});
								}}
								className={classNames(
									link.current
										? 'bg-gray-800 text-white'
										: 'text-gray-400 hover:bg-gray-800 hover:text-white',
									'group flex gap-x-2 rounded-md px-2 py-1 text-xs font-semibold relative items-center',
								)}
							>
								<link.icon aria-hidden="true" className="size-5 shrink-0" />
								{sidebarOpen && link.name}
							</Link>
						</li>
					))}
				</ul>
			</li>
		</ul>
	);
}
