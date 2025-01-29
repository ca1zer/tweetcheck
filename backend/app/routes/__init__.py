from flask import Blueprint

api = Blueprint('api', __name__)

from .user_routes import *
from .search_routes import *