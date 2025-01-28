export function ErrorMessage({ message }) {
	return (
		<div
			className="bg-red-50 border-2 border-red-200 text-red-700 px-6 py-4 rounded-xl shadow-sm relative flex items-center gap-3"
			role="alert"
		>
			<svg
				className="w-5 h-5 text-red-500"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeWidth="2"
					d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
				></path>
			</svg>
			<div>
				<strong className="font-semibold">Error: </strong>
				<span className="block sm:inline">{message}</span>
			</div>
		</div>
	);
}
