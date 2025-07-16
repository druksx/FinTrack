# FinTrack - Personal Finance Manager

A comprehensive personal finance management application built with modern web technologies. Track expenses, manage subscriptions, and visualize your financial data with an intuitive dashboard.

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose installed
- Node.js 20+ (for local development)

### 🏃 Launch the Application

**The fastest way to get started:**

```bash
# Clone the repository
git clone <repository-url>
cd FinTrack

# Start all services (development mode)
docker-compose up
```

**Note:** ⏳ The first build might take a few minutes as Docker compiles all dependencies. Subsequent builds will be much faster thanks to caching.

**Access the application:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:3333
- API Documentation: http://localhost:3333/api

### Development Mode (Fast Hot Reload)
For development with fast compilation and hot reload:

```bash
# Start all services in development mode
docker-compose up

# Or rebuild and start development containers
docker-compose up --build
```

**Development Features:**
- ✅ Hot reload - changes appear instantly (~1s)
- ✅ Fast compilation with Turbopack
- ✅ Volume mounts for real-time code changes
- ✅ Development-optimized builds

### Production Mode (Optimized Build)
For production-ready builds with maximum performance:

```bash
# Start with production configuration
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up --build

# Or build production frontend locally
cd frontend
npm run build
npm start
```

**Production Features:**
- ✅ Multi-stage Docker builds
- ✅ Optimized bundle sizes
- ✅ Standalone Next.js output
- ✅ Production-ready performance

## 🔧 Development Workflow

### Making Code Changes
1. Start development mode: `docker-compose up`
2. Edit your code in your favorite editor
3. Changes will automatically appear in your browser
4. No need to restart containers!

### Helper Scripts
For convenience, you can use these scripts:

```bash
# Development mode
./scripts/dev.sh

# Production mode  
./scripts/prod.sh
```

### Switching Between Modes
- **Development**: `docker-compose up` (uses `docker-compose.override.yml` automatically)
- **Production**: `docker-compose -f docker-compose.yml -f docker-compose.prod.yml up`

### Running Tests
```bash
# Backend tests
cd backend
npm test

# Frontend tests (if you add them)
cd frontend
npm test
```

**Test Coverage:**
- ✅ Unit tests for services and controllers
- ✅ E2E tests for API endpoints
- ✅ Automated testing with Jest

## 📁 Configuration Files

- `docker-compose.yml` - Base configuration
- `docker-compose.override.yml` - Development overrides (auto-applied)
- `docker-compose.prod.yml` - Production-specific settings
- `frontend/Dockerfile` - Production build
- `frontend/Dockerfile.dev` - Development build

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: NestJS, TypeScript, Prisma ORM
- **Database**: PostgreSQL
- **Auth**: NextAuth.js
- **Containerization**: Docker & Docker Compose

## 📊 Features

### Core Functionality
- **Expense Tracking**: Add, edit, and categorize expenses with custom categories
- **Subscription Management**: Track recurring subscriptions (monthly/annually)
- **Dashboard Analytics**: Visual charts and spending insights
- **Data Export**: Export expense data to CSV/Excel
- **Multi-Month View**: Navigate between different months
- **Smart Date Handling**: Intelligent date defaults based on selected month

### User Experience
- **Authentication**: Secure login with NextAuth.js
- **Responsive Design**: Works on desktop and mobile
- **Dark Mode**: Toggle between light and dark themes
- **Real-time Updates**: Automatic refresh when data changes
- **Intuitive UI**: Clean, modern interface with smooth animations

### Technical Features
- **Fast Performance**: Optimized Docker builds and hot reload
- **Data Persistence**: PostgreSQL database with Docker volumes
- **API Documentation**: Complete Swagger/OpenAPI documentation
- **Type Safety**: Full TypeScript implementation
- **Testing**: Comprehensive test suite with Jest

## 🔄 Recent Optimizations

- **Docker Build Speed**: 50s+ → ~15s with multi-stage builds
- **Development Speed**: Hot reload with Turbopack for instant changes
- **Data Refresh**: Automatic UI updates when adding expenses/subscriptions
- **Bundle Optimization**: Standalone Next.js builds for smaller containers
- **User Experience**: Smooth refresh animations and smart date handling
- **Test Coverage**: All tests updated and passing

## 🏗️ Architecture

### Frontend (Next.js 15)
- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: React Context for global state
- **Authentication**: NextAuth.js integration

### Backend (NestJS)
- **Framework**: NestJS with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **API**: RESTful API with Swagger documentation
- **Authentication**: JWT-based authentication

### Infrastructure
- **Containerization**: Docker with multi-stage builds
- **Development**: Hot reload with file watching
- **Production**: Optimized standalone builds
- **Database**: Persistent PostgreSQL with Docker volumes
