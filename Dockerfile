# Build stage
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies including serve
RUN npm ci --only=production && npm install -g serve

# Copy source code
COPY . .

# Build argument for API URL
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Build the application
RUN npm run build

# Expose port 3000
EXPOSE 3000

# Serve the built application
CMD ["serve", "-s", "dist", "-l", "3000"]
