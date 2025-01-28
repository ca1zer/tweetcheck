"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { searchUsers } from "../lib/api";
import { LoadingSpinner } from "../components/LoadingSpinner";

export default function HomePage() {
	const [query, setQuery] = useState("");
	const [results, setResults] = useState([]);
	const [isSearching, setIsSearching] = useState(false);
	const [error, setError] = useState(null);
	const router = useRouter();

	async function handleSearch(e) {
		e.preventDefault();
		if (!query.trim()) return;

		setIsSearching(true);
		setError(null);

		try {
			console.log("Starting search with query:", query);
			console.log("Environment:", process.env.NEXT_PUBLIC_API_URL);
			const users = await searchUsers(query);
			console.log("Search results:", users);
			setResults(users);
		} catch (err) {
			setError("Failed to search users");
			setResults([]);
		} finally {
			setIsSearching(false);
		}
	}

	return (
		<div className="min-h-screen bg-gray-50">
			<div className="container mx-auto px-4 py-16">
				<div className="max-w-3xl mx-auto">
					<h1 className="text-4xl font-bold text-center mb-2">
						Twitter Influence Explorer
					</h1>
					<p className="text-gray-600 text-center mb-8">
						Analyze Twitter users' influence and network metrics
					</p>

					<form onSubmit={handleSearch} className="mb-8">
						<div className="flex gap-2">
							<input
								type="text"
								value={query}
								onChange={(e) => setQuery(e.target.value)}
								placeholder="Search by username or user ID"
								className="flex-1 p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							/>
							<button
								type="submit"
								className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
								disabled={isSearching}
							>
								Search
							</button>
						</div>
					</form>

					{isSearching && <LoadingSpinner />}

					{error && (
						<div className="text-red-500 text-center mb-4">{error}</div>
					)}

					{results.length > 0 && (
						<div className="space-y-4">
							{results.map((user) => (
								<button
									key={user.user_id}
									onClick={() => router.push(`/user/${user.username}`)}
									className="w-full p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow flex items-center space-x-4"
								>
									<img
										src={user.profile_pic_url || "/default-avatar.png"}
										alt={user.username}
										className="w-12 h-12 rounded-full"
									/>
									<div className="flex-1 text-left">
										<h3 className="font-medium">@{user.username}</h3>
										<p className="text-sm text-gray-500">
											{user.follower_count.toLocaleString()} followers
										</p>
									</div>
									{user.pagerank_score && (
										<div className="text-right">
											<div className="text-sm text-gray-600">Network Rank</div>
											<div className="font-medium">
												Top {(100 - user.pagerank_percentile).toFixed(1)}%
											</div>
										</div>
									)}
								</button>
							))}
						</div>
					)}

					{query && !isSearching && results.length === 0 && (
						<p className="text-center text-gray-600">No users found</p>
					)}
				</div>
			</div>
		</div>
	);
}
