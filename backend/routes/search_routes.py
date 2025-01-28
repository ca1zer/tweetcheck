from flask import jsonify, request
from . import api
from app import get_db

@api.route('/api/search')
def search_users():
    """Search users by username or user_id"""
    query = request.args.get('q', '')
    if not query:
        return jsonify([])
    
    db = get_db()
    users = db.execute("""
        SELECT u.user_id, u.username, u.profile_pic_url,
               m.pagerank_score, m.pagerank_percentile
        FROM users u
        LEFT JOIN (
            SELECT *
            FROM user_daily_metrics
            WHERE date = (SELECT MAX(date) FROM user_daily_metrics)
        ) m ON m.user_id = u.user_id
        WHERE username LIKE ? OR user_id = ?
        ORDER BY m.pagerank_score DESC NULLS LAST
        LIMIT 10
    """, (f'%{query}%', f'%{query}%')).fetchall()
    
    return jsonify([dict(user) for user in users])