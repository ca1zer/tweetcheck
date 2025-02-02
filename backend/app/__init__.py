from flask import Flask
from flask_cors import CORS
import sqlite3
import os


def get_db():
    # Check if we're running on Fly.io by looking for the FLY_APP_NAME environment variable
    if os.getenv('FLY_APP_NAME'):
        db_path = '/data/twitter.db'
    else:
        # Local development path
        db_path = 'data/twitter.db'
    
    db = sqlite3.connect(db_path)
    db.row_factory = sqlite3.Row
    return db

def create_app():
    app = Flask(__name__)
    
    CORS(app)

    from app.routes import api
    app.register_blueprint(api)
    
    return app