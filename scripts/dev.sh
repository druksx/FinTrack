#!/bin/bash
echo "🚀 Starting FinTrack in Development Mode..."
echo "Features: Hot reload, fast compilation, volume mounts"
echo ""
echo "Access the application at:"
echo "- Frontend: http://localhost:3000"
echo "- Backend API: http://localhost:3333"
echo "- API Documentation: http://localhost:3333/api"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Start development mode (uses docker-compose.override.yml automatically)
docker-compose up