#!/bin/bash

echo "🚀 Starting FinTrack in Production Mode..."
echo "📝 Features: Optimized builds, multi-stage Docker, production performance"
echo ""

# Stop any existing containers
echo "🛑 Stopping existing containers..."
docker-compose down

# Start production environment
echo "🔧 Building and starting production environment..."
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up --build

echo "✅ Production environment started!"
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 Backend: http://localhost:3333"
echo "📊 Database: localhost:5432"
echo ""
echo "🚀 Running in production mode with optimized performance!" 