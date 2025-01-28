"use client";

import { useEffect, useState } from "react";
import { getUserData, getUserHistory } from "../../lib/api";
import { NetworkStats } from "../../components/NetworkStats";
import { FollowerList } from "../../components/FollowerList";
import { HistoryChart } from "../../components/HistoryChart";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { ErrorMessage } from "../../components/ErrorMessage";

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

				// In Next.js 14, dynamic route params are accessed via params.[segment]
				const [data, history] = await Promise.all([
					getUserData(params.slug),
					getUserHistory(params.slug),
				]);

				setUserData(data);
				setUserHistory(history);
			} catch (e) {
				setError(e instanceof Error ? e.message : "Failed to load user data");
			} finally {
				setIsLoading(false);
			}
		}

		fetchData();
	}, [params.slug]);

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
		<div className="container mx-auto px-4 py-12">
			{/* User Header */}
			<div className="gradient-border rounded-2xl p-8 mb-12">
				<div className="flex items-center">
					<img
						src={userData.user.profile_pic_url || "/default-avatar.png"}
						alt={userData.user.username}
						className="w-24 h-24 rounded-full mr-8 ring-4 ring-white shadow-lg"
					/>
					<div>
						<h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
							@{userData.user.username}
						</h1>
						<p className="text-gray-600 text-lg mt-2">
							{userData.user.description}
						</p>
						<div className="mt-4 flex gap-3">
							{userData.user.is_verified && (
								<span className="bg-gradient-to-r from-primary to-accent text-white text-sm font-medium px-4 py-1.5 rounded-full">
									Verified
								</span>
							)}
							<span className="bg-gradient-to-r from-secondary to-accent text-white text-sm font-medium px-4 py-1.5 rounded-full">
								Top {(100 - userData.user.pagerank_percentile).toFixed(1)}%
							</span>
						</div>
					</div>
				</div>
			</div>

			{/* Stats Grid */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
				<NetworkStats stats={userData.network_stats} user={userData.user} />
				<HistoryChart data={userHistory.history} />
			</div>

			{/* Followers */}
			<FollowerList followers={userData.top_followers} />
		</div>
	);
}
