from flask import Flask
from flask_cors import CORS
import sqlite3

def get_db():
    db = sqlite3.connect('data/twitter.db')
    db.row_factory = sqlite3.Row
    return db

def create_app():
    app = Flask(__name__)
    
    CORS(app, resources={
        r"/*": {
            "origins": "*",
            "methods": ["GET", "POST", "OPTIONS"],  # Add OPTIONS explicitly
            "allow_headers": ["Content-Type", "Authorization"],
            "expose_headers": ["Content-Range", "X-Content-Range"]
        }
    })

    from app.routes import api
    app.register_blueprint(api)
    
    return app