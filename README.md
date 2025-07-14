# FinTrack - Personal Finance Tracking Application

FinTrack is a modern web application for tracking personal expenses, managing subscriptions, and gaining insights into your spending habits. Built with Next.js for the frontend and NestJS for the backend, it provides a seamless and responsive experience for managing your finances.

## Features

- 🔐 **User Authentication** - Secure registration and login system
- 📊 **Expense Tracking** - Add, edit, and delete expenses with detailed analytics
- 📅 **Subscription Management** - Track recurring subscriptions with calendar view
- 📱 **Responsive Design** - Works perfectly on desktop and mobile
- 🌙 **Dark Mode Support** - Toggle between light and dark themes
- 📈 **Visual Reports** - Interactive charts and expense analytics
- 🏷️ **Custom Categories** - Create and manage your own expense categories
- 📤 **Export Functionality** - Export expenses to PDF and other formats
- 👤 **Profile Management** - Update profile information and change passwords
- 🔒 **Secure API** - All endpoints protected with user authentication

## Tech Stack

### Frontend

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- Shadcn/ui components
- Recharts for data visualization
- Lucide React icons

### Backend

- NestJS
- TypeScript
- Prisma ORM
- PostgreSQL
- bcryptjs for password hashing
- JWT for authentication

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v20 or higher)
- npm
- Docker and Docker Compose (recommended)
- PostgreSQL (if running without Docker)

## Getting Started

### Quick Start with Docker (Recommended)

1. **Clone the repository:**

   ```bash
   git clone <your-repo-url>
   cd FinTrack
   ```

2. **Start the application:**

   ```bash
   docker-compose up --build
   ```

3. **Access the application:**

   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3333
   - Database: localhost:5432

4. **Create your account:**
   - Navigate to http://localhost:3000
   - Click "Sign Up" to create a new account
   - Start tracking your expenses!

### Manual Setup (Alternative)

If you prefer to run without Docker:

1. **Install dependencies:**

   ```bash
   # Backend
   cd backend
   npm install

   # Frontend
   cd ../frontend
   npm install
   ```

2. **Set up environment variables:**

   ```bash
   # Copy example environment files
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env.local
   
   # Edit the files with your actual values:
   # backend/.env - Update DATABASE_URL and JWT_SECRET
   # frontend/.env.local - Update API URLs and any OAuth credentials
   ```

3. **Set up the database:**

   ```bash
   cd backend
   npx prisma migrate dev
   npx prisma db seed
   ```

4. **Start the servers:**

   ```bash
   # Backend (terminal 1)
   cd backend
   npm run start:dev

   # Frontend (terminal 2)
   cd frontend
   npm run dev
   ```

## Environment Configuration

### Backend (.env)
Copy `backend/.env.example` to `backend/.env` and configure:

```bash
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/fintrack"

# JWT Configuration - Use a strong secret in production
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# Server Configuration
PORT=3333
NODE_ENV=development
```

### Frontend (.env.local)
Copy `frontend/.env.example` to `frontend/.env.local` and configure:

```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3333

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-key-change-this

# OAuth Configuration (Optional - for social login)
GITHUB_ID=your-github-oauth-app-id
GITHUB_SECRET=your-github-oauth-app-secret
GOOGLE_ID=your-google-oauth-client-id
GOOGLE_SECRET=your-google-oauth-client-secret
```

**⚠️ Security Note:** Never commit actual `.env` files to version control. The `.env.example` files contain safe placeholder values only.

## Application Structure

### Authentication System

- **Registration**: Create new user accounts with email and password
- **Login**: Secure authentication with JWT tokens
- **Profile Management**: Update user information and change passwords
- **Session Persistence**: Stay logged in across browser sessions

### Expense Management

- **Add Expenses**: Quick expense entry with categories and notes
- **Edit/Delete**: Modify or remove existing expenses
- **Categories**: Organize expenses with custom categories and colors
- **Monthly View**: Filter expenses by month for better organization

### Subscription Tracking

- **Recurring Subscriptions**: Track monthly and annual subscriptions
- **Calendar View**: Visual calendar showing upcoming payments
- **Cost Analysis**: See total monthly subscription costs
- **Subscription Management**: Add, edit, and cancel subscriptions

### Analytics & Reports

- **Dashboard Cards**: Overview of total expenses and comparisons
- **Interactive Charts**: Line charts, bar charts, and pie charts
- **Export Options**: Generate PDF reports of your expenses
- **Dark Theme**: Charts adapt to light/dark mode automatically

## API Endpoints

### Authentication

- `POST /auth/register` - Register new user
- `POST /auth/login` - User login

### Users

- `GET /users/profile` - Get user profile
- `PUT /users/profile` - Update user profile
- `PUT /users/password` - Change password

### Expenses

- `GET /expenses` - Get user expenses
- `POST /expenses` - Create new expense
- `PUT /expenses/:id` - Update expense
- `DELETE /expenses/:id` - Delete expense
- `GET /expenses/dashboard` - Get dashboard data
- `GET /expenses/export` - Export expenses

### Categories

- `GET /categories` - Get user categories
- `POST /categories` - Create category
- `PUT /categories/:id` - Update category
- `DELETE /categories/:id` - Delete category

### Subscriptions

- `GET /subscriptions` - Get user subscriptions
- `POST /subscriptions` - Create subscription
- `PUT /subscriptions/:id` - Update subscription
- `DELETE /subscriptions/:id` - Delete subscription
- `GET /subscriptions/month` - Get monthly subscriptions

## Development

### Available Scripts

**Frontend:**

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run start      # Start production server
npm run lint       # Run ESLint
```

**Backend:**

```bash
npm run start:dev  # Start development server
npm run build      # Build for production
npm run start:prod # Start production server
npm run test       # Run tests
npm run test:e2e   # Run end-to-end tests
```

### Docker Commands

```bash
# Start all services
docker-compose up --build

# Start in background
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Reset database (removes all data)
docker-compose down -v
```

## Database Schema

The application uses PostgreSQL with the following main tables:

- **users** - User accounts and authentication
- **categories** - Expense categories (user-specific)
- **expenses** - Individual expense records
- **subscriptions** - Recurring subscription tracking

## Security Features

- **Password Hashing**: Passwords are hashed using bcryptjs
- **JWT Authentication**: Secure token-based authentication
- **User Isolation**: All data is user-specific and isolated
- **Input Validation**: All API endpoints validate input data
- **CORS Protection**: Proper CORS configuration for API security
