#!/bin/sh
# Start script for Azure App Service
# Uses PORT environment variable (set by Azure to 8080)

PORT=${PORT:-8080}
echo "Starting Next.js on port $PORT"
next start -p $PORT

