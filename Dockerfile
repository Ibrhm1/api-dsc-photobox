# ==========================================
# Stage 1: Builder Stage
# ==========================================
FROM oven/bun:1.1-alpine AS builder

WORKDIR /usr/src/app

# Salin package.json untuk instalasi dependensi
COPY package.json ./

# Install dependensi (termasuk devDependencies untuk kompilasi build)
RUN bun install

# Salin seluruh kode sumber proyek
COPY . .

# Jalankan script build (mengompilasi TS ke JS ter-minify di folder ./dist)
RUN bun run build

# ==========================================
# Stage 2: Runner Stage (Production Image)
# ==========================================
FROM oven/bun:1.1-alpine AS runner

WORKDIR /usr/src/app

# Atur environment variable NODE_ENV ke production
ENV NODE_ENV=production

# Salin file konfigurasi dependensi
COPY package.json ./

# Install hanya dependensi produksi (dependencies saja, tanpa devDependencies)
RUN bun install --production

# Salin folder hasil build (dist) dari builder
COPY --from=builder /usr/src/app/dist ./dist

# Salin folder migrations agar migrasi database drizzle tetap tersedia di container
COPY --from=builder /usr/src/app/migrations ./migrations

# Expose port internal container (Express port)
EXPOSE 3000

# Jalankan aplikasi Express menggunakan Bun
CMD ["bun", "dist/src/server.js"]
