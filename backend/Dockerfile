# Stage 1: Build Frontend
FROM node:22-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: Create Production Server
FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production

# Install backend dependencies
COPY backend/package*.json ./backend/
RUN cd backend && npm ci --only=production

# Copy backend source
COPY backend/src ./backend/src

# Copy built frontend from Stage 1
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Expose port
EXPOSE 5000

# Start application
CMD ["node", "backend/src/index.js"]
