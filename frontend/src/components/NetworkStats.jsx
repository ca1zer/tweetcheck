export function NetworkStats({ stats, user }) {
	const networkCoverage = (
		(stats.followers_in_dataset / user.follower_count) *
		100
	).toFixed(1);

	return (
		<div className="glass-card rounded-2xl p-8">
			<h2 className="text-3xl gradient-text mb-8">Network Statistics</h2>

			<div className="grid grid-cols-2 md:grid-cols-3 gap-8 mt-12">
				<div className="glass-card rounded-xl p-6">
					<p className="text-white/60 text-sm font-medium mb-2">
						Total Followers
					</p>
					<p className="text-2xl font-bold">
						{user.follower_count.toLocaleString()}
					</p>
				</div>

				<div className="glass-card rounded-xl p-6">
					<p className="text-white/60 text-sm font-medium mb-2">
						Total Following
					</p>
					<p className="text-2xl font-bold">
						{user.following_count.toLocaleString()}
					</p>
				</div>

				<div className="glass-card rounded-xl p-6">
					<p className="text-white/60 text-sm font-medium mb-2">
						Followers in Dataset
					</p>
					<p className="text-2xl font-bold">
						{stats.followers_in_dataset.toLocaleString()}
						<span className="text-sm text-white/40 ml-2 font-medium">
							({networkCoverage}%)
						</span>
					</p>
				</div>

				<div className="glass-card rounded-xl p-6">
					<p className="text-white/60 text-sm font-medium mb-2">
						Following in Dataset
					</p>
					<p className="text-2xl font-bold">
						{stats.following_in_dataset.toLocaleString()}
					</p>
				</div>

				<div className="glass-card rounded-xl p-6">
					<p className="text-white/60 text-sm font-medium mb-2">
						Reciprocal Connections
					</p>
					<p className="text-2xl font-bold">
						{stats.reciprocal_connections.toLocaleString()}
					</p>
				</div>

				<div className="glass-card rounded-xl p-6">
					<p className="text-white/60 text-sm font-medium mb-2">
						Network Percentile
					</p>
					<p className="text-2xl font-bold">
						{user.pagerank_percentile.toFixed(1)}%
					</p>
				</div>
			</div>
		</div>
	);
}
