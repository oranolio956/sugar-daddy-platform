# Use official Node.js 18 image
FROM node:18

# Set working directory
WORKDIR /app

# Copy package files first for better caching
COPY package.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY src ./src

# Build the TypeScript application
RUN npm run build

# Expose the port the app runs on
EXPOSE 3003

# Command to run the application
CMD ["npm", "start"]