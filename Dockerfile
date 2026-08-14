# syntax=docker/dockerfile:1

# Multi-stage so the runtime image carries no devDependencies and no source.
# Node 20 rather than the Node 18 that Railway pinned — the AGENTS.md ban on
# `import.meta.dirname` came from that pin, and the code already avoids it, so
# nothing here depends on staying on 18.

FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --include=dev
COPY . .
# Emits dist/index.js (esbuild, server) and dist/public (vite, client).
RUN npm run build

FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
# serveStatic() resolves dist/public from process.cwd(), so WORKDIR must stay /app.
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=build /app/dist ./dist
EXPOSE 5000
USER node
CMD ["node", "dist/index.js"]
