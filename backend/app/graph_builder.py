import networkx as nx
import numpy as np
import sqlite3
from datetime import datetime
import pandas as pd
from scipy import stats
from scipy.sparse import csr_matrix
from tqdm import tqdm

def build_graph():
    """Build NetworkX graph from database"""
    print("Building graph from database...")
    
    conn = sqlite3.connect('data/twitter.db')
    
    # Load users and their attributes
    users_df = pd.read_sql_query("""
        SELECT user_id, username, follower_count, following_count,
               is_verified, profile_pic_url
        FROM users
    """, conn)
    
    # Load relationships
    relationships_df = pd.read_sql_query("""
        SELECT user_id, following_id
        FROM following_relationships
    """, conn)
    
    conn.close()
    
    # Create graph
    G = nx.DiGraph()
    
    # Add nodes with attributes
    for _, user in users_df.iterrows():
        G.add_node(user['user_id'], **{
            'username': user['username'],
            'follower_count': user['follower_count'],
            'following_count': user['following_count'],
            'is_verified': user['is_verified'],
            'profile_pic_url': user['profile_pic_url']
        })
    
    # Add edges
    G.add_edges_from(relationships_df.values)
    
    print(f"Graph built with {G.number_of_nodes()} nodes and {G.number_of_edges()} edges")
    return G

def calculate_pagerank(G, alpha=0.15, max_iter=1000, tol=1e-6, seed_nodes=None):
    """Calculate PageRank scores using sparse matrix operations."""
    print("Preparing matrices...")
    
    # Get adjacency matrix in sparse format
    A = nx.adjacency_matrix(G)
    n = A.shape[0]
    
    # Create node mapping
    node_list = list(G.nodes())
    node_idx = {node: i for i, node in enumerate(node_list)}
    
    # Normalize adjacency matrix by out-degree
    out_degrees = np.array(A.sum(axis=1)).flatten()
    out_degrees[out_degrees == 0] = 1  # Avoid division by zero
    D_inv = csr_matrix((1 / out_degrees, (range(n), range(n))))
    M = A.T.dot(D_inv)
    
    # Initialize personalization vector
    p = np.ones(n) / n
    if seed_nodes:
        seed_indices = [node_idx[node] for node in seed_nodes if node in node_idx]
        p = np.zeros(n)
        p[seed_indices] = 5 / len(seed_indices)  # Much higher weight for seed nodes
    
    # Adjust personalization with follower/following ratio
    for i, node in enumerate(node_list):
        data = G.nodes[node]
        if not (seed_nodes and node in seed_nodes):
            followers = data.get('follower_count', 1)
            following = data.get('following_count', 1)
            p[i] = min(max(0, np.log((followers + 250) / (following + 250))), 5)
    
            if following > 8000:
                penalty_factor = min(following / 4000, 10)  # Cap penalty
                p[i] /= penalty_factor

    # Scale to [0,1] range
    p = (p - p.min()) / (p.max() - p.min())

    # Power iteration
    scores = np.ones(n) / n
    for iteration in tqdm(range(max_iter)):
        prev_scores = scores.copy()
        scores = (1 - alpha) * M.dot(scores) + alpha * p
        
        # Check convergence
        err = np.abs(scores - prev_scores).sum()
        if err < tol:
            print(f"Converged after {iteration + 1} iterations")
            break

    scores -= alpha * p * 1.0  # subtract the boost from followers
    
    # Convert back to dictionary
    score_dict = {node: float(score) for node, score in zip(node_list, scores)}
    
    return score_dict


def save_daily_metrics(scores, G):
    """Save daily metrics including PageRank scores and graph metrics"""
    print("Starting to save daily metrics...")
    conn = sqlite3.connect('data/twitter.db')
    c = conn.cursor()
    
    c.execute('''
        CREATE TABLE IF NOT EXISTS user_daily_metrics (
            user_id TEXT,
            date DATE,
            pagerank_score REAL,
            pagerank_percentile REAL,
            follower_count INTEGER,
            following_count INTEGER,
            inbound_edges INTEGER,
            outbound_edges INTEGER,
            PRIMARY KEY (user_id, date)
        )
    ''')
    
    c.execute('''
        CREATE INDEX IF NOT EXISTS idx_metrics_date 
        ON user_daily_metrics(date)
    ''')
    
    today = datetime.now().date()
    
    print("Calculating in/out degrees...")
    in_degrees = dict(G.in_degree())
    out_degrees = dict(G.out_degree())
    
    print("Converting scores to percentiles...")
    score_values = np.array(list(scores.values()))
    ranks = pd.qcut(score_values, q=10000, labels=False, duplicates='drop')
    percentiles = (ranks / 9999) * 100
    
    print("Preparing data for insertion...")
    data = []
    for i, (user_id, score) in enumerate(scores.items()):
        node_data = G.nodes[user_id]
        data.append((
            user_id,
            today,
            float(score),
            float(percentiles[i]),
            node_data.get('follower_count', 0),
            node_data.get('following_count', 0),
            in_degrees.get(user_id, 0),
            out_degrees.get(user_id, 0)
        ))
    
    print("Beginning database transaction...")
    c.execute('BEGIN TRANSACTION')
    
    try:
        batch_size = 50000
        for i in range(0, len(data), batch_size):
            batch = data[i:i + batch_size]
            c.executemany('''
                INSERT OR REPLACE INTO user_daily_metrics 
                (user_id, date, pagerank_score, pagerank_percentile, 
                follower_count, following_count, inbound_edges, outbound_edges)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ''', batch)
            print(f"Inserted batch {i//batch_size + 1}/{(len(data) + batch_size - 1)//batch_size}")
        
        conn.commit()
        print(f"Successfully saved {len(scores)} daily metrics for {today}")
    except Exception as e:
        conn.rollback()
        print(f"Error during insertion: {e}")
        raise
    finally:
        conn.close()
    