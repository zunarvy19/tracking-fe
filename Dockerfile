# --------- TAHAP 1: BUILD STAGE ---------
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package.json dan package-lock.json terlebih dahulu
COPY package*.json ./

# Install semua module Vue/Vite
RUN npm install

# Copy seluruh kode sumber (src, public, dsb) ke dalam container
COPY . .

# Eksekusi Vite build (menghasilkan folder 'dist' yang berisi web statis)
RUN npm run build

# --------- TAHAP 2: PRODUCTION STAGE ---------
FROM nginx:alpine

# Timpa konfigurasi bawaan Nginx dengan `nginx.conf` kita
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Ambil folder hasil build statis (/app/dist) dari Tahap 1
COPY --from=builder /app/dist /usr/share/nginx/html

# Beritahu Docker bahwa container ini akan mendengarkan port 80 (HTTP)
# (meskipun saat di run kita expose menjadi 6969:80 di host OS)
EXPOSE 80

# Perintah utama untuk menjalankan Nginx agar selalu menyala
CMD ["nginx", "-g", "daemon off;"]
