#!/bin/bash

# # Copy the database if it exists in the mounted volume
# if [ -f /data/twitter.db ]; then
#     cp /data/twitter.db /app/data/twitter.db
# fi

# Start the Flask application
exec gunicorn --bind 0.0.0.0:8080 "run:app" --workers 2 --threads 2 --timeout 60