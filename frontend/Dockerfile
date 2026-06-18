# ===== Этап сборки =====
FROM node:20-bookworm AS builder
WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .

# Заменяем захардкоженный http://localhost:3000 на пустую строку,
# чтобы все запросы стали относительными (/api/..., /uploads/...).
# Их nginx проксирует на бэкенд — тот же origin, без CORS.
RUN find src -name "*.ts" -exec sed -i 's#http://localhost:3000##g' {} +

RUN npx ng build --configuration production

# ===== Этап запуска =====
FROM nginx:1.27-alpine AS runtime
COPY --from=builder /app/dist/diplom/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
