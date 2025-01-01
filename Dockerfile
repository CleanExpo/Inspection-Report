# Build stage
FROM node:16 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production stage
FROM node:16-slim
WORKDIR /app

# Copy built assets
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/public ./public

# Copy service account key if it exists
COPY service-account-key.json ./service-account-key.json

# Environment variables
ENV NODE_ENV=production
ENV GOOGLE_PROJECT_ID=${GOOGLE_PROJECT_ID}
ENV GOOGLE_STORAGE_BUCKET=${GOOGLE_STORAGE_BUCKET}
ENV GOOGLE_APPLICATION_CREDENTIALS=./service-account-key.json

# Expose the port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
