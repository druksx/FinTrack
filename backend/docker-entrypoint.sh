#!/bin/sh

# Wait for database to be ready
echo "Waiting for database to be ready..."
while ! nc -z postgres 5432; do
  sleep 1
done

# Run migrations
echo "Running database migrations..."
npx prisma migrate deploy

# Run seed script
echo "Seeding database..."
npx prisma db seed

# Start the application
echo "Starting the application..."
npm run start:dev 