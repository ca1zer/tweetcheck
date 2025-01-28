import Link from 'next/link';

export function FollowerList({ followers }) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-lg font-semibold mb-4">Top Influential Followers</h2>
      
      <div className="space-y-4">
        {followers.map((follower) => (
          <Link
            key={follower.user_id}
            href={`/user/${follower.username}`}
            className="flex items-center p-4 rounded-lg border hover:bg-gray-50 transition-colors"
          >
            <img
              src={follower.profile_pic_url || '/default-avatar.png'}
              alt={follower.username}
              className="w-12 h-12 rounded-full mr-4"
            />
            
            <div className="flex-grow">
              <h3 className="font-medium">@{follower.username}</h3>
              <p className="text-gray-500">
                {follower.follower_count.toLocaleString()} followers
              </p>
            </div>
            
            <div className="text-right">
              <p className="text-sm text-gray-600">Network Rank</p>
              <p className="font-medium">Top {(100 - follower.pagerank_percentile).toFixed(1)}%</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}