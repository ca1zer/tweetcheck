"use client";

import { useState, useRef, useCallback } from "react";
import { searchUsers, getUserData, analyzeNewUser } from "../lib/api";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { NetworkStats } from "../components/NetworkStats";
import { FollowerList } from "../components/FollowerList";

export default function HomePage() {
	const selectedUserRef = useRef(null);
	const [query, setQuery] = useState("");
	const [results, setResults] = useState([]);
	const [isSearching, setIsSearching] = useState(false);
	const [error, setError] = useState(null);
	const [selectedUser, setSelectedUser] = useState(null);
	const [isLoadingUser, setIsLoadingUser] = useState(false);
	const [userError, setUserError] = useState(null);
	const [manualUsername, setManualUsername] = useState("");
	const [isAnalyzing, setIsAnalyzing] = useState(false);
	const [hasSearched, setHasSearched] = useState(false);
	const [showLongLoadingMessage, setShowLongLoadingMessage] = useState(false);
	const [showQuickLoadingMessage, setShowQuickLoadingMessage] = useState(false);

	async function handleSearch(e) {
		e.preventDefault();
		if (!query.trim()) return;

		setIsSearching(true);
		setError(null);
		setSelectedUser(null);
		setUserError(null);
		setHasSearched(true);

		try {
			const users = await searchUsers(query);
			setResults(users);
		} catch (err) {
			setError("Failed to search users");
			setResults([]);
		} finally {
			setIsSearching(false);
		}
	}

	const scrollToSelectedUser = useCallback(() => {
		if (selectedUserRef.current) {
			selectedUserRef.current.scrollIntoView({
				behavior: "smooth",
				block: "start",
			});
		}
	}, []);

	async function handleUserSelect(username) {
		setIsLoadingUser(true);
		setUserError(null);
		setShowQuickLoadingMessage(true);

		// Hide quick message after 1 second
		setTimeout(() => setShowQuickLoadingMessage(false), 1000);

		try {
			const data = await getUserData(username);
			setSelectedUser(data);
			// Scroll after data is loaded
			setTimeout(scrollToSelectedUser, 100); // Small delay to ensure DOM update
		} catch (e) {
			setUserError(e instanceof Error ? e.message : "Failed to load user data");
		} finally {
			setIsLoadingUser(false);
		}
	}

	return (
		<main className="min-h-screen relative">
			{/* Corner Banner */}
			<a
				href="https://x.com/AkrasiaAI"
				target="_blank"
				rel="noopener noreferrer"
				className="fixed top-4 right-4 text-sm font-medium text-[#394374] hover:text-[#4A5FBF] transition-colors z-50 tracking-wider drop-shadow-sm"
			>
				Powered by Akrasia AI
			</a>

			<div className="container mx-auto px-4 py-12">
				<div className="max-w-2xl mx-auto">
					<div className="text-center mb-8 animate-float">
						<h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink bg-clip-text text-transparent drop-shadow-[0_0_12px_rgba(189,0,255,0.5)]">
							Twitter Influence Explorer
						</h1>
						<p className="text-lg text-white/50 font-medium">
							Analyze Twitter users' influence and network metrics
						</p>
					</div>

					<div className="glass-card rounded-lg p-3 mb-8 border border-neon-purple/20 shadow-neon shadow-neon-purple/5">
						<form onSubmit={handleSearch} className="flex gap-2">
							<div className="relative group flex-1">
								<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
									<svg
										className="h-4 w-4 text-white/30 group-hover:text-neon-purple/50 transition-colors duration-300"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
										/>
									</svg>
								</div>
								<input
									type="text"
									value={query}
									onChange={(e) => setQuery(e.target.value)}
									placeholder="Search by username or user ID"
									className="w-full pl-10 pr-3 h-9 rounded-lg search-input text-sm"
								/>
								<div className="absolute inset-0 -z-10 bg-gradient-to-r from-neon-purple/20 via-neon-pink/20 to-neon-blue/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg blur-xl" />
							</div>
							<button
								type="submit"
								className="search-button px-6 h-9 flex items-center justify-center min-w-[100px]"
								disabled={isSearching}
							>
								<span className="relative">
									{isSearching ? (
										<>
											<svg
												className="animate-spin -ml-1 mr-2 h-4 w-4 inline"
												fill="none"
												viewBox="0 0 24 24"
											>
												<circle
													className="opacity-25"
													cx="12"
													cy="12"
													r="10"
													stroke="currentColor"
													strokeWidth="4"
												></circle>
												<path
													className="opacity-75"
													fill="currentColor"
													d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
												></path>
											</svg>
											Searching...
										</>
									) : (
										"Search"
									)}
									<div className="absolute inset-0 -z-10 bg-gradient-to-r from-neon-purple via-neon-pink to-neon-blue opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg blur-xl" />
								</span>
							</button>
						</form>
					</div>

					{isSearching && <LoadingSpinner />}

					{error && (
						<div className="glass-card rounded p-3 mb-4 border-l-2 border-red-500/50 text-red-200 text-sm">
							{error}
						</div>
					)}

					<div className="space-y-8">
						{results.length > 0 && (
							<div className="space-y-2">
								{results.map((user) => (
									<button
										key={user.user_id}
										onClick={() => handleUserSelect(user.username)}
										className="w-full user-card"
									>
										<div className="flex items-center space-x-3">
											<div className="relative">
												<div className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-neon-purple to-neon-pink opacity-75 blur-sm" />
												<div className="relative w-10 h-10 rounded-full bg-gradient-to-r from-neon-purple to-neon-pink p-0.5">
													<img
														src={user.profile_pic_url || "/default-avatar.png"}
														alt={user.username}
														className="w-full h-full rounded-full object-cover bg-dark-900"
													/>
												</div>
											</div>
											<div className="flex-1 text-left">
												<h3 className="text-base font-semibold text-white">
													@{user.username}
												</h3>
												<p className="text-sm text-white/40">
													{user.follower_count.toLocaleString()} followers
												</p>
											</div>
											{user.pagerank_score >= 0 && (
												<div className="text-right">
													<div className="text-xs text-white/40 mb-0.5">
														Network Rank
													</div>
													<div className="gradient-text text-sm">
														Top {(100 - user.pagerank_percentile).toFixed(1)}%
													</div>
												</div>
											)}
										</div>
									</button>
								))}
							</div>
						)}

						{query && hasSearched && !isSearching && results.length === 0 && (
							<div className="glass-card rounded p-6 text-center space-y-4">
								<p className="text-white/50 text-lg font-medium mb-2">
									No users found in our database
								</p>

								<div className="max-w-md mx-auto">
									<p className="text-transparent bg-clip-text bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink text-base font-medium mb-2">
										Don't worry! We can still analyze your profile
									</p>
									<p className="text-white/70 text-sm mb-3">
										While our database focuses on influential crypto
										personalities, we can instantly analyze any Twitter
										profile's metrics and network influence.
									</p>
									<div className="relative group">
										<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
											<svg
												className="h-4 w-4 text-white/30 group-hover:text-neon-purple/50 transition-colors duration-300"
												fill="none"
												viewBox="0 0 24 24"
												stroke="currentColor"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
													d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
												/>
											</svg>
										</div>
										<input
											type="text"
											value={manualUsername}
											onChange={(e) => setManualUsername(e.target.value)}
											placeholder="Enter your Twitter username"
											className="w-full pl-10 pr-3 h-9 rounded-lg search-input text-sm"
											disabled={isAnalyzing}
										/>
										<div className="absolute inset-0 -z-10 bg-gradient-to-r from-neon-purple/20 via-neon-pink/20 to-neon-blue/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg blur-xl" />
									</div>

									<button
										onClick={async () => {
											if (manualUsername.trim()) {
												setIsAnalyzing(true);
												setShowLongLoadingMessage(false);

												// Set up timer for long loading message
												const loadingTimer = setTimeout(() => {
													setShowLongLoadingMessage(true);
												}, 4000);

												try {
													const data = await analyzeNewUser(
														manualUsername.trim()
													);
													setSelectedUser(data);
													// Scroll after analysis is complete
													setTimeout(scrollToSelectedUser, 100); // Small delay to ensure DOM update
												} catch (e) {
													setUserError(
														e instanceof Error
															? e.message
															: "Failed to analyze user"
													);
												} finally {
													clearTimeout(loadingTimer);
													setIsAnalyzing(false);
													setShowLongLoadingMessage(false);
												}
											}
										}}
										className="search-button px-6 h-9 flex items-center justify-center min-w-[100px] mt-3 mx-auto"
										disabled={isAnalyzing || !manualUsername.trim()}
									>
										<span className="relative">
											{isAnalyzing ? (
												<div className="flex items-center">
													<svg
														className="animate-spin -ml-1 mr-2 h-4 w-4"
														fill="none"
														viewBox="0 0 24 24"
													>
														<circle
															className="opacity-25"
															cx="12"
															cy="12"
															r="10"
															stroke="currentColor"
															strokeWidth="4"
														></circle>
														<path
															className="opacity-75"
															fill="currentColor"
															d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
														></path>
													</svg>
													Analyzing...
												</div>
											) : (
												"Analyze"
											)}
											<div className="absolute inset-0 -z-10 bg-gradient-to-r from-neon-purple via-neon-pink to-neon-blue opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg blur-xl" />
										</span>
									</button>
								</div>
							</div>
						)}

						{isLoadingUser && (
							<div className="glass-card rounded-lg p-6">
								<LoadingSpinner />
							</div>
						)}

						{userError && (
							<div className="glass-card rounded p-3 text-center text-red-200 text-sm border-l-2 border-red-500/50">
								{userError}
							</div>
						)}

						{selectedUser && (
							<div ref={selectedUserRef} className="space-y-8">
								<div className="glass-card rounded-2xl p-10 border border-neon-purple/20">
									<div className="flex items-center">
										<div className="relative">
											<div className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-neon-purple to-neon-pink opacity-75 blur-sm" />
											<div className="relative w-24 h-24 rounded-full bg-gradient-to-r from-neon-purple to-neon-pink p-0.5">
												<img
													src={
														selectedUser.user.profile_pic_url ||
														"/default-avatar.png"
													}
													alt={selectedUser.user.username}
													className="w-full h-full rounded-full object-cover bg-dark-900"
												/>
											</div>
										</div>
										<div className="ml-8">
											<h1 className="text-3xl gradient-text drop-shadow-[0_0_12px_rgba(189,0,255,0.5)]">
												@{selectedUser.user.username}
											</h1>
											<p className="text-white/60 text-lg mt-2">
												{selectedUser.user.description}
											</p>
											<div className="mt-4 flex gap-3">
												{selectedUser.user.is_verified && (
													<span className="bg-gradient-to-r from-neon-purple to-neon-pink text-white text-sm font-medium px-6 py-2 rounded-full shadow-lg hover:shadow-neon-purple/30 transition-all duration-300">
														Verified
													</span>
												)}
												<span className="bg-gradient-to-r from-neon-blue to-neon-purple text-white text-sm font-medium px-6 py-2 rounded-full shadow-lg hover:shadow-neon-blue/30 transition-all duration-300">
													Top{" "}
													{(
														100 - selectedUser.user.pagerank_percentile
													).toFixed(1)}
													%
												</span>
											</div>
										</div>
									</div>
								</div>

								<NetworkStats
									stats={selectedUser.network_stats}
									user={selectedUser.user}
								/>
								<FollowerList
									followers={selectedUser.top_followers}
									onUserSelect={handleUserSelect}
								/>
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Quick loading message */}
			{showQuickLoadingMessage && (
				<div className="fixed inset-0 flex items-center justify-center z-50">
					<div className="glass-card rounded-lg p-4 animate-fade-up text-center backdrop-blur-sm">
						<div className="mb-2">
							<svg
								className="animate-spin h-5 w-5 mx-auto text-neon-purple"
								fill="none"
								viewBox="0 0 24 24"
							>
								<circle
									className="opacity-25"
									cx="12"
									cy="12"
									r="10"
									stroke="currentColor"
									strokeWidth="4"
								></circle>
								<path
									className="opacity-75"
									fill="currentColor"
									d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
								></path>
							</svg>
						</div>
						<p className="text-lg bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent font-medium">
							Fetching Network Analysis
						</p>
					</div>
				</div>
			)}

			{/* Long loading message */}
			{showLongLoadingMessage && (
				<div className="fixed inset-0 flex items-center justify-center z-50 px-4">
					<div className="glass-card rounded-xl p-6 shadow-lg border border-neon-purple/40 max-w-lg mx-auto text-center animate-fade-up backdrop-blur-sm">
						<div className="mb-4">
							<svg
								className="animate-spin h-8 w-8 mx-auto text-neon-purple"
								fill="none"
								viewBox="0 0 24 24"
							>
								<circle
									className="opacity-25"
									cx="12"
									cy="12"
									r="10"
									stroke="currentColor"
									strokeWidth="4"
								></circle>
								<path
									className="opacity-75"
									fill="currentColor"
									d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
								></path>
							</svg>
						</div>
						<h3 className="text-2xl font-semibold mb-3 bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink bg-clip-text text-transparent">
							Building Your Network Graph
						</h3>
						<p className="text-white/90 mb-3 text-lg">
							We're analyzing your connections and calculating influence metrics
							to provide the most accurate insights.
						</p>
						<div className="space-y-2 text-white/70">
							<p className="text-sm">✨ Mapping follower relationships</p>
							<p className="text-sm">📊 Computing network influence scores</p>
							<p className="text-sm">🔍 Identifying key connections</p>
						</div>
					</div>
				</div>
			)}
		</main>
	);
}
