from flask import jsonify, request, make_response
from app import get_db
from . import api

@api.route('/api/search')
def search_users():
    """Search users by username or user_id"""
    query = request.args.get('q', '')
    if not query:
        return jsonify([])
    
    db = get_db()
    users = db.execute("""
        SELECT u.user_id, u.username, u.profile_pic_url,
               m.pagerank_score, m.pagerank_percentile,
               u.follower_count
        FROM users u
        LEFT JOIN (
            SELECT *
            FROM user_daily_metrics
            WHERE date = (SELECT MAX(date) FROM user_daily_metrics)
        ) m ON m.user_id = u.user_id
        WHERE LOWER(username) LIKE LOWER(?)
        ORDER BY m.pagerank_score DESC NULLS LAST
        LIMIT 10
    """, (f'%{query}%',)).fetchall()
    
    response = make_response(jsonify([dict(user) for user in users]))
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    return response    