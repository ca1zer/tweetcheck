export function NetworkStats({ stats, user }) {
  const networkCoverage = (stats.followers_in_dataset / user.follower_count * 100).toFixed(1);
  
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-lg font-semibold mb-4">Network Statistics</h2>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-gray-600">Total Followers</p>
          <p className="text-xl font-medium">
            {user.follower_count.toLocaleString()}
          </p>
        </div>
        
        <div>
          <p className="text-gray-600">Total Following</p>
          <p className="text-xl font-medium">
            {user.following_count.toLocaleString()}
          </p>
        </div>
        
        <div>
          <p className="text-gray-600">Followers in Dataset</p>
          <p className="text-xl font-medium">
            {stats.followers_in_dataset.toLocaleString()}
            <span className="text-sm text-gray-500 ml-2">({networkCoverage}%)</span>
          </p>
        </div>
        
        <div>
          <p className="text-gray-600">Following in Dataset</p>
          <p className="text-xl font-medium">
            {stats.following_in_dataset.toLocaleString()}
          </p>
        </div>
        
        <div>
          <p className="text-gray-600">Reciprocal Connections</p>
          <p className="text-xl font-medium">
            {stats.reciprocal_connections.toLocaleString()}
          </p>
        </div>
        
        <div>
          <p className="text-gray-600">Network Percentile</p>
          <p className="text-xl font-medium">
            {user.pagerank_percentile.toFixed(1)}%
          </p>
        </div>
      </div>
    </div>
  );
}