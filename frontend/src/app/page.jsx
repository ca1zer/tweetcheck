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
		<div className="min-h-screen bg-background">
			<div className="container mx-auto px-4 py-16">
				<div className="max-w-3xl mx-auto">
					<div className="text-center mb-12">
						<h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent animate-gradient">
							Twitter Influence Explorer
						</h1>
						<p className="text-lg text-gray-600">
							Analyze Twitter users' influence and network metrics
						</p>
					</div>

					<form onSubmit={handleSearch} className="mb-12">
						<div className="flex gap-3">
							<input
								type="text"
								value={query}
								onChange={(e) => setQuery(e.target.value)}
								placeholder="Search by username or user ID"
								className="flex-1 p-4 border-2 border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
							/>
							<button
								type="submit"
								className="px-8 py-4 bg-gradient-to-r from-primary to-accent text-white rounded-xl hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300"
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
									className="w-full p-6 bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 flex items-center space-x-6 gradient-border"
								>
									<img
										src={user.profile_pic_url || "/default-avatar.png"}
										alt={user.username}
										className="w-12 h-12 rounded-full"
									/>
									<div className="flex-1 text-left">
										<h3 className="text-lg font-semibold">@{user.username}</h3>
										<p className="text-gray-600">
											{user.follower_count.toLocaleString()} followers
										</p>
									</div>
									{user.pagerank_score && (
										<div className="text-right">
											<div className="text-sm text-gray-600 mb-1">
												Network Rank
											</div>
											<div className="text-lg font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
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
