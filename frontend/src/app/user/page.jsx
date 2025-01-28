'use client';

import { useEffect, useState } from 'react';
import { getUserData, getUserHistory } from '../../../lib/api';
import { NetworkStats } from '../../../components/NetworkStats';
import { FollowerList } from '../../../components/FollowerList';
import { HistoryChart } from '../../../components/HistoryChart';
import { LoadingSpinner } from '../../../components/LoadingSpinner';
import { ErrorMessage } from '../../../components/ErrorMessage';

export default function UserProfile({ params }) {
  const [userData, setUserData] = useState(null);
  const [userHistory, setUserHistory] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        setError(null);
        
        const [data, history] = await Promise.all([
          getUserData(params.identifier),
          getUserHistory(params.identifier)
        ]);
        
        setUserData(data);
        setUserHistory(history);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load user data');
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [params.identifier]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  if (!userData || !userHistory) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* User Header */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <div className="flex items-center">
          <img
            src={userData.user.profile_pic_url || '/default-avatar.png'}
            alt={userData.user.username}
            className="w-20 h-20 rounded-full mr-6"
          />
          <div>
            <h1 className="text-2xl font-bold">@{userData.user.username}</h1>
            <p className="text-gray-600">{userData.user.description}</p>
            <div className="mt-2">
              {userData.user.is_verified && (
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded mr-2">
                  Verified
                </span>
              )}
              <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                Top {(100 - userData.user.pagerank_percentile).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <NetworkStats stats={userData.network_stats} user={userData.user} />
        <HistoryChart data={userHistory.history} />
      </div>

      {/* Followers */}
      <FollowerList followers={userData.top_followers} />
    </div>
  );
}