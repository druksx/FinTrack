#!/bin/bash

echo "🚀 Starting FinTrack in Development Mode..."
echo "📝 Features: Hot reload, fast compilation, volume mounts"
echo ""

# Stop any existing containers
echo "🛑 Stopping existing containers..."
docker-compose down

# Start development environment
echo "🔧 Starting development environment..."
docker-compose up --build

echo "✅ Development environment started!"
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 Backend: http://localhost:3333"
echo "📊 Database: localhost:5432"
echo ""
echo "💡 Make code changes and see them instantly in your browser!" 