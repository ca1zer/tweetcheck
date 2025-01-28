from flask import Blueprint

# Create a single Blueprint instance
api = Blueprint('api', __name__)

# Import routes after Blueprint creation to avoid circular imports
from .user_routes import *
from .search_routes import *