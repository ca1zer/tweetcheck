const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
console.log("API_BASE is:", API_BASE);

export async function searchUsers(query) {
	const url = `${API_BASE}/api/search?q=${encodeURIComponent(query)}`;
	try {
		const response = await fetch(url);
		console.log("Response status:", response.status);
		console.log("Response headers:", Object.fromEntries(response.headers));
		if (!response.ok) {
			const text = await response.text();
			console.log("Error response body:", text);
			throw new Error(`Search failed: ${response.status} ${text}`);
		}
		return response.json();
	} catch (error) {
		console.error("Fetch error:", error);
		throw error;
	}
}

export async function getUserData(identifier) {
	const url = `${API_BASE}/api/user/${identifier}`;
	console.log("Making request to:", url);
	const response = await fetch(url);
	if (!response.ok) {
		throw new Error("Failed to fetch user data");
	}
	return response.json();
}

export async function getUserHistory(identifier) {
	const url = `${API_BASE}/api/user/${identifier}/history`;
	console.log("Making request to:", url);
	const response = await fetch(url);
	if (!response.ok) {
		throw new Error("Failed to fetch user history");
	}
	return response.json();
}
