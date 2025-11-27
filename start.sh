#!/bin/sh
# Start script for Azure App Service
# Uses PORT environment variable (set by Azure to 8080)
# Works with standalone output mode

PORT=${PORT:-8080}
echo "Starting Next.js on port $PORT"

# If standalone build exists, use it (faster startup)
if [ -d ".next/standalone" ]; then
  echo "Using standalone build"
  cd .next/standalone
  PORT=$PORT node server.js
else
  # Fallback to regular next start
  echo "Using regular build"
  next start -p $PORT
fi

