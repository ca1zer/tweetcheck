import httpx
import time
import os
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
            db.commit()  # Commit the transaction to save changes
            
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
        
        # Get their following list
        following = get_followers(user_details["user_id"])
        
        return jsonify({
            'status': 'external_found',
            'message': f'User {identifier} found on Twitter',
            'user': user_details,
            'following_count': len(following),
            'following': following,
            'suggested_actions': {
                'import': True,
                'analyze': True
            }
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

        # Used, Only extract the fields we need
        users = [{
            "user_id": str(user["user_id"]),
            "username": user["username"],
            "follower_count": user["follower_count"]
        } for user in response["results"]]

        all_followers.extend(users)

        
        
        continuation_token = response.get("continuation_token")
        time.sleep(0.1)  # Small delay between requests
        
    return all_followers
