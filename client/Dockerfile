# ---- Flavor Hub web image (multi-stage) ----
# Stage 1: build the Vite app. Stage 2: serve the static bundle via nginx,
# which also reverse-proxies /api to the API container.

# --- Build stage ---
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# VITE_API_BASE_URL defaults to /api; nginx proxies that to the API service.
RUN npm run build

# --- Runtime stage ---
FROM nginx:alpine
# Custom config: SPA fallback + /api reverse proxy.
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
