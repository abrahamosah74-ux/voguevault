# API Gateway Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY dist ./dist

# Expose port
EXPOSE 3001

# Start application
CMD ["node", "dist/index.js"]
