export function NetworkStats({ stats, user }) {
	const networkCoverage = (
		(stats.followers_in_dataset / user.follower_count) *
		100
	).toFixed(1);

	return (
		<div className="stat-card">
			<h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
				Network Statistics
			</h2>

			<div className="grid grid-cols-2 gap-6">
				<div className="stat-item">
					<p className="stat-label">Total Followers</p>
					<p className="stat-value">{user.follower_count.toLocaleString()}</p>
				</div>

				<div className="stat-item">
					<p className="stat-label">Total Following</p>
					<p className="stat-value">{user.following_count.toLocaleString()}</p>
				</div>

				<div className="stat-item">
					<p className="stat-label">Followers in Dataset</p>
					<p className="stat-value">
						{stats.followers_in_dataset.toLocaleString()}
						<span className="text-sm text-gray-500 ml-2">
							({networkCoverage}%)
						</span>
					</p>
				</div>

				<div className="stat-item">
					<p className="stat-label">Following in Dataset</p>
					<p className="stat-value">
						{stats.following_in_dataset.toLocaleString()}
					</p>
				</div>

				<div className="stat-item">
					<p className="stat-label">Reciprocal Connections</p>
					<p className="stat-value">
						{stats.reciprocal_connections.toLocaleString()}
					</p>
				</div>

				<div className="stat-item">
					<p className="stat-label">Network Percentile</p>
					<p className="stat-value">{user.pagerank_percentile.toFixed(1)}%</p>
				</div>
			</div>
		</div>
	);
}
