# ---- Flavor Hub API image ----
# Small, production-oriented Node image. Installs only production dependencies
# using the committed lockfile for reproducible builds.
FROM node:20-alpine

# Run as the built-in non-root "node" user for better container security.
WORKDIR /app

# Install deps first to leverage Docker layer caching.
COPY package*.json ./
RUN npm ci --omit=dev

# Copy application source.
COPY src ./src

ENV NODE_ENV=production
ENV PORT=5000
EXPOSE 5000

USER node

# Basic healthcheck hitting the API's health endpoint.
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://localhost:5000/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "src/server.js"]
