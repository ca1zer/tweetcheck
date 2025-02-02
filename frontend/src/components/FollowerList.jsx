export function FollowerList({ followers, onUserSelect }) {
	return (
		<div className="glass-card rounded-2xl p-8">
			<h2 className="text-3xl gradient-text mb-8">Top Influential Followers</h2>

			<div className="space-y-4">
				{followers.length > 0 ? (
					followers.map((follower) => (
						<button
							key={follower.user_id}
							onClick={() => onUserSelect(follower.username)}
							className="w-full user-card"
						>
							<div className="flex items-center space-x-3">
								<div className="relative">
									<div className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-neon-purple to-neon-pink opacity-75 blur-sm" />
									<div className="relative w-10 h-10 rounded-full bg-gradient-to-r from-neon-purple to-neon-pink p-0.5">
										<img
											src={follower.profile_pic_url || "/default-avatar.png"}
											alt={follower.username}
											className="w-full h-full rounded-full object-cover bg-dark-900"
										/>
									</div>
								</div>
								<div className="flex-1 text-left">
									<h3 className="text-base font-semibold text-white">
										@{follower.username}
									</h3>
									<p className="text-sm text-white/40">
										{follower.follower_count.toLocaleString()} followers
									</p>
								</div>
								<div className="text-right">
									<div className="text-xs text-white/40 mb-0.5">
										Network Rank
									</div>
									<div className="gradient-text text-sm">
										Top {(100 - follower.pagerank_percentile).toFixed(1)}%
									</div>
								</div>
							</div>
						</button>
					))
				) : (
					<div className="text-center py-8">
						<p className="text-lg text-white/70">
							No influential followers found in our database yet.
						</p>
						<p className="text-sm text-white/50 mt-2">
							Keep growing your network! As your followers join our database,
							they'll appear here.
						</p>
					</div>
				)}
			</div>
		</div>
	);
}
