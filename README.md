# FinTrack - Personal Finance Manager

## 🚀 Quick Start

### Development Mode (Fast Hot Reload)
For development with fast compilation and hot reload:

```bash
# Start all services in development mode
docker-compose up

# Or start just the frontend for development
cd frontend
npm run dev

# Or rebuild and start development containers
docker-compose up --build
```

**Development Features:**
- ✅ Hot reload - changes appear instantly
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

### Switching Between Modes
- **Development**: `docker-compose up` (uses `docker-compose.override.yml` automatically)
- **Production**: `docker-compose -f docker-compose.yml -f docker-compose.prod.yml up`

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

- Expense tracking with categories
- Subscription management
- Dashboard with charts and analytics
- Data export functionality
- User authentication
- Responsive design with dark mode

## 🔄 Recent Optimizations

- **Docker Build Speed**: 50s+ → ~15s with multi-stage builds
- **Development Speed**: Hot reload with Turbopack for instant changes
- **Data Refresh**: Automatic UI updates when adding expenses/subscriptions
- **Bundle Optimization**: Standalone Next.js builds for smaller containers
