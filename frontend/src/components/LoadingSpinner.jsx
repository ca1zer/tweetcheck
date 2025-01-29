export function LoadingSpinner() {
	return (
		<div className="flex justify-center items-center p-8">
			<div className="relative">
				<div className="w-16 h-16 rounded-full border-4 border-indigo-500/20"></div>
				<div className="absolute top-0 left-0 w-16 h-16">
					<div className="w-16 h-16 rounded-full border-4 border-transparent border-t-indigo-500 animate-spin"></div>
				</div>
				<div className="absolute top-0 left-0 w-16 h-16">
					<div className="w-16 h-16 rounded-full border-4 border-transparent border-l-purple-500/50 animate-spin-slow"></div>
				</div>
			</div>
		</div>
	);
}
