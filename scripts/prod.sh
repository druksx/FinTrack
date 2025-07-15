#!/bin/bash
echo "🏭 Starting FinTrack in Production Mode..."
echo "Features: Optimized builds, multi-stage Docker, standalone output"
echo ""
echo "Building containers... (this may take a few minutes)"
echo ""
echo "Access the application at:"
echo "- Frontend: http://localhost:3000"
echo "- Backend API: http://localhost:3333"
echo "- API Documentation: http://localhost:3333/api"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

echo "🛑 Stopping existing containers..."
docker-compose down

echo "🔧 Building and starting production environment..."
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up --build

echo "✅ Production environment started!"
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 Backend: http://localhost:3333"
echo "📊 Database: localhost:5432"
echo ""
echo "🚀 Running in production mode with optimized performance!" 