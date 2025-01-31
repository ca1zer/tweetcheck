import httpx
import time
import os
from datetime import datetime
from typing import List, Dict, Any
from flask import jsonify

# Debug print for environment variables
api_key = os.getenv("RAPID_API_KEY")


API_BASE = "https://twitter154.p.rapidapi.com"
HEADERS = {
    "x-rapidapi-key": api_key,  # Store in variable for debugging
    "x-rapidapi-host": "twitter154.p.rapidapi.com"
}

def handle_user_not_in_db(identifier, db):
    """
    Handle the case when a requested user is not in the database.
    Attempts to fetch their data from Twitter API.
    
    Args:
        identifier: The user identifier (username or user_id)
        db: Database connection from the Flask route handler
    """
    print("\033[93mHandling user not in database\033[0m")
    
    # Check if user actually exists in DB
    print("\033[91mChecking if user exists in database...\033[0m")
    
    # Single query to check both user_id and username
    # user = db.execute("""
    #     SELECT * FROM users 
    #     WHERE user_id = ? 
    #     OR LOWER(username) = LOWER(?)
    # """, (str(identifier), str(identifier))).fetchone()
    
    # if user:
    #     print(f"\033[91mUser {identifier} found in database - Please use /api/user\033[0m")
    #     return jsonify({
    #         'status': 'error',
    #         'message': f'User {identifier} is already in the database. Please use /api/user endpoint instead.',
    #         'suggested_actions': {
    #             'redirect': '/api/user'
    #         }
    #     }), 200

    try:
        # Get user details from Twitter
        user_details = get_user_details(identifier)
        
        # Add additional tracking fields
        user_details.update({
            'last_updated': int(time.time() * 1000),  # milliseconds timestamp
            'followers_crawled': False,
            'bfs_depth': 0,
            'is_in_niche': False,
            'checked_in_niche': False
        })
        
        # Save user to database
        try:
            db.execute("""
                INSERT OR REPLACE INTO users (
                    user_id, username, name, follower_count, following_count,
                    description, creation_date, timestamp, is_private, is_verified,
                    location, profile_pic_url, profile_banner_url, external_url,
                    number_of_tweets, bot, has_nft_avatar, last_updated,
                    followers_crawled, bfs_depth, is_in_niche, checked_in_niche
                ) VALUES (
                    ?, ?, ?, ?, ?,
                    ?, ?, ?, ?, ?,
                    ?, ?, ?, ?,
                    ?, ?, ?, ?,
                    ?, ?, ?, ?
                )
            """, (
                user_details['user_id'],
                user_details.get('username'),
                user_details.get('name'),
                user_details.get('follower_count'),
                user_details.get('following_count'),
                user_details.get('description'),
                user_details.get('creation_date'),
                user_details.get('timestamp'),
                1 if user_details.get('is_private') else 0,
                1 if user_details.get('is_verified') else 0,
                user_details.get('location'),
                user_details.get('profile_pic_url'),
                user_details.get('profile_banner_url'),
                user_details.get('external_url'),
                user_details.get('number_of_tweets'),
                1 if user_details.get('bot') else 0,
                1 if user_details.get('has_nft_avatar') else 0,
                user_details['last_updated'],
                1 if user_details['followers_crawled'] else 0,
                user_details['bfs_depth'],
                1 if user_details['is_in_niche'] else 0,
                1 if user_details['checked_in_niche'] else 0
            ))
            # db.commit()  # Commit the transaction to save changes
            
            # Verify the save operation
            saved_user = db.execute(
                "SELECT * FROM users WHERE user_id = ?", 
                (user_details['user_id'],)
            ).fetchone()

            # Just see if akrasia is here 
            saved_user_sanity_check = db.execute(
                "SELECT * FROM users WHERE LOWER(username) = LOWER(?)", 
                ('akrasiaai',)
            ).fetchone()
            print("sanity check start", saved_user_sanity_check, "sanity check end")
            
            if saved_user:
                print(f"\033[92mVerified: User {user_details.get('username')} was successfully saved to database\033[0m")
                print("\033[92mSaved user data:\033[0m")
                for key, value in dict(saved_user).items():
                    print(f"\033[92m  {key}: {value}\033[0m")
            else:
                print(f"\033[91mWarning: Failed to verify user {user_details.get('username')} in database\033[0m")
                
        except Exception as e:
            print(f"\033[91mError saving user to database: {str(e)}\033[0m")
            raise


        
        # Get their follower list
        followers = get_followers(user_details["user_id"])
        
        # Calculate sum of pagerank_score/outbound_edges for all followers
        follower_scores_sum = 0
        if followers:
            # Get the most recent metrics for each follower
            placeholders = ','.join(['?' for _ in followers])
            metrics_query = f"""
                WITH LatestDates AS (
                    SELECT user_id, MAX(date) as max_date
                    FROM user_daily_metrics
                    WHERE user_id IN ({placeholders})
                    GROUP BY user_id
                )
                SELECT m.user_id, m.pagerank_score, m.outbound_edges
                FROM user_daily_metrics m
                INNER JOIN LatestDates ld
                    ON m.user_id = ld.user_id 
                    AND m.date = ld.max_date
                WHERE m.outbound_edges > 0
            """
            
            metrics_results = db.execute(metrics_query, followers).fetchall()
            
            # Create a dict for quick lookup
            metrics_dict = {str(row['user_id']): row for row in metrics_results}
            
            # Calculate sum
            for follower_id in followers:
                if follower_id in metrics_dict:
                    metrics = metrics_dict[follower_id]
                    follower_scores_sum += (metrics['pagerank_score'] / (metrics['outbound_edges'] + 1))
                # If follower not found in metrics, add 0 (implicit)
                    
            follower_scores_sum *= 0.85
            # followers_with_pagerank = []
            # for follower_id in followers:
            #     if follower_id in metrics_dict:
            #         metrics = metrics_dict[follower_id]
            #         followers_with_pagerank.append({
            #             'user_id': follower_id,
            #             'pagerank_score': metrics['pagerank_score'],
            #             'outbound_edges': metrics['outbound_edges'],
            #         })
                
        
        # Calculate percentile for the follower_scores_sum
        # follower_scores_percentile = estimate_pagerank_percentile_fast(follower_scores_sum, db)

        # Prepare to add into user_daily_metrics, need date, user_id, pagerank_score, pagerank_percentile, follower_count, following_count, inbound_edges, outbound_edges
        metrics = {
            'user_id': user_details['user_id'],
            'date': datetime.now().date(),
            'pagerank_score': follower_scores_sum,
            'pagerank_percentile': None,  # Will be calculated later if needed
            'follower_count': user_details['follower_count'],
            'following_count': user_details['following_count'],
            'inbound_edges': len(metrics_dict), # followers in
            'outbound_edges': 0  # Default to 0 since we don't have this info yet
        }

        # Save metrics to database
        db.execute("""
            INSERT OR REPLACE INTO user_daily_metrics 
            (user_id, date, pagerank_score, pagerank_percentile, 
            follower_count, following_count, inbound_edges, outbound_edges)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            metrics['user_id'],  # user_id (from user_details)
            metrics['date'],     # date (current date)
            metrics['pagerank_score'], # pagerank_score (using follower_scores_sum)
            metrics['pagerank_percentile'], # pagerank_percentile 
            metrics['follower_count'], # follower_count (from user_details)
            metrics['following_count'], # following_count (from user_details)
            metrics['inbound_edges'], # inbound_edges (length of followers list)
            metrics['outbound_edges'] # outbound_edges (default 0)
        ))



        
        
        return jsonify({
            'status': 'external_found',
            'message': f'User {identifier} found on Twitter',
            'user': user_details,
            'follower_count': len(followers),
            'followers': followers,
            'follower_pagerank_sum': follower_scores_sum,
            # 'follower_pagerank_percentile': follower_scores_percentile,
            'suggested_actions': {
                'import': True,
                'analyze': True
            },
            'metrics': metrics
            # 'followers_with_pagerank': followers_with_pagerank,
        }), 200
        
    except Exception as e:
        # If Twitter API fails, return not found
        return jsonify({
            'status': 'not_found',
            'message': f'User {identifier} not found in database or Twitter',
            'error': str(e),
            'suggested_actions': {
                'retry': True,
                'search': True
            }
        }), 200

def make_request(url: str, params: Dict) -> Dict:
    """Handle API requests with exponential backoff retry logic"""
    if not api_key:
        raise Exception("RAPID_API_KEY environment variable is not set!")
        
    max_attempts = 5
    response = None
    
    for attempt in range(max_attempts):
        try:
            with httpx.Client() as client:
                response = client.get(url, headers=HEADERS, params=params)
                response.raise_for_status()
                return response.json()
                
        except httpx.HTTPStatusError as e:
            if response and response.status_code == 429:
                wait_time = 2 ** attempt
                time.sleep(wait_time)
                continue
            raise Exception(f"HTTP Error: {str(e)}")
            
        except Exception as e:
            if attempt == max_attempts - 1:
                raise
            
            wait_time = 1 * attempt
            time.sleep(wait_time)
    
    raise Exception("Max retry attempts reached")

def get_user_details(identifier: str) -> Dict:
    """Get basic profile info for a user"""
    url = f"{API_BASE}/user/details"
    # Convert identifier to expected format
    params = {"username": identifier} if isinstance(identifier, str) else identifier
    
    print(f"Fetching user details for {identifier}...")
    print(f"URL: {url}")
    print(f"Params: {params}")
    
    response = make_request(url, params)
    
    if "user_id" in response:
        response["user_id"] = str(response["user_id"])
    
    return response

def get_followers(user_id: str, max_limit: int = 2500) -> List[Dict]:
    """
    Fetch user's followers list with pagination
    Returns normalized user objects with string IDs
    """
    all_followers = []
    continuation_token = ""
    limit = 100  # Users per request
    
    while len(all_followers) < max_limit:
        # Use different URL if we have continuation token
        url = f"{API_BASE}/user/followers"
        if continuation_token:
            url += "/continuation"
            
        params = {
            "user_id": str(user_id),
            "limit": limit,
            "continuation_token": continuation_token
        }
        
        response = make_request(url, params)
        
        # Break if no more results
        if not response.get("results"):
            break
            
        # Unused, but has everything
        fullInfoUsers = [{**user, "user_id": str(user["user_id"])} 
                for user in response["results"]]

        # Used, Extract into an object with three fields
        # users = [{
        #     "user_id": str(user["user_id"]),
        #     "username": user["username"],
        #     "follower_count": user["follower_count"]
        # } for user in response["results"]]

        # Extract into not object and only one field, user_id, for preparation of getting pagerank scores of everything
        users = [str(user["user_id"]) for user in response["results"]]


        all_followers.extend(users)

        
        
        continuation_token = response.get("continuation_token")
        time.sleep(0.1)  # Small delay between requests
        
    return all_followers

def estimate_pagerank_percentile_fast(score, db):
    """
    Ultra-fast PageRank percentile estimation using anchor points.
    Only queries 5 strategic points for estimation.
    
    Args:
        score: The PageRank score to estimate percentile for
        db: Database connection
        
    Returns:
        float: Estimated percentile (0-100)
    """
    # Get 11 strategic anchor points for more granular percentile estimation
    # Using NTILE and ROW_NUMBER for efficient single-scan calculation
    anchor_points = db.execute("""
        WITH latest_date AS (
            SELECT MAX(date) as max_date 
            FROM user_daily_metrics
        ),
        ranked_scores AS (
            SELECT pagerank_score,
                   NTILE(20) OVER (ORDER BY pagerank_score) as vigintile,
                   ROW_NUMBER() OVER (PARTITION BY NTILE(20) OVER (ORDER BY pagerank_score) ORDER BY pagerank_score) as rn
            FROM user_daily_metrics
            WHERE date = (SELECT max_date FROM latest_date)
            AND pagerank_score > 0  -- Skip any zero scores
        )
        SELECT 
            MIN(CASE WHEN vigintile = 1 AND rn = 1 THEN pagerank_score END) as p5,
            MIN(CASE WHEN vigintile = 2 AND rn = 1 THEN pagerank_score END) as p10,
            MIN(CASE WHEN vigintile = 4 AND rn = 1 THEN pagerank_score END) as p20,
            MIN(CASE WHEN vigintile = 6 AND rn = 1 THEN pagerank_score END) as p30,
            MIN(CASE WHEN vigintile = 8 AND rn = 1 THEN pagerank_score END) as p40,
            MIN(CASE WHEN vigintile = 10 AND rn = 1 THEN pagerank_score END) as p50,
            MIN(CASE WHEN vigintile = 12 AND rn = 1 THEN pagerank_score END) as p60,
            MIN(CASE WHEN vigintile = 14 AND rn = 1 THEN pagerank_score END) as p70,
            MIN(CASE WHEN vigintile = 16 AND rn = 1 THEN pagerank_score END) as p80,
            MIN(CASE WHEN vigintile = 18 AND rn = 1 THEN pagerank_score END) as p90,
            MIN(CASE WHEN vigintile = 19 AND rn = 1 THEN pagerank_score END) as p95
        FROM ranked_scores
    """).fetchone()
    
    if not anchor_points:
        return 50.0  # Default to middle if no data
    
    # Convert to list for easier indexing with more granular points
    anchors = [
        (5, anchor_points['p5']),
        (10, anchor_points['p10']),
        (20, anchor_points['p20']),
        (30, anchor_points['p30']),
        (40, anchor_points['p40']),
        (50, anchor_points['p50']),
        (60, anchor_points['p60']),
        (70, anchor_points['p70']),
        (80, anchor_points['p80']),
        (90, anchor_points['p90']),
        (95, anchor_points['p95'])
    ]
    
    # Find which segment the score falls into
    for i in range(len(anchors) - 1):
        if score <= anchors[0][1]:  # Below p10
            return max(1, (score / anchors[0][1]) * 10)
        elif score >= anchors[-1][1]:  # Above p90
            remaining_range = 100 - anchors[-1][0]
            overshoot = (score - anchors[-1][1]) / anchors[-1][1]
            return min(99.9, anchors[-1][0] + (overshoot * remaining_range))
        elif anchors[i][1] <= score <= anchors[i + 1][1]:
            # Linear interpolation within the segment
            segment_start = anchors[i]
            segment_end = anchors[i + 1]
            
            # Calculate position within segment
            segment_progress = (score - segment_start[1]) / (segment_end[1] - segment_start[1])
            segment_size = segment_end[0] - segment_start[0]
            
            return segment_start[0] + (segment_progress * segment_size)
    
    return 50.0  # Fallback
