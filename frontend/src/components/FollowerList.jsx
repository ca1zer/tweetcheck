import Link from "next/link";

export function FollowerList({ followers }) {
	return (
		<div className="stat-card">
			<h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
				Top Influential Followers
			</h2>

			<div className="space-y-4">
				{followers.map((follower) => (
					<Link
						key={follower.user_id}
						href={`/user/${follower.username}`}
						className="flex items-center p-6 rounded-xl border-2 border-gray-100 hover:border-transparent hover:shadow-lg transition-all duration-300 gradient-border"
					>
						<img
							src={follower.profile_pic_url || "/default-avatar.png"}
							alt={follower.username}
							className="w-16 h-16 rounded-full mr-6 ring-2 ring-gray-100"
						/>

						<div className="flex-grow">
							<h3 className="text-lg font-semibold">@{follower.username}</h3>
							<p className="text-gray-600">
								{follower.follower_count.toLocaleString()} followers
							</p>
						</div>

						<div className="text-right">
							<p className="text-sm text-gray-600 mb-1">Network Rank</p>
							<p className="text-lg font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
								Top {(100 - follower.pagerank_percentile).toFixed(1)}%
							</p>
						</div>
					</Link>
				))}
			</div>
		</div>
	);
}
