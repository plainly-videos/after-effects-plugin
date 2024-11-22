'use client';

import classNames from 'classnames';
import Footer from '../footer/Footer';
import { useGlobalState, State } from '../../state/store';

export default function MainWrapper({
	children,
}: {
	children: React.ReactNode;
}) {
	const [settings] = useGlobalState(State.SETTINGS);
	const sidebarOpen = settings.sidebarOpen;

	return (
		<main className={classNames(sidebarOpen ? 'pl-64' : 'pl-[3.75rem]')}>
			<div className="p-12 sm:p-14 lg:p-20 min-h-screen justify-between items-center flex flex-col">
				{children}
				<Footer />
			</div>
		</main>
	);
}
