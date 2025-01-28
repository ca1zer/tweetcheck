from flask import jsonify
from app import get_db
from . import api

@api.route('/api/user/<identifier>')
def get_user_data(identifier):
   """Get user data and network statistics"""
   db = get_db()
   
   # Get user with latest metrics in one query
   user = db.execute("""
       SELECT u.*, m.pagerank_score, m.pagerank_percentile, 
              m.inbound_edges, m.outbound_edges
       FROM users u
       LEFT JOIN (
           SELECT *
           FROM user_daily_metrics
           WHERE date = (SELECT MAX(date) FROM user_daily_metrics)
       ) m ON m.user_id = u.user_id
       WHERE u.user_id = ? OR LOWER(u.username) = LOWER(?)
   """, (identifier, identifier)).fetchone()
   
   if not user:
       return jsonify({'error': 'User not found'}), 404
   
   # Get top followers with their latest metrics
   followers = db.execute("""
       SELECT u.*, m.pagerank_score, m.pagerank_percentile
       FROM users u
       JOIN following_relationships f ON f.user_id = u.user_id
       LEFT JOIN (
           SELECT *
           FROM user_daily_metrics
           WHERE date = (SELECT MAX(date) FROM user_daily_metrics)
       ) m ON m.user_id = u.user_id
       WHERE f.following_id = ?
       ORDER BY m.pagerank_score DESC
       LIMIT 10
   """, (user['user_id'],)).fetchall()
   
   # Get reciprocal connections
   reciprocal = db.execute("""
       SELECT COUNT(*) as count
       FROM following_relationships f1
       JOIN following_relationships f2 ON f1.following_id = f2.user_id
       WHERE f1.user_id = ? AND f2.following_id = ?
   """, (user['user_id'], user['user_id'])).fetchone()['count']
   
   response = {
       'user': {
           'user_id': user['user_id'],
           'username': user['username'],
           'follower_count': user['follower_count'],
           'following_count': user['following_count'], 
           'description': user['description'],
           'is_verified': bool(user['is_verified']),
           'profile_pic_url': user['profile_pic_url'],
           'profile_banner_url': user['profile_banner_url'],
           'pagerank_score': user['pagerank_score'],
           'pagerank_percentile': user['pagerank_percentile'],
           'network_followers': user['inbound_edges'],
           'network_following': user['outbound_edges']
       },
       'network_stats': {
           'followers_in_dataset': user['inbound_edges'],
           'following_in_dataset': user['outbound_edges'],
           'reciprocal_connections': reciprocal
       },
       'top_followers': [{
           'user_id': f['user_id'],
           'username': f['username'],
           'follower_count': f['follower_count'],
           'profile_pic_url': f['profile_pic_url'],
           'pagerank_score': f['pagerank_score'],
           'pagerank_percentile': f['pagerank_percentile']
       } for f in followers]
   }
   
   return jsonify(response)

@api.route('/api/user/<identifier>/history')
def get_user_history(identifier):
   """Get user's historical metrics"""
   db = get_db()
   
   user = db.execute("""
       SELECT user_id, username 
       FROM users
       WHERE user_id = ? OR LOWER(username) = LOWER(?)
   """, (identifier, identifier)).fetchone()
   
   if not user:
       return jsonify({'error': 'User not found'}), 404
   
   history = db.execute("""
       SELECT date, pagerank_score, pagerank_percentile,
              follower_count, following_count,
              inbound_edges, outbound_edges
       FROM user_daily_metrics
       WHERE user_id = ?
       ORDER BY date DESC
       LIMIT 30
   """, (user['user_id'],)).fetchall()
   
   return jsonify({
       'user_id': user['user_id'],
       'username': user['username'],
       'history': [dict(row) for row in history]
   })