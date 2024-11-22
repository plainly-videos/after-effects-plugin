import classNames from 'classnames';
import { Eye, EyeOff } from 'lucide-react';
import { type ComponentPropsWithRef, useState } from 'react';

export default function Input({
	id,
	value,
	defaultValue,
	onChange,
	label,
	iconRight,
	type = 'text',
	autoComplete,
}: {
	id: string;
	label?: string;
	iconRight?: 'showHidePassword';
} & ComponentPropsWithRef<'input'>) {
	const [showPassword, setShowPassword] = useState(false);

	return (
		<>
			{label && (
				<label
					htmlFor={id}
					className="block text-sm/6 font-semibold text-white"
				>
					{label}
				</label>
			)}
			<div className="mt-2 relative">
				<input
					id={id}
					name={id}
					autoComplete={autoComplete}
					type={type === 'password' && showPassword ? 'text' : type}
					className={classNames(
						'block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm/6',
						iconRight && 'pr-10',
					)}
					value={value}
					defaultValue={defaultValue}
					onChange={onChange}
				/>
				{iconRight === 'showHidePassword' && (
					<button
						type="button"
						className="absolute inset-y-0 right-0 flex items-center pr-3"
						onClick={() => setShowPassword(!showPassword)}
					>
						{showPassword ? (
							<Eye aria-hidden="true" className="size-5 text-gray-400" />
						) : (
							<EyeOff aria-hidden="true" className="size-5 text-gray-400" />
						)}
					</button>
				)}
			</div>
		</>
	);
}
