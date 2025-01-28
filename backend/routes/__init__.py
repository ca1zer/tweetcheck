# routes/__init__.py
from flask import Blueprint
api = Blueprint('api', __name__)

from . import user_routes
from . import search_routes