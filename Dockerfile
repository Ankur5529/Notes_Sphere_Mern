# ──────────────────────────────────────────────
# Stage 1: Build the React frontend
# ──────────────────────────────────────────────
FROM node:20-alpine AS client-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install --silent
COPY client/ ./
RUN npm run build

# ──────────────────────────────────────────────
# Stage 2: Production server image
# ──────────────────────────────────────────────
FROM node:20-alpine AS server
WORKDIR /app/server

# Install only production dependencies
COPY server/package*.json ./
RUN npm install --omit=dev --silent

# Copy server source
COPY server/ ./

# Copy the built React app into the server's public folder
COPY --from=client-builder /app/client/build ./public

# Expose the port the server listens on
EXPOSE 5000

# Use a non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

CMD ["node", "server.js"]
