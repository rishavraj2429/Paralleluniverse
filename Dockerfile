# Production Dockerfile for Eulr Cloud Meeting Bot Engine
FROM mcr.microsoft.com/playwright:v1.48.1-jammy

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install node dependencies
RUN npm ci

# Copy application source
COPY . .

# Build Next.js application
RUN npm run build

# Expose HTTP port
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production
ENV HEADLESS=true
ENV PORT=3000

# Start server and background bot scheduler
CMD ["npm", "start"]
