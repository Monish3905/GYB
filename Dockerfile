FROM node:20-alpine AS builder

WORKDIR /app

# Copy package configurations
COPY package.json package-lock.json ./
COPY packages/*/package.json ./packages/

# Install all dependencies (including devDependencies for building)
RUN npm ci

# Copy source code
COPY tsconfig.json ./
COPY src/ ./src/
COPY packages/ ./packages/

# Build all packages and root
RUN npm run build
# Note: In a real monorepo we'd use something like lerna, turbo, or npm workspaces native build.
# For now we will rely on standard npm commands.
RUN npm run build --workspaces --if-present

# Production image
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

# Define ARG for service to run
ARG SERVICE_NAME
ENV SERVICE_NAME=${SERVICE_NAME}

# Copy only production dependencies and built files
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/packages ./packages

# Optional: Add user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# Start command
CMD ["sh", "-c", "if [ -z \"$SERVICE_NAME\" ]; then node dist/main.js; else node packages/${SERVICE_NAME}/dist/index.js; fi"]
