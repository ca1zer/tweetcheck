FROM python:3.10-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements files
COPY requirements.txt .
COPY poetry.lock .
COPY pyproject.toml .

# Install Python dependencies
RUN pip install -r requirements.txt

# Copy application code
COPY . .

# Create data directory and ensure it exists
RUN mkdir -p data

# Make the entrypoint script executable
COPY entrypoint.sh .
RUN chmod +x entrypoint.sh

# Set environment variables
ENV FLASK_APP=run.py
ENV FLASK_ENV=production

# Expose port
EXPOSE 8080

# Use entrypoint script
ENTRYPOINT ["./entrypoint.sh"]