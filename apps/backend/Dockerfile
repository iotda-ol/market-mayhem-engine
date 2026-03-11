# Build stage — context is repo root
FROM node:20-alpine AS builder

WORKDIR /app

# Install root workspace + backend deps
COPY package.json package-lock.json ./
COPY tsconfig.json ./
COPY src/ ./src/
COPY apps/backend/package.json ./apps/backend/

RUN npm ci --workspaces=false && \
    npm ci --workspace=apps/backend

# Build engine then backend
RUN npm run build

COPY apps/backend/tsconfig.json ./apps/backend/
COPY apps/backend/src/ ./apps/backend/src/
RUN npm run build --workspace=apps/backend

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Engine dist (backend references it as a local file dep)
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json

# Backend build + prod deps
COPY --from=builder /app/apps/backend/dist ./apps/backend/dist
COPY --from=builder /app/apps/backend/package.json ./apps/backend/package.json

# Install only production dependencies for the backend
RUN npm install --prefix apps/backend --omit=dev

EXPOSE 3001

CMD ["node", "apps/backend/dist/index.js"]
