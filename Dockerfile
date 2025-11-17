# Step 1: Build the Angular app
FROM node:18 AS build

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copy source and build
COPY . .
RUN npm run build

# Step 2: Serve the app with http-server
FROM node:18-alpine

# Install lightweight static server
RUN npm install -g http-server

# Create app directory
WORKDIR /app

# Copy built Angular app from previous stage
COPY --from=build dist/elit-go /app/

# Expose port
EXPOSE 4200

# Start the app
CMD ["http-server", ".", "-p", "4200"]
