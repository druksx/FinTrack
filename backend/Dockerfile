FROM node:20-alpine

WORKDIR /app

# Install OpenSSL and netcat for Prisma and database checks
RUN apk add --no-cache openssl netcat-openbsd

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci

# Copy source code and entrypoint script
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Make the startup script executable
RUN chmod +x docker-entrypoint.sh

# Expose the port
EXPOSE 3333

# Start using the startup script
CMD ["/bin/sh", "./docker-entrypoint.sh"]