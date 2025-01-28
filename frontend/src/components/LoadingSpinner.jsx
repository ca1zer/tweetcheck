export function LoadingSpinner() {
	return (
		<div className="flex justify-center items-center p-8">
			<div className="relative w-12 h-12">
				<div className="absolute w-full h-full rounded-full border-4 border-t-primary border-r-accent border-b-secondary border-l-primary animate-spin"></div>
				<div className="absolute w-full h-full rounded-full border-4 border-t-transparent border-r-transparent border-b-transparent border-l-accent animate-spin-slow opacity-50"></div>
			</div>
		</div>
	);
}
