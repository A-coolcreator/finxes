# =========================================================
# Stage 1: Build the React Frontend (finexis_UI_Updated)
# =========================================================
FROM node:22-alpine AS frontend-builder

WORKDIR /app/finexis_UI_Updated

# Copy frontend dependency manifests
COPY finexis_UI_Updated/package*.json ./

# Install dependencies
RUN npm install

# Copy source code and configuration files
COPY finexis_UI_Updated/ ./

# Build static production bundle
RUN npm run build

# =========================================================
# Stage 2: Final Production Environment (Express Backend)
# =========================================================
# CHANGED: Switched from alpine to bookworm-slim for Python wheel compatibility
FROM node:22-bookworm-slim AS production

WORKDIR /app

# CHANGED: Use apt-get for Debian-based image to install Python
# We include python3-venv to safely run pip if needed, though --break-system-packages works
RUN apt-get update && \
    apt-get install -y --no-install-recommends python3 python3-pip && \
    rm -rf /var/lib/apt/lists/*

# Set environment to production
ENV NODE_ENV=production
ENV PORT=3000

# Copy root & backend package files
COPY package*.json ./
COPY backend/package*.json ./backend/

# Install production node dependencies for backend
RUN cd backend && npm install --only=production

# Copy Python requirements and install dependencies
COPY backend/requirements.txt ./
RUN pip3 install --no-cache-dir --break-system-packages -r requirements.txt

# Copy backend application source
COPY backend ./backend

# Copy built frontend assets into the directory expected by Express server (backend/server.js)
COPY --from=frontend-builder /app/finexis_UI_Updated/dist ./finexis_ui_updated/dist

# Expose backend port
EXPOSE 3000

# Set default directory to backend and launch server
WORKDIR /app/backend
CMD ["node", "server.js"]